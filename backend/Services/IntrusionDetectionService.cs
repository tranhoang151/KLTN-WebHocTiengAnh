using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using BingGoWebAPI.Models;
using Google.Cloud.Firestore;

namespace BingGoWebAPI.Services
{
    /// <summary>
    /// Intrusion Detection Service for real-time threat detection and prevention
    /// Implements advanced pattern recognition and behavioral analysis for security threats
    /// </summary>

    public class IntrusionDetectionService : IIntrusionDetectionService
    {
        private readonly FirestoreDb _firestore;
        private readonly ILogger<IntrusionDetectionService> _logger;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _configuration;

        // In-memory tracking for real-time analysis
        private readonly ConcurrentDictionary<string, List<SecurityEvent>> _recentEvents = new();
        private readonly ConcurrentDictionary<string, DateTime> _blockedIps = new();
        private readonly ConcurrentDictionary<string, int> _failedAttempts = new();

        // Detection thresholds
        private readonly DetectionThresholds _thresholds;

        public IntrusionDetectionService(
            FirestoreDb firestore,
            ILogger<IntrusionDetectionService> logger,
            IMemoryCache cache,
            IConfiguration configuration)
        {
            _firestore = firestore;
            _logger = logger;
            _cache = cache;
            _configuration = configuration;

            _thresholds = configuration.GetSection("IntrusionDetection").Get<DetectionThresholds>()
                ?? new DetectionThresholds();

            // Initialize background cleanup task
            _ = Task.Run(CleanupExpiredDataAsync);
        }

        /// <summary>
        /// Analyze security event for potential threats
        /// </summary>
        public async Task<bool> AnalyzeEventAsync(SecurityEvent securityEvent)
        {
            try
            {
                var threatDetected = false;

                // Check if IP is already blocked
                if (await IsIpAddressBlockedAsync(securityEvent.IpAddress))
                {
                    _logger.LogWarning("Event from blocked IP address: {IpAddress}", securityEvent.IpAddress);
                    return true; // Threat detected (blocked IP)
                }

                // Track recent events for this IP
                TrackRecentEvent(securityEvent);

                // Run detection algorithms
                threatDetected |= await DetectBruteForceAttackAsync(securityEvent);
                threatDetected |= await DetectSuspiciousLoginPatternsAsync(securityEvent);
                threatDetected |= await DetectRateLimitViolationsAsync(securityEvent);
                threatDetected |= await DetectAnomalousActivityAsync(securityEvent);
                threatDetected |= await DetectSqlInjectionAttemptsAsync(securityEvent);
                threatDetected |= await DetectXssAttemptsAsync(securityEvent);
                threatDetected |= await DetectDirectoryTraversalAsync(securityEvent);

                // If threat detected, log and potentially block
                if (threatDetected)
                {
                    await LogThreatDetectionAsync(securityEvent);

                    // Auto-block for critical threats
                    if (securityEvent.Severity >= SecurityEventSeverity.High)
                    {
                        await ConsiderAutoBlockAsync(securityEvent);
                    }
                }

                return threatDetected;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing security event for threats");
                return false;
            }
        }

