
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class CourseController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<CourseController> _logger;

    public CourseController(IFirebaseService firebaseService, ILogger<CourseController> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetCourses()
    {
        try
        {
            var courses = await _firebaseService.GetCoursesAsync();
            return Ok(courses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving courses");
            return StatusCode(500, new { message = "Error retrieving courses", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourse(string id)
    {
        try
        {
            var course = await _firebaseService.GetCourseByIdAsync(id);
            if (course == null)
            {
                return NotFound();
            }
            return Ok(course);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course {CourseId}", id);
            return StatusCode(500, new { message = "Error retrieving course", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] Course course)
    {
        try
        {
            var createdCourse = await _firebaseService.CreateCourseAsync(course);
            return CreatedAtAction(nameof(GetCourse), new { id = createdCourse.Id }, createdCourse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course");
            return StatusCode(500, new { message = "Error creating course", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(string id, [FromBody] Course course)
    {
        try
        {
            var updatedCourse = await _firebaseService.UpdateCourseAsync(id, course);
            if (updatedCourse == null)
            {
                return NotFound();
            }
            return Ok(updatedCourse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating course {CourseId}", id);
            return StatusCode(500, new { message = "Error updating course", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(string id)
    {
        try
        {
            await _firebaseService.DeleteCourseAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting course {CourseId}", id);
            return StatusCode(500, new { message = "Error deleting course", error = ex.Message });
        }
    }

    [HttpPost("{id}/assign-classes")]
    public async Task<IActionResult> AssignClasses(string id, [FromBody] List<string> classIds)
    {
        try
        {
            await _firebaseService.AssignClassesToCourseAsync(id, classIds);
            return Ok(new { message = "Classes assigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning classes to course {CourseId}", id);
            return StatusCode(500, new { message = "Error assigning classes", error = ex.Message });
        }
    }
}
