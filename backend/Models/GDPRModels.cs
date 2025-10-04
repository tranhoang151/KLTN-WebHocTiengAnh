using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models
{
    #region Export Models

    [FirestoreData]
    public class UserProfileExport
    {
        [FirestoreProperty]
        public string FullName { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Email { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Role { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime? DateOfBirth { get; set; }

        [FirestoreProperty]
        public string PreferredLanguage { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Timezone { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty]
        public DateTime? LastLoginAt { get; set; }

        [FirestoreProperty]
        public string? ProfileImageUrl { get; set; }
    }

    [FirestoreData]
    public class LearningProgressExport
    {
        [FirestoreProperty]
        public string CourseId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string LessonId { get; set; } = string.Empty;

        [FirestoreProperty]
        public double CompletionPercentage { get; set; }

        [FirestoreProperty]
        public TimeSpan TimeSpent { get; set; }

        [FirestoreProperty]
        public DateTime LastAccessedAt { get; set; }

        [FirestoreProperty]
        public double Score { get; set; }
    }

    [FirestoreData]
    public class FlashcardExport
    {
        [FirestoreProperty]
        public string FrontText { get; set; } = string.Empty;

        [FirestoreProperty]
        public string BackText { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Category { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Difficulty { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty]
        public List<string> Tags { get; set; } = new();
    }

    [FirestoreData]
    public class ExerciseExport
    {
        [FirestoreProperty]
        public string Title { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Type { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime? CompletedAt { get; set; }

        [FirestoreProperty]
        public double Score { get; set; }

        [FirestoreProperty]
        public TimeSpan TimeSpent { get; set; }

        [FirestoreProperty]
        public List<string> Answers { get; set; } = new();
    }

    [FirestoreData]
    public class AchievementExport
    {
        [FirestoreProperty]
        public string AchievementId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Title { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Description { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime EarnedAt { get; set; }

        [FirestoreProperty]
        public string Category { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class EnrollmentExport
    {
        [FirestoreProperty]
        public string CourseId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string CourseName { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime EnrolledAt { get; set; }

        [FirestoreProperty]
        public string Status { get; set; } = string.Empty;

        [FirestoreProperty]
        public double Progress { get; set; }
    }

    [FirestoreData]
    public class SystemLogExport
    {
        [FirestoreProperty]
        public string Action { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime Timestamp { get; set; }

        [FirestoreProperty]
        public string Details { get; set; } = string.Empty;

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserAgent { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class PrivacySettingsExport
    {
        [FirestoreProperty]
        public bool AllowDataCollection { get; set; }

        [FirestoreProperty]
        public bool AllowMarketing { get; set; }

        [FirestoreProperty]
        public bool AllowAnalytics { get; set; }

        [FirestoreProperty]
        public bool AllowCookies { get; set; }

        [FirestoreProperty]
        public DateTime LastUpdated { get; set; }

        [FirestoreProperty]
        public List<ConsentRecord> ConsentHistory { get; set; } = new();
    }

    [FirestoreData]
    public class UserPreferencesExport
    {
        [FirestoreProperty]
        public string Theme { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Language { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool NotificationsEnabled { get; set; }

        [FirestoreProperty]
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    #endregion

    #region Privacy and Consent Models

    [FirestoreData]
    public class ConsentRecord
    {
        [FirestoreProperty]
        public string ConsentType { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool Granted { get; set; }

        [FirestoreProperty]
        public DateTime Timestamp { get; set; }

        [FirestoreProperty]
        public string Version { get; set; } = string.Empty;

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserAgent { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class PrivacySettings
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool AllowDataCollection { get; set; } = true;

        [FirestoreProperty]
        public bool AllowMarketing { get; set; } = false;

        [FirestoreProperty]
        public bool AllowAnalytics { get; set; } = true;

        [FirestoreProperty]
        public bool AllowCookies { get; set; } = true;

        [FirestoreProperty]
        public bool AllowPersonalization { get; set; } = true;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty]
        public DateTime LastUpdated { get; set; }

        [FirestoreProperty]
        public List<ConsentRecord> ConsentHistory { get; set; } = new();
    }

    [FirestoreData]
    public class PrivacyPolicy
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Version { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Content { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime EffectiveDate { get; set; }

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty]
        public bool IsActive { get; set; }

        [FirestoreProperty]
        public List<string> Changes { get; set; } = new();
    }

    [FirestoreData]
    public class CookieConsent
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool Essential { get; set; } = true;

        [FirestoreProperty]
        public bool Functional { get; set; } = false;

        [FirestoreProperty]
        public bool Analytics { get; set; } = false;

        [FirestoreProperty]
        public bool Marketing { get; set; } = false;

        [FirestoreProperty]
        public bool Personalization { get; set; } = false;

        [FirestoreProperty]
        public DateTime ConsentDate { get; set; }

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty]
        public DateTime UpdatedAt { get; set; }

        [FirestoreProperty]
        public DateTime? ExpiryDate { get; set; }

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserAgent { get; set; } = string.Empty;

        [FirestoreProperty]
        public string ConsentMethod { get; set; } = string.Empty; // "banner", "settings", "api"
    }

    #endregion

    #region Audit and Logging Models

    [FirestoreData]
    public class AuditLog
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Action { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Resource { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Details { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime Timestamp { get; set; }

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserAgent { get; set; } = string.Empty;

        [FirestoreProperty]
        public string SessionId { get; set; } = string.Empty;

        [FirestoreProperty]
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    [FirestoreData]
    public class DataAccessLog
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string DataType { get; set; } = string.Empty;

        [FirestoreProperty]
        public string AccessType { get; set; } = string.Empty; // "read", "write", "delete", "export"

        [FirestoreProperty]
        public DateTime Timestamp { get; set; }

        [FirestoreProperty]
        public string Purpose { get; set; } = string.Empty;

        [FirestoreProperty]
        public string LegalBasis { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool UserConsented { get; set; }

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;
    }

    #endregion

    #region Session Management Models

    [FirestoreData]
    public class UserSession
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string SessionToken { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty]
        public DateTime LastAccessedAt { get; set; }

        [FirestoreProperty]
        public DateTime ExpiresAt { get; set; }

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserAgent { get; set; } = string.Empty;

        [FirestoreProperty]
        public string DeviceFingerprint { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool IsActive { get; set; } = true;

        [FirestoreProperty]
        public Dictionary<string, object> SessionData { get; set; } = new();
    }

    [FirestoreData]
    public class SecurityEvent
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public SecurityEventType EventType { get; set; }

        [FirestoreProperty]
        public SecurityEventSeverity Severity { get; set; }

        [FirestoreProperty]
        public string Description { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Details { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Source { get; set; } = string.Empty;

        [FirestoreProperty]
        public Dictionary<string, object> EventData { get; set; } = new();

        [FirestoreProperty]
        public RiskLevel RiskLevel { get; set; }

        [FirestoreProperty]
        public DateTime Timestamp { get; set; }

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserAgent { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool Resolved { get; set; } = false;

        [FirestoreProperty]
        public Dictionary<string, object> Metadata { get; set; } = [];
    }

    #endregion

    #region Request/Response Models

    public class ConsentUpdateRequest
    {
        public string PolicyVersion { get; set; } = string.Empty;
        public bool AcceptedTerms { get; set; }
        public bool AcceptedPrivacyPolicy { get; set; }
        public bool AcceptedDataProcessing { get; set; }
        public bool AcceptedCookies { get; set; }
        public bool AcceptedMarketing { get; set; }
        public Dictionary<string, bool> SpecificConsents { get; set; } = new();
    }

    public class GDPRDataExportResult
    {
        public string ExportId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string DownloadUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public long FileSizeBytes { get; set; }
    }

    public class GDPRDataPortabilityResult
    {
        public string RequestId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string DownloadUrl { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class GDPRDeletionRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public bool ConfirmDeletion { get; set; }
        public string DeletionScope { get; set; } = string.Empty;
        public List<string> DataTypesToDelete { get; set; } = new();
    }

    public class GDPRDeletionResult
    {
        public string RequestId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<string> DeletedDataTypes { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }

    public class UserPrivacySettings
    {
        public string UserId { get; set; } = string.Empty;
        public bool AllowDataCollection { get; set; }
        public bool AllowMarketing { get; set; }
        public bool AllowAnalytics { get; set; }
        public bool AllowCookies { get; set; }
        public bool AllowPersonalization { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    #endregion

    #region GDPR Compliance Models

    [FirestoreData]
    public class UserConsent
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool DataProcessingConsent { get; set; }

        [FirestoreProperty]
        public bool MarketingConsent { get; set; }

        [FirestoreProperty]
        public bool AnalyticsConsent { get; set; }

        [FirestoreProperty]
        public bool CookieConsent { get; set; }

        [FirestoreProperty]
        public string ConsentVersion { get; set; } = string.Empty;

        [FirestoreProperty]
        public string PolicyVersion { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool AcceptedTerms { get; set; }

        [FirestoreProperty]
        public bool AcceptedPrivacyPolicy { get; set; }

        [FirestoreProperty]
        public bool AcceptedDataProcessing { get; set; }

        [FirestoreProperty]
        public bool AcceptedCookies { get; set; }

        [FirestoreProperty]
        public bool AcceptedMarketing { get; set; }

        [FirestoreProperty]
        public Dictionary<string, bool> SpecificConsents { get; set; } = new();

        [FirestoreProperty]
        public DateTime ConsentDate { get; set; }

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty]
        public DateTime UpdatedAt { get; set; }

        [FirestoreProperty]
        public DateTime LastUpdated { get; set; }

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserAgent { get; set; } = string.Empty;

        public bool RequiresUpdate { get; set; } // Not stored in Firestore
    }

    [FirestoreData]
    public class DataProcessingActivity
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string ActivityType { get; set; } = string.Empty;

        [FirestoreProperty]
        public string DataCategory { get; set; } = string.Empty;

        [FirestoreProperty]
        public string ProcessingPurpose { get; set; } = string.Empty;

        [FirestoreProperty]
        public string LegalBasis { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime ProcessedAt { get; set; }

        [FirestoreProperty]
        public string ProcessedBy { get; set; } = string.Empty;

        [FirestoreProperty]
        public Dictionary<string, object> ProcessingDetails { get; set; } = new();

        [FirestoreProperty]
        public bool UserConsented { get; set; }

        [FirestoreProperty]
        public DateTime? ConsentDate { get; set; }
    }

    [FirestoreData]
    public class ComplianceReport
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime GeneratedAt { get; set; }

        [FirestoreProperty]
        public string ReportType { get; set; } = string.Empty;

        [FirestoreProperty]
        public Dictionary<string, bool> ComplianceChecks { get; set; } = new();

        [FirestoreProperty]
        public List<string> Violations { get; set; } = new();

        [FirestoreProperty]
        public List<string> Recommendations { get; set; } = new();

        [FirestoreProperty]
        public bool IsCompliant { get; set; }

        [FirestoreProperty]
        public DateTime? LastDataAccess { get; set; }

        [FirestoreProperty]
        public DateTime? LastConsentUpdate { get; set; }

        [FirestoreProperty]
        public int DataRetentionDays { get; set; }

        [FirestoreProperty]
        public Dictionary<string, object> AdditionalData { get; set; } = new();
    }

    #endregion

    #region Security Models

    public enum SecurityEventType
    {
        Unknown,
        AuthenticationSuccess,
        AuthenticationFailure,
        SuspiciousActivity,
        IntrusionAttempt,
        SecurityViolation,
        DataAccess,
        PermissionEscalation,
        UnauthorizedAccess
    }

    public enum SecurityEventSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum SecurityIncidentStatus
    {
        Open,
        InProgress,
        Resolved,
        Closed,
        Escalated
    }

    public enum SecurityAlertType
    {
        IntrusionDetection,
        DataBreach,
        UnauthorizedAccess,
        SuspiciousActivity,
        SystemCompromise,
        PolicyViolation
    }

    [FirestoreData]
    public class ThreatDetection
    {
        [FirestoreProperty] public string Id { get; set; } = string.Empty;
        [FirestoreProperty] public string ThreatType { get; set; } = string.Empty;
        [FirestoreProperty] public SecurityEventSeverity Severity { get; set; }
        [FirestoreProperty] public string SourceIp { get; set; } = string.Empty;
        [FirestoreProperty] public string TargetUserId { get; set; } = string.Empty;
        [FirestoreProperty] public DateTime DetectedAt { get; set; }
        [FirestoreProperty] public string EventId { get; set; } = string.Empty;
        [FirestoreProperty] public string Description { get; set; } = string.Empty;
        [FirestoreProperty] public double Confidence { get; set; }
        [FirestoreProperty] public bool Mitigated { get; set; }
        [FirestoreProperty] public string MitigationAction { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class DetectionRule
    {
        [FirestoreProperty] public string Id { get; set; } = string.Empty;
        [FirestoreProperty] public string Name { get; set; } = string.Empty;
        [FirestoreProperty] public string Description { get; set; } = string.Empty;
        [FirestoreProperty] public string RuleType { get; set; } = string.Empty;
        [FirestoreProperty] public string Pattern { get; set; } = string.Empty;
        [FirestoreProperty] public SecurityEventSeverity Severity { get; set; }
        [FirestoreProperty] public bool Enabled { get; set; }
        [FirestoreProperty] public DateTime CreatedAt { get; set; }
        [FirestoreProperty] public DateTime UpdatedAt { get; set; }
    }

    [FirestoreData]
    public class IntrusionDetectionReport
    {
        [FirestoreProperty] public string Id { get; set; } = string.Empty;
        [FirestoreProperty] public DateTime GeneratedAt { get; set; }
        [FirestoreProperty] public DateTime FromDate { get; set; }
        [FirestoreProperty] public DateTime ToDate { get; set; }
        [FirestoreProperty] public int TotalThreats { get; set; }
        [FirestoreProperty] public Dictionary<string, int> ThreatsByType { get; set; } = [];
        [FirestoreProperty] public int BlockedIpCount { get; set; }
        [FirestoreProperty] public List<string> TopBlockedIps { get; set; } = [];
        [FirestoreProperty] public double DetectionAccuracy { get; set; }
        [FirestoreProperty] public Dictionary<string, int> TopAttackSources { get; set; } = [];
    }

    [FirestoreData]
    public class IpBlockInfo
    {
        [FirestoreProperty] public string IpAddress { get; set; } = string.Empty;
        [FirestoreProperty] public string Reason { get; set; } = string.Empty;
        [FirestoreProperty] public DateTime BlockedAt { get; set; }
        [FirestoreProperty] public DateTime? ExpiresAt { get; set; }
        [FirestoreProperty] public string BlockedBy { get; set; } = string.Empty;
    }

    public class DetectionThresholds
    {
        public int BruteForceThreshold { get; set; } = 5;
        public int SuspiciousLoginIpThreshold { get; set; } = 3;
        public int RateLimitThreshold { get; set; } = 100;
        public int AnomalousActivityThreshold { get; set; } = 5;
    }

    [FirestoreData]
    public class SecurityIncident
    {
        [FirestoreProperty] public string Id { get; set; } = string.Empty;
        [FirestoreProperty] public string Title { get; set; } = string.Empty;
        [FirestoreProperty] public string Description { get; set; } = string.Empty;
        [FirestoreProperty] public SecurityIncidentStatus Status { get; set; }
        [FirestoreProperty] public SecurityEventSeverity Severity { get; set; }
        [FirestoreProperty] public string CreatedBy { get; set; } = string.Empty;
        [FirestoreProperty] public string AssignedTo { get; set; } = string.Empty;
        [FirestoreProperty] public DateTime CreatedAt { get; set; }
        [FirestoreProperty] public DateTime? ResolvedAt { get; set; }
        [FirestoreProperty] public List<string> RelatedEventIds { get; set; } = [];
        [FirestoreProperty] public Dictionary<string, object> Metadata { get; set; } = [];
    }

    [FirestoreData]
    public class SecurityAlert
    {
        [FirestoreProperty] public string Id { get; set; } = string.Empty;
        [FirestoreProperty] public SecurityAlertType AlertType { get; set; }
        [FirestoreProperty] public SecurityEventSeverity Severity { get; set; }
        [FirestoreProperty] public string Message { get; set; } = string.Empty;
        [FirestoreProperty] public string Source { get; set; } = string.Empty;
        [FirestoreProperty] public string RelatedEventId { get; set; } = string.Empty;
        [FirestoreProperty] public DateTime CreatedAt { get; set; }
        [FirestoreProperty] public bool Acknowledged { get; set; }
        [FirestoreProperty] public string AcknowledgedBy { get; set; } = string.Empty;
        [FirestoreProperty] public DateTime? AcknowledgedAt { get; set; }
        [FirestoreProperty] public Dictionary<string, object> Metadata { get; set; } = [];
    }

    public class SecurityDashboardData
    {
        public int TotalEvents { get; set; }
        public int CriticalEvents { get; set; }
        public int ActiveIncidents { get; set; }
        public int BlockedIps { get; set; }
        public List<ThreatDetection> RecentThreats { get; set; } = [];
        public List<SecurityEvent> RecentEvents { get; set; } = [];
        public Dictionary<string, int> EventsByType { get; set; } = [];
        public Dictionary<string, int> EventsBySeverity { get; set; } = [];
    }

    public class SecurityThreatAnalysis
    {
        public DateTime AnalysisDate { get; set; }
        public TimeSpan AnalysisPeriod { get; set; }
        public int TotalThreats { get; set; }
        public int HighSeverityThreats { get; set; }
        public int CriticalThreats { get; set; }
        public List<string> TopThreatTypes { get; set; } = [];
        public List<string> TopAttackSources { get; set; } = [];
        public double ThreatTrend { get; set; }
        public List<ThreatDetection> MostCriticalThreats { get; set; } = [];
    }

    public class SecurityMetric
    {
        public string MetricName { get; set; } = string.Empty;
        public string MetricType { get; set; } = string.Empty;
        public double Value { get; set; }
        public DateTime Timestamp { get; set; }
        public Dictionary<string, object> Dimensions { get; set; } = [];
    }

    public class SecurityComplianceReport
    {
        public string Id { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public bool IsCompliant { get; set; }
        public List<string> ComplianceChecks { get; set; } = [];
        public List<string> Violations { get; set; } = [];
        public List<string> Recommendations { get; set; } = [];
        public Dictionary<string, object> Metrics { get; set; } = [];
    }

    public class SecurityIncidentRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public SecurityEventSeverity Severity { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public List<string> RelatedEventIds { get; set; } = [];
    }

    #endregion

    #region Missing Model Classes

    public enum RiskLevel
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum SecurityViolationType
    {
        UnauthorizedAccess,
        DataBreach,
        PolicyViolation,
        IntrusionAttempt,
        SuspiciousActivity,
        PrivilegeEscalation
    }

    [FirestoreData]
    public class ConsentHistory
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Action { get; set; } = string.Empty;

        [FirestoreProperty]
        public string PolicyVersion { get; set; } = string.Empty;

        [FirestoreProperty]
        public string ConsentData { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime Timestamp { get; set; }

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserAgent { get; set; } = string.Empty;
    }

    [FirestoreData]
    public class ConsentReport
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime GeneratedAt { get; set; }

        [FirestoreProperty]
        public DateTime FromDate { get; set; }

        [FirestoreProperty]
        public DateTime ToDate { get; set; }

        [FirestoreProperty]
        public int TotalUsers { get; set; }

        [FirestoreProperty]
        public int AcceptedTerms { get; set; }

        [FirestoreProperty]
        public int AcceptedPrivacyPolicy { get; set; }

        [FirestoreProperty]
        public int AcceptedDataProcessing { get; set; }

        [FirestoreProperty]
        public int AcceptedCookies { get; set; }

        [FirestoreProperty]
        public int AcceptedMarketing { get; set; }

        [FirestoreProperty]
        public int ConsentUpdates { get; set; }

        [FirestoreProperty]
        public Dictionary<string, double> ConsentRates { get; set; } = new();
    }

    public class CookieConsentRequest
    {
        public bool Functional { get; set; }
        public bool Analytics { get; set; }
        public bool Marketing { get; set; }
        public bool Personalization { get; set; }
    }

    [FirestoreData]
    public class SuspiciousActivity
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Type { get; set; } = string.Empty;

        [FirestoreProperty]
        public string IpAddress { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public int EventCount { get; set; }

        [FirestoreProperty]
        public int RiskScore { get; set; }

        [FirestoreProperty]
        public DateTime FirstOccurrence { get; set; }

        [FirestoreProperty]
        public DateTime LastOccurrence { get; set; }

        [FirestoreProperty]
        public string Description { get; set; } = string.Empty;
    }

    #endregion
}