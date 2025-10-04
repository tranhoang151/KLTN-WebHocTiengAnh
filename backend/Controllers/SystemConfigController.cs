using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/system-config")]
[Authorize(Roles = "admin")]
public class SystemConfigController : ControllerBase
{
    private readonly ISystemConfigService _systemConfigService;
    private readonly ILogger<SystemConfigController> _logger;

    public SystemConfigController(ISystemConfigService systemConfigService, ILogger<SystemConfigController> logger)
    {
        _systemConfigService = systemConfigService;
        _logger = logger;
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSystemSettings()
    {
        try
        {
            var settings = await _systemConfigService.GetSystemSettingsAsync();
            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system settings");
            return StatusCode(500, new { message = "Error retrieving system settings", error = ex.Message });
        }
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSystemSettings([FromBody] SystemSettingsDto settings)
    {
        try
        {
            await _systemConfigService.UpdateSystemSettingsAsync(settings);
            _logger.LogInformation("System settings updated by admin");
            return Ok(new { message = "System settings updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating system settings");
            return StatusCode(500, new { message = "Error updating system settings", error = ex.Message });
        }
    }

    [HttpGet("feature-flags")]
    public async Task<IActionResult> GetFeatureFlags()
    {
        try
        {
            var flags = await _systemConfigService.GetFeatureFlagsAsync();
            return Ok(flags);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving feature flags");
            return StatusCode(500, new { message = "Error retrieving feature flags", error = ex.Message });
        }
    }

    [HttpPut("feature-flags")]
    public async Task<IActionResult> UpdateFeatureFlags([FromBody] List<FeatureFlagDto> flags)
    {
        try
        {
            await _systemConfigService.UpdateFeatureFlagsAsync(flags);
            _logger.LogInformation("Feature flags updated by admin");
            return Ok(new { message = "Feature flags updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating feature flags");
            return StatusCode(500, new { message = "Error updating feature flags", error = ex.Message });
        }
    }

    [HttpGet("maintenance")]
    public async Task<IActionResult> GetMaintenanceStatus()
    {
        try
        {
            var status = await _systemConfigService.GetMaintenanceStatusAsync();
            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving maintenance status");
            return StatusCode(500, new { message = "Error retrieving maintenance status", error = ex.Message });
        }
    }

    [HttpPost("maintenance/enable")]
    public async Task<IActionResult> EnableMaintenanceMode([FromBody] MaintenanceModeDto maintenanceInfo)
    {
        try
        {
            await _systemConfigService.EnableMaintenanceModeAsync(maintenanceInfo);
            _logger.LogWarning("Maintenance mode enabled by admin: {Message}", maintenanceInfo.Message);
            return Ok(new { message = "Maintenance mode enabled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enabling maintenance mode");
            return StatusCode(500, new { message = "Error enabling maintenance mode", error = ex.Message });
        }
    }

    [HttpPost("maintenance/disable")]
    public async Task<IActionResult> DisableMaintenanceMode()
    {
        try
        {
            await _systemConfigService.DisableMaintenanceModeAsync();
            _logger.LogInformation("Maintenance mode disabled by admin");
            return Ok(new { message = "Maintenance mode disabled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disabling maintenance mode");
            return StatusCode(500, new { message = "Error disabling maintenance mode", error = ex.Message });
        }
    }

    [HttpGet("announcements")]
    public async Task<IActionResult> GetSystemAnnouncements()
    {
        try
        {
            var announcements = await _systemConfigService.GetSystemAnnouncementsAsync();
            return Ok(announcements);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system announcements");
            return StatusCode(500, new { message = "Error retrieving system announcements", error = ex.Message });
        }
    }

    [HttpPost("announcements")]
    public async Task<IActionResult> CreateAnnouncement([FromBody] SystemAnnouncementDto announcement)
    {
        try
        {
            var created = await _systemConfigService.CreateAnnouncementAsync(announcement);
            _logger.LogInformation("System announcement created: {Title}", announcement.Title);
            return CreatedAtAction(nameof(GetSystemAnnouncements), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating system announcement");
            return StatusCode(500, new { message = "Error creating system announcement", error = ex.Message });
        }
    }

    [HttpPut("announcements/{id}")]
    public async Task<IActionResult> UpdateAnnouncement(string id, [FromBody] SystemAnnouncementDto announcement)
    {
        try
        {
            await _systemConfigService.UpdateAnnouncementAsync(id, announcement);
            _logger.LogInformation("System announcement updated: {Id}", id);
            return Ok(new { message = "Announcement updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating system announcement");
            return StatusCode(500, new { message = "Error updating system announcement", error = ex.Message });
        }
    }

    [HttpDelete("announcements/{id}")]
    public async Task<IActionResult> DeleteAnnouncement(string id)
    {
        try
        {
            await _systemConfigService.DeleteAnnouncementAsync(id);
            _logger.LogInformation("System announcement deleted: {Id}", id);
            return Ok(new { message = "Announcement deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting system announcement");
            return StatusCode(500, new { message = "Error deleting system announcement", error = ex.Message });
        }
    }

    [HttpPost("backup")]
    public async Task<IActionResult> CreateSystemBackup()
    {
        try
        {
            var backupInfo = await _systemConfigService.CreateSystemBackupAsync();
            _logger.LogInformation("System backup created: {BackupId}", backupInfo.Id);
            return Ok(backupInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating system backup");
            return StatusCode(500, new { message = "Error creating system backup", error = ex.Message });
        }
    }

    [HttpGet("backups")]
    public async Task<IActionResult> GetSystemBackups()
    {
        try
        {
            var backups = await _systemConfigService.GetSystemBackupsAsync();
            return Ok(backups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system backups");
            return StatusCode(500, new { message = "Error retrieving system backups", error = ex.Message });
        }
    }

    [HttpPost("restore/{backupId}")]
    public async Task<IActionResult> RestoreFromBackup(string backupId)
    {
        try
        {
            await _systemConfigService.RestoreFromBackupAsync(backupId);
            _logger.LogWarning("System restored from backup: {BackupId}", backupId);
            return Ok(new { message = "System restored successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring from backup");
            return StatusCode(500, new { message = "Error restoring from backup", error = ex.Message });
        }
    }

    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSystemHealth()
    {
        try
        {
            var health = await _systemConfigService.GetSystemHealthAsync();
            return Ok(health);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system health");
            return StatusCode(500, new { message = "Error retrieving system health", error = ex.Message });
        }
    }
}