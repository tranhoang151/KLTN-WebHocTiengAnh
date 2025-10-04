using Google.Cloud.Firestore;
using BingGoWebAPI.Models;
using System.Text.Json;

namespace BingGoWebAPI.Services
{
    /// <summary>
    /// Audit Log Service for tracking data access and modifications
    /// Implements comprehensive logging for GDPR compliance and security monitoring
    /// </summary>
    public interface IAuditLogService
    {
        Task LogDataAccessAsync(string userId, string action, string details, string? resource = null);
        Task LogDataDeletionAsync(string userId, string deletionType, string details);
        Task LogSecurityEventAsync(string userId, string eventType, string severity, string description, Dictionary<string, object>? eventData = null);
        Task<List<AuditLog>> GetUserAuditLogsAsync(string userId, TimeSpan? timeRange = null);
        Task<List<SystemLogExport>> GetUserSystemLogsForExportAsync(string userId);
        Task<List<DataAccessLog>> GetDataAccessLogsAsync(string userId, string? dataType = null);
        Task LogConsentChangeAsync(string userId, string consentType, bool granted, string version);
        Task LogPrivacySettingsChangeAsync(string userId, Dictionary<string, object> changes);
        Task CleanupOldLogsAsync(TimeSpan retentionPeriod);

        // New methods for enhanced audit functionality
        Task LogConsentUpdateAsync(string userId, string action, object details);
        Task LogAdminActionAsync(string adminId, string action, object details);
        Task<List<AuditLog>> GetAuditLogsByActionAsync(string action, DateTime? fromDate = null);
        Task<List<AuditLog>> GetAuditLogsAsync(string? userId = null, DateTime? fromDate = null);
    }

    public class AuditLogService : IAuditLogService
    {
        private readonly FirestoreDb _firestore;
        private readonly ILogger<AuditLogService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogService(
            FirestoreDb firestore,
            ILogger<AuditLogService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _firestore = firestore;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Log data access activities for GDPR compliance
        /// </summary>
        public async Task LogDataAccessAsync(string userId, string action, string details, string? resource = null)
        {
            try
            {
                var context = _httpContextAccessor.HttpContext;
                var auditLog = new AuditLog
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    Action = action,
                    Resource = resource ?? "Unknown",
                    Details = details,
                    Timestamp = DateTime.UtcNow,
                    IpAddress = GetClientIpAddress(context),
                    UserAgent = context?.Request.Headers["User-Agent"].ToString() ?? "Unknown",
                    SessionId = context?.Session?.Id ?? "Unknown"
                };

                // Add additional metadata
                auditLog.Metadata = new Dictionary<string, object>
                {
                    ["requestId"] = context?.TraceIdentifier ?? Guid.NewGuid().ToString(),
                    ["method"] = context?.Request.Method ?? "Unknown",
                    ["path"] = context?.Request.Path.ToString() ?? "Unknown"
                };

                var docRef = _firestore.Collection("auditLogs").Document(auditLog.Id);
                await docRef.SetAsync(auditLog);

                // Also log data access specifically
                await LogDataAccessInternalAsync(userId, action, details, resource);

                _logger.LogInformation("Audit log created for user {UserId}, action {Action}", userId, action);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create audit log for user {UserId}, action {Action}", userId, action);
                // Don't throw - audit logging should not break the main flow
            }
        }

        /// <summary>
        /// Log data deletion activities
        /// </summary>
        public async Task LogDataDeletionAsync(string userId, string deletionType, string details)
        {
            try
            {
                await LogDataAccessAsync(userId, "DATA_DELETION", $"Type: {deletionType}, Details: {details}");

                // Create specific data access log for deletion
                var context = _httpContextAccessor.HttpContext;
                var dataAccessLog = new DataAccessLog
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    DataType = "User Data",
                    AccessType = "delete",
                    Timestamp = DateTime.UtcNow,
                    Purpose = "GDPR Right to Erasure",
                    LegalBasis = "User request for data deletion",
                    UserConsented = true,
                    IpAddress = GetClientIpAddress(context)
                };

                var docRef = _firestore.Collection("dataAccessLogs").Document(dataAccessLog.Id);
                await docRef.SetAsync(dataAccessLog);

                _logger.LogInformation("Data deletion logged for user {UserId}, type {DeletionType}", userId, deletionType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log data deletion for user {UserId}", userId);
            }
        }

