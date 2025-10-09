
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/questions")]
[Authorize(Roles = "admin,teacher")]
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
    public async Task<IActionResult> GetQuestions([FromQuery] string? courseId = null)
    {
        try
        {
            if (!string.IsNullOrEmpty(courseId))
            {
                var questionsByCourse = await _firebaseService.GetQuestionsByCourseAsync(courseId);
                return Ok(questionsByCourse);
            }
            var questions = await _firebaseService.GetQuestionsAsync();
            return Ok(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving questions");
            return StatusCode(500, new { message = "Error retrieving questions", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuestion(string id)
    {
        try
        {
            var question = await _firebaseService.GetQuestionByIdAsync(id);
            if (question == null)
            {
                return NotFound();
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
    public async Task<IActionResult> CreateQuestion([FromBody] Question question)
    {
        try
        {
            var createdQuestion = await _firebaseService.CreateQuestionAsync(question);
            return CreatedAtAction(nameof(GetQuestion), new { id = createdQuestion.Id }, createdQuestion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating question");
            return StatusCode(500, new { message = "Error creating question", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateQuestion(string id, [FromBody] Question question)
    {
        try
        {
            var updatedQuestion = await _firebaseService.UpdateQuestionAsync(id, question);
            if (updatedQuestion == null)
            {
                return NotFound();
            }
            return Ok(updatedQuestion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating question {QuestionId}", id);
            return StatusCode(500, new { message = "Error updating question", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuestion(string id)
    {
        try
        {
            await _firebaseService.DeleteQuestionAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting question {QuestionId}", id);
            return StatusCode(500, new { message = "Error deleting question", error = ex.Message });
        }
    }
}
