using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using Google.Cloud.Firestore;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuestionController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<QuestionController> _logger;

    public QuestionController(IFirebaseService firebaseService, ILogger<QuestionController> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetAllQuestions([FromQuery] string? courseId = null, [FromQuery] string? type = null, [FromQuery] string? difficulty = null)
    {
        try
        {
            var questions = await _firebaseService.GetQuestionsAsync();

            // Apply filters
            if (!string.IsNullOrEmpty(courseId))
            {
                questions = questions.Where(q => q.CourseId == courseId).ToList();
            }

            if (!string.IsNullOrEmpty(type))
            {
                questions = questions.Where(q => q.Type.Equals(type, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(difficulty))
            {
                questions = questions.Where(q => q.Difficulty.Equals(difficulty, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return Ok(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving questions");
            return StatusCode(500, new { message = "Error retrieving questions", error = ex.Message });
        }
    }

    [HttpGet("course/{courseId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetQuestionsByCourse(string courseId)
    {
        try
        {
            var questions = await _firebaseService.GetQuestionsByCourseAsync(courseId);
            return Ok(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving questions for course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error retrieving questions", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetQuestion(string id)
    {
        try
        {
            var question = await _firebaseService.GetDocumentAsync<Question>("questions", id);
            if (question == null)
            {
                return NotFound(new { message = "Question not found" });
            }

            return Ok(question);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving question {QuestionId}", id);
            return StatusCode(500, new { message = "Error retrieving question", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionDto createQuestionDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var question = new Question
            {
                Id = Guid.NewGuid().ToString(),
                Content = createQuestionDto.Content,
                Type = createQuestionDto.Type,
                Options = createQuestionDto.Options,
                CorrectAnswer = createQuestionDto.CorrectAnswer,
                Explanation = createQuestionDto.Explanation,
                Difficulty = createQuestionDto.Difficulty,
                CourseId = createQuestionDto.CourseId,
                Tags = createQuestionDto.Tags,
                CreatedBy = User.Identity?.Name ?? "system",
                CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                IsActive = true
            };

            var createdQuestion = await _firebaseService.CreateQuestionAsync(question);

            _logger.LogInformation("Question created successfully: {QuestionId}", question.Id);
            return CreatedAtAction(nameof(GetQuestion), new { id = question.Id }, createdQuestion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating question");
            return StatusCode(500, new { message = "Error creating question", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateQuestion(string id, [FromBody] UpdateQuestionDto updateQuestionDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingQuestion = await _firebaseService.GetDocumentAsync<Question>("questions", id);
            if (existingQuestion == null)
            {
                return NotFound(new { message = "Question not found" });
            }

            // Update fields
            if (!string.IsNullOrEmpty(updateQuestionDto.Content))
                existingQuestion.Content = updateQuestionDto.Content;

            if (!string.IsNullOrEmpty(updateQuestionDto.Type))
                existingQuestion.Type = updateQuestionDto.Type;

            if (updateQuestionDto.Options != null)
                existingQuestion.Options = updateQuestionDto.Options;

            if (!string.IsNullOrEmpty(updateQuestionDto.CorrectAnswer))
                existingQuestion.CorrectAnswer = updateQuestionDto.CorrectAnswer;

            if (updateQuestionDto.Explanation != null)
                existingQuestion.Explanation = updateQuestionDto.Explanation;

            if (!string.IsNullOrEmpty(updateQuestionDto.Difficulty))
                existingQuestion.Difficulty = updateQuestionDto.Difficulty;

            if (!string.IsNullOrEmpty(updateQuestionDto.CourseId))
                existingQuestion.CourseId = updateQuestionDto.CourseId;

            if (updateQuestionDto.Tags != null)
                existingQuestion.Tags = updateQuestionDto.Tags;

            if (updateQuestionDto.IsActive.HasValue)
                existingQuestion.IsActive = updateQuestionDto.IsActive.Value;

            var updatedQuestion = await _firebaseService.UpdateQuestionAsync(id, existingQuestion);

            _logger.LogInformation("Question updated successfully: {QuestionId}", id);
            return Ok(updatedQuestion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating question {QuestionId}", id);
            return StatusCode(500, new { message = "Error updating question", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteQuestion(string id)
    {
        try
        {
            var question = await _firebaseService.GetDocumentAsync<Question>("questions", id);
            if (question == null)
            {
                return NotFound(new { message = "Question not found" });
            }

            await _firebaseService.DeleteDocumentAsync("questions", id);

            _logger.LogInformation("Question deleted successfully: {QuestionId}", id);
            return Ok(new { message = "Question deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting question {QuestionId}", id);
            return StatusCode(500, new { message = "Error deleting question", error = ex.Message });
        }
    }

    [HttpGet("types")]
    [Authorize(Roles = "admin,teacher")]
    public IActionResult GetQuestionTypes()
    {
        var types = new[] { "multiple_choice", "fill_blank" };
        return Ok(types);
    }

    [HttpGet("difficulties")]
    [Authorize(Roles = "admin,teacher")]
    public IActionResult GetQuestionDifficulties()
    {
        var difficulties = new[] { "easy", "medium", "hard" };
        return Ok(difficulties);
    }
}