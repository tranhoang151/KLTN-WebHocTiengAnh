using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using System.Security.Claims;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClassController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<ClassController> _logger;

    public ClassController(IFirebaseService firebaseService, ILogger<ClassController> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpGet("teacher")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> GetClassesForTeacher()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var classes = await _firebaseService.GetClassesByTeacherAsync(userId);
            return Ok(classes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving classes for teacher {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return StatusCode(500, new { message = "Error retrieving classes", error = ex.Message });
        }
    }
}
