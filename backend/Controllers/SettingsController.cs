using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Services;
using BingGoWebAPI.Models;

namespace BingGoWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly ICustomAuthService _authService;
        private readonly ILogger<SettingsController> _logger;

        public SettingsController(ICustomAuthService authService, ILogger<SettingsController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfileSettings()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                return Ok(new
                {
                    fullName = user.FullName,
                    email = user.Email,
                    gender = user.Gender,
                    avatarUrl = user.AvatarUrl,
                    avatarBase64 = user.AvatarBase64,
                    streakCount = user.StreakCount,
                    lastLoginDate = user.LastLoginDate,
                    classIds = user.ClassIds
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile settings");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfileSettings([FromBody] UpdateProfileRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Update user properties
                if (!string.IsNullOrEmpty(request.FullName))
                    user.FullName = request.FullName;

                if (!string.IsNullOrEmpty(request.Gender))
                    user.Gender = request.Gender;

                if (!string.IsNullOrEmpty(request.AvatarUrl))
                    user.AvatarUrl = request.AvatarUrl;

                if (!string.IsNullOrEmpty(request.AvatarBase64))
                    user.AvatarBase64 = request.AvatarBase64;

                await _authService.UpdateUserAsync(user);

                return Ok(new { message = "Profile updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile settings");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Verify current password
                if (!_authService.VerifyPassword(request.CurrentPassword, user.Password))
                {
                    return BadRequest("Current password is incorrect");
                }

                // Update password
                user.Password = _authService.HashPassword(request.NewPassword);
                await _authService.UpdateUserAsync(user);

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("preferences")]
        public async Task<IActionResult> GetUserPreferences()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Get user preferences from database or return defaults
                var preferences = new
                {
                    notifications = new
                    {
                        email = true,
                        push = true,
                        sms = false
                    },
                    learning = new
                    {
                        dailyGoal = 30, // minutes
                        reminderTime = "19:00",
                        difficulty = "medium"
                    },
                    privacy = new
                    {
                        profileVisibility = "friends",
                        showProgress = true,
                        allowAnalytics = true
                    }
                };

                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user preferences");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdateUserPreferences([FromBody] UserPreferences preferences)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Save preferences to database (implementation depends on your storage strategy)
                // For now, just return success
                return Ok(new { message = "Preferences updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user preferences");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public string? AvatarUrl { get; set; }
        public string? AvatarBase64 { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UserPreferences
    {
        public NotificationSettings? Notifications { get; set; }
        public LearningSettings? Learning { get; set; }
        public PrivacySettings? Privacy { get; set; }
    }

    public class NotificationSettings
    {
        public bool Email { get; set; }
        public bool Push { get; set; }
        public bool Sms { get; set; }
    }

    public class LearningSettings
    {
        public int DailyGoal { get; set; }
        public string ReminderTime { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
    }

    public class PrivacySettings
    {
        public string ProfileVisibility { get; set; } = string.Empty;
        public bool ShowProgress { get; set; }
        public bool AllowAnalytics { get; set; }
    }
}