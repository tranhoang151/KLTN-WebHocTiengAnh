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

    private static object? GetDynamicProperty(dynamic obj, string propertyName)
    {
        try
        {
            // Try to access property directly first
            var property = obj.GetType().GetProperty(propertyName);
            if (property != null)
            {
                return property.GetValue(obj);
            }

            // Try dictionary access
            if (obj is IDictionary<string, object> dict)
            {
                return dict.ContainsKey(propertyName) ? dict[propertyName] : null;
            }

            // Try dynamic access
            return ((dynamic)obj)[propertyName];
        }
        catch
        {
            return null;
        }
    }

    public ExerciseController(IFirebaseService firebaseService, IBadgeService badgeService, ILogger<ExerciseController> logger)
    {
        _firebaseService = firebaseService;
        _badgeService = badgeService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "admin,teacher,student")]
    public async Task<IActionResult> GetAllExercises()
    {
        try
        {
            var exercises = await _firebaseService.GetAllExercisesAsync();
            return Ok(exercises);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all exercises");
            return StatusCode(500, new { message = "Error retrieving exercises", error = ex.Message });
        }
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { message = "Test endpoint working!" });
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
    public async Task<IActionResult> CreateExercise([FromBody] System.Text.Json.JsonElement exerciseData)
    {
        try
        {
            // Log exercise creation
            _logger.LogInformation("Creating exercise");

            if (exerciseData.ValueKind == System.Text.Json.JsonValueKind.Null)
            {
                _logger.LogWarning("Exercise data is null");
                return BadRequest("Exercise data is required");
            }

            // Log the received data for debugging
            _logger.LogInformation("Received exercise data");

            // Extract data from JsonElement
            string title = "";
            string type = "";
            string courseId = "";
            string createdBy = "";

            if (exerciseData.TryGetProperty("title", out var titleProp))
                title = titleProp.GetString() ?? "";
            if (exerciseData.TryGetProperty("type", out var typeProp))
                type = typeProp.GetString() ?? "";
            if (exerciseData.TryGetProperty("course_id", out var courseIdProp))
                courseId = courseIdProp.GetString() ?? "";
            if (exerciseData.TryGetProperty("created_by", out var createdByProp))
                createdBy = createdByProp.GetString() ?? "";

            if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(type) || string.IsNullOrEmpty(courseId))
            {
                return BadRequest("Title, type, and course_id are required");
            }

            // Create exercise data (simple structure like backup.json)
            var exerciseDataDict = new Dictionary<string, object>
            {
                ["id"] = Guid.NewGuid().ToString(),
                ["type"] = type,
                ["title"] = title,
                ["course_id"] = courseId,
                ["questions"] = new List<Dictionary<string, object>>()
            };

            // Process questions data
            if (exerciseData.TryGetProperty("questions", out var questionsProp) && questionsProp.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                _logger.LogInformation("Processing {Count} questions", questionsProp.GetArrayLength());

                var questionsList = new List<Dictionary<string, object>>();

                foreach (var questionElement in questionsProp.EnumerateArray())
                {
                    try
                    {
                        var questionText = questionElement.TryGetProperty("content", out var contentProp) ? contentProp.GetString() :
                                          (questionElement.TryGetProperty("question_text", out var questionTextProp) ? questionTextProp.GetString() : null);

                        if (string.IsNullOrEmpty(questionText))
                            continue;

                        var questionData = new Dictionary<string, object>
                        {
                            ["id"] = questionElement.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? Guid.NewGuid().ToString() : Guid.NewGuid().ToString(),
                            ["question_text"] = questionText,
                            ["correct_answer"] = questionElement.TryGetProperty("correctAnswer", out var correctAnswerProp) ? correctAnswerProp.GetString() :
                                              (questionElement.TryGetProperty("correct_answer", out var correctAnswerProp2) ? correctAnswerProp2.GetString() : null)
                        };

                        // Handle options for multiple choice questions
                        if (questionElement.TryGetProperty("options", out var optionsProp) && optionsProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            var optionsList = new List<string>();
                            foreach (var optionElement in optionsProp.EnumerateArray())
                            {
                                if (optionElement.ValueKind == System.Text.Json.JsonValueKind.String)
                                {
                                    var option = optionElement.GetString();
                                    if (!string.IsNullOrEmpty(option))
                                        optionsList.Add(option);
                                }
                            }
                            if (optionsList.Count > 0)
                            {
                                questionData["options"] = optionsList;
                            }
                        }

                        questionsList.Add(questionData);
                    }
                    catch (Exception qex)
                    {
                        _logger.LogWarning(qex, "Error processing question, skipping");
                    }
                }

                exerciseDataDict["questions"] = questionsList;
            }

            // Calculate totalPoints based on questions count (like Android app)
            var questionCount = ((List<Dictionary<string, object>>)exerciseDataDict["questions"]).Count;
            var totalPoints = questionCount * 10;

            _logger.LogInformation("Exercise prepared with {QuestionCount} questions, total points: {TotalPoints}",
                questionCount, totalPoints);

            var createdExercise = await _firebaseService.CreateExerciseAsync(exerciseDataDict);

            _logger.LogInformation("Exercise created successfully: {ExerciseId}", createdExercise.Id);
            return CreatedAtAction(nameof(GetExercise), new { exerciseId = createdExercise.Id }, createdExercise);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating exercise: {Error}", ex.Message);
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

            // Calculate totalPoints based on questions count (like Android app)
            exercise.TotalPoints = exercise.Questions?.Count * 10 ?? 0;

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
