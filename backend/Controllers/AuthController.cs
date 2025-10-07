using Microsoft.AspNetCore.Mvc;
using BingGoWebAPI.Services;
using BingGoWebAPI.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ICustomAuthService _customAuthService;
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ICustomAuthService customAuthService,
        IFirebaseService firebaseService,
        ILogger<AuthController> logger)
    {
        _customAuthService = customAuthService;
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpGet("sync-data")]
    public async Task<IActionResult> GetSyncData()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Success = false, Message = "User not authenticated" });
            }

            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "User not found" });
            }

            // Return current user data for synchronization
            return Ok(new
            {
                Success = true,
                User = MapUserToDto(user),
                LastSyncDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ServerTimestamp = DateTime.UtcNow.ToString("O"),
                DataVersion = "1.0"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sync data for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return StatusCode(500, new { Success = false, Message = "Internal server error" });
        }
    }

    [HttpPost("sync-progress")]
    public async Task<IActionResult> SyncProgress([FromBody] SyncProgressRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Success = false, Message = "User not authenticated" });
            }

            // Sync learning progress data
            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "User not found" });
            }

            // Update learning history and streak data
            if (request.LearningHistory != null)
            {
                // Merge learning history with existing data
                foreach (var entry in request.LearningHistory)
                {
                    user.LearningHistory[entry.Key] = entry.Value;
                }
            }

            if (request.LastLearningDate != null)
            {
                user.LastLearningDate = request.LastLearningDate;

                // Calculate learning streak based on Android app logic
                var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
                var lastLearning = user.LastLearningDate;

                if (lastLearning != today)
                {
                    if (string.IsNullOrEmpty(lastLearning))
                    {
                        user.LearningStreakCount = 1;
                    }
                    else
                    {
                        var lastLearningDate = DateTime.Parse(lastLearning);
                        var daysDifference = (DateTime.Parse(today) - lastLearningDate).Days;

                        if (daysDifference == 1)
                        {
                            // Consecutive day - increment streak
                            user.LearningStreakCount++;
                        }
                        else if (daysDifference > 1)
                        {
                            // Streak broken - reset to 1
                            user.LearningStreakCount = 1;
                        }
                    }
                }
            }

            if (request.Badges != null)
            {
                // Merge badges with existing data
                foreach (var badge in request.Badges)
                {
                    user.Badges[badge.Key] = badge.Value;
                }
            }

            await _firebaseService.UpdateUserAsync(user);

            return Ok(new
            {
                Success = true,
                Message = "Progress synchronized successfully",
                User = MapUserToDto(user),
                SyncedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ServerTimestamp = DateTime.UtcNow.ToString("O")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing progress for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return StatusCode(500, new { Success = false, Message = "Internal server error" });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Success = false, Message = "Invalid request data" });
            }

            var result = await _customAuthService.AuthenticateAsync(request.Email, request.Password);

            if (!result.Success)
            {
                return Unauthorized(new { Success = false, Message = result.Error ?? "Authentication failed" });
            }

            var userDto = MapUserToDto(result.User!);

            // Update login streak and last login date (synchronized with Android app logic)
            try
            {
                var user = result.User!;
                var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
                var lastLogin = user.LastLoginDate;

                // Calculate streak based on Android app logic
                if (lastLogin != today)
                {
                    if (string.IsNullOrEmpty(lastLogin))
                    {
                        user.LearningStreakCount = 1;
                    }
                    else
                    {
                        var lastLoginDate = DateTime.Parse(lastLogin);
                        var daysDifference = (DateTime.Parse(today) - lastLoginDate).Days;

                        if (daysDifference == 1)
                        {
                            // Consecutive day - increment streak
                            user.LearningStreakCount++;
                        }
                        else if (daysDifference > 1)
                        {
                            // Streak broken - reset to 1
                            user.LearningStreakCount = 1;
                        }
                    }

                    user.LastLoginDate = today;
                    await _firebaseService.UpdateUserAsync(user);
                }

                // Update userDto with latest streak data
                userDto.StreakCount = user.LearningStreakCount;
                userDto.LastLoginDate = user.LastLoginDate;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to update user streak data on login for email {Email}", request.Email);
            }

            return Ok(new LoginResponse
            {
                Success = true,
                Message = "Login successful",
                Token = result.Token,
                RefreshToken = result.RefreshToken,
                User = userDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email {Email}", request.Email);
            return StatusCode(500, new { Success = false, Message = "Internal server error" });
        }
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateSession([FromBody] ValidateTokenRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Token))
            {
                return BadRequest(new { IsValid = false, Message = "Invalid token format" });
            }

            var isValid = await _customAuthService.ValidateTokenAsync(request.Token);

            if (!isValid)
            {
                return Ok(new { IsValid = false, Message = "Token is invalid or expired" });
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var jsonToken = tokenHandler.ReadJwtToken(request.Token);
            var userId = jsonToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            var email = jsonToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;

            if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(email))
            {
                var user = await _customAuthService.GetUserByEmailAsync(email);
                if (user != null)
                {
                    return Ok(new ValidateTokenResponse
                    {
                        IsValid = true,
                        Message = "Token is valid",
                        User = MapUserToDto(user)
                    });
                }
            }

            return Ok(new { IsValid = true, Message = "Token is valid" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return StatusCode(500, new { IsValid = false, Message = "Internal server error" });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return BadRequest(new { Success = false, Message = "Invalid refresh token format" });
            }

            var isValidRefreshToken = await _customAuthService.ValidateRefreshTokenAsync(request.RefreshToken);

            if (!isValidRefreshToken)
            {
                return Unauthorized(new { Success = false, Message = "Invalid or expired refresh token" });
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var jsonToken = tokenHandler.ReadJwtToken(request.RefreshToken);
            var userId = jsonToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Success = false, Message = "Invalid refresh token" });
            }

            var user = await _customAuthService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "User not found" });
            }

            var newToken = await _customAuthService.GenerateJwtTokenAsync(user);
            var newRefreshToken = await _customAuthService.GenerateRefreshTokenAsync(user);

            return Ok(new RefreshTokenResponse
            {
                Success = true,
                Message = "Token refreshed successfully",
                Token = newToken,
                RefreshToken = newRefreshToken
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, new { Success = false, Message = "Internal server error" });
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            _logger.LogInformation("User {UserId} logged out", userId);

            // Update last login date and streak when user logs out
            try
            {
                var user = await _customAuthService.GetUserByEmailAsync(User.FindFirst(ClaimTypes.Email)?.Value ?? "");
                if (user != null)
                {
                    user.LastLoginDate = DateTime.UtcNow.ToString("yyyy-MM-dd");
                    // Note: Streak calculation logic should be implemented based on Android app logic
                    await _firebaseService.UpdateUserAsync(user);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to update user login data on logout for user {UserId}", userId);
            }
        }
        return Ok(new { message = "Logout successful" });
    }

    private static UserDto MapUserToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Gender = user.Gender,
            AvatarUrl = user.AvatarUrl,
            StreakCount = user.LearningStreakCount,
            LastLoginDate = user.LastLoginDate,
            ClassIds = user.ClassIds,
            Badges = user.Badges.ToDictionary(kvp => kvp.Key, kvp => kvp.Value) // Ensure dictionary is mapped
        };
    }
}