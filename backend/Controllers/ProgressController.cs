using BingGoWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;
    private readonly ILogger<ProgressController> _logger;

    public ProgressController(IProgressService progressService, ILogger<ProgressController> logger)
    {
        _progressService = progressService;
        _logger = logger;
    }

    [HttpGet("dashboard/{userId}")]
    public async Task<IActionResult> GetDashboardData(string userId)
    {
        // Optional: Add check to ensure the requesting user is the user themselves, a teacher, or an admin
        try
        {
            var data = await _progressService.GetStudentDashboardDataAsync(userId);
            _logger.LogInformation("Dashboard data retrieved successfully for user {UserId}: {@Data}", userId, data);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get dashboard data for user {UserId}: {Message}", userId, ex.Message);
            return StatusCode(500, new { error = "An error occurred while fetching dashboard data.", details = ex.Message });
        }
    }

    [HttpGet("teacher/{teacherId}/classes")]
    public async Task<IActionResult> GetTeacherClassSummaries(string teacherId)
    {
        try
        {
            var summaries = await _progressService.GetTeacherClassSummariesAsync(teacherId);
            return Ok(summaries);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get class summaries for teacher {TeacherId}", teacherId);
            return StatusCode(500, "An error occurred while fetching class summaries.");
        }
    }

    [HttpGet("class/{classId}")]
    public async Task<IActionResult> GetClassProgress(string classId)
    {
        try
        {
            var classProgress = await _progressService.GetClassProgressAsync(classId);
            if (classProgress == null)
            {
                return NotFound($"Class with ID {classId} not found.");
            }
            return Ok(classProgress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get progress for class {ClassId}", classId);
            return StatusCode(500, "An error occurred while fetching class progress.");
        }
    }

}
