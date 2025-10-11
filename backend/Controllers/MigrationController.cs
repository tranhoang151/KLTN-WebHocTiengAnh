using Microsoft.AspNetCore.Mvc;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MigrationController : ControllerBase
    {
        private readonly DataMigrationService _migrationService;
        private readonly ILogger<MigrationController> _logger;

        public MigrationController(DataMigrationService migrationService, ILogger<MigrationController> logger)
        {
            _migrationService = migrationService;
            _logger = logger;
        }

        [HttpPost("migrate-from-backup")]
        public async Task<IActionResult> MigrateFromBackup([FromBody] MigrationRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.BackupFilePath))
                {
                    return BadRequest("Backup file path is required");
                }

                _logger.LogInformation($"Starting migration from {request.BackupFilePath}");

                var success = await _migrationService.MigrateFromBackupJson(request.BackupFilePath);

                if (success)
                {
                    _logger.LogInformation("Migration completed successfully");
                    return Ok(new { message = "Migration completed successfully" });
                }
                else
                {
                    _logger.LogError("Migration failed");
                    return StatusCode(500, new { message = "Migration failed" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during migration");
                return StatusCode(500, new { message = "Internal server error during migration", error = ex.Message });
            }
        }

        [HttpPost("migrate-from-default-backup")]
        public async Task<IActionResult> MigrateFromDefaultBackup()
        {
            try
            {
                var backupFilePath = Path.Combine(Directory.GetCurrentDirectory(), "WebConversion", "backup.json");
                _logger.LogInformation($"Starting migration from default path: {backupFilePath}");

                var success = await _migrationService.MigrateFromBackupJson(backupFilePath);

                if (success)
                {
                    _logger.LogInformation("Migration completed successfully");
                    return Ok(new { message = "Migration completed successfully" });
                }
                else
                {
                    _logger.LogError("Migration failed");
                    return StatusCode(500, new { message = "Migration failed" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during migration");
                return StatusCode(500, new { message = "Internal server error during migration", error = ex.Message });
            }
        }
    }

    public class MigrationRequest
    {
        public string BackupFilePath { get; set; } = string.Empty;
    }
}