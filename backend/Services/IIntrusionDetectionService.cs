using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    /// <summary>
    /// Interface for intrusion detection and threat prevention
    /// </summary>
    public interface IIntrusionDetectionService
    {
        /// <summary>
        /// Analyze security event for potential threats
        /// </summary>
        Task<bool> AnalyzeEventAsync(SecurityEvent securityEvent);

        /// <summary>
        /// Get recent threat detections with time window
        /// </summary>
        Task<List<ThreatDetection>> GetRecentThreatsAsync(TimeSpan timeWindow);

        /// <summary>
        /// Get recent threat detections (last 24 hours)
        /// </summary>
        Task<List<ThreatDetection>> GetRecentThreatsAsync();

        /// <summary>
        /// Check if IP address is blocked
        /// </summary>
        Task<bool> IsIpAddressBlockedAsync(string ipAddress);

        /// <summary>
        /// Block IP address
        /// </summary>
        Task<bool> BlockIpAddressAsync(string ipAddress, string reason, TimeSpan? duration = null);

        /// <summary>
        /// Unblock IP address
        /// </summary>
        Task<bool> UnblockIpAddressAsync(string ipAddress);

        /// <summary>
        /// Get list of blocked IP addresses
        /// </summary>
        Task<List<string>> GetBlockedIpAddressesAsync();

        /// <summary>
        /// Generate intrusion detection report
        /// </summary>
        Task<IntrusionDetectionReport> GenerateReportAsync(DateTime fromDate, DateTime toDate);

        /// <summary>
        /// Update detection rules
        /// </summary>
        Task<bool> UpdateDetectionRulesAsync(List<DetectionRule> rules);

        /// <summary>
        /// Get detection rules
        /// </summary>
        Task<List<DetectionRule>> GetDetectionRulesAsync();
    }
}