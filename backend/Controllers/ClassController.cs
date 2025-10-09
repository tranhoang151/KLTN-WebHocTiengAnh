
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

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetClasses()
    {
        try
        {
            var classes = await _firebaseService.GetClassesAsync();
            return Ok(classes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all classes");
            return StatusCode(500, new { message = "Error retrieving classes", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetClass(string id)
    {
        try
        {
            var classEntity = await _firebaseService.GetClassByIdAsync(id);
            if (classEntity == null)
            {
                return NotFound();
            }
            return Ok(classEntity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving class {ClassId}", id);
            return StatusCode(500, new { message = "Error retrieving class", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateClass([FromBody] Class classEntity)
    {
        try
        {
            var createdClass = await _firebaseService.CreateClassAsync(classEntity);
            return CreatedAtAction(nameof(GetClass), new { id = createdClass.Id }, createdClass);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating class");
            return StatusCode(500, new { message = "Error creating class", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateClass(string id, [FromBody] Class classEntity)
    {
        try
        {
            var updatedClass = await _firebaseService.UpdateClassAsync(id, classEntity);
            if (updatedClass == null)
            {
                return NotFound();
            }
            return Ok(updatedClass);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating class {ClassId}", id);
            return StatusCode(500, new { message = "Error updating class", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteClass(string id)
    {
        try
        {
            await _firebaseService.DeleteClassAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting class {ClassId}", id);
            return StatusCode(500, new { message = "Error deleting class", error = ex.Message });
        }
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
