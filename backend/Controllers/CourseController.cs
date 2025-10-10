using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using Google.Cloud.Firestore;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CourseController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<CourseController> _logger;

    public CourseController(IFirebaseService firebaseService, ILogger<CourseController> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetAllCourses([FromQuery] string? search = null)
    {
        try
        {
            var courses = await _firebaseService.GetAllCoursesAsync();

            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                courses = courses.Where(c =>
                    c.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    c.Description.Contains(search, StringComparison.OrdinalIgnoreCase)
                ).ToList();
            }

            return Ok(courses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving courses");
            return StatusCode(500, new { message = "Error retrieving courses", error = ex.Message });
        }
    }

    [HttpGet("{courseId}")]
    public async Task<IActionResult> GetCourse(string courseId)
    {
        try
        {
            var course = await _firebaseService.GetCourseByIdAsync(courseId);
            if (course == null)
            {
                return NotFound(new { message = "Course not found" });
            }
            return Ok(course);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error retrieving course", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> CreateCourse([FromBody] Course course)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            course.Id = Guid.NewGuid().ToString();
            course.CreatedAt = Timestamp.GetCurrentTimestamp();

            var createdCourse = await _firebaseService.CreateCourseAsync(course);

            _logger.LogInformation("Course created: {CourseId}", createdCourse.Id);
            return CreatedAtAction(nameof(GetCourse), new { courseId = createdCourse.Id }, createdCourse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course");
            return StatusCode(500, new { message = "Error creating course", error = ex.Message });
        }
    }

    [HttpPut("{courseId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateCourse(string courseId, [FromBody] Course course)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedCourse = await _firebaseService.UpdateCourseAsync(courseId, course);
            if (updatedCourse == null)
            {
                return NotFound(new { message = "Course not found" });
            }

            _logger.LogInformation("Course updated: {CourseId}", courseId);
            return Ok(updatedCourse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error updating course", error = ex.Message });
        }
    }

    [HttpDelete("{courseId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteCourse(string courseId)
    {
        try
        {
            await _firebaseService.DeleteCourseAsync(courseId);

            _logger.LogInformation("Course deleted: {CourseId}", courseId);
            return Ok(new { message = "Course deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error deleting course", error = ex.Message });
        }
    }

    [HttpPost("{courseId}/assign-classes")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> AssignClassesToCourse(string courseId, [FromBody] List<string> classIds)
    {
        try
        {
            await _firebaseService.AssignClassesToCourseAsync(courseId, classIds);

            _logger.LogInformation("Classes {ClassIds} assigned to course {CourseId}", string.Join(",", classIds), courseId);
            return Ok(new { message = "Classes assigned successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Assign failed: Course not found: {CourseId}", courseId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning classes to course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error assigning classes", error = ex.Message });
        }
    }

    [HttpGet("{courseId}/classes")]
    public async Task<IActionResult> GetCourseClasses(string courseId)
    {
        try
        {
            var classes = await _firebaseService.GetCourseClassesAsync(courseId);
            return Ok(classes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving classes for course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error retrieving course classes", error = ex.Message });
        }
    }

    [HttpGet("{courseId}/statistics")]
    public async Task<IActionResult> GetCourseStatistics(string courseId)
    {
        try
        {
            var stats = await _firebaseService.GetCourseStatisticsAsync(courseId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statistics for course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error retrieving course statistics", error = ex.Message });
        }
    }
}