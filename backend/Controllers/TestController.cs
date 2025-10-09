
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using System.Security.Claims;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly IBadgeService _badgeService;
    private readonly ILogger<TestController> _logger;

    public TestController(IFirebaseService firebaseService, IBadgeService badgeService, ILogger<TestController> logger)
    {
        _firebaseService = firebaseService;
        _badgeService = badgeService;
        _logger = logger;
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

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitTest([FromBody] TestSubmissionDto submission)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var test = await _firebaseService.GetTestByIdAsync(submission.TestId);
            if (test == null || test.Questions == null)
            {
                return NotFound(new { message = "Test not found or has no questions." });
            }

            var correctAnswers = 0;
            var questionResults = new List<QuestionResult>();

            foreach (var userAnswer in submission.Answers)
            {
                var question = test.Questions.FirstOrDefault(q => q.Id == userAnswer.QuestionId);
                if (question != null)
                {
                    bool isCorrect = string.Equals(userAnswer.Answer, question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);
                    if (isCorrect)
                    {
                        correctAnswers++;
                    }
                    questionResults.Add(new QuestionResult
                    {
                        QuestionId = question.Id,
                        UserAnswer = userAnswer.Answer,
                        CorrectAnswer = question.CorrectAnswer,
                        IsCorrect = isCorrect,
                        Explanation = question.Explanation
                    });
                }
            }

            var resultDto = new TestResultDto
            {
                SubmissionId = Guid.NewGuid().ToString(),
                TestId = submission.TestId,
                UserId = userId,
                CorrectAnswers = correctAnswers,
                TotalQuestions = test.Questions.Count,
                Score = test.Questions.Count > 0 ? (double)correctAnswers / test.Questions.Count * 100 : 0,
                SubmittedAt = DateTime.UtcNow,
                QuestionResults = questionResults
            };

            var savedResult = await _firebaseService.SaveTestSubmissionAsync(resultDto);

            // Award badges
            await _badgeService.CheckAndAwardBadgeAsync(userId, "test_complete_2");

            // Log learning activity
            await _firebaseService.UpdateLearningHistoryAsync(userId, new LearningActivity
            {
                Type = "test",
                ExerciseId = submission.TestId, // Using ExerciseId field for TestId
                Score = resultDto.Score,
                CompletedAt = Google.Cloud.Firestore.Timestamp.FromDateTime(resultDto.SubmittedAt)
            });

            return Ok(savedResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting test for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return StatusCode(500, new { message = "An error occurred while submitting the test.", error = ex.Message });
        }
    }

    [HttpGet("result/{submissionId}")]
    public async Task<IActionResult> GetTestResult(string submissionId)
    {
        try
        {
            var result = await _firebaseService.GetDocumentAsync<TestResultDto>("test_submissions", submissionId);
            if (result == null)
            {
                return NotFound(new { message = "Test submission not found." });
            }

            // Security check: ensure the user requesting the result is the one who submitted it, or an admin/teacher
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (result.UserId != userId && !User.IsInRole("admin") && !User.IsInRole("teacher"))
            {
                return Forbid();
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving test result {SubmissionId}", submissionId);
            return StatusCode(500, new { message = "Error retrieving test result.", error = ex.Message });
        }
    }
}
