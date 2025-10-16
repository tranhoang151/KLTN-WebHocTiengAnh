using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FlashcardController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly IBadgeService _badgeService;
    private readonly ILogger<FlashcardController> _logger;

    public FlashcardController(
        IFirebaseService firebaseService,
        IBadgeService badgeService,
        ILogger<FlashcardController> logger)
    {
        _firebaseService = firebaseService;
        _badgeService = badgeService;
        _logger = logger;
    }

    [HttpGet("sets/{courseId}")]
    public async Task<IActionResult> GetFlashcardSets(string courseId)
    {
        try
        {
            var sets = await _firebaseService.GetFlashcardSetsByCourseAsync(courseId);
            return Ok(sets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving flashcard sets for course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error retrieving flashcard sets", error = ex.Message });
        }
    }

    [HttpGet("set/{setId}/cards")]
    public async Task<IActionResult> GetFlashcards(string setId)
    {
        try
        {
            var cards = await _firebaseService.GetFlashcardsBySetAsync(setId);
            return Ok(cards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving flashcards for set {SetId}", setId);
            return StatusCode(500, new { message = "Error retrieving flashcards", error = ex.Message });
        }
    }

    [HttpPost("progress")]
    public async Task<IActionResult> UpdateProgress([FromBody] FlashcardProgressDto progress)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _firebaseService.UpdateFlashcardProgressAsync(progress);

            // Record learning activity
            var activity = new LearningActivity
            {
                Type = "flashcard",
                FlashcardSetId = progress.SetId,
                CompletedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp(),
                TimeSpent = progress.TimeSpent
            };
            await _firebaseService.UpdateLearningHistoryAsync(progress.UserId, activity);

            // Update learning streak
            var user = await _firebaseService.GetUserByIdAsync(progress.UserId);
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

            // Check for badge eligibility
            if (progress.CompletionPercentage >= 100)
            {
                await _badgeService.CheckAndAwardBadgeAsync(progress.UserId, "flashcard_complete");
            }

            _logger.LogInformation("Flashcard progress updated for user {UserId}, set {SetId}",
                progress.UserId, progress.SetId);

            return Ok(new { message = "Progress updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating flashcard progress");
            return StatusCode(500, new { message = "Error updating progress", error = ex.Message });
        }
    }

    [HttpGet("progress/{userId}/{setId}")]
    public async Task<IActionResult> GetProgress(string userId, string setId)
    {
        try
        {
            var progress = await _firebaseService.GetFlashcardProgressAsync(userId, setId);
            if (progress == null)
            {
                return NotFound(new { message = "Progress not found" });
            }

            return Ok(progress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving flashcard progress for user {UserId}, set {SetId}",
                userId, setId);
            return StatusCode(500, new { message = "Error retrieving progress", error = ex.Message });
        }
    }

    [HttpGet("sets")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetAllFlashcardSets()
    {
        try
        {
            var sets = await _firebaseService.GetFlashcardSetsAsync();
            return Ok(sets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all flashcard sets");
            return StatusCode(500, new { message = "Error retrieving flashcard sets", error = ex.Message });
        }
    }

    [HttpPost("set")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> CreateFlashcardSet([FromBody] CreateFlashcardSetDto setDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var flashcardSet = new FlashcardSet
            {
                Id = Guid.NewGuid().ToString(),
                Title = setDto.Title,
                Description = setDto.Description,
                CourseId = setDto.CourseId,
                CreatedBy = User.Identity?.Name ?? "system",
                CreatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp(),
                AssignedClassIds = setDto.AssignedClassIds ?? new List<string>(),
                SetId = Guid.NewGuid().ToString(),
                IsActive = true
            };

            var createdSet = await _firebaseService.CreateFlashcardSetAsync(flashcardSet);

            _logger.LogInformation("Flashcard set created: {SetId}", createdSet.Id);
            return CreatedAtAction(nameof(GetFlashcards), new { setId = createdSet.Id }, createdSet);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating flashcard set");
            return StatusCode(500, new { message = "Error creating flashcard set", error = ex.Message });
        }
    }

    [HttpPost("set/{setId}/card")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> CreateFlashcard(string setId, [FromBody] CreateFlashcardDto cardDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var flashcard = new Flashcard
            {
                Id = Guid.NewGuid().ToString(),
                FlashcardSetId = setId,
                FrontText = cardDto.FrontText,
                BackText = cardDto.BackText,
                ExampleSentence = cardDto.ExampleSentence,
                ImageUrl = cardDto.ImageUrl,
                ImageBase64 = cardDto.ImageBase64,
                Order = cardDto.Order
            };

            var createdCard = await _firebaseService.CreateFlashcardAsync(flashcard);

            _logger.LogInformation("Flashcard created: {CardId} in set {SetId}", createdCard.Id, setId);
            return CreatedAtAction(nameof(GetFlashcards), new { setId }, createdCard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating flashcard");
            return StatusCode(500, new { message = "Error creating flashcard", error = ex.Message });
        }
    }

    [HttpPut("set/{setId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateFlashcardSet(string setId, [FromBody] CreateFlashcardSetDto setDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedSet = await _firebaseService.UpdateFlashcardSetAsync(setId, setDto);
            if (updatedSet == null)
            {
                return NotFound(new { message = "Flashcard set not found" });
            }

            _logger.LogInformation("Flashcard set updated: {SetId}", setId);
            return Ok(updatedSet);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating flashcard set");
            return StatusCode(500, new { message = "Error updating flashcard set", error = ex.Message });
        }
    }

    [HttpDelete("set/{setId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteFlashcardSet(string setId)
    {
        try
        {
            var deleted = await _firebaseService.DeleteFlashcardSetAsync(setId);
            if (!deleted)
            {
                return NotFound(new { message = "Flashcard set not found" });
            }

            _logger.LogInformation("Flashcard set deleted: {SetId}", setId);
            return Ok(new { message = "Flashcard set deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting flashcard set");
            return StatusCode(500, new { message = "Error deleting flashcard set", error = ex.Message });
        }
    }

    [HttpPut("card/{cardId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateFlashcard(string cardId, [FromBody] CreateFlashcardDto cardDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedCard = await _firebaseService.UpdateFlashcardAsync(cardId, cardDto);
            if (updatedCard == null)
            {
                return NotFound(new { message = "Flashcard not found" });
            }

            _logger.LogInformation("Flashcard updated: {CardId}", cardId);
            return Ok(updatedCard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating flashcard");
            return StatusCode(500, new { message = "Error updating flashcard", error = ex.Message });
        }
    }

    [HttpDelete("card/{cardId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteFlashcard(string cardId)
    {
        try
        {
            var deleted = await _firebaseService.DeleteFlashcardAsync(cardId);
            if (!deleted)
            {
                return NotFound(new { message = "Flashcard not found" });
            }

            _logger.LogInformation("Flashcard deleted: {CardId}", cardId);
            return Ok(new { message = "Flashcard deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting flashcard");
            return StatusCode(500, new { message = "Error deleting flashcard", error = ex.Message });
        }
    }

    [HttpPut("set/{setId}/reorder")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> ReorderFlashcards(string setId, [FromBody] ReorderFlashcardsDto reorderDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _firebaseService.ReorderFlashcardsAsync(setId, reorderDto.Cards);

            _logger.LogInformation("Flashcards reordered for set: {SetId}", setId);
            return Ok(new { message = "Flashcards reordered successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering flashcards");
            return StatusCode(500, new { message = "Error reordering flashcards", error = ex.Message });
        }
    }

    [HttpGet("history/{userId}/{setId}")]
    public async Task<IActionResult> GetHistory(string userId, string setId)
    {
        try
        {
            var activities = await _firebaseService.GetLearningActivitiesAsync(userId, setId);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving learning history for user {UserId}, set {SetId}", userId, setId);
            return StatusCode(500, new { message = "Error retrieving learning history", error = ex.Message });
        }
    }

    [HttpGet("sets/student/{studentId}/{courseId}")]
    public async Task<IActionResult> GetFlashcardSetsForStudent(string studentId, string courseId)
    {
        try
        {
            var sets = await _firebaseService.GetFlashcardSetsForStudentAsync(studentId, courseId);
            return Ok(sets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving flashcard sets for student {StudentId} and course {CourseId}", studentId, courseId);
            return StatusCode(500, new { message = "Error retrieving flashcard sets for student", error = ex.Message });
        }
    }

    [HttpPut("set/{setId}/assign")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> AssignFlashcardSet(string setId, [FromBody] List<string> classIds)
    {
        try
        {
            await _firebaseService.AssignFlashcardSetAsync(setId, classIds);
            _logger.LogInformation("Flashcard set {SetId} assigned to classes {ClassIds}", setId, string.Join(",", classIds));
            return Ok(new { message = "Flashcard set assigned successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Assign failed: Flashcard set not found: {SetId}", setId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning flashcard set {SetId}", setId);
            return StatusCode(500, new { message = "Error assigning flashcard set", error = ex.Message });
        }
    }

    [HttpGet("analytics/teacher/{teacherId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetTeacherAnalytics(string teacherId, [FromQuery] string? courseId = null, [FromQuery] string? setId = null)
    {
        try
        {
            var analytics = await _firebaseService.GetTeacherAnalyticsAsync(teacherId, courseId, setId);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teacher analytics for teacher {TeacherId}", teacherId);
            return StatusCode(500, new { message = "Error retrieving teacher analytics", error = ex.Message });
        }
    }

    [HttpGet("analytics/class/{classId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetClassAnalytics(string classId, [FromQuery] string? courseId = null, [FromQuery] string? setId = null)
    {
        try
        {
            var analytics = await _firebaseService.GetClassAnalyticsAsync(classId, courseId, setId);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving class analytics for class {ClassId}", classId);
            return StatusCode(500, new { message = "Error retrieving class analytics", error = ex.Message });
        }
    }

    [HttpGet("analytics/student/{studentId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetStudentAnalytics(string studentId, [FromQuery] string? courseId = null, [FromQuery] string? setId = null)
    {
        try
        {
            var analytics = await _firebaseService.GetStudentAnalyticsAsync(studentId, courseId, setId);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving student analytics for student {StudentId}", studentId);
            return StatusCode(500, new { message = "Error retrieving student analytics", error = ex.Message });
        }
    }

    [HttpGet("badges/{userId}")]
    [Authorize(Roles = "admin,teacher,student")]
    public async Task<IActionResult> GetUserBadges(string userId)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Convert user badges to a more detailed format
            var badges = user.Badges.Select(kvp => new
            {
                Id = kvp.Key,
                Name = GetBadgeName(kvp.Key),
                Description = GetBadgeDescription(kvp.Key),
                ImageUrl = GetBadgeImageUrl(kvp.Key),
                Earned = kvp.Value.Earned,
                EarnedAt = kvp.Value.EarnedAt?.ToDateTime(),
                Category = GetBadgeCategory(kvp.Key),
                Rarity = GetBadgeRarity(kvp.Key)
            }).ToList();

            return Ok(badges);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving badges for user {UserId}", userId);
            return StatusCode(500, new { message = "Error retrieving user badges", error = ex.Message });
        }
    }

    [HttpGet("streak/{userId}")]
    [Authorize(Roles = "admin,teacher,parent,student")]
    public async Task<IActionResult> GetStreakData(string userId)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Get learning activities to build streak calendar
            var activities = await _firebaseService.GetAllLearningActivitiesAsync(userId);
            var streakCalendar = new Dictionary<string, bool>();

            // Build calendar for last 90 days
            var today = DateTime.UtcNow.Date;
            for (int i = 0; i < 90; i++)
            {
                var date = today.AddDays(-i);
                var dateString = date.ToString("yyyy-MM-dd");
                var hasActivity = activities.Any(a => a.CompletedAt.ToDateTime().Date == date);
                streakCalendar[dateString] = hasActivity;
            }

            var streakData = new
            {
                CurrentStreak = user.LearningStreakCount,
                LongestStreak = CalculateLongestStreak(activities),
                StreakCalendar = streakCalendar
            };

            return Ok(streakData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving streak data for user {UserId}", userId);
            return StatusCode(500, new { message = "Error retrieving streak data", error = ex.Message });
        }
    }

    private string GetBadgeName(string badgeId)
    {
        return badgeId switch
        {
            "login_streak_3" => "Chăm chỉ đăng nhập",
            "flashcard_complete" => "Chuyên gia Flashcard",
            "exercise_complete" => "Siêng năng làm bài tập",
            "test_complete_2" => "Thi cử tích cực",
            "video_complete" => "Học qua video",
            "learning_streak_3" => "Streak học tập 3 ngày",
            _ => "Unknown Badge"
        };
    }

    private string GetBadgeDescription(string badgeId)
    {
        return badgeId switch
        {
            "login_streak_3" => "Đăng nhập 3 ngày liên tiếp",
            "flashcard_complete" => "Học xong 1 bộ flashcard",
            "exercise_complete" => "Hoàn thành 1 bài tập",
            "test_complete_2" => "Hoàn thành 2 bài kiểm tra",
            "video_complete" => "Xem hoàn thành 1 video học tập",
            "learning_streak_3" => "Học liên tục 3 ngày",
            _ => "Unknown badge description"
        };
    }

    private string GetBadgeImageUrl(string badgeId)
    {
        return badgeId switch
        {
            "login_streak_3" => "https://i.postimg.cc/Gm7BStxm/Depth-5-Frame-0.png",
            "flashcard_complete" => "https://i.postimg.cc/VNqxkrZY/Depth-6-Frame-0.png",
            "exercise_complete" => "https://i.postimg.cc/8CQK8yJL/Depth-7-Frame-0.png",
            "test_complete_2" => "https://i.postimg.cc/L8pLbzpL/Depth-8-Frame-0.png",
            "video_complete" => "https://i.postimg.cc/9FLzJzpL/Depth-9-Frame-0.png",
            "learning_streak_3" => "https://i.postimg.cc/L6pLbzpL/Depth-10-Frame-0.png",
            _ => "https://i.postimg.cc/VNqxkrZY/Depth-6-Frame-0.png"
        };
    }

    private string GetBadgeCategory(string badgeId)
    {
        return badgeId switch
        {
            "login_streak_3" or "learning_streak_3" => "consistency",
            "flashcard_complete" => "learning",
            "exercise_complete" => "exercises",
            "test_complete_2" => "tests",
            "video_complete" => "videos",
            _ => "general"
        };
    }

    private string GetBadgeRarity(string badgeId)
    {
        return badgeId switch
        {
            "login_streak_3" or "flashcard_complete" or "exercise_complete" or "video_complete" => "common",
            "test_complete_2" or "learning_streak_3" => "rare",
            _ => "common"
        };
    }

    private int CalculateLongestStreak(List<LearningActivity> activities)
    {
        if (!activities.Any()) return 0;

        var activityDates = activities
            .Select(a => a.CompletedAt.ToDateTime().Date)
            .Distinct()
            .OrderBy(d => d)
            .ToList();

        int longestStreak = 1;
        int currentStreak = 1;

        for (int i = 1; i < activityDates.Count; i++)
        {
            if (activityDates[i] == activityDates[i - 1].AddDays(1))
            {
                currentStreak++;
                longestStreak = Math.Max(longestStreak, currentStreak);
            }
            else
            {
                currentStreak = 1;
            }
        }

        return longestStreak;
    }
}