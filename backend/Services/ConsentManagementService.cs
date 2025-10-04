using Google.Cloud.Firestore;
using System.Text.Json;
using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    /// <summary>
    /// Consent Management Service for GDPR compliance and user privacy
    /// Handles user consent tracking, cookie management, and privacy preferences
    /// </summary>
    public interface IConsentManagementService
    {
        Task<UserConsent> GetUserConsentAsync(string userId);
        Task<bool> UpdateUserConsentAsync(string userId, ConsentUpdateRequest request);
        Task<CookieConsent> GetCookieConsentAsync(string userId);
        Task<bool> UpdateCookieConsentAsync(string userId, CookieConsentRequest request);
        Task<List<ConsentHistory>> GetConsentHistoryAsync(string userId);
        Task<bool> ValidateConsentAsync(string userId, string consentType);
        Task<ConsentReport> GenerateConsentReportAsync(DateTime fromDate, DateTime toDate);
        Task<bool> RevokeConsentAsync(string userId, string consentType);
        Task<Dictionary<string, bool>> GetRequiredConsentsAsync();
    }

    public class ConsentManagementService : IConsentManagementService
    {
        private readonly FirestoreDb _firestore;
        private readonly ILogger<ConsentManagementService> _logger;
        private readonly IAuditLogService _auditLogService;
        private readonly IConfiguration _configuration;

        public ConsentManagementService(
            FirestoreDb firestore,
            ILogger<ConsentManagementService> logger,
            IAuditLogService auditLogService,
            IConfiguration configuration)
        {
            _firestore = firestore;
            _logger = logger;
            _auditLogService = auditLogService;
            _configuration = configuration;
        }

        /// <summary>
        /// /// Get user's current consent status
        /// </summary>
        public async Task<UserConsent> GetUserConsentAsync(string userId)
        {
            try
            {
                var consentDoc = await _firestore.Collection("userConsents").Document(userId).GetSnapshotAsync();

                if (!consentDoc.Exists)
                {
                    return new UserConsent
                    {
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow,
                        RequiresUpdate = true
                    };
                }

                var consent = consentDoc.ConvertTo<UserConsent>();

                // Check if consent needs update based on policy version
                var currentPolicyVersion = _configuration["Privacy:CurrentPolicyVersion"] ?? "1.0";
                consent.RequiresUpdate = consent.PolicyVersion != currentPolicyVersion;

                return consent;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user consent for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Update user consent preferences
        /// </summary>
        public async Task<bool> UpdateUserConsentAsync(string userId, ConsentUpdateRequest request)
        {
            try
            {
                _logger.LogInformation("Updating consent for user {UserId}", userId);

                var consent = new UserConsent
                {
                    UserId = userId,
                    PolicyVersion = request.PolicyVersion,
                    AcceptedTerms = request.AcceptedTerms,
                    AcceptedPrivacyPolicy = request.AcceptedPrivacyPolicy,
                    AcceptedDataProcessing = request.AcceptedDataProcessing,
                    AcceptedCookies = request.AcceptedCookies,
                    AcceptedMarketing = request.AcceptedMarketing,
                    SpecificConsents = request.SpecificConsents,
                    UpdatedAt = DateTime.UtcNow,
                    RequiresUpdate = false
                };

                // If this is the first consent, set created date
                var existingConsent = await GetUserConsentAsync(userId);
                if (existingConsent.CreatedAt == default)
                {
                    consent.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    consent.CreatedAt = existingConsent.CreatedAt;
                }

                // Save consent
                await _firestore.Collection("userConsents").Document(userId).SetAsync(consent);

                // Save consent history
                await SaveConsentHistoryAsync(userId, consent, "UPDATE");

                // Log consent update
                await _auditLogService.LogConsentUpdateAsync(userId, "CONSENT_UPDATE",
                    JsonSerializer.Serialize(new
                    {
                        PolicyVersion = request.PolicyVersion,
                        AcceptedTerms = request.AcceptedTerms,
                        AcceptedPrivacyPolicy = request.AcceptedPrivacyPolicy,
                        AcceptedDataProcessing = request.AcceptedDataProcessing
                    }));

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user consent for user {UserId}", userId);
                return false;
            }
        }

        /// <summary>
        /// Get user's cookie consent preferences
        /// </summary>
        public async Task<CookieConsent> GetCookieConsentAsync(string userId)
        {
            try
            {
                var cookieDoc = await _firestore.Collection("cookieConsents").Document(userId).GetSnapshotAsync();

                if (!cookieDoc.Exists)
                {
                    return new CookieConsent
                    {
                        UserId = userId,
                        Essential = true, // Essential cookies are always enabled
                        CreatedAt = DateTime.UtcNow
                    };
                }

                return cookieDoc.ConvertTo<CookieConsent>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cookie consent for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Update user's cookie consent preferences
        /// </summary>
        public async Task<bool> UpdateCookieConsentAsync(string userId, CookieConsentRequest request)
        {
            try
            {
                _logger.LogInformation("Updating cookie consent for user {UserId}", userId);

                var cookieConsent = new CookieConsent
                {
                    UserId = userId,
                    Essential = true, // Always true - essential cookies cannot be disabled
                    Functional = request.Functional,
                    Analytics = request.Analytics,
                    Marketing = request.Marketing,
                    Personalization = request.Personalization,
                    UpdatedAt = DateTime.UtcNow
                };

                // If this is the first consent, set created date
                var existingConsent = await GetCookieConsentAsync(userId);
                if (existingConsent.CreatedAt == default)
                {
                    cookieConsent.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    cookieConsent.CreatedAt = existingConsent.CreatedAt;
                }

                // Save cookie consent
                await _firestore.Collection("cookieConsents").Document(userId).SetAsync(cookieConsent);

                // Save consent history
                await SaveCookieConsentHistoryAsync(userId, cookieConsent, "UPDATE");

                // Log cookie consent update
                await _auditLogService.LogConsentUpdateAsync(userId, "COOKIE_CONSENT_UPDATE",
                    JsonSerializer.Serialize(new
                    {
                        Functional = request.Functional,
                        Analytics = request.Analytics,
                        Marketing = request.Marketing,
                        Personalization = request.Personalization
                    }));

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cookie consent for user {UserId}", userId);
                return false;
            }
        }

        /// <summary>
        /// Get user's consent history
        /// </summary>
        public async Task<List<ConsentHistory>> GetConsentHistoryAsync(string userId)
        {
            try
            {
                var historyQuery = _firestore.Collection("consentHistory")
                    .WhereEqualTo("userId", userId)
                    .OrderByDescending("timestamp")
                    .Limit(50);

                var historyDocs = await historyQuery.GetSnapshotAsync();

                return historyDocs.Documents.Select(doc => doc.ConvertTo<ConsentHistory>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting consent history for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Validate if user has given required consent for a specific operation
        /// </summary>
        public async Task<bool> ValidateConsentAsync(string userId, string consentType)
        {
            try
            {
                var consent = await GetUserConsentAsync(userId);

                return consentType.ToLower() switch
                {
                    "terms" => consent.AcceptedTerms,
                    "privacy" => consent.AcceptedPrivacyPolicy,
                    "dataprocessing" => consent.AcceptedDataProcessing,
                    "cookies" => consent.AcceptedCookies,
                    "marketing" => consent.AcceptedMarketing,
                    _ => false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating consent for user {UserId} and type {ConsentType}", userId, consentType);
                return false;
            }
        }

        /// <summary>
        /// Generate consent compliance report
        /// </summary>
        public async Task<ConsentReport> GenerateConsentReportAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var report = new ConsentReport
                {
                    GeneratedAt = DateTime.UtcNow,
                    FromDate = fromDate,
                    ToDate = toDate
                };

                // Get all user consents
                var consentsQuery = _firestore.Collection("userConsents")
                    .WhereGreaterThanOrEqualTo("updatedAt", fromDate)
                    .WhereLessThanOrEqualTo("updatedAt", toDate);

                var consentDocs = await consentsQuery.GetSnapshotAsync();
                var consents = consentDocs.Documents.Select(doc => doc.ConvertTo<UserConsent>()).ToList();

                report.TotalUsers = consents.Count;
                report.AcceptedTerms = consents.Count(c => c.AcceptedTerms);
                report.AcceptedPrivacyPolicy = consents.Count(c => c.AcceptedPrivacyPolicy);
                report.AcceptedDataProcessing = consents.Count(c => c.AcceptedDataProcessing);
                report.AcceptedCookies = consents.Count(c => c.AcceptedCookies);
                report.AcceptedMarketing = consents.Count(c => c.AcceptedMarketing);

                // Calculate consent rates
                if (report.TotalUsers > 0)
                {
                    report.ConsentRates = new Dictionary<string, double>
                    {
                        ["Terms"] = (double)report.AcceptedTerms / report.TotalUsers * 100,
                        ["Privacy"] = (double)report.AcceptedPrivacyPolicy / report.TotalUsers * 100,
                        ["DataProcessing"] = (double)report.AcceptedDataProcessing / report.TotalUsers * 100,
                        ["Cookies"] = (double)report.AcceptedCookies / report.TotalUsers * 100,
                        ["Marketing"] = (double)report.AcceptedMarketing / report.TotalUsers * 100
                    };
                }

                // Get consent history for the period
                var historyQuery = _firestore.Collection("consentHistory")
                    .WhereGreaterThanOrEqualTo("timestamp", fromDate)
                    .WhereLessThanOrEqualTo("timestamp", toDate);

                var historyDocs = await historyQuery.GetSnapshotAsync();
                report.ConsentUpdates = historyDocs.Count;

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating consent report");
                throw;
            }
        }

        /// <summary>
        /// Revoke specific consent type for a user
        /// </summary>
        public async Task<bool> RevokeConsentAsync(string userId, string consentType)
        {
            try
            {
                _logger.LogInformation("Revoking consent type {ConsentType} for user {UserId}", consentType, userId);

                var consent = await GetUserConsentAsync(userId);

                // Update the specific consent
                switch (consentType.ToLower())
                {
                    case "marketing":
                        consent.AcceptedMarketing = false;
                        break;
                    case "cookies":
                        consent.AcceptedCookies = false;
                        break;
                    case "dataprocessing":
                        consent.AcceptedDataProcessing = false;
                        break;
                    default:
                        _logger.LogWarning("Cannot revoke consent type {ConsentType} - not revokable", consentType);
                        return false;
                }

                consent.UpdatedAt = DateTime.UtcNow;

                // Save updated consent
                await _firestore.Collection("userConsents").Document(userId).SetAsync(consent);

                // Save consent history
                await SaveConsentHistoryAsync(userId, consent, $"REVOKE_{consentType.ToUpper()}");

                // Log consent revocation
                await _auditLogService.LogConsentUpdateAsync(userId, "CONSENT_REVOCATION",
                    $"Revoked consent for: {consentType}");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking consent for user {UserId} and type {ConsentType}", userId, consentType);
                return false;
            }
        }

        /// <summary>
        /// Get required consents based on configuration
        /// </summary>
        public async Task<Dictionary<string, bool>> GetRequiredConsentsAsync()
        {
            try
            {
                var requiredConsents = new Dictionary<string, bool>
                {
                    ["terms"] = true, // Always required
                    ["privacy"] = true, // Always required
                    ["dataprocessing"] = _configuration.GetValue<bool>("Privacy:RequireDataProcessingConsent", true),
                    ["cookies"] = _configuration.GetValue<bool>("Privacy:RequireCookieConsent", true),
                    ["marketing"] = _configuration.GetValue<bool>("Privacy:RequireMarketingConsent", false)
                };

                return requiredConsents;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting required consents");
                throw;
            }
        }

        #region Private Methods

        private async Task SaveConsentHistoryAsync(string userId, UserConsent consent, string action)
        {
            try
            {
                var history = new ConsentHistory
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    Action = action,
                    PolicyVersion = consent.PolicyVersion,
                    ConsentData = JsonSerializer.Serialize(consent),
                    Timestamp = DateTime.UtcNow,
                    IpAddress = GetCurrentIpAddress(),
                    UserAgent = GetCurrentUserAgent()
                };

                await _firestore.Collection("consentHistory").Document(history.Id).SetAsync(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving consent history for user {UserId}", userId);
                // Don't throw - this is not critical for the main operation
            }
        }

        private async Task SaveCookieConsentHistoryAsync(string userId, CookieConsent consent, string action)
        {
            try
            {
                var history = new ConsentHistory
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    Action = action,
                    ConsentData = JsonSerializer.Serialize(consent),
                    Timestamp = DateTime.UtcNow,
                    IpAddress = GetCurrentIpAddress(),
                    UserAgent = GetCurrentUserAgent()
                };

                await _firestore.Collection("consentHistory").Document(history.Id).SetAsync(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving cookie consent history for user {UserId}", userId);
                // Don't throw - this is not critical for the main operation
            }
        }

        private string GetCurrentIpAddress()
        {
            // This would typically be injected from the HTTP context
            return "127.0.0.1"; // Placeholder
        }

        private string GetCurrentUserAgent()
        {
            // This would typically be injected from the HTTP context
            return "Unknown"; // Placeholder
        }

        #endregion
    }
}