using System.ComponentModel.DataAnnotations;

namespace BingGoWebAPI.Models;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class ValidateTokenRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;
}

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class LoginResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public UserDto? User { get; set; }
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int StreakCount { get; set; }
    public string? LastLoginDate { get; set; }
    public List<string> ClassIds { get; set; } = new();
    public Dictionary<string, UserBadge> Badges { get; set; } = new();
}

public class ValidateTokenResponse
{
    public bool IsValid { get; set; }
    public string? Message { get; set; }
    public UserDto? User { get; set; }
}

public class RefreshTokenResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
}