        /// <summary>
        /// Get recent threat detections with time window
        /// </summary>
        public async Task<List<ThreatDetection>> GetRecentThreatsAsync(TimeSpan timeWindow)
        {
            try
            {
                var fromDate = DateTime.UtcNow.Subtract(timeWindow);

                var query = _firestore.Collection("threatDetections")
                    .WhereGreaterThanOrEqualTo("detectedAt", fromDate)
                    .OrderByDescending("detectedAt")
                    .Limit(100);

                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(doc => doc.ConvertTo<ThreatDetection>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent threats");
                throw;
            }
        }

        /// <summary>
        /// Get recent threat detections (last 24 hours)
        /// </summary>
        public async Task<List<ThreatDetection>> GetRecentThreatsAsync()
        {
            return await GetRecentThreatsAsync(TimeSpan.FromHours(24));
        }

        /// <summary>
        /// Check if IP address is blocked
        /// </summary>
        public async Task<bool> IsIpAddressBlockedAsync(string ipAddress)
        {
            try
            {
                // Check in-memory cache first
                if (_blockedIps.ContainsKey(ipAddress))
                {
                    return true;
                }

                // Check database
                var blockDoc = await _firestore.Collection("blockedIps").Document(ipAddress).GetSnapshotAsync();

                if (blockDoc.Exists)
                {
                    var blockInfo = blockDoc.ConvertTo<IpBlockInfo>();

                    // Check if block has expired
                    if (blockInfo.ExpiresAt.HasValue && blockInfo.ExpiresAt.Value <= DateTime.UtcNow)
                    {
                        await UnblockIpAddressAsync(ipAddress);
                        return false;
                    }

                    // Add to in-memory cache
                    _blockedIps.TryAdd(ipAddress, blockInfo.BlockedAt);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if IP address is blocked: {IpAddress}", ipAddress);
                return false;
            }
        }

        /// <summary>
        /// Block IP address
        /// </summary>
        public async Task<bool> BlockIpAddressAsync(string ipAddress, string reason, TimeSpan? duration = null)
        {
            try
            {
                var blockInfo = new IpBlockInfo
                {
                    IpAddress = ipAddress,
                    Reason = reason,
                    BlockedAt = DateTime.UtcNow,
                    ExpiresAt = duration.HasValue ? DateTime.UtcNow.Add(duration.Value) : null,
                    BlockedBy = "IntrusionDetectionSystem"
                };

                await _firestore.Collection("blockedIps").Document(ipAddress).SetAsync(blockInfo);

                // Add to in-memory cache
                _blockedIps.TryAdd(ipAddress, blockInfo.BlockedAt);

                _logger.LogWarning("IP address blocked: {IpAddress} - Reason: {Reason}", ipAddress, reason);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking IP address: {IpAddress}", ipAddress);
                return false;
            }
        }

        /// <summary>
        /// Unblock IP address
        /// </summary>
        public async Task<bool> UnblockIpAddressAsync(string ipAddress)
        {
            try
            {
                await _firestore.Collection("blockedIps").Document(ipAddress).DeleteAsync();

                // Remove from in-memory cache
                _blockedIps.TryRemove(ipAddress, out _);

                _logger.LogInformation("IP address unblocked: {IpAddress}", ipAddress);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unblocking IP address: {IpAddress}", ipAddress);
                return false;
            }
        }

        /// <summary>
        /// Get list of blocked IP addresses
        /// </summary>
        public async Task<List<string>> GetBlockedIpAddressesAsync()
        {
            try
            {
                var query = _firestore.Collection("blockedIps");
                var snapshot = await query.GetSnapshotAsync();

                return snapshot.Documents.Select(doc => doc.Id).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving blocked IP addresses");
                throw;
            }
        }

        /// <summary>
        /// Generate intrusion detection report
        /// </summary>
        public async Task<IntrusionDetectionReport> GenerateReportAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var report = new IntrusionDetectionReport
                {
                    GeneratedAt = DateTime.UtcNow,
                    FromDate = fromDate,
                    ToDate = toDate
                };

                // Get threat detections
                var threats = await GetThreatsInRangeAsync(fromDate, toDate);
                report.TotalThreats = threats.Count;
                report.ThreatsByType = threats.GroupBy(t => t.ThreatType).ToDictionary(g => g.Key, g => g.Count());

                // Get blocked IPs
                var blockedIps = await GetBlockedIpsInRangeAsync(fromDate, toDate);
                report.BlockedIpCount = blockedIps.Count;
                report.TopBlockedIps = blockedIps.Take(10).ToList();

                // Calculate detection accuracy
                report.DetectionAccuracy = CalculateDetectionAccuracy(threats);

                // Get top attack sources
                report.TopAttackSources = threats
                    .GroupBy(t => t.SourceIp)
                    .OrderByDescending(g => g.Count())
                    .Take(10)
                    .ToDictionary(g => g.Key, g => g.Count());

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating intrusion detection report");
                throw;
            }
        }

