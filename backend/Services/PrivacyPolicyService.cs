using Google.Cloud.Firestore;
using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    public class PrivacyPolicyService : IPrivacyPolicyService
    {
        private readonly FirestoreDb _firestore;
        private readonly ILogger<PrivacyPolicyService> _logger;

        public PrivacyPolicyService(FirestoreDb firestore, ILogger<PrivacyPolicyService> logger)
        {
            _firestore = firestore;
            _logger = logger;
        }

        public async Task<PrivacyPolicy> GetCurrentPrivacyPolicyAsync()
        {
            try
            {
                var snapshot = await _firestore.Collection("privacyPolicies")
                    .WhereEqualTo("isActive", true)
                    .OrderByDescending("effectiveDate")
                    .Limit(1)
                    .GetSnapshotAsync();

                if (snapshot.Documents.Any())
                {
                    return snapshot.Documents.First().ConvertTo<PrivacyPolicy>();
                }

                return new PrivacyPolicy
                {
                    Id = Guid.NewGuid().ToString(),
                    Version = "1.0",
                    Content = "Default privacy policy content",
                    EffectiveDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    Changes = new List<string>()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get current privacy policy");
                throw;
            }
        }

        public async Task<List<PrivacyPolicy>> GetPrivacyPolicyHistoryAsync()
        {
            try
            {
                var snapshot = await _firestore.Collection("privacyPolicies")
                    .OrderByDescending("effectiveDate")
                    .GetSnapshotAsync();

                return snapshot.Documents.Select(doc => doc.ConvertTo<PrivacyPolicy>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get privacy policy history");
                throw;
            }
        }

        public async Task<PrivacyPolicy> CreatePrivacyPolicyAsync(PrivacyPolicy policy)
        {
            try
            {
                policy.Id = Guid.NewGuid().ToString();
                policy.CreatedAt = DateTime.UtcNow;

                await _firestore.Collection("privacyPolicies").AddAsync(policy);

                _logger.LogInformation("Privacy policy created: {PolicyId}", policy.Id);

                return policy;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create privacy policy");
                throw;
            }
        }

        public async Task<PrivacyPolicy> UpdatePrivacyPolicyAsync(string policyId, PrivacyPolicy policy)
        {
            try
            {
                policy.Id = policyId;

                await _firestore.Collection("privacyPolicies").Document(policyId).SetAsync(policy);

                _logger.LogInformation("Privacy policy updated: {PolicyId}", policyId);

                return policy;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update privacy policy: {PolicyId}", policyId);
                throw;
            }
        }

        public async Task<bool> AcceptPrivacyPolicyAsync(string userId, string policyVersion)
        {
            try
            {
                var acceptance = new
                {
                    UserId = userId,
                    PolicyVersion = policyVersion,
                    AcceptedAt = DateTime.UtcNow,
                    IpAddress = "unknown"
                };

                await _firestore.Collection("policyAcceptances").AddAsync(acceptance);

                _logger.LogInformation("Privacy policy accepted by user: {UserId}, Version: {Version}", userId, policyVersion);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to record privacy policy acceptance for user: {UserId}", userId);
                return false;
            }
        }

        public async Task<UserConsent> GetUserConsentAsync(string userId)
        {
            try
            {
                var snapshot = await _firestore.Collection("userConsents")
                    .WhereEqualTo("UserId", userId)
                    .OrderByDescending("LastUpdated")
                    .Limit(1)
                    .GetSnapshotAsync();

                if (snapshot.Documents.Any())
                {
                    return snapshot.Documents.First().ConvertTo<UserConsent>();
                }

                // Return default consent if none exists
                return new UserConsent
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    DataProcessingConsent = false,
                    MarketingConsent = false,
                    AnalyticsConsent = false,
                    CookieConsent = false,
                    ConsentVersion = "1.0",
                    ConsentDate = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow,
                    IpAddress = "unknown",
                    UserAgent = "unknown"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get user consent for user: {UserId}", userId);
                throw;
            }
        }

        public async Task UpdateUserConsentAsync(string userId, UserConsent consent)
        {
            try
            {
                if (string.IsNullOrEmpty(consent.Id))
                {
                    consent.Id = Guid.NewGuid().ToString();
                }

                consent.UserId = userId;
                consent.LastUpdated = DateTime.UtcNow;

                await _firestore.Collection("userConsents").Document(consent.Id).SetAsync(consent);

                _logger.LogInformation("User consent updated for user: {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update user consent for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<UserPrivacySettings> GetUserPrivacySettingsAsync(string userId)
        {
            try
            {
                var snapshot = await _firestore.Collection("userPrivacySettings")
                    .WhereEqualTo("UserId", userId)
                    .Limit(1)
                    .GetSnapshotAsync();

                if (snapshot.Documents.Any())
                {
                    var settings = snapshot.Documents.First().ConvertTo<PrivacySettings>();
                    return new UserPrivacySettings
                    {
                        UserId = settings.UserId,
                        AllowDataCollection = settings.AllowDataCollection,
                        AllowMarketing = settings.AllowMarketing,
                        AllowAnalytics = settings.AllowAnalytics,
                        AllowCookies = settings.AllowCookies,
                        AllowPersonalization = settings.AllowPersonalization,
                        LastUpdated = settings.LastUpdated
                    };
                }

                // Return default settings if none exist
                return new UserPrivacySettings
                {
                    UserId = userId,
                    AllowDataCollection = true,
                    AllowMarketing = false,
                    AllowAnalytics = true,
                    AllowCookies = true,
                    AllowPersonalization = true,
                    LastUpdated = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get user privacy settings for user: {UserId}", userId);
                throw;
            }
        }

        public async Task UpdateUserPrivacySettingsAsync(string userId, UserPrivacySettings settings)
        {
            try
            {
                var privacySettings = new PrivacySettings
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    AllowDataCollection = settings.AllowDataCollection,
                    AllowMarketing = settings.AllowMarketing,
                    AllowAnalytics = settings.AllowAnalytics,
                    AllowCookies = settings.AllowCookies,
                    AllowPersonalization = settings.AllowPersonalization,
                    CreatedAt = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow,
                    ConsentHistory = new List<ConsentRecord>()
                };

                await _firestore.Collection("userPrivacySettings").Document(privacySettings.Id).SetAsync(privacySettings);

                _logger.LogInformation("User privacy settings updated for user: {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update user privacy settings for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<ComplianceReport> GenerateComplianceReportAsync()
        {
            try
            {
                var report = new ComplianceReport
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = "system",
                    GeneratedAt = DateTime.UtcNow,
                    ReportType = "privacy_compliance",
                    ComplianceChecks = new Dictionary<string, bool>(),
                    Violations = new List<string>(),
                    Recommendations = new List<string>(),
                    IsCompliant = true,
                    DataRetentionDays = 365,
                    AdditionalData = new Dictionary<string, object>()
                };

                // Check privacy policy compliance
                var currentPolicy = await GetCurrentPrivacyPolicyAsync();
                report.ComplianceChecks["has_active_privacy_policy"] = currentPolicy != null && currentPolicy.IsActive;

                // Check user consent records
                var consentSnapshot = await _firestore.Collection("userConsents").Limit(100).GetSnapshotAsync();
                var totalUsers = consentSnapshot.Documents.Count;
                var usersWithConsent = consentSnapshot.Documents.Count(doc =>
                {
                    var consent = doc.ConvertTo<UserConsent>();
                    return consent.DataProcessingConsent;
                });

                report.ComplianceChecks["user_consent_coverage"] = totalUsers == 0 || (usersWithConsent / (double)totalUsers) >= 0.95;

                // Check data retention policies
                var oldDataCutoff = DateTime.UtcNow.AddDays(-report.DataRetentionDays);
                var oldDataSnapshot = await _firestore.Collection("auditLogs")
                    .WhereLessThan("Timestamp", oldDataCutoff)
                    .Limit(1)
                    .GetSnapshotAsync();

                report.ComplianceChecks["data_retention_compliance"] = !oldDataSnapshot.Documents.Any();

                // Generate recommendations based on compliance checks
                if (!report.ComplianceChecks["has_active_privacy_policy"])
                {
                    report.Violations.Add("No active privacy policy found");
                    report.Recommendations.Add("Create and activate a privacy policy");
                    report.IsCompliant = false;
                }

                if (!report.ComplianceChecks["user_consent_coverage"])
                {
                    report.Violations.Add("Insufficient user consent coverage");
                    report.Recommendations.Add("Implement consent collection for all users");
                    report.IsCompliant = false;
                }

                if (!report.ComplianceChecks["data_retention_compliance"])
                {
                    report.Violations.Add("Old data found beyond retention period");
                    report.Recommendations.Add("Implement automated data cleanup processes");
                    report.IsCompliant = false;
                }

                // Store the report
                await _firestore.Collection("complianceReports").Document(report.Id).SetAsync(report);

                _logger.LogInformation("Compliance report generated: {ReportId}, Compliant: {IsCompliant}",
                    report.Id, report.IsCompliant);

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate compliance report");
                throw;
            }
        }
    }
}