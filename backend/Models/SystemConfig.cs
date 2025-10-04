using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class SystemSettings
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = "system_settings";

    [FirestoreProperty("app_name")]
    public string AppName { get; set; } = "BingGo English Learning";

    [FirestoreProperty("app_version")]
    public string AppVersion { get; set; } = "1.0.0";

    [FirestoreProperty("max_login_attempts")]
    public int MaxLoginAttempts { get; set; } = 5;

    [FirestoreProperty("session_timeout_minutes")]
    public int SessionTimeoutMinutes { get; set; } = 60;

    [FirestoreProperty("max_file_upload_size_mb")]
    public int MaxFileUploadSizeMB { get; set; } = 10;

    [FirestoreProperty("allowed_file_types")]
    public List<string> AllowedFileTypes { get; set; } = new() { "jpg", "jpeg", "png", "gif", "mp4", "pdf" };

    [FirestoreProperty("enable_registration")]
    public bool EnableRegistration { get; set; } = true;

    [FirestoreProperty("enable_password_reset")]
    public bool EnablePasswordReset { get; set; } = true;

    [FirestoreProperty("default_language")]
    public string DefaultLanguage { get; set; } = "vi";

    [FirestoreProperty("supported_languages")]
    public List<string> SupportedLanguages { get; set; } = new() { "vi", "en" };

    [FirestoreProperty("updated_at")]
    public Timestamp UpdatedAt { get; set; }

    [FirestoreProperty("updated_by")]
    public string UpdatedBy { get; set; } = string.Empty;
}

[FirestoreData]
public class FeatureFlag
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("name")]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty("description")]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty("enabled")]
    public bool Enabled { get; set; }

    [FirestoreProperty("target_roles")]
    public List<string> TargetRoles { get; set; } = new();

    [FirestoreProperty("target_users")]
    public List<string> TargetUsers { get; set; } = new();

    [FirestoreProperty("start_date")]
    public Timestamp? StartDate { get; set; }

    [FirestoreProperty("end_date")]
    public Timestamp? EndDate { get; set; }

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("updated_at")]
    public Timestamp UpdatedAt { get; set; }
}

[FirestoreData]
public class MaintenanceMode
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = "maintenance_mode";

    [FirestoreProperty("enabled")]
    public bool Enabled { get; set; }

    [FirestoreProperty("message")]
    public string Message { get; set; } = string.Empty;

    [FirestoreProperty("start_time")]
    public Timestamp? StartTime { get; set; }

    [FirestoreProperty("end_time")]
    public Timestamp? EndTime { get; set; }

    [FirestoreProperty("allowed_roles")]
    public List<string> AllowedRoles { get; set; } = new() { "admin" };

    [FirestoreProperty("created_by")]
    public string CreatedBy { get; set; } = string.Empty;

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }
}

[FirestoreData]
public class SystemAnnouncement
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("title")]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty("message")]
    public string Message { get; set; } = string.Empty;

    [FirestoreProperty("type")]
    public string Type { get; set; } = "info"; // info, warning, error, success

    [FirestoreProperty("priority")]
    public int Priority { get; set; } = 1; // 1 = low, 2 = medium, 3 = high

    [FirestoreProperty("target_roles")]
    public List<string> TargetRoles { get; set; } = new();

    [FirestoreProperty("active")]
    public bool Active { get; set; } = true;

    [FirestoreProperty("start_date")]
    public Timestamp? StartDate { get; set; }

    [FirestoreProperty("end_date")]
    public Timestamp? EndDate { get; set; }

    [FirestoreProperty("created_by")]
    public string CreatedBy { get; set; } = string.Empty;

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("updated_at")]
    public Timestamp UpdatedAt { get; set; }
}

[FirestoreData]
public class SystemBackup
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("name")]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty("description")]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty("backup_type")]
    public string BackupType { get; set; } = "full"; // full, incremental

    [FirestoreProperty("file_path")]
    public string FilePath { get; set; } = string.Empty;

    [FirestoreProperty("file_size_bytes")]
    public long FileSizeBytes { get; set; }

    [FirestoreProperty("status")]
    public string Status { get; set; } = "pending"; // pending, in_progress, completed, failed

    [FirestoreProperty("created_by")]
    public string CreatedBy { get; set; } = string.Empty;

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("completed_at")]
    public Timestamp? CompletedAt { get; set; }
}

[FirestoreData]
public class SystemHealth
{
    [FirestoreProperty("status")]
    public string Status { get; set; } = "healthy"; // healthy, degraded, unhealthy

    [FirestoreProperty("database_status")]
    public string DatabaseStatus { get; set; } = "connected";

    [FirestoreProperty("firebase_status")]
    public string FirebaseStatus { get; set; } = "connected";

    [FirestoreProperty("storage_status")]
    public string StorageStatus { get; set; } = "available";

    [FirestoreProperty("memory_usage_mb")]
    public double MemoryUsageMB { get; set; }

    [FirestoreProperty("cpu_usage_percent")]
    public double CpuUsagePercent { get; set; }

    [FirestoreProperty("active_users")]
    public int ActiveUsers { get; set; }

    [FirestoreProperty("uptime_seconds")]
    public long UptimeSeconds { get; set; }

    [FirestoreProperty("last_check")]
    public Timestamp LastCheck { get; set; }
}