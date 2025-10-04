using Google.Cloud.Firestore;
using System.Text.Json;
using System.Net;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    /// <summary>
    /// Security Event Service for comprehensive security monitoring and logging
    /// Tracks security events, suspicious activities, and potential threats
    /// </summary>
    public interface ISecurityEventService
    {
        Task LogSecurityEventAsync(SecurityEvent securityEvent);
        Task LogLoginAttemptAsync(string userId, string ipAddress, bool success, string userAgent = "");
        Task LogFailedAuthenticationAsync(string identifier, string ipAddress, string reason, string userAgent = "");
        Task LogSuspiciousActivityAsync(string userId, string activity, string details, string ipAddress);
        Task LogDataAccessAsync(string userId, string resource, string action, string ipAddress);
        Task LogAdminActionAsync(string adminId, string action, string target, string details, string ipAddress);
        Task LogSecurityViolationAsync(string userId, SecurityViolationType violationType, string details, string ipAddress);
        Task<List<SecurityEvent>> GetSecurityEventsAsync(DateTime fromDate, DateTime toDate, SecurityEventType? eventType = null);
        Task<List<SecurityEvent>> GetUserSecurityEventsAsync(string userId, DateTime fromDate, DateTime toDate);
        Task<SecurityThreatAnalysis> AnalyzeSecurityThreatsAsync(DateTime fromDate, DateTime toDate);
        Task<List<SuspiciousActivity>> DetectSuspiciousActivitiesAsync(TimeSpan timeWindow);
        Task<bool> IsIpAddressSuspiciousAsync(string ipAddress);
        Task BlockIpAddressAsync(string ipAddress, string reason, TimeSpan? duration = null);
        Task UnblockIpAddressAsync(string ipAddress);
    }

    public class SecurityEventService : ISecurityEventService
    {
        private readonly FirestoreDb _firestore;
        private readonly ILogger<SecurityEventService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;

        // Suspicious activity thresholds
        private readonly Dictionary<string, int> _suspiciousThresholds = new()
        {
            ["failed_login_attempts"] = 5,
            ["rapid_requests"] = 100,
            ["data_access_volume"] = 50,
            ["admin_actions"] = 10,
            ["different_locations"] = 3
        };

        public SecurityEventService(
            FirestoreDb firestore,
            ILogger<SecurityEventService> logger,
            IConfiguration configuration,
            IMemoryCache cache)
        {
            _firestore = firestore;
            _logger = logger;
            _configuration = configuration;
            _cache = cache;
        }

        /// <summary>
        /// Log a security event to the database
        /// </summary>
        public async Task LogSecurityEventAsync(SecurityEvent securityEvent)
        {
            try
            {
                securityEvent.Id = Guid.NewGuid().ToString();
                securityEvent.Timestamp = DateTime.UtcNow;
                securityEvent.Severity = DetermineSeverity(securityEvent);

                // Store in Firestore
                await _firestore.Collection("securityEvents").Document(securityEvent.Id).SetAsync(securityEvent);

                // Log to application logs based on severity
                LogToApplicationLogs(securityEvent);

                // Check for immediate threats
                await CheckForImmediateThreatsAsync(securityEvent);

                _logger.LogInformation("Security event logged: {EventType} for user {UserId}",
                    securityEvent.EventType, securityEvent.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging security event: {EventType}", securityEvent.EventType);
                throw;
            }
        }

        /// <summary>
        /// Log login attempt (successful or failed)
        /// </summary>
        public async Task LogLoginAttemptAsync(string userId, string ipAddress, bool success, string userAgent = "")
        {
            var securityEvent = new SecurityEvent
            {
                EventType = success ? SecurityEventType.AuthenticationSuccess : SecurityEventType.AuthenticationFailure,
                UserId = userId,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Details = JsonSerializer.Serialize(new
                {
                    Success = success,
                    Timestamp = DateTime.UtcNow
                }),
                RiskLevel = success ? RiskLevel.Low : RiskLevel.Medium
            };

            await LogSecurityEventAsync(securityEvent);

            // Track failed attempts for brute force detection
            if (!success)
            {
                await TrackFailedLoginAttemptAsync(userId, ipAddress);
            }
        }

        /// <summary>
        /// Log failed authentication attempt
        /// </summary>
        public async Task LogFailedAuthenticationAsync(string identifier, string ipAddress, string reason, string userAgent = "")
        {
            var securityEvent = new SecurityEvent
            {
                EventType = SecurityEventType.AuthenticationFailure,
                UserId = identifier,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Details = JsonSerializer.Serialize(new
                {
                    Reason = reason,
                    Identifier = identifier,
                    Timestamp = DateTime.UtcNow
                }),
                RiskLevel = RiskLevel.Medium
            };

            await LogSecurityEventAsync(securityEvent);
        }

        /// <summary>
        /// Log suspicious activity
        /// </summary>
        public async Task LogSuspiciousActivityAsync(string userId, string activity, string details, string ipAddress)
        {
            var securityEvent = new SecurityEvent
            {
                EventType = SecurityEventType.SuspiciousActivity,
                UserId = userId,
                IpAddress = ipAddress,
                Details = JsonSerializer.Serialize(new
                {
                    Activity = activity,
                    Details = details,
                    Timestamp = DateTime.UtcNow
                }),
                RiskLevel = RiskLevel.High
            };

            await LogSecurityEventAsync(securityEvent);
        }

        /// <summary>
        /// Log data access for audit trail
        /// </summary>
        public async Task LogDataAccessAsync(string userId, string resource, string action, string ipAddress)
        {
            var securityEvent = new SecurityEvent
            {
                EventType = SecurityEventType.DataAccess,
                UserId = userId,
                IpAddress = ipAddress,
                Details = JsonSerializer.Serialize(new
                {
                    Resource = resource,
                    Action = action,
                    Timestamp = DateTime.UtcNow
                }),
                RiskLevel = RiskLevel.Low
            };

            await LogSecurityEventAsync(securityEvent);
        }

        /// <summary>
        /// Log administrative actions
        /// </summary>
        public async Task LogAdminActionAsync(string adminId, string action, string target, string details, string ipAddress)
        {
            var securityEvent = new SecurityEvent
            {
                EventType = SecurityEventType.PermissionEscalation,
                UserId = adminId,
                IpAddress = ipAddress,
                Details = JsonSerializer.Serialize(new
                {
                    Action = action,
                    Target = target,
                    Details = details,
                    Timestamp = DateTime.UtcNow
                }),
                RiskLevel = RiskLevel.Medium
            };

            await LogSecurityEventAsync(securityEvent);
        }

        /// <summary>
        /// Log security violations
        /// </summary>
        public async Task LogSecurityViolationAsync(string userId, SecurityViolationType violationType, string details, string ipAddress)
        {
            var securityEvent = new SecurityEvent
            {
                EventType = SecurityEventType.SecurityViolation,
                UserId = userId,
                IpAddress = ipAddress,
                Details = JsonSerializer.Serialize(new
                {
                    ViolationType = violationType.ToString(),
                    Details = details,
                    Timestamp = DateTime.UtcNow
                }),
                RiskLevel = RiskLevel.Critical
            };

            await LogSecurityEventAsync(securityEvent);
        }

        /// <summary>
        /// Get security events within date range
        /// </summary>
        public async Task<List<SecurityEvent>> GetSecurityEventsAsync(DateTime fromDate, DateTime toDate, SecurityEventType? eventType = null)
        {
            try
            {
                var query = _firestore.Collection("securityEvents")
                    .WhereGreaterThanOrEqualTo("timestamp", fromDate)
                    .WhereLessThanOrEqualTo("timestamp", toDate)
                    .OrderByDescending("timestamp")
                    .Limit(1000);

                if (eventType.HasValue)
                {
                    query = query.WhereEqualTo("eventType", eventType.Value.ToString());
                }

                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(doc => doc.ConvertTo<SecurityEvent>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting security events");
                throw;
            }
        }

        /// <summary>
        /// Get security events for specific user
        /// </summary>
        public async Task<List<SecurityEvent>> GetUserSecurityEventsAsync(string userId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var query = _firestore.Collection("securityEvents")
                    .WhereEqualTo("userId", userId)
                    .WhereGreaterThanOrEqualTo("timestamp", fromDate)
                    .WhereLessThanOrEqualTo("timestamp", toDate)
                    .OrderByDescending("timestamp")
                    .Limit(500);

                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(doc => doc.ConvertTo<SecurityEvent>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user security events for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Analyze security threats and patterns
        /// </summary>
        public async Task<SecurityThreatAnalysis> AnalyzeSecurityThreatsAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var events = await GetSecurityEventsAsync(fromDate, toDate);

                var analysis = new SecurityThreatAnalysis
                {
                    AnalysisDate = DateTime.UtcNow,
                    AnalysisPeriod = toDate - fromDate,
                    TotalThreats = events.Count,
                    HighSeverityThreats = events.Count(e => e.Severity == SecurityEventSeverity.High),
                    CriticalThreats = events.Count(e => e.Severity == SecurityEventSeverity.Critical)
                };

                // Top threat types
                analysis.TopThreatTypes = events
                    .GroupBy(e => e.EventType)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => g.Key.ToString())
                    .ToList();

                // Top attack sources
                analysis.TopAttackSources = events
                    .Where(e => !string.IsNullOrEmpty(e.IpAddress))
                    .GroupBy(e => e.IpAddress)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => g.Key)
                    .ToList();

                // Most critical threats
                analysis.MostCriticalThreats = events
                    .Where(e => e.Severity == SecurityEventSeverity.Critical)
                    .OrderByDescending(e => e.Timestamp)
                    .Take(10)
                    .Select(e => new ThreatDetection
                    {
                        Id = e.Id,
                        ThreatType = e.EventType.ToString(),
                        Severity = e.Severity,
                        SourceIp = e.IpAddress,
                        TargetUserId = e.UserId,
                        DetectedAt = e.Timestamp,
                        Description = e.Details
                    })
                    .ToList();

                return analysis;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing security threats");
                throw;
            }
        }

        /// <summary>
        /// Detect suspicious activities based on patterns
        /// </summary>
        public async Task<List<SuspiciousActivity>> DetectSuspiciousActivitiesAsync(TimeSpan timeWindow)
        {
            try
            {
                var fromDate = DateTime.UtcNow.Subtract(timeWindow);
                var events = await GetSecurityEventsAsync(fromDate, DateTime.UtcNow);
                var suspiciousActivities = new List<SuspiciousActivity>();

                // Detect brute force attacks
                var bruteForceActivities = DetectBruteForceAttacks(events);
                suspiciousActivities.AddRange(bruteForceActivities);

                // Detect rapid requests from same IP
                var rapidRequestActivities = DetectRapidRequests(events);
                suspiciousActivities.AddRange(rapidRequestActivities);

                // Detect unusual data access patterns
                var dataAccessActivities = DetectUnusualDataAccess(events);
                suspiciousActivities.AddRange(dataAccessActivities);

                // Detect privilege escalation attempts
                var privilegeEscalationActivities = DetectPrivilegeEscalation(events);
                suspiciousActivities.AddRange(privilegeEscalationActivities);

                return suspiciousActivities.OrderByDescending(a => a.RiskScore).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting suspicious activities");
                throw;
            }
        }

        /// <summary>
        /// Check if IP address is suspicious
        /// </summary>
        public async Task<bool> IsIpAddressSuspiciousAsync(string ipAddress)
        {
            try
            {
                // Check cache first
                var cacheKey = $"suspicious_ip_{ipAddress}";
                if (_cache.TryGetValue(cacheKey, out bool isSuspicious))
                {
                    return isSuspicious;
                }

                // Check blocked IPs
                var blockedIpDoc = await _firestore.Collection("blockedIPs").Document(ipAddress).GetSnapshotAsync();
                if (blockedIpDoc.Exists)
                {
                    var blockedIp = blockedIpDoc.ConvertTo<IpBlockInfo>();
                    if (blockedIp.ExpiresAt == null || blockedIp.ExpiresAt > DateTime.UtcNow)
                    {
                        _cache.Set(cacheKey, true, TimeSpan.FromMinutes(5));
                        return true;
                    }
                }

                // Check recent suspicious activity
                var recentEvents = await GetSecurityEventsAsync(DateTime.UtcNow.AddHours(-24), DateTime.UtcNow);
                var ipEvents = recentEvents.Where(e => e.IpAddress == ipAddress).ToList();

                var suspiciousScore = CalculateSuspiciousScore(ipEvents);
                isSuspicious = suspiciousScore > 50; // Threshold for suspicious activity

                _cache.Set(cacheKey, isSuspicious, TimeSpan.FromMinutes(5));
                return isSuspicious;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if IP address is suspicious: {IpAddress}", ipAddress);
                return false;
            }
        }

        /// <summary>
        /// Block IP address
        /// </summary>
        public async Task BlockIpAddressAsync(string ipAddress, string reason, TimeSpan? duration = null)
        {
            try
            {
                var blockedIp = new IpBlockInfo
                {
                    IpAddress = ipAddress,
                    Reason = reason,
                    BlockedAt = DateTime.UtcNow,
                    ExpiresAt = duration.HasValue ? DateTime.UtcNow.Add(duration.Value) : null,
                    BlockedBy = "System"
                };

                await _firestore.Collection("blockedIPs").Document(ipAddress).SetAsync(blockedIp);

                // Clear cache
                _cache.Remove($"suspicious_ip_{ipAddress}");

                _logger.LogWarning("IP address blocked: {IpAddress} for reason: {Reason}", ipAddress, reason);

                // Log security event
                await LogSecurityEventAsync(new SecurityEvent
                {
                    EventType = SecurityEventType.IntrusionAttempt,
                    IpAddress = ipAddress,
                    Details = JsonSerializer.Serialize(new { Reason = reason, Duration = duration?.ToString() }),
                    RiskLevel = RiskLevel.High
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking IP address: {IpAddress}", ipAddress);
                throw;
            }
        }

        /// <summary>
        /// Unblock IP address
        /// </summary>
        public async Task UnblockIpAddressAsync(string ipAddress)
        {
            try
            {
                await _firestore.Collection("blockedIPs").Document(ipAddress).DeleteAsync();

                // Clear cache
                _cache.Remove($"suspicious_ip_{ipAddress}");

                _logger.LogInformation("IP address unblocked: {IpAddress}", ipAddress);

                // Log security event
                await LogSecurityEventAsync(new SecurityEvent
                {
                    EventType = SecurityEventType.UnauthorizedAccess,
                    IpAddress = ipAddress,
                    Details = JsonSerializer.Serialize(new { Action = "Unblocked" }),
                    RiskLevel = RiskLevel.Low
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unblocking IP address: {IpAddress}", ipAddress);
                throw;
            }
        }

        #region Private Methods

        private SecurityEventSeverity DetermineSeverity(SecurityEvent securityEvent)
        {
            return securityEvent.RiskLevel switch
            {
                RiskLevel.Critical => SecurityEventSeverity.Critical,
                RiskLevel.High => SecurityEventSeverity.High,
                RiskLevel.Medium => SecurityEventSeverity.Medium,
                RiskLevel.Low => SecurityEventSeverity.Low,
                _ => SecurityEventSeverity.Low
            };
        }

        private void LogToApplicationLogs(SecurityEvent securityEvent)
        {
            var message = $"Security Event: {securityEvent.EventType} - User: {securityEvent.UserId} - IP: {securityEvent.IpAddress}";

            switch (securityEvent.Severity)
            {
                case SecurityEventSeverity.Critical:
                    _logger.LogCritical(message);
                    break;
                case SecurityEventSeverity.High:
                    _logger.LogError(message);
                    break;
                case SecurityEventSeverity.Medium:
                    _logger.LogWarning(message);
                    break;
                case SecurityEventSeverity.Low:
                    _logger.LogInformation(message);
                    break;
                default:
                    _logger.LogDebug(message);
                    break;
            }
        }

        private async Task CheckForImmediateThreatsAsync(SecurityEvent securityEvent)
        {
            // Check for brute force attacks
            if (securityEvent.EventType == SecurityEventType.AuthenticationFailure)
            {
                await CheckBruteForceAttackAsync(securityEvent.IpAddress, securityEvent.UserId);
            }

            // Check for rapid requests
            if (securityEvent.RiskLevel >= RiskLevel.Medium)
            {
                await CheckRapidRequestsAsync(securityEvent.IpAddress);
            }
        }

        private async Task TrackFailedLoginAttemptAsync(string userId, string ipAddress)
        {
            var cacheKey = $"failed_login_{ipAddress}_{userId}";
            var attempts = _cache.Get<int>(cacheKey);
            attempts++;

            _cache.Set(cacheKey, attempts, TimeSpan.FromMinutes(15));

            if (attempts >= _suspiciousThresholds["failed_login_attempts"])
            {
                await LogSuspiciousActivityAsync(userId, "Brute Force Attack",
                    $"Multiple failed login attempts from IP: {ipAddress}", ipAddress);

                // Consider blocking IP after threshold
                if (attempts >= _suspiciousThresholds["failed_login_attempts"] * 2)
                {
                    await BlockIpAddressAsync(ipAddress, "Brute force attack detected", TimeSpan.FromHours(1));
                }
            }
        }

        private async Task CheckBruteForceAttackAsync(string ipAddress, string userId)
        {
            var recentEvents = await GetSecurityEventsAsync(DateTime.UtcNow.AddMinutes(-15), DateTime.UtcNow);
            var failedLogins = recentEvents
                .Where(e => e.EventType == SecurityEventType.AuthenticationFailure && e.IpAddress == ipAddress)
                .Count();

            if (failedLogins >= _suspiciousThresholds["failed_login_attempts"])
            {
                await LogSuspiciousActivityAsync(userId, "Brute Force Attack Detected",
                    $"IP {ipAddress} has {failedLogins} failed login attempts in 15 minutes", ipAddress);
            }
        }

        private async Task CheckRapidRequestsAsync(string ipAddress)
        {
            var recentEvents = await GetSecurityEventsAsync(DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow);
            var requestCount = recentEvents.Where(e => e.IpAddress == ipAddress).Count();

            if (requestCount >= _suspiciousThresholds["rapid_requests"])
            {
                await LogSuspiciousActivityAsync("", "Rapid Requests Detected",
                    $"IP {ipAddress} has {requestCount} requests in 5 minutes", ipAddress);
            }
        }

        private List<SuspiciousActivity> DetectBruteForceAttacks(List<SecurityEvent> events)
        {
            var activities = new List<SuspiciousActivity>();

            var failedLogins = events
                .Where(e => e.EventType == SecurityEventType.AuthenticationFailure)
                .GroupBy(e => new { e.IpAddress, e.UserId })
                .Where(g => g.Count() >= _suspiciousThresholds["failed_login_attempts"])
                .ToList();

            foreach (var group in failedLogins)
            {
                activities.Add(new SuspiciousActivity
                {
                    Type = "Brute Force Attack",
                    IpAddress = group.Key.IpAddress,
                    UserId = group.Key.UserId,
                    EventCount = group.Count(),
                    RiskScore = Math.Min(100, group.Count() * 10),
                    FirstOccurrence = group.Min(e => e.Timestamp),
                    LastOccurrence = group.Max(e => e.Timestamp),
                    Description = $"Multiple failed login attempts from IP {group.Key.IpAddress}"
                });
            }

            return activities;
        }

        private List<SuspiciousActivity> DetectRapidRequests(List<SecurityEvent> events)
        {
            var activities = new List<SuspiciousActivity>();

            var rapidRequests = events
                .GroupBy(e => e.IpAddress)
                .Where(g => g.Count() >= _suspiciousThresholds["rapid_requests"])
                .ToList();

            foreach (var group in rapidRequests)
            {
                activities.Add(new SuspiciousActivity
                {
                    Type = "Rapid Requests",
                    IpAddress = group.Key,
                    EventCount = group.Count(),
                    RiskScore = Math.Min(100, group.Count() / 2),
                    FirstOccurrence = group.Min(e => e.Timestamp),
                    LastOccurrence = group.Max(e => e.Timestamp),
                    Description = $"Unusually high request rate from IP {group.Key}"
                });
            }

            return activities;
        }

        private List<SuspiciousActivity> DetectUnusualDataAccess(List<SecurityEvent> events)
        {
            var activities = new List<SuspiciousActivity>();

            var dataAccessEvents = events
                .Where(e => e.EventType == SecurityEventType.DataAccess)
                .GroupBy(e => e.UserId)
                .Where(g => g.Count() >= _suspiciousThresholds["data_access_volume"])
                .ToList();

            foreach (var group in dataAccessEvents)
            {
                activities.Add(new SuspiciousActivity
                {
                    Type = "Unusual Data Access",
                    UserId = group.Key,
                    EventCount = group.Count(),
                    RiskScore = Math.Min(100, group.Count() * 2),
                    FirstOccurrence = group.Min(e => e.Timestamp),
                    LastOccurrence = group.Max(e => e.Timestamp),
                    Description = $"Unusually high data access volume by user {group.Key}"
                });
            }

            return activities;
        }

        private List<SuspiciousActivity> DetectPrivilegeEscalation(List<SecurityEvent> events)
        {
            var activities = new List<SuspiciousActivity>();

            var adminActions = events
                .Where(e => e.EventType == SecurityEventType.PermissionEscalation)
                .GroupBy(e => e.UserId)
                .Where(g => g.Count() >= _suspiciousThresholds["admin_actions"])
                .ToList();

            foreach (var group in adminActions)
            {
                activities.Add(new SuspiciousActivity
                {
                    Type = "Potential Privilege Escalation",
                    UserId = group.Key,
                    EventCount = group.Count(),
                    RiskScore = Math.Min(100, group.Count() * 15),
                    FirstOccurrence = group.Min(e => e.Timestamp),
                    LastOccurrence = group.Max(e => e.Timestamp),
                    Description = $"Unusual administrative activity by user {group.Key}"
                });
            }

            return activities;
        }

        private int CalculateSuspiciousScore(List<SecurityEvent> events)
        {
            var score = 0;

            // Failed logins
            score += events.Count(e => e.EventType == SecurityEventType.AuthenticationFailure) * 10;

            // High risk events
            score += events.Count(e => e.RiskLevel == RiskLevel.High) * 20;

            // Critical events
            score += events.Count(e => e.RiskLevel == RiskLevel.Critical) * 50;

            // Suspicious activities
            score += events.Count(e => e.EventType == SecurityEventType.SuspiciousActivity) * 30;

            return Math.Min(100, score);
        }

        #endregion
    }
}