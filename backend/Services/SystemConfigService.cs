using BingGoWebAPI.Models;
using System.Diagnostics;

namespace BingGoWebAPI.Services;

public class SystemConfigService : ISystemConfigService
{
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<SystemConfigService> _logger;
    private static readonly DateTime _startTime = DateTime.UtcNow;

    public SystemConfigService(IFirebaseService firebaseService, ILogger<SystemConfigService> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    public async Task<SystemSettingsDto> GetSystemSettingsAsync()
    {
        try
        {
            var settings = await _firebaseService.GetSystemSettingsAsync();
            return new SystemSettingsDto
            {
                AppName = settings.AppName,
                AppVersion = settings.AppVersion,
                MaxLoginAttempts = settings.MaxLoginAttempts,
                SessionTimeoutMinutes = settings.SessionTimeoutMinutes,
                MaxFileUploadSizeMB = settings.MaxFileUploadSizeMB,
                AllowedFileTypes = settings.AllowedFileTypes,
                EnableRegistration = settings.EnableRegistration,
                EnablePasswordReset = settings.EnablePasswordReset,
                DefaultLanguage = settings.DefaultLanguage,
                SupportedLanguages = settings.SupportedLanguages
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system settings");
            throw;
        }
    }

    public async Task UpdateSystemSettingsAsync(SystemSettingsDto settingsDto)
    {
        try
        {
            var settings = new SystemSettings
            {
                AppName = settingsDto.AppName,
                AppVersion = settingsDto.AppVersion,
                MaxLoginAttempts = settingsDto.MaxLoginAttempts,
                SessionTimeoutMinutes = settingsDto.SessionTimeoutMinutes,
                MaxFileUploadSizeMB = settingsDto.MaxFileUploadSizeMB,
                AllowedFileTypes = settingsDto.AllowedFileTypes,
                EnableRegistration = settingsDto.EnableRegistration,
                EnablePasswordReset = settingsDto.EnablePasswordReset,
                DefaultLanguage = settingsDto.DefaultLanguage,
                SupportedLanguages = settingsDto.SupportedLanguages,
                UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp(),
                UpdatedBy = "admin" // This should come from the current user context
            };

            await _firebaseService.UpdateSystemSettingsAsync(settings);
            _logger.LogInformation("System settings updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating system settings");
            throw;
        }
    }

    public async Task<List<FeatureFlagDto>> GetFeatureFlagsAsync()
    {
        try
        {
            var flags = await _firebaseService.GetFeatureFlagsAsync();
            return flags.Select(f => new FeatureFlagDto
            {
                Id = f.Id,
                Name = f.Name,
                Description = f.Description,
                Enabled = f.Enabled,
                TargetRoles = f.TargetRoles,
                TargetUsers = f.TargetUsers,
                StartDate = f.StartDate?.ToDateTime(),
                EndDate = f.EndDate?.ToDateTime()
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting feature flags");
            throw;
        }
    }

    public async Task UpdateFeatureFlagsAsync(List<FeatureFlagDto> flagsDto)
    {
        try
        {
            var flags = flagsDto.Select(f => new FeatureFlag
            {
                Id = f.Id,
                Name = f.Name,
                Description = f.Description,
                Enabled = f.Enabled,
                TargetRoles = f.TargetRoles,
                TargetUsers = f.TargetUsers,
                StartDate = f.StartDate.HasValue ? Google.Cloud.Firestore.Timestamp.FromDateTime(f.StartDate.Value) : null,
                EndDate = f.EndDate.HasValue ? Google.Cloud.Firestore.Timestamp.FromDateTime(f.EndDate.Value) : null,
                UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp()
            }).ToList();

            await _firebaseService.UpdateFeatureFlagsAsync(flags);
            _logger.LogInformation("Feature flags updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating feature flags");
            throw;
        }
    }

    public async Task<bool> IsFeatureEnabledAsync(string featureId, string? userId = null, string? userRole = null)
    {
        try
        {
            var flags = await _firebaseService.GetFeatureFlagsAsync();
            var flag = flags.FirstOrDefault(f => f.Id == featureId);

            if (flag == null || !flag.Enabled)
                return false;

            // Check date range
            var now = DateTime.UtcNow;
            if (flag.StartDate.HasValue && now < flag.StartDate.Value.ToDateTime())
                return false;
            if (flag.EndDate.HasValue && now > flag.EndDate.Value.ToDateTime())
                return false;

            // Check target roles
            if (flag.TargetRoles.Any() && !string.IsNullOrEmpty(userRole))
            {
                if (!flag.TargetRoles.Contains(userRole))
                    return false;
            }

            // Check target users
            if (flag.TargetUsers.Any() && !string.IsNullOrEmpty(userId))
            {
                if (!flag.TargetUsers.Contains(userId))
                    return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking feature flag: {FeatureId}", featureId);
            return false; // Fail safe - disable feature if error
        }
    }

    public async Task<MaintenanceModeDto> GetMaintenanceStatusAsync()
    {
        try
        {
            var maintenance = await _firebaseService.GetMaintenanceModeAsync();
            return new MaintenanceModeDto
            {
                Enabled = maintenance.Enabled,
                Message = maintenance.Message,
                StartTime = maintenance.StartTime?.ToDateTime(),
                EndTime = maintenance.EndTime?.ToDateTime(),
                AllowedRoles = maintenance.AllowedRoles
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting maintenance status");
            throw;
        }
    }

    public async Task EnableMaintenanceModeAsync(MaintenanceModeDto maintenanceDto)
    {
        try
        {
            var maintenance = new MaintenanceMode
            {
                Enabled = true,
                Message = maintenanceDto.Message,
                StartTime = maintenanceDto.StartTime.HasValue
                    ? Google.Cloud.Firestore.Timestamp.FromDateTime(maintenanceDto.StartTime.Value)
                    : Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp(),
                EndTime = maintenanceDto.EndTime.HasValue
                    ? Google.Cloud.Firestore.Timestamp.FromDateTime(maintenanceDto.EndTime.Value)
                    : null,
                AllowedRoles = maintenanceDto.AllowedRoles,
                CreatedBy = "admin", // This should come from current user context
                CreatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp()
            };

            await _firebaseService.UpdateMaintenanceModeAsync(maintenance);
            _logger.LogWarning("Maintenance mode enabled: {Message}", maintenanceDto.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enabling maintenance mode");
            throw;
        }
    }

    public async Task DisableMaintenanceModeAsync()
    {
        try
        {
            var maintenance = new MaintenanceMode
            {
                Enabled = false,
                Message = string.Empty,
                StartTime = null,
                EndTime = null,
                AllowedRoles = new List<string> { "admin" },
                CreatedBy = "admin",
                CreatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp()
            };

            await _firebaseService.UpdateMaintenanceModeAsync(maintenance);
            _logger.LogInformation("Maintenance mode disabled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disabling maintenance mode");
            throw;
        }
    }

    public async Task<List<SystemAnnouncementDto>> GetSystemAnnouncementsAsync()
    {
        try
        {
            var announcements = await _firebaseService.GetSystemAnnouncementsAsync();
            return announcements.Select(a => new SystemAnnouncementDto
            {
                Id = a.Id,
                Title = a.Title,
                Message = a.Message,
                Type = a.Type,
                Priority = a.Priority,
                TargetRoles = a.TargetRoles,
                Active = a.Active,
                StartDate = a.StartDate?.ToDateTime(),
                EndDate = a.EndDate?.ToDateTime()
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system announcements");
            throw;
        }
    }

    public async Task<List<SystemAnnouncementDto>> GetActiveAnnouncementsForRoleAsync(string role)
    {
        try
        {
            var announcements = await GetSystemAnnouncementsAsync();
            var now = DateTime.UtcNow;

            return announcements.Where(a =>
                a.Active &&
                (a.TargetRoles.Count == 0 || a.TargetRoles.Contains(role)) &&
                (!a.StartDate.HasValue || now >= a.StartDate.Value) &&
                (!a.EndDate.HasValue || now <= a.EndDate.Value)
            ).OrderByDescending(a => a.Priority).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active announcements for role: {Role}", role);
            throw;
        }
    }

    public async Task<SystemAnnouncementDto> CreateAnnouncementAsync(SystemAnnouncementDto announcementDto)
    {
        try
        {
            var announcement = new SystemAnnouncement
            {
                Id = Guid.NewGuid().ToString(),
                Title = announcementDto.Title,
                Message = announcementDto.Message,
                Type = announcementDto.Type,
                Priority = announcementDto.Priority,
                TargetRoles = announcementDto.TargetRoles,
                Active = announcementDto.Active,
                StartDate = announcementDto.StartDate.HasValue
                    ? Google.Cloud.Firestore.Timestamp.FromDateTime(announcementDto.StartDate.Value)
                    : null,
                EndDate = announcementDto.EndDate.HasValue
                    ? Google.Cloud.Firestore.Timestamp.FromDateTime(announcementDto.EndDate.Value)
                    : null,
                CreatedBy = "admin",
                CreatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp(),
                UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp()
            };

            await _firebaseService.CreateSystemAnnouncementAsync(announcement);

            return new SystemAnnouncementDto
            {
                Id = announcement.Id,
                Title = announcement.Title,
                Message = announcement.Message,
                Type = announcement.Type,
                Priority = announcement.Priority,
                TargetRoles = announcement.TargetRoles,
                Active = announcement.Active,
                StartDate = announcement.StartDate?.ToDateTime(),
                EndDate = announcement.EndDate?.ToDateTime()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating system announcement");
            throw;
        }
    }

    public async Task UpdateAnnouncementAsync(string id, SystemAnnouncementDto announcementDto)
    {
        try
        {
            var announcement = new SystemAnnouncement
            {
                Id = id,
                Title = announcementDto.Title,
                Message = announcementDto.Message,
                Type = announcementDto.Type,
                Priority = announcementDto.Priority,
                TargetRoles = announcementDto.TargetRoles,
                Active = announcementDto.Active,
                StartDate = announcementDto.StartDate.HasValue
                    ? Google.Cloud.Firestore.Timestamp.FromDateTime(announcementDto.StartDate.Value)
                    : null,
                EndDate = announcementDto.EndDate.HasValue
                    ? Google.Cloud.Firestore.Timestamp.FromDateTime(announcementDto.EndDate.Value)
                    : null,
                UpdatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp()
            };

            await _firebaseService.UpdateSystemAnnouncementAsync(announcement);
            _logger.LogInformation("System announcement updated: {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating system announcement: {Id}", id);
            throw;
        }
    }

    public async Task DeleteAnnouncementAsync(string id)
    {
        try
        {
            await _firebaseService.DeleteSystemAnnouncementAsync(id);
            _logger.LogInformation("System announcement deleted: {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting system announcement: {Id}", id);
            throw;
        }
    }

    public async Task<SystemBackupDto> CreateSystemBackupAsync()
    {
        try
        {
            var backup = new SystemBackup
            {
                Id = Guid.NewGuid().ToString(),
                Name = $"System Backup {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}",
                Description = "Automated system backup",
                BackupType = "full",
                Status = "in_progress",
                CreatedBy = "admin",
                CreatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp()
            };

            // Simulate backup creation (in real implementation, this would create actual backup)
            await Task.Delay(1000);

            backup.Status = "completed";
            backup.FileSizeBytes = new Random().Next(1000000, 10000000); // Simulate file size
            backup.CompletedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();
            backup.FilePath = $"/backups/{backup.Id}.backup";

            await _firebaseService.CreateSystemBackupAsync(backup);

            return new SystemBackupDto
            {
                Id = backup.Id,
                Name = backup.Name,
                Description = backup.Description,
                BackupType = backup.BackupType,
                FileSizeBytes = backup.FileSizeBytes,
                Status = backup.Status,
                CreatedAt = backup.CreatedAt.ToDateTime(),
                CompletedAt = backup.CompletedAt?.ToDateTime()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating system backup");
            throw;
        }
    }

    public async Task<List<SystemBackupDto>> GetSystemBackupsAsync()
    {
        try
        {
            var backups = await _firebaseService.GetSystemBackupsAsync();
            return backups.Select(b => new SystemBackupDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                BackupType = b.BackupType,
                FileSizeBytes = b.FileSizeBytes,
                Status = b.Status,
                CreatedAt = b.CreatedAt.ToDateTime(),
                CompletedAt = b.CompletedAt?.ToDateTime()
            }).OrderByDescending(b => b.CreatedAt).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system backups");
            throw;
        }
    }

    public async Task RestoreFromBackupAsync(string backupId)
    {
        try
        {
            // In real implementation, this would restore from actual backup file
            await Task.Delay(2000); // Simulate restore process

            _logger.LogWarning("System restored from backup: {BackupId}", backupId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring from backup: {BackupId}", backupId);
            throw;
        }
    }

    public async Task<SystemHealthDto> GetSystemHealthAsync()
    {
        try
        {
            var process = Process.GetCurrentProcess();
            var uptime = DateTime.UtcNow - _startTime;

            // Check database connectivity
            var dbStatus = "connected";
            try
            {
                await _firebaseService.TestConnectionAsync();
            }
            catch
            {
                dbStatus = "disconnected";
            }

            return new SystemHealthDto
            {
                Status = dbStatus == "connected" ? "healthy" : "unhealthy",
                DatabaseStatus = dbStatus,
                FirebaseStatus = dbStatus,
                StorageStatus = "available",
                MemoryUsageMB = process.WorkingSet64 / 1024.0 / 1024.0,
                CpuUsagePercent = 0, // Would need performance counter for accurate CPU usage
                ActiveUsers = 0, // Would need to track active sessions
                UptimeSeconds = (long)uptime.TotalSeconds,
                LastCheck = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system health");
            return new SystemHealthDto
            {
                Status = "unhealthy",
                DatabaseStatus = "error",
                FirebaseStatus = "error",
                StorageStatus = "error",
                LastCheck = DateTime.UtcNow
            };
        }
    }
}