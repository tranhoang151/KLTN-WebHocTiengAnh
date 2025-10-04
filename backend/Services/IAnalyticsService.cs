namespace BingGoWebAPI.Services
{
    public interface IAnalyticsService
    {
        Task<Dictionary<string, object>> GetUserAnalyticsAsync(string userId);
        Task<Dictionary<string, object>> GetCourseAnalyticsAsync(string courseId);
        Task<Dictionary<string, object>> GetClassAnalyticsAsync(string classId);
        Task<Dictionary<string, object>> GetSystemAnalyticsAsync();
        Task LogEventAsync(string eventName, Dictionary<string, object> properties);
        Task<List<Dictionary<string, object>>> GetTopPerformersAsync(string? courseId = null, string? classId = null);
        Task<Dictionary<string, object>> GetLearningTrendsAsync(DateTime fromDate, DateTime toDate);
        Task<object> GetAnalyticsSummaryAsync();
    }
}