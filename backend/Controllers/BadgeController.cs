using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/badges")]
[Authorize]
public class BadgeController : ControllerBase
{
    private readonly IBadgeService _badgeService;
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<BadgeController> _logger;

    public BadgeController(IBadgeService badgeService, IFirebaseService firebaseService, ILogger<BadgeController> logger)
    {
        _badgeService = badgeService;
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpGet("definitions")]
    public async Task<IActionResult> GetBadgeDefinitions()
    {
        // Temporary diagnostic code to bypass the service layer
        _logger.LogWarning("Executing temporary mock implementation for GetBadgeDefinitions.");
        var mockBadges = new List<Badge>
        {
            new Badge { Id = "mock1", Name = "Mock Badge 1", Description = "This is a test badge." },
            new Badge { Id = "mock2", Name = "Mock Badge 2", Description = "This is another test badge." }
        };
        await Task.Delay(10); // Simulate async operation
        return Ok(mockBadges);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserBadges(string userId)
    {
        try
        {
            var badges = await _badgeService.GetUserBadgesAsync(userId);
            return Ok(badges);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user badges for user {UserId}", userId);
            return StatusCode(500, new { message = "Error retrieving user badges", error = ex.Message });
        }
    }

    [HttpGet("notifications/{userId}")]
    public async Task<IActionResult> GetBadgeNotifications(string userId)
    {
        try
        {
            var notifications = await _badgeService.GetBadgeNotificationsAsync(userId);
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving badge notifications for user {UserId}", userId);
            return StatusCode(500, new { message = "Error retrieving badge notifications", error = ex.Message });
        }
    }

    [HttpPost("notifications/{userId}/{badgeId}/seen")]
    public async Task<IActionResult> MarkNotificationAsSeen(string userId, string badgeId)
    {
        try
        {
            await _badgeService.MarkNotificationAsSeenAsync(userId, badgeId);
            return Ok(new { message = "Notification marked as seen" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as seen for user {UserId}, badge {BadgeId}", userId, badgeId);
            return StatusCode(500, new { message = "Error marking notification as seen", error = ex.Message });
        }
    }

    [HttpPost("share")]
    public async Task<IActionResult> ShareAchievement([FromBody] ShareAchievementDto shareDto)
    {
        try
        {
            await _badgeService.ShareAchievementAsync(shareDto.UserId, shareDto.BadgeId, shareDto.Platform);
            return Ok(new { message = "Achievement shared successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sharing achievement for user {UserId}, badge {BadgeId}", shareDto.UserId, shareDto.BadgeId);
            return StatusCode(500, new { message = "Error sharing achievement", error = ex.Message });
        }
    }

    [HttpGet("stats/{userId}")]
    public async Task<IActionResult> GetAchievementStats(string userId)
    {
        try
        {
            var stats = await _badgeService.GetAchievementStatsAsync(userId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving achievement stats for user {UserId}", userId);
            return StatusCode(500, new { message = "Error retrieving achievement stats", error = ex.Message });
        }
    }

    [HttpPost("award")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> AwardBadge([FromBody] AwardBadgeDto awardDto)
    {
        try
        {
            await _badgeService.AwardBadgeAsync(awardDto.UserId, awardDto.BadgeId);
            return Ok(new { message = "Badge awarded successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error awarding badge {BadgeId} to user {UserId}", awardDto.BadgeId, awardDto.UserId);
            return StatusCode(500, new { message = "Error awarding badge", error = ex.Message });
        }
    }
}

public class ShareAchievementDto
{
    public string UserId { get; set; } = string.Empty;
    public string BadgeId { get; set; } = string.Empty;
    public string Platform { get; set; } = "general";
}

public class AwardBadgeDto
{
    public string UserId { get; set; } = string.Empty;
    public string BadgeId { get; set; } = string.Empty;
}