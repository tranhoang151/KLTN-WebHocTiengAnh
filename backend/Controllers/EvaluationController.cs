using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using Google.Cloud.Firestore;
using System.Security.Claims;

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

    [HttpGet("student/{studentId}")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> GetStudentEvaluations(string studentId, [FromQuery] string? classId = null)
    {
        try
        {
            var evaluations = await _firebaseService.GetStudentEvaluationsAsync(studentId, classId);

            var evaluationSummaries = evaluations.Select(e => new EvaluationSummaryDto
            {
                EvaluationId = e.Id,
                StudentId = e.StudentId,
                TeacherId = e.TeacherId,
                ClassId = e.ClassId,
                OverallRating = e.OverallRating,
                Score = e.Score,
                EvaluationDate = e.EvaluationDate,
                Comments = e.Comments
            }).ToList();

            return Ok(evaluationSummaries);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving evaluations for student {StudentId}", studentId);
            return StatusCode(500, new { message = "Error retrieving evaluations", error = ex.Message });
        }
    }

    [HttpGet("teacher/{teacherId}")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> GetTeacherEvaluations(string teacherId, [FromQuery] string? classId = null)
    {
        try
        {
            var evaluations = await _firebaseService.GetTeacherEvaluationsAsync(teacherId, classId);
            return Ok(evaluations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving evaluations for teacher {TeacherId}", teacherId);
            return StatusCode(500, new { message = "Error retrieving evaluations", error = ex.Message });
        }
    }

    [HttpGet("{evaluationId}")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> GetEvaluation(string evaluationId)
    {
        try
        {
            var evaluation = await _firebaseService.GetEvaluationByIdAsync(evaluationId);
            if (evaluation == null)
            {
                return NotFound(new { message = "Evaluation not found" });
            }
            return Ok(evaluation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving evaluation {EvaluationId}", evaluationId);
            return StatusCode(500, new { message = "Error retrieving evaluation", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> CreateEvaluation([FromBody] CreateEvaluationDto evaluationDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get current user ID from JWT token
            var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(teacherId))
            {
                return Unauthorized(new { message = "Teacher not authenticated" });
            }

            var evaluation = new Evaluation
            {
                Id = Guid.NewGuid().ToString(),
                StudentId = evaluationDto.StudentId,
                TeacherId = teacherId,
                ClassId = evaluationDto.ClassId,
                EvaluationDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                OverallRating = (evaluationDto.RatingParticipation + evaluationDto.RatingUnderstanding + evaluationDto.RatingProgress) / 3,
                RatingParticipation = evaluationDto.RatingParticipation,
                RatingUnderstanding = evaluationDto.RatingUnderstanding,
                RatingProgress = evaluationDto.RatingProgress,
                Score = evaluationDto.Score,
                Comments = evaluationDto.Comments,
                Strengths = evaluationDto.Strengths,
                AreasForImprovement = evaluationDto.AreasForImprovement,
                Recommendations = evaluationDto.Recommendations,
                CreatedAt = Timestamp.GetCurrentTimestamp(),
                UpdatedAt = Timestamp.GetCurrentTimestamp()
            };

            var createdEvaluation = await _firebaseService.CreateEvaluationAsync(evaluation);

            _logger.LogInformation("Evaluation created: {EvaluationId} for student {StudentId} by teacher {TeacherId}",
                createdEvaluation.Id, evaluationDto.StudentId, teacherId);

            return CreatedAtAction(nameof(GetEvaluation), new { evaluationId = createdEvaluation.Id }, createdEvaluation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating evaluation");
            return StatusCode(500, new { message = "Error creating evaluation", error = ex.Message });
        }
    }

    [HttpPut("{evaluationId}")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> UpdateEvaluation(string evaluationId, [FromBody] UpdateEvaluationDto evaluationDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingEvaluation = await _firebaseService.GetEvaluationByIdAsync(evaluationId);
            if (existingEvaluation == null)
            {
                return NotFound(new { message = "Evaluation not found" });
            }

            // Check if user is the teacher who created the evaluation or admin
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userRole != "admin" && existingEvaluation.TeacherId != userId)
            {
                return Forbid("You can only update your own evaluations");
            }

            // Update fields
            if (evaluationDto.RatingParticipation.HasValue)
                existingEvaluation.RatingParticipation = evaluationDto.RatingParticipation.Value;
            if (evaluationDto.RatingUnderstanding.HasValue)
                existingEvaluation.RatingUnderstanding = evaluationDto.RatingUnderstanding.Value;
            if (evaluationDto.RatingProgress.HasValue)
                existingEvaluation.RatingProgress = evaluationDto.RatingProgress.Value;
            if (evaluationDto.Score.HasValue)
                existingEvaluation.Score = evaluationDto.Score.Value;
            if (evaluationDto.Comments != null)
                existingEvaluation.Comments = evaluationDto.Comments;
            if (evaluationDto.Strengths != null)
                existingEvaluation.Strengths = evaluationDto.Strengths;
            if (evaluationDto.AreasForImprovement != null)
                existingEvaluation.AreasForImprovement = evaluationDto.AreasForImprovement;
            if (evaluationDto.Recommendations != null)
                existingEvaluation.Recommendations = evaluationDto.Recommendations;

            // Recalculate overall rating if any rating changed
            if (evaluationDto.RatingParticipation.HasValue || evaluationDto.RatingUnderstanding.HasValue || evaluationDto.RatingProgress.HasValue)
            {
                existingEvaluation.OverallRating = (existingEvaluation.RatingParticipation +
                    existingEvaluation.RatingUnderstanding + existingEvaluation.RatingProgress) / 3;
            }

            existingEvaluation.UpdatedAt = Timestamp.GetCurrentTimestamp();

            var updatedEvaluation = await _firebaseService.UpdateEvaluationAsync(evaluationId, existingEvaluation);
            if (updatedEvaluation == null)
            {
                return NotFound(new { message = "Evaluation not found" });
            }

            _logger.LogInformation("Evaluation updated: {EvaluationId}", evaluationId);
            return Ok(updatedEvaluation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating evaluation {EvaluationId}", evaluationId);
            return StatusCode(500, new { message = "Error updating evaluation", error = ex.Message });
        }
    }

    [HttpDelete("{evaluationId}")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> DeleteEvaluation(string evaluationId)
    {
        try
        {
            var existingEvaluation = await _firebaseService.GetEvaluationByIdAsync(evaluationId);
            if (existingEvaluation == null)
            {
                return NotFound(new { message = "Evaluation not found" });
            }

            // Check if user is the teacher who created the evaluation or admin
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userRole != "admin" && existingEvaluation.TeacherId != userId)
            {
                return Forbid("You can only delete your own evaluations");
            }

            await _firebaseService.DeleteEvaluationAsync(evaluationId);

            _logger.LogInformation("Evaluation deleted: {EvaluationId}", evaluationId);
            return Ok(new { message = "Evaluation deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting evaluation {EvaluationId}", evaluationId);
            return StatusCode(500, new { message = "Error deleting evaluation", error = ex.Message });
        }
    }

    [HttpGet("class/{classId}")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> GetClassEvaluations(string classId)
    {
        try
        {
            var evaluations = await _firebaseService.GetClassEvaluationsAsync(classId);
            return Ok(evaluations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving evaluations for class {ClassId}", classId);
            return StatusCode(500, new { message = "Error retrieving class evaluations", error = ex.Message });
        }
    }

    [HttpGet("analytics/student/{studentId}")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> GetStudentEvaluationAnalytics(string studentId)
    {
        try
        {
            var analytics = await _firebaseService.GetStudentEvaluationAnalyticsAsync(studentId);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving evaluation analytics for student {StudentId}", studentId);
            return StatusCode(500, new { message = "Error retrieving evaluation analytics", error = ex.Message });
        }
    }

    [HttpGet("analytics/teacher/{teacherId}")]
    [Authorize(Roles = "teacher,admin")]
    public async Task<IActionResult> GetTeacherEvaluationAnalytics(string teacherId)
    {
        try
        {
            var analytics = await _firebaseService.GetTeacherEvaluationAnalyticsAsync(teacherId);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving evaluation analytics for teacher {TeacherId}", teacherId);
            return StatusCode(500, new { message = "Error retrieving evaluation analytics", error = ex.Message });
        }
    }
}