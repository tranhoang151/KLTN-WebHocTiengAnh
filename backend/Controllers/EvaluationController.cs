
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using System.Security.Claims;
using Google.Cloud.Firestore;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EvaluationController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<EvaluationController> _logger;

    public EvaluationController(IFirebaseService firebaseService, ILogger<EvaluationController> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> SaveEvaluation([FromBody] EvaluationDto evaluationDto)
    {
        try
        {
            var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(teacherId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var evaluation = new Evaluation
            {
                Id = Guid.NewGuid().ToString(),
                StudentId = evaluationDto.StudentId,
                TeacherId = teacherId,
                EvaluationDate = Timestamp.FromDateTime(DateTime.UtcNow),
                OverallRating = evaluationDto.OverallRating,
                Comments = evaluationDto.Comments,
                Score = evaluationDto.Score,
                RatingParticipation = evaluationDto.RatingParticipation,
                RatingUnderstanding = evaluationDto.RatingUnderstanding,
                RatingProgress = evaluationDto.RatingProgress
            };

            var savedEvaluation = await _firebaseService.SaveEvaluationAsync(evaluation);

            return CreatedAtAction(nameof(GetEvaluations), new { studentId = savedEvaluation.StudentId }, savedEvaluation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving evaluation for student {StudentId}", evaluationDto.StudentId);
            return StatusCode(500, new { message = "An error occurred while saving the evaluation.", error = ex.Message });
        }
    }

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetEvaluations(string studentId)
    {
        try
        {
            // Security check: Allow student to see their own, or admin/teacher to see any.
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId != studentId && !User.IsInRole("admin") && !User.IsInRole("teacher"))
            {
                return Forbid();
            }

            var evaluations = await _firebaseService.GetEvaluationsForStudentAsync(studentId);
            return Ok(evaluations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving evaluations for student {StudentId}", studentId);
            return StatusCode(500, new { message = "Error retrieving evaluations.", error = ex.Message });
        }
    }
}
