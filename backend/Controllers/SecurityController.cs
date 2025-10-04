using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Services;
using BingGoWebAPI.Models;
using BingGoWebAPI.Exceptions;
using System.Security.Claims;

namespace BingGoWebAPI.Controllers
{
    /// <summary>
    /// Security Controller for security monitoring, intrusion detection, and audit management
    /// Provides endpoints for security administrators to monitor and manage system security
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class SecurityController : ControllerBase
    {
        private readonly ISecurityMonitoringService _securityMonitoring;
        private readonly IIntrusionDetectionService _intrusionDetection;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<SecurityController> _logger;

        public SecurityController(
            ISecurityMonitoringService securityMonitoring,
            IIntrusionDetectionService intrusionDetection,
            IAuditLogService auditLogService,
            ILogger<SecurityController> logger)
        {
            _securityMonitoring = securityMonitoring;
            _intrusionDetection = intrusionDetection;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        /// <summary>
        /// Get security dashboard data
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<ActionResult<SecurityDashboardData>> GetSecurityDashboard()
        {
            try
            {
                var dashboardData = await _securityMonitoring.GetSecurityDashboardDataAsync();
                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving security dashboard data");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get security events within date range
        /// </summary>
        [HttpGet("events")]
        public async Task<ActionResult<List<Models.SecurityEvent>>> GetSecurityEvents(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] SecurityEventType? eventType = null)
        {
            try
            {
                var from = fromDate ?? DateTime.UtcNow.AddDays(-7);
                var to = toDate ?? DateTime.UtcNow;

                var events = await _securityMonitoring.GetSecurityEventsAsync(from, to, eventType);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving security events");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Log a security event
        /// </summary>
        [HttpPost("events")]
        public async Task<ActionResult> LogSecurityEvent([FromBody] SecurityEventRequest request)
        {
            try
            {
                var securityEvent = new Models.SecurityEvent
                {
                    EventType = request.EventType,
                    Severity = request.Severity,
                    Description = request.Description,
                    Source = request.Source,
                    UserId = request.UserId,
                    IpAddress = request.IpAddress ?? GetClientIpAddress(),
                    UserAgent = request.UserAgent ?? Request.Headers["User-Agent"].ToString(),
                    Metadata = request.Metadata
                };

                await _securityMonitoring.LogSecurityEventAsync(securityEvent);

                return Ok(new { message = "Security event logged successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging security event");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get security threat analysis
        /// </summary>
        [HttpGet("threats/analysis")]
        public async Task<ActionResult<SecurityThreatAnalysis>> GetThreatAnalysis([FromQuery] int hours = 24)
        {
            try
            {
                var timeWindow = TimeSpan.FromHours(hours);
                var analysis = await _securityMonitoring.AnalyzeSecurityThreatsAsync(timeWindow);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing security threats");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get recent threat detections
        /// </summary>
        [HttpGet("threats")]
        public async Task<ActionResult<List<ThreatDetection>>> GetRecentThreats([FromQuery] int hours = 24)
        {
            try
            {
                var timeWindow = TimeSpan.FromHours(hours);
                var threats = await _intrusionDetection.GetRecentThreatsAsync(timeWindow);
                return Ok(threats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent threats");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get active security incidents
        /// </summary>
        [HttpGet("incidents")]
        public async Task<ActionResult<List<SecurityIncident>>> GetActiveIncidents()
        {
            try
            {
                var incidents = await _securityMonitoring.GetActiveIncidentsAsync();
                return Ok(incidents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active incidents");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Create security incident
        /// </summary>
        [HttpPost("incidents")]
        public async Task<ActionResult<SecurityIncident>> CreateIncident([FromBody] SecurityIncidentRequest request)
        {
            try
            {
                var currentUser = GetCurrentUserId();
                request.CreatedBy = currentUser;

                var incident = await _securityMonitoring.CreateIncidentAsync(request);
                return Ok(incident);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating security incident");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Update incident status
        /// </summary>
        [HttpPut("incidents/{incidentId}/status")]
        public async Task<ActionResult> UpdateIncidentStatus(
            string incidentId,
            [FromBody] IncidentStatusUpdateRequest request)
        {
            try
            {
                var success = await _securityMonitoring.UpdateIncidentStatusAsync(
                    incidentId, request.Status, request.Notes);

                if (success)
                {
                    return Ok(new { message = "Incident status updated successfully" });
                }
                else
                {
                    return NotFound(new { error = "Incident not found" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating incident status");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get blocked IP addresses
        /// </summary>
        [HttpGet("blocked-ips")]
        public async Task<ActionResult<List<string>>> GetBlockedIpAddresses()
        {
            try
            {
                var blockedIps = await _intrusionDetection.GetBlockedIpAddressesAsync();
                return Ok(blockedIps);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving blocked IP addresses");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Block IP address
        /// </summary>
        [HttpPost("blocked-ips")]
        public async Task<ActionResult> BlockIpAddress([FromBody] BlockIpRequest request)
        {
            try
            {
                var duration = request.DurationHours.HasValue ?
                    (TimeSpan?)TimeSpan.FromHours(request.DurationHours.Value) : null;

                var success = await _intrusionDetection.BlockIpAddressAsync(
                    request.IpAddress, request.Reason, duration);

                if (success)
                {
                    // Log the admin action
                    await _auditLogService.LogAdminActionAsync(GetCurrentUserId(), "IP_BLOCK",
                        $"Blocked IP address: {request.IpAddress} - Reason: {request.Reason}");

                    return Ok(new { message = "IP address blocked successfully" });
                }
                else
                {
                    return BadRequest(new { error = "Failed to block IP address" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking IP address");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Unblock IP address
        /// </summary>
        [HttpDelete("blocked-ips/{ipAddress}")]
        public async Task<ActionResult> UnblockIpAddress(string ipAddress)
        {
            try
            {
                var success = await _intrusionDetection.UnblockIpAddressAsync(ipAddress);

                if (success)
                {
                    // Log the admin action
                    await _auditLogService.LogAdminActionAsync(GetCurrentUserId(), "IP_UNBLOCK",
                        $"Unblocked IP address: {ipAddress}");

                    return Ok(new { message = "IP address unblocked successfully" });
                }
                else
                {
                    return BadRequest(new { error = "Failed to unblock IP address" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unblocking IP address");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get detection rules
        /// </summary>
        [HttpGet("detection-rules")]
        public async Task<ActionResult<List<DetectionRule>>> GetDetectionRules()
        {
            try
            {
                var rules = await _intrusionDetection.GetDetectionRulesAsync();
                return Ok(rules);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving detection rules");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Update detection rules
        /// </summary>
        [HttpPut("detection-rules")]
        public async Task<ActionResult> UpdateDetectionRules([FromBody] List<DetectionRule> rules)
        {
            try
            {
                var success = await _intrusionDetection.UpdateDetectionRulesAsync(rules);

                if (success)
                {
                    // Log the admin action
                    await _auditLogService.LogAdminActionAsync(GetCurrentUserId(), "DETECTION_RULES_UPDATE",
                        $"Updated {rules.Count} detection rules");

                    return Ok(new { message = "Detection rules updated successfully" });
                }
                else
                {
                    return BadRequest(new { error = "Failed to update detection rules" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating detection rules");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get security metrics
        /// </summary>
        [HttpGet("metrics")]
        public async Task<ActionResult<List<SecurityMetric>>> GetSecurityMetrics(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var from = fromDate ?? DateTime.UtcNow.AddDays(-30);
                var to = toDate ?? DateTime.UtcNow;

                var metrics = await _securityMonitoring.GetSecurityMetricsAsync(from, to);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving security metrics");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Generate compliance report
        /// </summary>
        [HttpGet("compliance-report")]
        public async Task<ActionResult<SecurityComplianceReport>> GetComplianceReport(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var from = fromDate ?? DateTime.UtcNow.AddDays(-30);
                var to = toDate ?? DateTime.UtcNow;

                var report = await _securityMonitoring.GenerateComplianceReportAsync(from, to);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating compliance report");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Generate intrusion detection report
        /// </summary>
        [HttpGet("intrusion-report")]
        public async Task<ActionResult<IntrusionDetectionReport>> GetIntrusionDetectionReport(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var from = fromDate ?? DateTime.UtcNow.AddDays(-30);
                var to = toDate ?? DateTime.UtcNow;

                var report = await _intrusionDetection.GenerateReportAsync(from, to);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating intrusion detection report");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Trigger security alert
        /// </summary>
        [HttpPost("alerts")]
        public async Task<ActionResult> TriggerSecurityAlert([FromBody] SecurityAlertRequest request)
        {
            try
            {
                var alert = new SecurityAlert
                {
                    AlertType = request.AlertType,
                    Severity = request.Severity,
                    Message = request.Message,
                    Source = request.Source,
                    RelatedEventId = request.RelatedEventId,
                    Metadata = request.Metadata
                };

                var success = await _securityMonitoring.TriggerSecurityAlertAsync(alert);

                if (success)
                {
                    return Ok(new { message = "Security alert triggered successfully" });
                }
                else
                {
                    return BadRequest(new { error = "Failed to trigger security alert" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering security alert");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get audit logs
        /// </summary>
        [HttpGet("audit-logs")]
        public async Task<ActionResult<List<AuditLog>>> GetAuditLogs(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] string? userId = null,
            [FromQuery] string? action = null)
        {
            try
            {
                var from = fromDate ?? DateTime.UtcNow.AddDays(-7);
                var to = toDate ?? DateTime.UtcNow;

                List<AuditLog> auditLogs;

                if (!string.IsNullOrEmpty(userId))
                {
                    auditLogs = await _auditLogService.GetUserAuditLogsAsync(userId, to - from);
                }
                else if (!string.IsNullOrEmpty(action))
                {
                    auditLogs = await _auditLogService.GetAuditLogsByActionAsync(action, from);
                }
                else
                {
                    auditLogs = await _auditLogService.GetAuditLogsAsync(null, from);
                }

                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit logs");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Export security data
        /// </summary>
        [HttpPost("export")]
        public async Task<ActionResult> ExportSecurityData([FromBody] SecurityDataExportRequest request)
        {
            try
            {
                // This would implement data export functionality
                // For now, return a placeholder response
                return Ok(new
                {
                    message = "Security data export initiated",
                    exportId = Guid.NewGuid().ToString()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting security data");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        #region Private Methods

        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                   User.FindFirst("uid")?.Value ??
                   "system";
        }

        private string GetClientIpAddress()
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

            // Check for forwarded IP addresses
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                ipAddress = Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim();
            }
            else if (Request.Headers.ContainsKey("X-Real-IP"))
            {
                ipAddress = Request.Headers["X-Real-IP"].FirstOrDefault();
            }

            return ipAddress ?? "Unknown";
        }

        #endregion
    }

    #region Request/Response Models

    public class SecurityEventRequest
    {
        public SecurityEventType EventType { get; set; }
        public SecurityEventSeverity Severity { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class IncidentStatusUpdateRequest
    {
        public SecurityIncidentStatus Status { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class BlockIpRequest
    {
        public string IpAddress { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public int? DurationHours { get; set; }
    }

    public class SecurityAlertRequest
    {
        public SecurityAlertType AlertType { get; set; }
        public SecurityEventSeverity Severity { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string RelatedEventId { get; set; } = string.Empty;
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class SecurityDataExportRequest
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public List<string> DataTypes { get; set; } = new();
        public string Format { get; set; } = "json";
    }

    #endregion
}