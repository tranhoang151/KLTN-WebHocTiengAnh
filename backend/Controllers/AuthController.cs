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

            if (!string.IsNullOrEmpty(userId))
            {
                var user = await _firebaseService.GetUserByIdAsync(userId);
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

            var user = await _firebaseService.GetUserByIdAsync(userId);
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
    public IActionResult Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            _logger.LogInformation("User {UserId} logged out", userId);
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