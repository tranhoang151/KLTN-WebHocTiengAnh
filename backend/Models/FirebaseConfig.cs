namespace BingGoWebAPI.Models
{
    public class FirebaseConfig
    {
        public string ProjectId { get; set; } = string.Empty;
        public string ServiceAccountKeyPath { get; set; } = string.Empty;
        public string DatabaseUrl { get; set; } = string.Empty;
        public string StorageBucket { get; set; } = string.Empty;

        // New Caching Properties
        public int CacheTtlMinutes { get; set; } = 15;
        public int CollectionCacheTtlMinutes { get; set; } = 30;
        public int CacheSlidingExpirationMinutes { get; set; } = 60;

        // New Retry Properties
        public int MaxRetryAttempts { get; set; } = 3;
        public int RetryBaseDelayMs { get; set; } = 1000;
        public int MaxConcurrentBatches { get; set; } = 10;
    }
}