        /// <summary>
        /// Log security events
        /// </summary>
        public async Task LogSecurityEventAsync(string userId, string eventType, string severity, string description, Dictionary<string, object>? eventData = null)
        {
            try
            {
                var context = _httpContextAccessor.HttpContext;
                var securityEvent = new SecurityEvent
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    EventType = Enum.TryParse<SecurityEventType>(eventType, out var parsedEventType) ? parsedEventType : SecurityEventType.Unknown,
                    Severity = Enum.TryParse<SecurityEventSeverity>(severity, out var parsedSeverity) ? parsedSeverity : SecurityEventSeverity.Low,
                    Description = description,
                    Timestamp = DateTime.UtcNow,
                    IpAddress = GetClientIpAddress(context),
                    UserAgent = context?.Request.Headers["User-Agent"].ToString() ?? "Unknown",
                    EventData = eventData ?? new Dictionary<string, object>()
                };

                var docRef = _firestore.Collection("securityEvents").Document(securityEvent.Id);
                await docRef.SetAsync(securityEvent);

                // Also create audit log entry
                await LogDataAccessAsync(userId, $"SECURITY_EVENT_{eventType}", description);

                _logger.LogWarning("Security event logged: {EventType} for user {UserId}, severity {Severity}",
                    eventType, userId, severity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log security event for user {UserId}", userId);
            }
        }

