using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Services;
using BingGoWebAPI.Models;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FirebaseController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly IFirebaseAuthService _firebaseAuthService;
    private readonly IFirebaseStorageService _firebaseStorageService;
    private readonly ILogger<FirebaseController> _logger;

    public FirebaseController(
        IFirebaseService firebaseService,
        IFirebaseAuthService firebaseAuthService,
        IFirebaseStorageService firebaseStorageService,
        ILogger<FirebaseController> logger)
    {
        _firebaseService = firebaseService;
        _firebaseAuthService = firebaseAuthService;
        _firebaseStorageService = firebaseStorageService;
        _logger = logger;
    }

    [HttpGet("test-firestore")]
    public async Task<IActionResult> TestFirestore()
    {
        try
        {
            var courses = await _firebaseService.GetCoursesAsync();
            return Ok(new
            {
                message = "Firestore connection successful",
                coursesCount = courses.Count,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Firestore test failed");
            return StatusCode(500, new { error = "Firestore test failed", details = ex.Message });
        }
    }

    [HttpPost("test-auth")]
    public async Task<IActionResult> TestAuth([FromBody] TestAuthRequest request)
    {
        try
        {
            var decodedToken = await _firebaseAuthService.VerifyIdTokenAsync(request.IdToken);
            return Ok(new
            {
                message = "Firebase Auth verification successful",
                userId = decodedToken.Uid,
                email = decodedToken.Claims.GetValueOrDefault("email"),
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Firebase Auth test failed");
            return StatusCode(401, new { error = "Firebase Auth test failed", details = ex.Message });
        }
    }

    [HttpPost("test-storage")]
    public async Task<IActionResult> TestStorage([FromBody] TestStorageRequest request)
    {
        try
        {
            var fileName = $"test-{DateTime.UtcNow:yyyyMMdd-HHmmss}.jpg";
            var base64Content = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(request.Content ?? "Test file content"));
            
            var uploadUrl = await _firebaseStorageService.UploadBase64ImageAsync(base64Content, fileName, "test");
            
            return Ok(new
            {
                message = "Firebase Storage test successful",
                fileName = fileName,
                uploadUrl = uploadUrl,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Firebase Storage test failed");
            return StatusCode(500, new { error = "Firebase Storage test failed", details = ex.Message });
        }
    }

    [HttpGet("test-storage-list")]
    public async Task<IActionResult> TestStorageList()
    {
        try
        {
            var files = await _firebaseStorageService.ListFilesAsync("test", 10);
            return Ok(new
            {
                message = "Firebase Storage list test successful",
                filesCount = files.Count,
                files = files,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Firebase Storage list test failed");
            return StatusCode(500, new { error = "Firebase Storage list test failed", details = ex.Message });
        }
    }

    [HttpGet("protected")]
    [Authorize(AuthenticationSchemes = "Firebase")]
    public IActionResult ProtectedEndpoint()
    {
        var userId = User.FindFirst("firebase_uid")?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        return Ok(new
        {
            message = "Protected endpoint accessed successfully",
            userId = userId,
            email = email,
            role = role,
            timestamp = DateTime.UtcNow
        });
    }
}

public class TestAuthRequest
{
    public string IdToken { get; set; } = string.Empty;
}

public class TestStorageRequest
{
    public string Content { get; set; } = string.Empty;
}