using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    /// <summary>
    /// Interface for GDPR compliance operations
    /// </summary>
    public interface IGDPRComplianceService
    {
        /// <summary>
        /// Export all user data for GDPR compliance
        /// </summary>
        Task<GDPRDataExportResult> ExportUserDataAsync(string userId);

        /// <summary>
        /// Get portable user data in machine-readable format
        /// </summary>
        Task<GDPRDataExportResult> GetPortableUserDataAsync(string userId);

        /// <summary>
        /// Delete user data according to GDPR deletion request
        /// </summary>
        Task<GDPRDeletionResult> DeleteUserDataAsync(string userId, GDPRDeletionRequest request);

        /// <summary>
        /// Anonymize user data while preserving analytics value
        /// </summary>
        Task<bool> AnonymizeUserDataAsync(string userId);

        /// <summary>
        /// Get data processing activities for a user
        /// </summary>
        Task<List<DataProcessingActivity>> GetDataProcessingActivitiesAsync(string userId);

        /// <summary>
        /// Validate data retention policies compliance
        /// </summary>
        Task<bool> ValidateDataRetentionPoliciesAsync();

        /// <summary>
        /// Get user privacy settings
        /// </summary>
        Task<UserPrivacySettings> GetUserPrivacySettingsAsync(string userId);

        /// <summary>
        /// Update user privacy settings
        /// </summary>
        Task<UserPrivacySettings> UpdateUserPrivacySettingsAsync(string userId, UserPrivacySettings settings);
    }
}