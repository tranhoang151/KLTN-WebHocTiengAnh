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

    [HttpGet("tags")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetAvailableTags([FromQuery] string? courseId = null)
    {
        try
        {
            var questions = await _firebaseService.GetQuestionsAsync();

            // Filter by course if specified
            if (!string.IsNullOrEmpty(courseId))
            {
                questions = questions.Where(q => q.CourseId == courseId).ToList();
            }

            // Extract all unique tags
            var allTags = questions
                .SelectMany(q => q.Tags ?? new List<string>())
                .Where(tag => !string.IsNullOrWhiteSpace(tag))
                .Distinct()
                .OrderBy(tag => tag)
                .ToList();

            return Ok(allTags);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving available tags");
            return StatusCode(500, new { message = "Error retrieving available tags", error = ex.Message });
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

            // Debug logging for tags
            _logger.LogInformation("CreateQuestion - Received tags: {Tags}", string.Join(", ", createQuestionDto.tags ?? new List<string>()));

            var question = new Question
            {
                Id = Guid.NewGuid().ToString(),
                Content = createQuestionDto.content,
                Type = createQuestionDto.type,
                Options = createQuestionDto.type == "multiple_choice" ? createQuestionDto.options : new List<string>(),
                CorrectAnswer = createQuestionDto.correctAnswer,
                Explanation = createQuestionDto.explanation,
                Difficulty = createQuestionDto.difficulty,
                CourseId = createQuestionDto.course_id,
                Tags = createQuestionDto.tags,
                CreatedBy = User.Identity?.Name ?? "system",
                CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                IsActive = true
            };

            // Debug logging for question tags
            _logger.LogInformation("CreateQuestion - Question tags: {Tags}", string.Join(", ", question.Tags ?? new List<string>()));

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
            if (!string.IsNullOrEmpty(updateQuestionDto.content))
                existingQuestion.Content = updateQuestionDto.content;

            if (!string.IsNullOrEmpty(updateQuestionDto.type))
                existingQuestion.Type = updateQuestionDto.type;

            if (updateQuestionDto.options != null)
            {
                // Only update options for multiple_choice questions
                if (updateQuestionDto.type == "multiple_choice" || existingQuestion.Type == "multiple_choice")
                {
                    existingQuestion.Options = updateQuestionDto.options;
                }
                else
                {
                    // Clear options for non-multiple_choice questions
                    existingQuestion.Options = new List<string>();
                }
            }

            if (!string.IsNullOrEmpty(updateQuestionDto.correctAnswer))
                existingQuestion.CorrectAnswer = updateQuestionDto.correctAnswer;

            if (updateQuestionDto.explanation != null)
                existingQuestion.Explanation = updateQuestionDto.explanation;

            if (!string.IsNullOrEmpty(updateQuestionDto.difficulty))
                existingQuestion.Difficulty = updateQuestionDto.difficulty;

            if (!string.IsNullOrEmpty(updateQuestionDto.course_id))
                existingQuestion.CourseId = updateQuestionDto.course_id;

            if (updateQuestionDto.tags != null)
            {
                _logger.LogInformation("UpdateQuestion - Updating tags: {Tags}", string.Join(", ", updateQuestionDto.tags));
                existingQuestion.Tags = updateQuestionDto.tags;
            }

            if (updateQuestionDto.isActive.HasValue)
                existingQuestion.IsActive = updateQuestionDto.isActive.Value;

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