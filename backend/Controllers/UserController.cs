using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using Google.Cloud.Firestore;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<UserController> _logger;

    public UserController(IFirebaseService firebaseService, ILogger<UserController> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllUsers([FromQuery] string? role = null, [FromQuery] string? search = null, [FromQuery] bool? isActive = null)
    {
        try
        {
            var users = await _firebaseService.GetAllUsersAsync();

            // Apply filters
            if (!string.IsNullOrEmpty(role))
            {
                users = users.Where(u => u.Role.Equals(role, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(search))
            {
                users = users.Where(u =>
                    u.FullName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    u.Email.Contains(search, StringComparison.OrdinalIgnoreCase)
                ).ToList();
            }

            if (isActive.HasValue)
            {
                users = users.Where(u => u.IsActive == isActive.Value).ToList();
            }

            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, new { message = "Error retrieving users", error = ex.Message });
        }
    }

    [HttpGet("by-email/{email}")]
    public async Task<IActionResult> GetUserByEmail(string email)
    {
        try
        {
            var user = await _firebaseService.GetUserByEmailAsync(email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by email {Email}", email);
            return StatusCode(500, new { message = "Error retrieving user", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetUser(string id)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, new { message = "Error retrieving user", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if user with email already exists
            var existingUser = await _firebaseService.GetUserByEmailAsync(createUserDto.Email);
            if (existingUser != null)
            {
                return Conflict(new { message = "User with this email already exists" });
            }

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                FullName = createUserDto.FullName,
                Email = createUserDto.Email,
                Password = createUserDto.Password,
                Role = createUserDto.Role,
                Gender = createUserDto.Gender ?? "",
                AvatarBase64 = createUserDto.AvatarBase64,
                IsActive = true,
                CreatedAt = Timestamp.GetCurrentTimestamp(),
                LastLoginDate = "",
                StreakCount = 0,
                ClassIds = createUserDto.ClassIds ?? new List<string>(),
                Badges = new Dictionary<string, UserBadge>()
            };

            await _firebaseService.CreateUserAsync(user);

            _logger.LogInformation("User created successfully: {UserId}", user.Id);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { message = "Error creating user", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = await _firebaseService.GetUserByIdAsync(id);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Check if email is being changed and if new email already exists
            if (!string.IsNullOrEmpty(updateUserDto.Email) &&
                updateUserDto.Email != existingUser.Email)
            {
                var userWithEmail = await _firebaseService.GetUserByEmailAsync(updateUserDto.Email);
                if (userWithEmail != null && userWithEmail.Id != id)
                {
                    return Conflict(new { message = "User with this email already exists" });
                }
                existingUser.Email = updateUserDto.Email;
            }

            // Update fields
            if (!string.IsNullOrEmpty(updateUserDto.FullName))
                existingUser.FullName = updateUserDto.FullName;

            if (!string.IsNullOrEmpty(updateUserDto.Password))
                existingUser.Password = updateUserDto.Password;

            if (!string.IsNullOrEmpty(updateUserDto.Role))
                existingUser.Role = updateUserDto.Role;

            if (!string.IsNullOrEmpty(updateUserDto.Gender))
                existingUser.Gender = updateUserDto.Gender;

            if (updateUserDto.AvatarBase64 != null)
                existingUser.AvatarBase64 = updateUserDto.AvatarBase64;

            if (updateUserDto.ClassIds != null)
                existingUser.ClassIds = updateUserDto.ClassIds;

            await _firebaseService.UpdateUserAsync(existingUser);

            _logger.LogInformation("User updated successfully: {UserId}", id);
            return Ok(existingUser);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { message = "Error updating user", error = ex.Message });
        }
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateUserStatus(string id, [FromBody] UpdateUserStatusDto statusDto)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.IsActive = statusDto.IsActive;
            await _firebaseService.UpdateUserAsync(user);

            _logger.LogInformation("User status updated: {UserId} - Active: {IsActive}", id, statusDto.IsActive);
            return Ok(new { message = $"User {(statusDto.IsActive ? "activated" : "deactivated")} successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user status {UserId}", id);
            return StatusCode(500, new { message = "Error updating user status", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            await _firebaseService.DeleteUserAsync(id);

            _logger.LogInformation("User deleted successfully: {UserId}", id);
            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { message = "Error deleting user", error = ex.Message });
        }
    }

    [HttpGet("roles")]
    [Authorize(Roles = "admin")]
    public IActionResult GetAvailableRoles()
    {
        var roles = new[] { "student", "teacher", "admin", "parent" };
        return Ok(roles);
    }

}