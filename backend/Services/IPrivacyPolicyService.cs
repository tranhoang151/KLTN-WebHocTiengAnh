using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    /// <summary>
    /// Interface for privacy policy and user consent management
    /// </summary>
    public interface IPrivacyPolicyService
    {
        /// <summary>
        /// Get the current active privacy policy
        /// </summary>
        Task<PrivacyPolicy> GetCurrentPrivacyPolicyAsync();

        /// <summary>
        /// Get privacy policy history
        /// </summary>
        Task<List<PrivacyPolicy>> GetPrivacyPolicyHistoryAsync();

        /// <summary>
        /// Create a new privacy policy
        /// </summary>
        Task<PrivacyPolicy> CreatePrivacyPolicyAsync(PrivacyPolicy policy);

        /// <summary>
        /// Update an existing privacy policy
        /// </summary>
        Task<PrivacyPolicy> UpdatePrivacyPolicyAsync(string policyId, PrivacyPolicy policy);

        /// <summary>
        /// Record user acceptance of privacy policy
        /// /// </summary>
        Task<bool> AcceptPrivacyPolicyAsync(string userId, string policyVersion);

        /// <summary>
        /// /// Get user consent information
        /// </summary>
        Task<UserConsent> GetUserConsentAsync(string userId);

        /// <summary>
        /// Update user consent
        /// </summary>
        Task UpdateUserConsentAsync(string userId, UserConsent consent);

        /// <summary>
        /// Get user privacy settings
        /// </summary>
        Task<UserPrivacySettings> GetUserPrivacySettingsAsync(string userId);

        /// <summary>
        /// Update user privacy settings
        /// </summary>
        Task UpdateUserPrivacySettingsAsync(string userId, UserPrivacySettings settings);

        /// <summary>
        /// Generate compliance report
        /// </summary>
        Task<ComplianceReport> GenerateComplianceReportAsync();
    }
}