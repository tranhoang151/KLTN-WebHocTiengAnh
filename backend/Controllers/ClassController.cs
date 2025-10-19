using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

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
    [AllowAnonymous] // Temporarily allow anonymous access for debugging
    public async Task<IActionResult> GetAllClasses([FromQuery] string? search = null, [FromQuery] string? courseId = null)
    {
        try
        {
            var classes = await _firebaseService.GetAllClassesAsync();

            // Log the first class for debugging
            if (classes.Any())
            {
                var firstClass = classes.First();
                _logger.LogInformation("First class data: Id={Id}, Name={Name}, CourseId={CourseId}, TeacherId={TeacherId}, StudentIds={StudentIds}, CreatedAt={CreatedAt}, Capacity={Capacity}",
                    firstClass.Id, firstClass.Name, firstClass.CourseId, firstClass.TeacherId,
                    string.Join(",", firstClass.StudentIds), firstClass.CreatedAt, firstClass.Capacity);
            }

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                classes = classes.Where(c => c.Name.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(courseId))
            {
                classes = classes.Where(c => c.CourseId == courseId).ToList();
            }

            return Ok(classes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving classes");
            return StatusCode(500, new { message = "Error retrieving classes", error = ex.Message });
        }
    }

    [HttpGet("teacher")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> GetClassesForTeacher()
    {
        try
        {
            var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var classes = await _firebaseService.GetClassesByTeacherAsync(userId);
            return Ok(classes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving classes for teacher {UserId}", User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return StatusCode(500, new { message = "Error retrieving classes", error = ex.Message });
        }
    }

    [HttpGet("{classId}")]
    public async Task<IActionResult> GetClass(string classId)
    {
        try
        {
            var classObj = await _firebaseService.GetClassByIdAsync(classId);
            if (classObj == null)
            {
                return NotFound(new { message = "Class not found" });
            }
            return Ok(classObj);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving class {ClassId}", classId);
            return StatusCode(500, new { message = "Error retrieving class", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> CreateClass([FromBody] Class classObj)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate capacity
            if (classObj.Capacity <= 0)
            {
                return BadRequest(new { message = "Capacity must be greater than 0" });
            }

            classObj.Id = Guid.NewGuid().ToString();
            classObj.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            classObj.IsActive = true;

            var createdClass = await _firebaseService.CreateClassAsync(classObj);

            _logger.LogInformation("Class created: {ClassId}", createdClass.Id);
            return CreatedAtAction(nameof(GetClass), new { classId = createdClass.Id }, createdClass);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating class");
            return StatusCode(500, new { message = "Error creating class", error = ex.Message });
        }
    }

    [HttpPut("{classId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateClass(string classId, [FromBody] Class classObj)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate capacity
            if (classObj.Capacity <= 0)
            {
                return BadRequest(new { message = "Capacity must be greater than 0" });
            }

            var updatedClass = await _firebaseService.UpdateClassAsync(classId, classObj);
            if (updatedClass == null)
            {
                return NotFound(new { message = "Class not found" });
            }

            _logger.LogInformation("Class updated: {ClassId}", classId);
            return Ok(updatedClass);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating class {ClassId}", classId);
            return StatusCode(500, new { message = "Error updating class", error = ex.Message });
        }
    }

    [HttpDelete("{classId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteClass(string classId)
    {
        try
        {
            await _firebaseService.DeleteClassAsync(classId);

            _logger.LogInformation("Class deleted: {ClassId}", classId);
            return Ok(new { message = "Class deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting class {ClassId}", classId);
            return StatusCode(500, new { message = "Error deleting class", error = ex.Message });
        }
    }

    [HttpPost("{classId}/assign-teacher/{teacherId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> AssignTeacherToClass(string classId, string teacherId)
    {
        try
        {
            await _firebaseService.AssignTeacherToClassAsync(classId, teacherId);

            _logger.LogInformation("Teacher {TeacherId} assigned to class {ClassId}", teacherId, classId);
            return Ok(new { message = "Teacher assigned successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning teacher {TeacherId} to class {ClassId}", teacherId, classId);
            return StatusCode(500, new { message = "Error assigning teacher", error = ex.Message });
        }
    }

    [HttpPost("{classId}/assign-students")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> AssignStudentsToClass(string classId, [FromBody] List<string> studentIds)
    {
        try
        {
            await _firebaseService.AssignStudentsToClassAsync(classId, studentIds);

            _logger.LogInformation("Students {StudentIds} assigned to class {ClassId}", string.Join(",", studentIds), classId);
            return Ok(new { message = "Students assigned successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning students to class {ClassId}", classId);
            return StatusCode(500, new { message = "Error assigning students", error = ex.Message });
        }
    }

    [HttpDelete("{classId}/students/{studentId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> RemoveStudentFromClass(string classId, string studentId)
    {
        try
        {
            await _firebaseService.RemoveStudentFromClassAsync(classId, studentId);

            _logger.LogInformation("Student {StudentId} removed from class {ClassId}", studentId, classId);
            return Ok(new { message = "Student removed successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing student {StudentId} from class {ClassId}", studentId, classId);
            return StatusCode(500, new { message = "Error removing student", error = ex.Message });
        }
    }

    [HttpGet("{classId}/students")]
    public async Task<IActionResult> GetClassStudents(string classId)
    {
        try
        {
            var students = await _firebaseService.GetClassStudentsAsync(classId);
            return Ok(students);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving students for class {ClassId}", classId);
            return StatusCode(500, new { message = "Error retrieving class students", error = ex.Message });
        }
    }

    [HttpGet("{classId}/statistics")]
    public async Task<IActionResult> GetClassStatistics(string classId)
    {
        try
        {
            var stats = await _firebaseService.GetClassStatisticsAsync(classId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statistics for class {ClassId}", classId);
            return StatusCode(500, new { message = "Error retrieving class statistics", error = ex.Message });
        }
    }
}