        /// <summary>
        /// Update detection rules
        /// </summary>
        public async Task<bool> UpdateDetectionRulesAsync(List<DetectionRule> rules)
        {
            try
            {
                var batch = _firestore.StartBatch();

                foreach (var rule in rules)
                {
                    var ruleRef = _firestore.Collection("detectionRules").Document(rule.Id);
                    batch.Set(ruleRef, rule);
                }

                await batch.CommitAsync();

                // Clear cache to force reload
                _cache.Remove("detection_rules");

                _logger.LogInformation("Detection rules updated: {RuleCount} rules", rules.Count);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating detection rules");
                return false;
            }
        }

        /// <summary>
        /// Get detection rules
        /// </summary>
        public async Task<List<DetectionRule>> GetDetectionRulesAsync()
        {
            try
            {
                // Check cache first
                if (_cache.TryGetValue("detection_rules", out List<DetectionRule>? cachedRules))
                {
                    return cachedRules!;
                }

                var query = _firestore.Collection("detectionRules").WhereEqualTo("enabled", true);
                var snapshot = await query.GetSnapshotAsync();

                var rules = snapshot.Documents.Select(doc => doc.ConvertTo<DetectionRule>()).ToList();

                // Cache for 5 minutes
                _cache.Set("detection_rules", rules, TimeSpan.FromMinutes(5));

                return rules;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving detection rules");
                throw;
            }
        }

        #region Private Detection Methods

        private void TrackRecentEvent(SecurityEvent securityEvent)
        {
            var key = securityEvent.IpAddress;
            var events = _recentEvents.GetOrAdd(key, _ => new List<SecurityEvent>());

            lock (events)
            {
                events.Add(securityEvent);

                // Keep only events from last hour
                var cutoff = DateTime.UtcNow.AddHours(-1);
                events.RemoveAll(e => e.Timestamp < cutoff);
            }
        }

        private async Task<bool> DetectBruteForceAttackAsync(SecurityEvent securityEvent)
        {
            if (securityEvent.EventType != SecurityEventType.AuthenticationFailure)
                return false;

            var key = securityEvent.IpAddress;
            var failedCount = _failedAttempts.AddOrUpdate(key, 1, (k, v) => v + 1);

            if (failedCount >= _thresholds.BruteForceThreshold)
            {
                _logger.LogWarning("Brute force attack detected from IP: {IpAddress} ({FailedAttempts} attempts)",
                    key, failedCount);

                return true;
            }

            return false;
        }

        private async Task<bool> DetectSuspiciousLoginPatternsAsync(SecurityEvent securityEvent)
        {
            if (securityEvent.EventType != SecurityEventType.AuthenticationSuccess)
                return false;

            // Check for login from multiple locations
            if (!string.IsNullOrEmpty(securityEvent.UserId))
            {
                var recentLogins = await GetRecentLoginsForUserAsync(securityEvent.UserId);
                var uniqueIps = recentLogins.Select(e => e.IpAddress).Distinct().Count();

                if (uniqueIps >= _thresholds.SuspiciousLoginIpThreshold)
                {
                    _logger.LogWarning("Suspicious login pattern detected for user: {UserId} from {IpCount} different IPs",
                        securityEvent.UserId, uniqueIps);

                    return true;
                }
            }

            return false;
        }