        /// <summary>
        /// Get audit logs for a specific user
        /// </summary>
        public async Task<List<AuditLog>> GetUserAuditLogsAsync(string userId, TimeSpan? timeRange = null)
        {
            try
            {
                var query = _firestore.Collection("auditLogs")
                    .WhereEqualTo("userId", userId)
                    .OrderByDescending("timestamp");

                if (timeRange.HasValue)
                {
                    var cutoffDate = DateTime.UtcNow.Subtract(timeRange.Value);
                    query = query.WhereGreaterThanOrEqualTo("timestamp", cutoffDate);
                }

                var snapshot = await query.Limit(1000).GetSnapshotAsync();
                return snapshot.Documents.Select(doc => doc.ConvertTo<AuditLog>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get audit logs for user {UserId}", userId);
                return new List<AuditLog>();
            }
        }

        /// <summary>
        /// Get system logs for GDPR export
        /// </summary>
        public async Task<List<SystemLogExport>> GetUserSystemLogsForExportAsync(string userId)
        {
            try
            {
                var auditLogs = await GetUserAuditLogsAsync(userId, TimeSpan.FromDays(365));

                return auditLogs.Select(log => new SystemLogExport
                {
                    Action = log.Action,
                    Timestamp = log.Timestamp,
                    Details = log.Details,
                    IpAddress = MaskIpAddress(log.IpAddress),
                    UserAgent = log.UserAgent
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get system logs for export for user {UserId}", userId);
                return new List<SystemLogExport>();
            }
        }

        /// <summary>
        /// Get data access logs
        /// </summary>
        public async Task<List<DataAccessLog>> GetDataAccessLogsAsync(string userId, string? dataType = null)
        {
            try
            {
                var query = _firestore.Collection("dataAccessLogs")
                    .WhereEqualTo("userId", userId)
                    .OrderByDescending("timestamp");

                if (!string.IsNullOrEmpty(dataType))
                {
                    query = query.WhereEqualTo("dataType", dataType);
                }

                var snapshot = await query.Limit(500).GetSnapshotAsync();
                return snapshot.Documents.Select(doc => doc.ConvertTo<DataAccessLog>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get data access logs for user {UserId}", userId);
                return new List<DataAccessLog>();
            }
        }

        /// <summary>
        /// Log consent changes
        /// </summary>
        public async Task LogConsentChangeAsync(string userId, string consentType, bool granted, string version)
        {
            try
            {
                var details = $"Consent {consentType} {(granted ? "granted" : "revoked")} for version {version}";
                await LogDataAccessAsync(userId, "CONSENT_CHANGE", details);

                _logger.LogInformation("Consent change logged for user {UserId}: {ConsentType} = {Granted}",
                    userId, consentType, granted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log consent change for user {UserId}", userId);
            }
        }

        /// <summary>
        /// Log privacy settings changes
        /// </summary>
        public async Task LogPrivacySettingsChangeAsync(string userId, Dictionary<string, object> changes)
        {
            try
            {
                var changesJson = JsonSerializer.Serialize(changes);
                await LogDataAccessAsync(userId, "PRIVACY_SETTINGS_CHANGE", $"Changes: {changesJson}");

                _logger.LogInformation("Privacy settings change logged for user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log privacy settings change for user {UserId}", userId);
            }
        }

        /// <summary>
        /// Clean up old logs based on retention policy
        /// </summary>
        public async Task CleanupOldLogsAsync(TimeSpan retentionPeriod)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.Subtract(retentionPeriod);

                // Clean up audit logs
                await CleanupCollectionAsync("auditLogs", cutoffDate);

                // Clean up data access logs
                await CleanupCollectionAsync("dataAccessLogs", cutoffDate);

                // Clean up security events (keep longer)
                var securityRetentionDate = DateTime.UtcNow.Subtract(TimeSpan.FromDays(2555)); // 7 years
                await CleanupCollectionAsync("securityEvents", securityRetentionDate);

                _logger.LogInformation("Completed cleanup of old logs before {CutoffDate}", cutoffDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cleanup old logs");
            }
        }

        /// <summary>
        /// Log consent update activities
        /// </summary>
        public async Task LogConsentUpdateAsync(string userId, string action, object details)
        {
            try
            {
                var detailsJson = JsonSerializer.Serialize(details);
                await LogDataAccessAsync(userId, $"CONSENT_UPDATE_{action.ToUpper()}", detailsJson);

                _logger.LogInformation("Consent update logged for user {UserId}, action {Action}", userId, action);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log consent update for user {UserId}, action {Action}", userId, action);
            }
        }

        /// <summary>
        /// Log admin actions for audit trail
        /// </summary>
        public async Task LogAdminActionAsync(string adminId, string action, object details)
        {
            try
            {
                var detailsJson = JsonSerializer.Serialize(details);
                await LogDataAccessAsync(adminId, $"ADMIN_ACTION_{action.ToUpper()}", detailsJson);

                _logger.LogInformation("Admin action logged for admin {AdminId}, action {Action}", adminId, action);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log admin action for admin {AdminId}, action {Action}", adminId, action);
            }
        }

        /// <summary>
        /// Get audit logs filtered by action type
        /// </summary>
        public async Task<List<AuditLog>> GetAuditLogsByActionAsync(string action, DateTime? fromDate = null)
        {
            try
            {
                var query = _firestore.Collection("auditLogs")
                    .WhereEqualTo("action", action)
                    .OrderByDescending("timestamp");

                if (fromDate.HasValue)
                {
                    query = query.WhereGreaterThanOrEqualTo("timestamp", fromDate.Value);
                }

                var snapshot = await query.Limit(1000).GetSnapshotAsync();
                return snapshot.Documents.Select(doc => doc.ConvertTo<AuditLog>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get audit logs by action {Action}", action);
                return new List<AuditLog>();
            }
        }

        /// <summary>
        /// Get audit logs with optional filtering by user and date
        /// </summary>
        public async Task<List<AuditLog>> GetAuditLogsAsync(string? userId = null, DateTime? fromDate = null)
        {
            try
            {
                var query = _firestore.Collection("auditLogs").OrderByDescending("timestamp");

                if (!string.IsNullOrEmpty(userId))
                {
                    query = query.WhereEqualTo("userId", userId);
                }

                if (fromDate.HasValue)
                {
                    query = query.WhereGreaterThanOrEqualTo("timestamp", fromDate.Value);
                }

                var snapshot = await query.Limit(1000).GetSnapshotAsync();
                return snapshot.Documents.Select(doc => doc.ConvertTo<AuditLog>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get audit logs with userId {UserId} and fromDate {FromDate}", userId, fromDate);
                return new List<AuditLog>();
            }
        }

        #region Private Methods

        private async Task LogDataAccessInternalAsync(string userId, string action, string details, string? resource)
        {
            try
            {
                var context = _httpContextAccessor.HttpContext;
                var dataAccessLog = new DataAccessLog
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    DataType = resource ?? DetermineDataType(action),
                    AccessType = DetermineAccessType(action),
                    Timestamp = DateTime.UtcNow,
                    Purpose = DeterminePurpose(action),
                    LegalBasis = DetermineLegalBasis(action),
                    UserConsented = true, // Assume consent for logged-in users
                    IpAddress = GetClientIpAddress(context)
                };

                var docRef = _firestore.Collection("dataAccessLogs").Document(dataAccessLog.Id);
                await docRef.SetAsync(dataAccessLog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create data access log");
            }
        }

        private async Task CleanupCollectionAsync(string collectionName, DateTime cutoffDate)
        {
            var query = _firestore.Collection(collectionName)
                .WhereLessThan("timestamp", cutoffDate)
                .Limit(100);

            var snapshot = await query.GetSnapshotAsync();

            if (snapshot.Documents.Count > 0)
            {
                var batch = _firestore.StartBatch();
                foreach (var doc in snapshot.Documents)
                {
                    batch.Delete(doc.Reference);
                }
                await batch.CommitAsync();

                _logger.LogInformation("Deleted {Count} old records from {Collection}",
                    snapshot.Documents.Count, collectionName);

                // Continue cleanup if there might be more records
                if (snapshot.Documents.Count == 100)
                {
                    await CleanupCollectionAsync(collectionName, cutoffDate);
                }
            }
        }

        private string GetClientIpAddress(HttpContext? context)
        {
            if (context == null) return "Unknown";

            var ipAddress = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (string.IsNullOrEmpty(ipAddress))
            {
                ipAddress = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            }
            if (string.IsNullOrEmpty(ipAddress))
            {
                ipAddress = context.Connection.RemoteIpAddress?.ToString();
            }

            return ipAddress ?? "Unknown";
        }

        private string MaskIpAddress(string ipAddress)
        {
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "Unknown")
                return ipAddress;

            // Mask the last octet for IPv4 or last 64 bits for IPv6
            var parts = ipAddress.Split('.');
            if (parts.Length == 4)
            {
                return $"{parts[0]}.{parts[1]}.{parts[2]}.xxx";
            }

            // For IPv6, mask the last 64 bits
            if (ipAddress.Contains(':'))
            {
                var colonIndex = ipAddress.LastIndexOf(':');
                if (colonIndex > 0)
                {
                    return ipAddress.Substring(0, colonIndex) + ":xxxx";
                }
            }

            return "xxx.xxx.xxx.xxx";
        }

        private string DetermineDataType(string action)
        {
            return action switch
            {
                var a when a.Contains("LOGIN") => "Authentication Data",
                var a when a.Contains("PROFILE") => "Profile Data",
                var a when a.Contains("FLASHCARD") => "Learning Content",
                var a when a.Contains("PROGRESS") => "Learning Progress",
                var a when a.Contains("EXERCISE") => "Exercise Data",
                var a when a.Contains("GDPR") => "Personal Data",
                _ => "System Data"
            };
        }

        private string DetermineAccessType(string action)
        {
            return action switch
            {
                var a when a.Contains("CREATE") || a.Contains("ADD") => "write",
                var a when a.Contains("UPDATE") || a.Contains("MODIFY") => "write",
                var a when a.Contains("DELETE") || a.Contains("REMOVE") => "delete",
                var a when a.Contains("EXPORT") => "export",
                _ => "read"
            };
        }

        private string DeterminePurpose(string action)
        {
            return action switch
            {
                var a when a.Contains("LOGIN") => "Authentication and access control",
                var a when a.Contains("LEARNING") => "Educational service provision",
                var a when a.Contains("PROGRESS") => "Learning progress tracking",
                var a when a.Contains("GDPR") => "Data subject rights fulfillment",
                var a when a.Contains("SECURITY") => "Security monitoring and protection",
                _ => "System operation and service provision"
            };
        }

        private string DetermineLegalBasis(string action)
        {
            return action switch
            {
                var a when a.Contains("LOGIN") => "Legitimate interest (security)",
                var a when a.Contains("LEARNING") => "Contract performance (educational service)",
                var a when a.Contains("GDPR") => "Legal obligation (GDPR compliance)",
                var a when a.Contains("SECURITY") => "Legitimate interest (security)",
                _ => "Legitimate interest (service operation)"
            };
        }

        #endregion
    }
}