using Google.Cloud.Firestore;
using System.Text.Json;
using System.Net;
using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    /// <summary>
    /// Security Monitoring Service for comprehensive security event tracking and analysis
    /// </summary>
    public interface ISecurityMonitoringService
    {
        Task LogSecurityEventAsync(Models.SecurityEvent securityEvent);
        Task<List<Models.SecurityEvent>> GetSecurityEventsAsync(DateTime fromDate, DateTime toDate, SecurityEventType? eventType = null);
        Task<SecurityThreatAnalysis> AnalyzeSecurityThreatsAsync(TimeSpan timeWindow);
        Task<List<SecurityIncident>> GetActiveIncidentsAsync();
        Task<SecurityIncident> CreateIncidentAsync(SecurityIncidentRequest request);
        Task<bool> UpdateIncidentStatusAsync(string incidentId, SecurityIncidentStatus status, string notes);
        Task<SecurityDashboardData> GetSecurityDashboardDataAsync();
        Task<bool> TriggerSecurityAlertAsync(SecurityAlert alert);
        Task<List<SecurityMetric>> GetSecurityMetricsAsync(DateTime fromDate, DateTime toDate);
        Task<SecurityComplianceReport> GenerateComplianceReportAsync(DateTime fromDate, DateTime toDate);
    }

    public class SecurityMonitoringService : ISecurityMonitoringService
    {
        private readonly FirestoreDb _firestore;
        private readonly ILogger<SecurityMonitoringService> _logger;
        private readonly IIntrusionDetectionService _intrusionDetection;
        private readonly IAuditLogService _auditLogService;

        public SecurityMonitoringService(
            FirestoreDb firestore,
            ILogger<SecurityMonitoringService> logger,
            IIntrusionDetectionService intrusionDetection,
            IAuditLogService auditLogService)
        {
            _firestore = firestore;
            _logger = logger;
            _intrusionDetection = intrusionDetection;
            _auditLogService = auditLogService;
        }

        public async Task LogSecurityEventAsync(Models.SecurityEvent securityEvent)
        {
            try
            {
                securityEvent.Id = Guid.NewGuid().ToString();
                securityEvent.Timestamp = DateTime.UtcNow;

                await _firestore.Collection("securityEvents").AddAsync(securityEvent);
                _logger.LogInformation("Security event logged: {EventType}", securityEvent.EventType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log security event");
                throw;
            }
        }

        public async Task<List<Models.SecurityEvent>> GetSecurityEventsAsync(DateTime fromDate, DateTime toDate, SecurityEventType? eventType = null)
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
                return snapshot.Documents.Select(doc => doc.ConvertTo<Models.SecurityEvent>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get security events");
                throw;
            }
        }

        public async Task<SecurityThreatAnalysis> AnalyzeSecurityThreatsAsync(TimeSpan timeWindow)
        {
            var endTime = DateTime.UtcNow;
            var startTime = endTime.Subtract(timeWindow);

            var events = await GetSecurityEventsAsync(startTime, endTime);

            return new SecurityThreatAnalysis
            {
                AnalysisDate = DateTime.UtcNow,
                AnalysisPeriod = timeWindow,
                TotalThreats = events.Count,
                HighSeverityThreats = events.Count(e => e.Severity == SecurityEventSeverity.High),
                CriticalThreats = events.Count(e => e.Severity == SecurityEventSeverity.Critical),
                TopThreatTypes = events.GroupBy(e => e.EventType.ToString())
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => g.Key)
                    .ToList(),
                TopAttackSources = events.GroupBy(e => e.IpAddress)
                    .OrderByDescending(g => g.Count())
                    .Take(10)
                    .Select(g => g.Key)
                    .ToList(),
                ThreatTrend = CalculateThreatTrend(events),
                MostCriticalThreats = []
            };
        }

        public async Task<List<SecurityIncident>> GetActiveIncidentsAsync()
        {
            try
            {
                var snapshot = await _firestore.Collection("securityIncidents")
                    .WhereEqualTo("status", SecurityIncidentStatus.Open.ToString())
                    .OrderByDescending("createdAt")
                    .GetSnapshotAsync();

                return snapshot.Documents.Select(doc => doc.ConvertTo<SecurityIncident>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get active incidents");
                throw;
            }
        }

        public async Task<SecurityIncident> CreateIncidentAsync(SecurityIncidentRequest request)
        {
            try
            {
                var incident = new SecurityIncident
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = request.Title,
                    Description = request.Description,
                    Severity = request.Severity,
                    Status = SecurityIncidentStatus.Open,
                    CreatedBy = request.CreatedBy,
                    CreatedAt = DateTime.UtcNow,
                    RelatedEventIds = request.RelatedEventIds
                };

                await _firestore.Collection("securityIncidents").AddAsync(incident);
                return incident;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create security incident");
                throw;
            }
        }

        public async Task<bool> UpdateIncidentStatusAsync(string incidentId, SecurityIncidentStatus status, string notes)
        {
            try
            {
                var docRef = _firestore.Collection("securityIncidents").Document(incidentId);
                var updates = new Dictionary<string, object>
                {
                    { "status", status.ToString() },
                    { "notes", notes },
                    { "updatedAt", DateTime.UtcNow }
                };

                if (status == SecurityIncidentStatus.Resolved)
                {
                    updates["resolvedAt"] = DateTime.UtcNow;
                }

                await docRef.UpdateAsync(updates);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update incident status");
                return false;
            }
        }

        public async Task<SecurityDashboardData> GetSecurityDashboardDataAsync()
        {
            var endTime = DateTime.UtcNow;
            var startTime = endTime.AddDays(-7);

            var events = await GetSecurityEventsAsync(startTime, endTime);
            var incidents = await GetActiveIncidentsAsync();
            var blockedIps = await _intrusionDetection.GetBlockedIpAddressesAsync();
            var recentThreats = await _intrusionDetection.GetRecentThreatsAsync();

            return new SecurityDashboardData
            {
                TotalEvents = events.Count,
                CriticalEvents = events.Count(e => e.Severity == SecurityEventSeverity.Critical),
                ActiveIncidents = incidents.Count,
                BlockedIps = blockedIps.Count,
                RecentThreats = recentThreats.Take(10).ToList(),
                RecentEvents = events.Take(10).ToList(),
                EventsByType = events.GroupBy(e => e.EventType.ToString())
                    .ToDictionary(g => g.Key, g => g.Count()),
                EventsBySeverity = events.GroupBy(e => e.Severity.ToString())
                    .ToDictionary(g => g.Key, g => g.Count())
            };
        }

        public async Task<bool> TriggerSecurityAlertAsync(SecurityAlert alert)
        {
            try
            {
                alert.Id = Guid.NewGuid().ToString();
                alert.CreatedAt = DateTime.UtcNow;
                alert.Acknowledged = false;

                await _firestore.Collection("securityAlerts").AddAsync(alert);
                _logger.LogWarning("Security alert triggered: {AlertType}", alert.AlertType);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to trigger security alert");
                return false;
            }
        }

        public async Task<List<SecurityMetric>> GetSecurityMetricsAsync(DateTime fromDate, DateTime toDate)
        {
            var events = await GetSecurityEventsAsync(fromDate, toDate);
            var metrics = new List<SecurityMetric>();

            // Group events by date and calculate metrics
            var eventsByDate = events.GroupBy(e => e.Timestamp.Date);

            foreach (var group in eventsByDate)
            {
                metrics.Add(new SecurityMetric
                {
                    MetricName = "EventCount",
                    MetricType = "Daily",
                    Value = group.Count(),
                    Timestamp = group.Key,
                    Dimensions = new Dictionary<string, object>
                    {
                        { "date", group.Key.ToString("yyyy-MM-dd") }
                    }
                });
            }

            return metrics;
        }

        public async Task<SecurityComplianceReport> GenerateComplianceReportAsync(DateTime fromDate, DateTime toDate)
        {
            var events = await GetSecurityEventsAsync(fromDate, toDate);
            var violations = events.Where(e => e.EventType == SecurityEventType.SecurityViolation).ToList();

            return new SecurityComplianceReport
            {
                Id = Guid.NewGuid().ToString(),
                GeneratedAt = DateTime.UtcNow,
                FromDate = fromDate,
                ToDate = toDate,
                IsCompliant = violations.Count == 0,
                ComplianceChecks = [
                    "Authentication Security",
                    "Data Protection",
                    "Access Control",
                    "Audit Logging"
                ],
                Violations = violations.Select(v => v.Description).ToList(),
                Recommendations = GenerateRecommendations(events),
                Metrics = new Dictionary<string, object>
                {
                    { "TotalEvents", events.Count },
                    { "SecurityViolations", violations.Count },
                    { "ComplianceScore", CalculateComplianceScore(events) }
                }
            };
        }

        private double CalculateThreatTrend(List<Models.SecurityEvent> events)
        {
            if (events.Count < 2) return 0.0;

            var midpoint = DateTime.UtcNow.AddHours(-12);
            var recentEvents = events.Count(e => e.Timestamp > midpoint);
            var olderEvents = events.Count(e => e.Timestamp <= midpoint);

            if (olderEvents == 0) return recentEvents > 0 ? 100.0 : 0.0;

            return ((double)recentEvents - olderEvents) / olderEvents * 100.0;
        }

        private double CalculateComplianceScore(List<Models.SecurityEvent> events)
        {
            // Simple compliance score calculation
            var totalEvents = events.Count;
            var securityViolations = events.Count(e => e.EventType == SecurityEventType.SecurityViolation);

            if (totalEvents == 0) return 100.0;

            var violationRate = (double)securityViolations / totalEvents;
            return Math.Max(0, 100.0 - (violationRate * 100));
        }

        private List<string> GenerateRecommendations(List<Models.SecurityEvent> events)
        {
            var recommendations = new List<string>();

            var authFailures = events.Count(e => e.EventType == SecurityEventType.AuthenticationFailure);
            if (authFailures > 10)
            {
                recommendations.Add("Consider implementing stronger authentication measures");
            }

            var suspiciousActivity = events.Count(e => e.EventType == SecurityEventType.SuspiciousActivity);
            if (suspiciousActivity > 5)
            {
                recommendations.Add("Review and update intrusion detection rules");
            }

            return recommendations;
        }
    }


}