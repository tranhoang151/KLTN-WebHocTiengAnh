using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services;

public interface ISystemConfigService
{
    // System Settings
    Task<SystemSettingsDto> GetSystemSettingsAsync();
    Task UpdateSystemSettingsAsync(SystemSettingsDto settings);

    // Feature Flags
    Task<List<FeatureFlagDto>> GetFeatureFlagsAsync();
    Task UpdateFeatureFlagsAsync(List<FeatureFlagDto> flags);
    Task<bool> IsFeatureEnabledAsync(string featureId, string? userId = null, string? userRole = null);

    // Maintenance Mode
    Task<MaintenanceModeDto> GetMaintenanceStatusAsync();
    Task EnableMaintenanceModeAsync(MaintenanceModeDto maintenanceInfo);
    Task DisableMaintenanceModeAsync();

    // System Announcements
    Task<List<SystemAnnouncementDto>> GetSystemAnnouncementsAsync();
    Task<List<SystemAnnouncementDto>> GetActiveAnnouncementsForRoleAsync(string role);
    Task<SystemAnnouncementDto> CreateAnnouncementAsync(SystemAnnouncementDto announcement);
    Task UpdateAnnouncementAsync(string id, SystemAnnouncementDto announcement);
    Task DeleteAnnouncementAsync(string id);

    // System Backup and Restore
    Task<SystemBackupDto> CreateSystemBackupAsync();
    Task<List<SystemBackupDto>> GetSystemBackupsAsync();
    Task RestoreFromBackupAsync(string backupId);

    // System Health
    Task<SystemHealthDto> GetSystemHealthAsync();
}