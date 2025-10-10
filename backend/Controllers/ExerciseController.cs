using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExerciseController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly IBadgeService _badgeService;
    private readonly ILogger<ExerciseController> _logger;

    public ExerciseController(IFirebaseService firebaseService, IBadgeService badgeService, ILogger<ExerciseController> logger)
    {
        _firebaseService = firebaseService;
        _badgeService = badgeService;
        _logger = logger;
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetExercises(string courseId)
    {
        try
        {
            var exercises = await _firebaseService.GetExercisesByCourseAsync(courseId);
            return Ok(exercises);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving exercises for course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error retrieving exercises", error = ex.Message });
        }
    }

    [HttpGet("{exerciseId}")]
    public async Task<IActionResult> GetExercise(string exerciseId)
    {
        try
        {
            var exercise = await _firebaseService.GetExerciseByIdAsync(exerciseId);
            if (exercise == null)
            {
                return NotFound(new { message = "Exercise not found" });
            }
            return Ok(exercise);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving exercise {ExerciseId}", exerciseId);
            return StatusCode(500, new { message = "Error retrieving exercise", error = ex.Message });
        }
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitExercise([FromBody] ExerciseSubmissionDto submission)
    {
        try
        {
            var result = await _firebaseService.ProcessExerciseSubmissionAsync(submission);

            // Record learning activity
            var activity = new LearningActivity
            {
                Type = "exercise",
                ExerciseId = submission.ExerciseId,
                CompletedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp(),
                Score = result.Score // Assuming score is part of LearningActivity for exercises
            };
            await _firebaseService.UpdateLearningHistoryAsync(submission.UserId, activity);

            // Update learning streak
            var user = await _firebaseService.GetUserByIdAsync(submission.UserId);
            if (user != null)
            {
                var today = DateTime.UtcNow.Date;
                var lastLearningDate = user.LastLearningDate == null ? (DateTime?)null : DateTime.Parse(user.LastLearningDate).Date;

                if (lastLearningDate.HasValue)
                {
                    if (lastLearningDate.Value == today) // Already learned today
                    {
                        // No change to streak
                    }
                    else if (lastLearningDate.Value == today.AddDays(-1)) // Learned yesterday, continue streak
                    {
                        user.LearningStreakCount++;
                    }
                    else // Missed a day, reset streak
                    {
                        user.LearningStreakCount = 1;
                    }
                }
                else // First learning activity
                {
                    user.LearningStreakCount = 1;
                }

                user.LastLearningDate = today.ToString("yyyy-MM-dd");
                await _firebaseService.UpdateUserAsync(user.Id, user);

                // Check and award learning streak badge
                await _badgeService.CheckAndAwardBadgeAsync(user.Id, "learning_streak_3");
            }

            // Check for exercise completion badge
            await _badgeService.CheckAndAwardBadgeAsync(submission.UserId, "exercise_complete");

            // Trigger achievement check event (could be used for real-time notifications)
            // This could be extended to use SignalR for real-time notifications

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting exercise for user {UserId}", submission.UserId);
            return StatusCode(500, new { message = "Error submitting exercise", error = ex.Message });
        }
    }
}