        private async Task<bool> DetectRateLimitViolationsAsync(SecurityEvent securityEvent)
        {
            var key = securityEvent.IpAddress;

            if (_recentEvents.TryGetValue(key, out var events))
            {
                lock (events)
                {
                    var recentCount = events.Count(e => e.Timestamp > DateTime.UtcNow.AddMinutes(-1));

                    if (recentCount >= _thresholds.RateLimitThreshold)
                    {
                        _logger.LogWarning("Rate limit violation detected from IP: {IpAddress} ({RequestCount} requests/min)",
                            key, recentCount);

                        return true;
                    }
                }
            }

            return false;
        }

        private async Task<bool> DetectAnomalousActivityAsync(SecurityEvent securityEvent)
        {
            // Check for unusual activity patterns
            var key = securityEvent.IpAddress;

            if (_recentEvents.TryGetValue(key, out var events))
            {
                lock (events)
                {
                    // Check for rapid succession of different event types
                    var eventTypes = events.Where(e => e.Timestamp > DateTime.UtcNow.AddMinutes(-5))
                                          .Select(e => e.EventType)
                                          .Distinct()
                                          .Count();

                    if (eventTypes >= _thresholds.AnomalousActivityThreshold)
                    {
                        _logger.LogWarning("Anomalous activity detected from IP: {IpAddress} ({EventTypes} different event types)",
                            key, eventTypes);

                        return true;
                    }
                }
            }

            return false;
        }

        private async Task<bool> DetectSqlInjectionAttemptsAsync(SecurityEvent securityEvent)
        {
            // Check for SQL injection patterns in event metadata
            var sqlPatterns = new[]
            {
                "union select", "drop table", "insert into", "delete from",
                "' or '1'='1", "' or 1=1", "'; drop", "' union"
            };

            var eventData = JsonSerializer.Serialize(securityEvent.Metadata).ToLower();

            foreach (var pattern in sqlPatterns)
            {
                if (eventData.Contains(pattern))
                {
                    _logger.LogWarning("SQL injection attempt detected from IP: {IpAddress} - Pattern: {Pattern}",
                        securityEvent.IpAddress, pattern);

                    return true;
                }
            }

            return false;
        }

        private async Task<bool> DetectXssAttemptsAsync(SecurityEvent securityEvent)
        {
            // Check for XSS patterns
            var xssPatterns = new[]
            {
                "<script", "javascript:", "onerror=", "onload=", "alert(",
                "document.cookie", "window.location", "<iframe"
            };

            var eventData = JsonSerializer.Serialize(securityEvent.Metadata).ToLower();

            foreach (var pattern in xssPatterns)
            {
                if (eventData.Contains(pattern))
                {
                    _logger.LogWarning("XSS attempt detected from IP: {IpAddress} - Pattern: {Pattern}",
                        securityEvent.IpAddress, pattern);

                    return true;
                }
            }

            return false;
        }

        private async Task<bool> DetectDirectoryTraversalAsync(SecurityEvent securityEvent)
        {
            // Check for directory traversal patterns
            var traversalPatterns = new[]
            {
                "../", "..\\", "%2e%2e%2f", "%2e%2e\\", "....//", "....\\\\",
                "/etc/passwd", "/windows/system32", "boot.ini"
            };

            var eventData = JsonSerializer.Serialize(securityEvent.Metadata).ToLower();

            foreach (var pattern in traversalPatterns)
            {
                if (eventData.Contains(pattern))
                {
                    _logger.LogWarning("Directory traversal attempt detected from IP: {IpAddress} - Pattern: {Pattern}",
                        securityEvent.IpAddress, pattern);

                    return true;
                }
            }

            return false;
        }

        private async Task LogThreatDetectionAsync(SecurityEvent securityEvent)
        {
            var threatDetection = new ThreatDetection
            {
                Id = Guid.NewGuid().ToString(),
                ThreatType = DetermineThreatType(securityEvent),
                Severity = securityEvent.Severity,
                SourceIp = securityEvent.IpAddress,
                TargetUserId = securityEvent.UserId,
                DetectedAt = DateTime.UtcNow,
                EventId = securityEvent.Id,
                Description = $"Threat detected: {securityEvent.Description}",
                Confidence = 0.8, // Default confidence
                Mitigated = false
            };

            await _firestore.Collection("threatDetections").Document(threatDetection.Id).SetAsync(threatDetection);
        }

