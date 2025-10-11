using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Services;
using BingGoWebAPI.Models;
using BingGoWebAPI.Exceptions;
using System.Security.Claims;

namespace BingGoWebAPI.Controllers
{
    /// <summary>
    /// GDPR Compliance Controller for data protection and privacy rights
    /// Handles user data export, deletion, and privacy management requests
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GDPRController : ControllerBase
    {
        private readonly IGDPRComplianceService _gdprService;
        private readonly IPrivacyPolicyService _privacyService;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<GDPRController> _logger;

        public GDPRController(
            IGDPRComplianceService gdprService,
            IPrivacyPolicyService privacyService,
            IAuditLogService auditLogService,
            ILogger<GDPRController> logger)
        {
            _gdprService = gdprService;
            _privacyService = privacyService;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        /// <summary>
        /// Export all user data in compliance with GDPR Article 15 (Right of Access)
        /// </summary>
        [HttpPost("export-data")]
        public async Task<ActionResult<GDPRDataExportResult>> ExportUserData()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                _logger.LogInformation("GDPR data export requested by user {UserId}", userId);

                var result = await _gdprService.ExportUserDataAsync(userId);

                return Ok(result);
            }
            catch (GDPRComplianceException ex)
            {
                _logger.LogError(ex, "GDPR compliance error during data export");
                return BadRequest(new { error = "Failed to export user data", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during data export");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get portable user data in compliance with GDPR Article 20 (Right to Data Portability)
        /// </summary>
        [HttpPost("portable-data")]
        public async Task<ActionResult<GDPRDataPortabilityResult>> GetPortableData()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                _logger.LogInformation("GDPR data portability requested by user {UserId}", userId);

                var result = await _gdprService.GetPortableUserDataAsync(userId);

                return Ok(result);
            }
            catch (GDPRComplianceException ex)
            {
                _logger.LogError(ex, "GDPR compliance error during data portability");
                return BadRequest(new { error = "Failed to export portable data", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during data portability");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Delete user data in compliance with GDPR Article 17 (Right to Erasure)
        /// </summary>
        [HttpPost("delete-data")]
        public async Task<ActionResult<GDPRDeletionResult>> DeleteUserData([FromBody] GDPRDeletionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                if (!request.ConfirmDeletion)
                {
                    return BadRequest(new { error = "Deletion confirmation required" });
                }

                _logger.LogInformation("GDPR data deletion requested by user {UserId} with scope {Scope}",
                    userId, request.DeletionScope);

                var result = await _gdprService.DeleteUserDataAsync(userId, request);

                return Ok(result);
            }
            catch (GDPRComplianceException ex)
            {
                _logger.LogError(ex, "GDPR compliance error during data deletion");
                return BadRequest(new { error = "Failed to delete user data", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during data deletion");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Anonymize user data while preserving analytics value
        /// </summary>
        [HttpPost("anonymize-data")]
        public async Task<ActionResult> AnonymizeUserData()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                _logger.LogInformation("GDPR data anonymization requested by user {UserId}", userId);

                var success = await _gdprService.AnonymizeUserDataAsync(userId);

                if (success)
                {
                    return Ok(new { message = "User data anonymized successfully" });
                }
                else
                {
                    return BadRequest(new { error = "Failed to anonymize user data" });
                }
            }
            catch (GDPRComplianceException ex)
            {
                _logger.LogError(ex, "GDPR compliance error during data anonymization");
                return BadRequest(new { error = "Failed to anonymize user data", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during data anonymization");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get data processing activities for a user
        /// </summary>
        [HttpGet("processing-activities")]
        public async Task<ActionResult<List<DataProcessingActivity>>> GetProcessingActivities()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var activities = await _gdprService.GetDataProcessingActivitiesAsync(userId);

                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting processing activities for user");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// /// Get current privacy policy and user consent status
        /// </summary>
        [HttpGet("privacy-policy")]
        public async Task<ActionResult<PrivacyPolicyResponse>> GetPrivacyPolicy()
        {
            try
            {
                var userId = GetCurrentUserId();
                var policy = await _privacyService.GetCurrentPrivacyPolicyAsync();

                UserConsent? userConsent = null;
                if (!string.IsNullOrEmpty(userId))
                {
                    userConsent = await _privacyService.GetUserConsentAsync(userId);
                }

                var response = new PrivacyPolicyResponse
                {
                    Policy = policy,
                    UserConsent = userConsent,
                    RequiresConsent = userConsent == null ||
                                    userConsent.PolicyVersion != policy.Version
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting privacy policy");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Update user consent for privacy policy and data processing
        /// </summary>
        [HttpPost("consent")]
        public async Task<ActionResult> UpdateConsent([FromBody] ConsentUpdateRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                _logger.LogInformation("Privacy consent update requested by user {UserId}", userId);

                // Convert ConsentUpdateRequest to UserConsent
                var userConsent = new UserConsent
                {
                    UserId = userId,
                    DataProcessingConsent = request.AcceptedDataProcessing,
                    MarketingConsent = request.AcceptedMarketing,
                    AnalyticsConsent = request.AcceptedTerms, // Map to analytics for now
                    CookieConsent = request.AcceptedCookies,
                    ConsentVersion = request.PolicyVersion,
                    ConsentDate = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow,
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
                };

                await _privacyService.UpdateUserConsentAsync(userId, userConsent);

                return Ok(new { message = "Consent updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user consent");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Get user's current privacy settings
        /// </summary>
        [HttpGet("privacy-settings")]
        public async Task<ActionResult<UserPrivacySettings>> GetPrivacySettings()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var settings = await _privacyService.GetUserPrivacySettingsAsync(userId);

                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user privacy settings");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Update user's privacy settings
        /// </summary>
        [HttpPut("privacy-settings")]
        public async Task<ActionResult> UpdatePrivacySettings([FromBody] UserPrivacySettings settings)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                _logger.LogInformation("Privacy settings update requested by user {UserId}", userId);

                await _privacyService.UpdateUserPrivacySettingsAsync(userId, settings);

                return Ok(new { message = "Privacy settings updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user privacy settings");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Admin endpoint to validate data retention policies
        /// </summary>
        [HttpGet("admin/validate-retention")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> ValidateDataRetention()
        {
            try
            {
                _logger.LogInformation("Data retention validation requested by admin");

                var isValid = await _gdprService.ValidateDataRetentionPoliciesAsync();

                return Ok(new { isValid, message = isValid ? "All retention policies are compliant" : "Retention policy violations found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating data retention policies");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Admin endpoint to get GDPR compliance report
        /// </summary>
        [HttpGet("admin/compliance-report")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<GDPRComplianceReport>> GetComplianceReport([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                _logger.LogInformation("GDPR compliance report requested by admin");

                var report = await _privacyService.GenerateComplianceReportAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating compliance report");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                   User.FindFirst("uid")?.Value ??
                   string.Empty;
        }
    }

    #region Request/Response Models

    public class PrivacyPolicyResponse
    {
        public PrivacyPolicy Policy { get; set; } = new();
        public UserConsent? UserConsent { get; set; }
        public bool RequiresConsent { get; set; }
    }



    public class GDPRComplianceReport
    {
        public DateTime GeneratedAt { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int TotalDataExportRequests { get; set; }
        public int TotalDataDeletionRequests { get; set; }
        public int TotalAnonymizationRequests { get; set; }
        public int ActiveUserConsents { get; set; }
        public int ExpiredUserConsents { get; set; }
        public List<string> RetentionPolicyViolations { get; set; } = new();
        public Dictionary<string, int> ConsentByType { get; set; } = new();
    }

    #endregion
}