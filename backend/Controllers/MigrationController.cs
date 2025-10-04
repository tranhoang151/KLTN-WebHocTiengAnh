using Microsoft.AspNetCore.Mvc;
using BingGoWebAPI.Services;
using BingGoWebAPI.Exceptions;

namespace BingGoWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MigrationController : ControllerBase
    {
        private readonly IDataMigrationService _migrationService;
        private readonly ILogger<MigrationController> _logger;

        public MigrationController(IDataMigrationService migrationService, ILogger<MigrationController> logger)
        {
            _migrationService = migrationService;
            _logger = logger;
        }

        [HttpPost("migrate")]
        public async Task<IActionResult> MigrateData([FromQuery] string backupFile = "backup.json")
        {
            try
            {
                var backupPath = Path.Combine(Directory.GetCurrentDirectory(), backupFile);

                _logger.LogInformation($"Starting migration from {backupPath}");

                var result = await _migrationService.MigrateDataFromBackupAsync(backupPath);

                if (result.Success)
                {
                    var summary = await _migrationService.GetMigrationSummaryAsync();
                    return Ok(new
                    {
                        success = true,
                        message = result.Message,
                        processedRecords = result.ProcessedRecords,
                        summary = summary
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = result.Message,
                        errors = result.Errors,
                        processedRecords = result.ProcessedRecords
                    });
                }
            }
            catch (DataMigrationException ex)
            {
                _logger.LogError(ex, "Data migration error: {Message}", ex.Message);
                return BadRequest(new
                {
                    success = false,
                    message = "Data migration failed",
                    error = ex.Message,
                    processedRecords = ex.ProcessedRecords
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during migration");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Internal server error during migration",
                    error = ex.Message
                });
            }
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateData()
        {
            try
            {
                var isValid = await _migrationService.ValidateDataIntegrityAsync();
                var summary = await _migrationService.GetMigrationSummaryAsync();

                return Ok(new
                {
                    valid = isValid,
                    summary = summary,
                    message = isValid ? "Data integrity validation passed" : "Data integrity validation failed"
                });
            }
            catch (DataMigrationException ex)
            {
                _logger.LogError(ex, "Data migration error during validation: {Message}", ex.Message);
                return BadRequest(new
                {
                    valid = false,
                    message = "Data validation failed",
                    error = ex.Message,
                    processedRecords = ex.ProcessedRecords
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during validation");
                return StatusCode(500, new
                {
                    valid = false,
                    message = "Internal server error during validation",
                    error = ex.Message
                });
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetMigrationSummary()
        {
            try
            {
                var summary = await _migrationService.GetMigrationSummaryAsync();
                return Ok(summary);
            }
            catch (DataMigrationException ex)
            {
                _logger.LogError(ex, "Data migration error getting summary: {Message}", ex.Message);
                return BadRequest(new
                {
                    message = "Failed to get migration summary",
                    error = ex.Message,
                    processedRecords = ex.ProcessedRecords
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting migration summary");
                return StatusCode(500, new
                {
                    message = "Internal server error getting summary",
                    error = ex.Message
                });
            }
        }
    }
}