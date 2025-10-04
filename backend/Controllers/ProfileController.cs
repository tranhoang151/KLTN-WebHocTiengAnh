using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BingGoWebAPI.Services;
using BingGoWebAPI.Models;
using System.Security.Claims;
using FirebaseAdmin.Auth;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly IFirebaseAuthService _firebaseAuthService;
    private readonly IFirebaseStorageService _firebaseStorageService;
    private readonly ILogger<ProfileController> _logger;

    public ProfileController(
        IFirebaseService firebaseService,
        IFirebaseAuthService firebaseAuthService,
        IFirebaseStorageService firebaseStorageService,
        ILogger<ProfileController> logger)
    {
        _firebaseService = firebaseService;
        _firebaseAuthService = firebaseAuthService;
        _firebaseStorageService = firebaseStorageService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var profileDto = new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Gender = user.Gender,
                AvatarUrl = user.AvatarUrl,
                AvatarBase64 = user.AvatarBase64,
                StreakCount = user.StreakCount,
                LastLoginDate = user.LastLoginDate,
                ClassIds = user.ClassIds,
                Badges = user.Badges.ToDictionary(
                    kvp => kvp.Key,
                    kvp => new UserBadgeDto
                    {
                        Earned = kvp.Value.Earned,
                        EarnedAt = kvp.Value.EarnedAt?.ToDateTime()
                    }
                ),
                IsActive = user.IsActive
            };

            return Ok(profileDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Validate input
            if (string.IsNullOrWhiteSpace(updateDto.FullName))
            {
                return BadRequest(new { message = "Full name is required" });
            }

            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Update user properties
            user.FullName = updateDto.FullName.Trim();
            user.Gender = updateDto.Gender?.Trim() ?? user.Gender;

            // Handle avatar upload if provided
            if (!string.IsNullOrEmpty(updateDto.AvatarBase64))
            {
                try
                {
                    // Validate base64 format
                    var base64Data = updateDto.AvatarBase64;
                    if (base64Data.Contains(","))
                    {
                        base64Data = base64Data.Split(',')[1]; // Remove data:image/jpeg;base64, prefix
                    }

                    var imageBytes = Convert.FromBase64String(base64Data);

                    // Validate image size (max 5MB)
                    if (imageBytes.Length > 5 * 1024 * 1024)
                    {
                        return BadRequest(new { message = "Avatar image must be less than 5MB" });
                    }

                    // Store as base64 for now (can be enhanced to use Firebase Storage)
                    user.AvatarBase64 = updateDto.AvatarBase64;
                    user.AvatarUrl = null; // Clear URL if using base64
                }
                catch (FormatException)
                {
                    return BadRequest(new { message = "Invalid avatar image format" });
                }
            }

            // Update user in database
            var updatedUser = await _firebaseService.UpdateUserAsync(userId, user);

            var profileDto = new UserProfileDto
            {
                Id = updatedUser.Id,
                FullName = updatedUser.FullName,
                Email = updatedUser.Email,
                Role = updatedUser.Role,
                Gender = updatedUser.Gender,
                AvatarUrl = updatedUser.AvatarUrl,
                AvatarBase64 = updatedUser.AvatarBase64,
                StreakCount = updatedUser.StreakCount,
                LastLoginDate = updatedUser.LastLoginDate,
                ClassIds = updatedUser.ClassIds,
                Badges = updatedUser.Badges.ToDictionary(
                    kvp => kvp.Key,
                    kvp => new UserBadgeDto
                    {
                        Earned = kvp.Value.Earned,
                        EarnedAt = kvp.Value.EarnedAt?.ToDateTime()
                    }
                ),
                IsActive = updatedUser.IsActive
            };

            return Ok(new { message = "Profile updated successfully", profile = profileDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar([FromBody] AvatarUploadDto avatarDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            if (string.IsNullOrEmpty(avatarDto.AvatarBase64))
            {
                return BadRequest(new { message = "Avatar data is required" });
            }

            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            try
            {
                // Validate and process base64 image
                var base64Data = avatarDto.AvatarBase64;
                if (base64Data.Contains(","))
                {
                    base64Data = base64Data.Split(',')[1]; // Remove data:image/jpeg;base64, prefix
                }

                var imageBytes = Convert.FromBase64String(base64Data);

                // Validate image size (max 5MB)
                if (imageBytes.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "Avatar image must be less than 5MB" });
                }

                // Update user avatar
                user.AvatarBase64 = avatarDto.AvatarBase64;
                user.AvatarUrl = null; // Clear URL if using base64

                await _firebaseService.UpdateUserAsync(userId, user);

                return Ok(new
                {
                    message = "Avatar uploaded successfully",
                    avatarBase64 = user.AvatarBase64
                });
            }
            catch (FormatException)
            {
                return BadRequest(new { message = "Invalid image format" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto passwordDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Validate input
            if (string.IsNullOrEmpty(passwordDto.CurrentPassword) ||
                string.IsNullOrEmpty(passwordDto.NewPassword) ||
                string.IsNullOrEmpty(passwordDto.ConfirmPassword))
            {
                return BadRequest(new { message = "All password fields are required" });
            }

            if (passwordDto.NewPassword != passwordDto.ConfirmPassword)
            {
                return BadRequest(new { message = "New password and confirmation do not match" });
            }

            if (passwordDto.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "New password must be at least 6 characters long" });
            }

            if (passwordDto.CurrentPassword == passwordDto.NewPassword)
            {
                return BadRequest(new { message = "New password must be different from current password" });
            }

            try
            {
                // Update password in Firebase Auth
                var updateArgs = new UserRecordArgs
                {
                    Uid = userId,
                    Password = passwordDto.NewPassword
                };

                await _firebaseAuthService.UpdateUserAsync(userId, updateArgs);

                return Ok(new { message = "Password changed successfully" });
            }
            catch (FirebaseAuthException ex)
            {
                _logger.LogError(ex, "Firebase Auth error changing password for user {UserId}", userId);
                return BadRequest(new { message = "Failed to change password. Please try again." });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpDelete("avatar")]
    public async Task<IActionResult> RemoveAvatar()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Remove avatar
            user.AvatarBase64 = null;
            user.AvatarUrl = null;

            await _firebaseService.UpdateUserAsync(userId, user);

            return Ok(new { message = "Avatar removed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing avatar");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}