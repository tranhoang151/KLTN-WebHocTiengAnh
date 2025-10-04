using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services;

public interface IBadgeService
{
    Task<List<UserBadgeDto>> GetUserBadgesAsync(string userId);
    Task<bool> CheckAndAwardBadgeAsync(string userId, string badgeCondition);
    Task<List<Badge>> GetBadgeDefinitionsAsync();
    Task AwardBadgeAsync(string userId, string badgeId);
    Task<bool> CheckLoginStreakAsync(string userId, int requiredDays);
    Task<bool> CheckFlashcardCompletionAsync(string userId);
    Task<bool> CheckExerciseCompletionAsync(string userId);
    Task<bool> CheckTestCompletionAsync(string userId, int requiredTests);
    Task<bool> CheckVideoWatchAsync(string userId);
    Task<bool> CheckLearningStreakAsync(string userId, int requiredDays);

    // New methods for achievement notifications
    Task<List<BadgeNotificationDto>> GetBadgeNotificationsAsync(string userId);
    Task MarkNotificationAsSeenAsync(string userId, string badgeId);
    Task ShareAchievementAsync(string userId, string badgeId, string platform);
    Task<AchievementStatsDto> GetAchievementStatsAsync(string userId);
}