using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<TestController> _logger;

    public TestController(IFirebaseService firebaseService, ILogger<TestController> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "admin,teacher,student")]
    public async Task<IActionResult> GetAllTests([FromQuery] string? courseId = null, [FromQuery] string? type = null, [FromQuery] bool? isPublished = null, [FromQuery] bool? isActive = null)
    {
        try
        {
            var tests = await _firebaseService.GetAllTestsAsync();

            // Apply filters
            if (!string.IsNullOrEmpty(courseId))
            {
                tests = tests.Where(t => t.CourseId == courseId).ToList();
            }

            if (!string.IsNullOrEmpty(type))
            {
                tests = tests.Where(t => t.Type.Equals(type, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (isPublished.HasValue)
            {
                tests = tests.Where(t => t.IsPublished == isPublished.Value).ToList();
            }

            if (isActive.HasValue)
            {
                tests = tests.Where(t => t.IsActive == isActive.Value).ToList();
            }

            return Ok(tests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tests");
            return StatusCode(500, new { message = "Error retrieving tests", error = ex.Message });
        }
    }

    [HttpGet("{testId}")]
    public async Task<IActionResult> GetTest(string testId)
    {
        try
        {
            var test = await _firebaseService.GetTestByIdAsync(testId);
            if (test == null)
            {
                return NotFound(new { message = "Test not found" });
            }
            return Ok(test);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving test {TestId}", testId);
            return StatusCode(500, new { message = "Error retrieving test", error = ex.Message });
        }
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetTestsByCourse(string courseId)
    {
        try
        {
            var tests = await _firebaseService.GetTestsByCourseAsync(courseId);
            return Ok(tests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tests for course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error retrieving tests", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> CreateTest([FromBody] Test test)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate test data
            if (test.TotalPoints <= 0)
            {
                return BadRequest(new { message = "Total points must be greater than 0" });
            }

            if (test.PassingScore <= 0 || test.PassingScore > test.TotalPoints)
            {
                return BadRequest(new { message = "Passing score must be between 1 and total points" });
            }

            if (test.StartDate >= test.EndDate)
            {
                return BadRequest(new { message = "End date must be after start date" });
            }

            test.Id = Guid.NewGuid().ToString();
            test.CreatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();
            test.UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();
            test.IsActive = true;
            test.IsPublished = false; // Default to unpublished

            var createdTest = await _firebaseService.CreateTestAsync(test);

            _logger.LogInformation("Test created: {TestId}", createdTest.Id);
            return CreatedAtAction(nameof(GetTest), new { testId = createdTest.Id }, createdTest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating test");
            return StatusCode(500, new { message = "Error creating test", error = ex.Message });
        }
    }

    [HttpPut("{testId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateTest(string testId, [FromBody] Test test)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate test data
            if (test.TotalPoints <= 0)
            {
                return BadRequest(new { message = "Total points must be greater than 0" });
            }

            if (test.PassingScore <= 0 || test.PassingScore > test.TotalPoints)
            {
                return BadRequest(new { message = "Passing score must be between 1 and total points" });
            }

            if (test.StartDate >= test.EndDate)
            {
                return BadRequest(new { message = "End date must be after start date" });
            }

            test.UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();

            var updatedTest = await _firebaseService.UpdateTestAsync(testId, test);
            if (updatedTest == null)
            {
                return NotFound(new { message = "Test not found" });
            }

            _logger.LogInformation("Test updated: {TestId}", testId);
            return Ok(updatedTest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating test {TestId}", testId);
            return StatusCode(500, new { message = "Error updating test", error = ex.Message });
        }
    }

    [HttpDelete("{testId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteTest(string testId)
    {
        try
        {
            await _firebaseService.DeleteTestAsync(testId);

            _logger.LogInformation("Test deleted: {TestId}", testId);
            return Ok(new { message = "Test deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting test {TestId}", testId);
            return StatusCode(500, new { message = "Error deleting test", error = ex.Message });
        }
    }

    [HttpPut("{testId}/publish")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> PublishTest(string testId)
    {
        try
        {
            var test = await _firebaseService.GetTestByIdAsync(testId);
            if (test == null)
            {
                return NotFound(new { message = "Test not found" });
            }

            test.IsPublished = true;
            test.UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();

            var updatedTest = await _firebaseService.UpdateTestAsync(testId, test);

            _logger.LogInformation("Test published: {TestId}", testId);
            return Ok(updatedTest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing test {TestId}", testId);
            return StatusCode(500, new { message = "Error publishing test", error = ex.Message });
        }
    }

    [HttpPut("{testId}/unpublish")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UnpublishTest(string testId)
    {
        try
        {
            var test = await _firebaseService.GetTestByIdAsync(testId);
            if (test == null)
            {
                return NotFound(new { message = "Test not found" });
            }

            test.IsPublished = false;
            test.UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();

            var updatedTest = await _firebaseService.UpdateTestAsync(testId, test);

            _logger.LogInformation("Test unpublished: {TestId}", testId);
            return Ok(updatedTest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unpublishing test {TestId}", testId);
            return StatusCode(500, new { message = "Error unpublishing test", error = ex.Message });
        }
    }

    [HttpPost("{testId}/duplicate")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DuplicateTest(string testId)
    {
        try
        {
            var duplicatedTest = await _firebaseService.DuplicateTestAsync(testId);

            _logger.LogInformation("Test duplicated: {OriginalTestId} -> {NewTestId}", testId, duplicatedTest.Id);
            return CreatedAtAction(nameof(GetTest), new { testId = duplicatedTest.Id }, duplicatedTest);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating test {TestId}", testId);
            return StatusCode(500, new { message = "Error duplicating test", error = ex.Message });
        }
    }

    [HttpPost("{testId}/submit")]
    public async Task<IActionResult> SubmitTest(string testId, [FromBody] TestSubmissionDto submission)
    {
        try
        {
            var result = await _firebaseService.SubmitTestAsync(testId, submission);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting test {TestId} for user {UserId}", testId, submission.UserId);
            return StatusCode(500, new { message = "Error submitting test", error = ex.Message });
        }
    }

    [HttpGet("statistics")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetTestStatistics([FromQuery] string? testId = null, [FromQuery] string? courseId = null)
    {
        try
        {
            var stats = await _firebaseService.GetTestStatisticsAsync(testId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving test statistics");
            return StatusCode(500, new { message = "Error retrieving test statistics", error = ex.Message });
        }
    }
}