        private async Task ConsiderAutoBlockAsync(SecurityEvent securityEvent)
        {
            var autoBlockEnabled = _configuration.GetValue<bool>("IntrusionDetection:AutoBlockEnabled", false);

            if (autoBlockEnabled && securityEvent.Severity == SecurityEventSeverity.Critical)
            {
                var blockDuration = TimeSpan.FromHours(_configuration.GetValue<int>("IntrusionDetection:AutoBlockDurationHours", 24));

                await BlockIpAddressAsync(securityEvent.IpAddress,
                    $"Auto-blocked due to critical security event: {securityEvent.EventType}",
                    blockDuration);
            }
        }

        private static string DetermineThreatType(SecurityEvent securityEvent)
        {
            return securityEvent.EventType switch
            {
                SecurityEventType.AuthenticationFailure => "BruteForce",
                SecurityEventType.SuspiciousActivity => "AnomalousActivity",
                SecurityEventType.IntrusionAttempt => "IntrusionAttempt",
                SecurityEventType.SecurityViolation => "SecurityViolation",
                _ => "Unknown"
            };
        }

        private async Task<List<SecurityEvent>> GetRecentLoginsForUserAsync(string userId)
        {
            var query = _firestore.Collection("securityEvents")
                .WhereEqualTo("userId", userId)
                .WhereEqualTo("eventType", SecurityEventType.AuthenticationSuccess.ToString())
                .WhereGreaterThan("timestamp", DateTime.UtcNow.AddHours(-24))
                .OrderByDescending("timestamp")
                .Limit(50);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<SecurityEvent>()).ToList();
        }

        private async Task<List<ThreatDetection>> GetThreatsInRangeAsync(DateTime fromDate, DateTime toDate)
        {
            var query = _firestore.Collection("threatDetections")
                .WhereGreaterThanOrEqualTo("detectedAt", fromDate)
                .WhereLessThanOrEqualTo("detectedAt", toDate);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<ThreatDetection>()).ToList();
        }

        private async Task<List<string>> GetBlockedIpsInRangeAsync(DateTime fromDate, DateTime toDate)
        {
            var query = _firestore.Collection("blockedIps")
                .WhereGreaterThanOrEqualTo("blockedAt", fromDate)
                .WhereLessThanOrEqualTo("blockedAt", toDate);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.Id).ToList();
        }

        private double CalculateDetectionAccuracy(List<ThreatDetection> threats)
        {
            if (!threats.Any()) return 100.0;

            var confirmedThreats = threats.Count(t => t.Confidence >= 0.8);
            return (double)confirmedThreats / threats.Count * 100;
        }

        private async Task CleanupExpiredDataAsync()
        {
            while (true)
            {
                try
                {
                    // Clean up old events from memory
                    var cutoff = DateTime.UtcNow.AddHours(-1);

                    foreach (var kvp in _recentEvents.ToList())
                    {
                        lock (kvp.Value)
                        {
                            kvp.Value.RemoveAll(e => e.Timestamp < cutoff);

                            if (!kvp.Value.Any())
                            {
                                _recentEvents.TryRemove(kvp.Key, out _);
                            }
                        }
                    }

                    // Clean up failed attempts counter
                    var failedAttemptsCutoff = DateTime.UtcNow.AddMinutes(-30);
                    // This is simplified - in production, you'd want to track timestamps

                    await Task.Delay(TimeSpan.FromMinutes(5)); // Run cleanup every 5 minutes
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during cleanup task");
                    await Task.Delay(TimeSpan.FromMinutes(1)); // Wait before retrying
                }
            }
        }

        #endregion
    }


}