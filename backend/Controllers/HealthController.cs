using Microsoft.AspNetCore.Mvc;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Get()
    {
        _logger.LogInformation("Health check requested");
        
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
        });
    }

    [HttpGet("firebase")]
    public IActionResult CheckFirebase()
    {
        try
        {
            // Basic Firebase connection check
            var firebaseConfigPath = Environment.GetEnvironmentVariable("FIREBASE_SERVICE_ACCOUNT_PATH") 
                                    ?? "../WebConversion/kltn-c5cf0-firebase-adminsdk-fbsvc-036427bc95.json";
            
            var configExists = System.IO.File.Exists(firebaseConfigPath);
            
            return Ok(new
            {
                firebase_config_exists = configExists,
                config_path = firebaseConfigPath,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Firebase health check failed");
            return StatusCode(500, new { error = "Firebase health check failed", details = ex.Message });
        }
    }
}