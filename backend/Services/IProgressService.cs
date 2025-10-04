using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    public interface IProgressService
    {
        Task<UserProgress> GetUserProgressAsync(string userId);
        Task UpdateUserProgressAsync(string userId, UserProgress progress);
        Task<LearningStreak> GetUserStreakAsync(string userId);
        Task UpdateUserStreakAsync(string userId, LearningStreak streak);
        Task<List<LearningActivity>> GetUserActivitiesAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null);
        Task LogLearningActivityAsync(string userId, LearningActivity activity);
        Task<Dictionary<string, object>> GetProgressAnalyticsAsync(string userId);

        // New methods for enhanced dashboard functionality
        Task<StudentDashboardDto> GetStudentDashboardDataAsync(string userId);
        Task<List<TeacherClassSummaryDto>> GetTeacherClassSummariesAsync(string teacherId);
        Task<ClassProgressDto> GetClassProgressAsync(string classId);
        Task<List<StudentProgressSummaryDto>> GetChildrenProgressSummariesAsync(string parentId);
    }
}