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

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> CreateExercise([FromBody] Exercise exercise)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate exercise data
            if (exercise.TotalPoints <= 0)
            {
                return BadRequest(new { message = "Total points must be greater than 0" });
            }

            exercise.Id = Guid.NewGuid().ToString();
            exercise.CreatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();
            exercise.UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();
            exercise.IsActive = true;

            var createdExercise = await _firebaseService.CreateExerciseAsync(exercise);

            _logger.LogInformation("Exercise created: {ExerciseId}", createdExercise.Id);
            return CreatedAtAction(nameof(GetExercise), new { exerciseId = createdExercise.Id }, createdExercise);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating exercise");
            return StatusCode(500, new { message = "Error creating exercise", error = ex.Message });
        }
    }

    [HttpPut("{exerciseId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateExercise(string exerciseId, [FromBody] Exercise exercise)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate exercise data
            if (exercise.TotalPoints <= 0)
            {
                return BadRequest(new { message = "Total points must be greater than 0" });
            }

            exercise.UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();

            var updatedExercise = await _firebaseService.UpdateExerciseAsync(exerciseId, exercise);
            if (updatedExercise == null)
            {
                return NotFound(new { message = "Exercise not found" });
            }

            _logger.LogInformation("Exercise updated: {ExerciseId}", exerciseId);
            return Ok(updatedExercise);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating exercise {ExerciseId}", exerciseId);
            return StatusCode(500, new { message = "Error updating exercise", error = ex.Message });
        }
    }

    [HttpDelete("{exerciseId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteExercise(string exerciseId)
    {
        try
        {
            await _firebaseService.DeleteExerciseAsync(exerciseId);

            _logger.LogInformation("Exercise deleted: {ExerciseId}", exerciseId);
            return Ok(new { message = "Exercise deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting exercise {ExerciseId}", exerciseId);
            return StatusCode(500, new { message = "Error deleting exercise", error = ex.Message });
        }
    }

    [HttpPost("{exerciseId}/duplicate")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DuplicateExercise(string exerciseId)
    {
        try
        {
            var duplicatedExercise = await _firebaseService.DuplicateExerciseAsync(exerciseId);

            _logger.LogInformation("Exercise duplicated: {OriginalExerciseId} -> {NewExerciseId}", exerciseId, duplicatedExercise.Id);
            return CreatedAtAction(nameof(GetExercise), new { exerciseId = duplicatedExercise.Id }, duplicatedExercise);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating exercise {ExerciseId}", exerciseId);
            return StatusCode(500, new { message = "Error duplicating exercise", error = ex.Message });
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
