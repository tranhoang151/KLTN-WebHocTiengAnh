using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services;

public class BadgeService : IBadgeService
{
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<BadgeService> _logger;

    public BadgeService(IFirebaseService firebaseService, ILogger<BadgeService> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    public async Task<List<UserBadgeDto>> GetUserBadgesAsync(string userId)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return new List<UserBadgeDto>();
            }

            var badgeDefinitions = await GetBadgeDefinitionsAsync();
            var userBadges = new List<UserBadgeDto>();

            foreach (var definition in badgeDefinitions)
            {
                var badge = new UserBadgeDto
                {
                    Id = definition.Id,
                    Name = definition.Name,
                    Description = definition.Description,
                    ImageUrl = definition.ImageUrl,

                    Earned = user.Badges.ContainsKey(definition.Id) && user.Badges[definition.Id].Earned,
                    EarnedAt = user.Badges.ContainsKey(definition.Id) ? user.Badges[definition.Id].EarnedAt?.ToDateTime() : null
                };
                userBadges.Add(badge);
            }

            return userBadges;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user badges for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> CheckAndAwardBadgeAsync(string userId, string badgeCondition)
    {
        try
        {
            var badgeDefinitions = await GetBadgeDefinitionsAsync();
            var badgeToAward = badgeDefinitions.FirstOrDefault(b => b.ConditionKey == badgeCondition);

            if (badgeToAward == null)
            {
                _logger.LogWarning("Badge condition not found: {BadgeCondition}", badgeCondition);
                return false;
            }

            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", userId);
                return false;
            }

            // Check if badge is already earned
            if (user.Badges.ContainsKey(badgeToAward.Id) && user.Badges[badgeToAward.Id].Earned)
            {
                return false; // Already earned
            }

            // Check if condition is met
            var conditionMet = await CheckBadgeCondition(userId, badgeCondition);
            if (conditionMet)
            {
                await AwardBadgeAsync(userId, badgeToAward.Id);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking and awarding badge for user: {UserId}, condition: {BadgeCondition}", userId, badgeCondition);
            throw;
        }
    }

    public async Task<List<Badge>> GetBadgeDefinitionsAsync()
    {
        try
        {
            // Fetch badge definitions from Firestore
            var badges = await _firebaseService.GetCollectionAsync<Badge>("badges");
            return badges.Where(b => b.IsActive).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting badge definitions from Firestore.");
            throw;
        }
    }

    public async Task AwardBadgeAsync(string userId, string badgeId)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            user.Badges[badgeId] = new UserBadge
            {
                Earned = true,
                EarnedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp(),
                NotificationSeen = false // Create notification
            };

            await _firebaseService.UpdateUserAsync(userId, user);
            _logger.LogInformation("Badge awarded to user: {UserId}, badge: {BadgeId}", userId, badgeId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error awarding badge to user: {UserId}, badge: {BadgeId}", userId, badgeId);
            throw;
        }
    }

    private async Task<bool> CheckBadgeCondition(string userId, string condition)
    {
        return condition switch
        {
            "login_streak_3" => await CheckLoginStreakAsync(userId, 3),
            "flashcard_complete" => await CheckFlashcardCompletionAsync(userId),
            "exercise_complete" => await CheckExerciseCompletionAsync(userId),
            "test_complete_2" => await CheckTestCompletionAsync(userId, 2),
            "video_watch" => await CheckVideoWatchAsync(userId),
            "learning_streak_3" => await CheckLearningStreakAsync(userId, 3),
            _ => false
        };
    }

    // Placeholder implementations - these would need to be implemented based on actual data structure
    public async Task<bool> CheckLoginStreakAsync(string userId, int requiredDays)
    {
        var user = await _firebaseService.GetUserByIdAsync(userId);
        return user != null && user.LoginStreakCount >= requiredDays;
    }
    public async Task<bool> CheckFlashcardCompletionAsync(string userId)
    {
        var count = await _firebaseService.GetCompletedFlashcardSetsCountAsync(userId);
        return count >= 1;
    }
    public async Task<bool> CheckExerciseCompletionAsync(string userId)
    {
        var count = await _firebaseService.GetCompletedLearningActivitiesCountAsync(userId, "exercise");
        return count >= 1;
    }
    public async Task<bool> CheckTestCompletionAsync(string userId, int requiredTests)
    {
        var count = await _firebaseService.GetCompletedLearningActivitiesCountAsync(userId, "test");
        return count >= requiredTests;
    }
    public async Task<bool> CheckVideoWatchAsync(string userId)
    {
        var count = await _firebaseService.GetCompletedLearningActivitiesCountAsync(userId, "video");
        return count >= 1;
    }
    public async Task<bool> CheckLearningStreakAsync(string userId, int requiredDays)
    {
        var user = await _firebaseService.GetUserByIdAsync(userId);
        return user != null && user.LearningStreakCount >= requiredDays;
    }

    public async Task<List<BadgeNotificationDto>> GetBadgeNotificationsAsync(string userId)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null) return new List<BadgeNotificationDto>();

            var badgeDefinitions = await GetBadgeDefinitionsAsync();
            var notifications = new List<BadgeNotificationDto>();

            foreach (var badge in user.Badges)
            {
                if (badge.Value.Earned && badge.Value.EarnedAt != null)
                {
                    var definition = badgeDefinitions.FirstOrDefault(b => b.Id == badge.Key);
                    if (definition != null)
                    {
                        notifications.Add(new BadgeNotificationDto
                        {
                            BadgeId = badge.Key,
                            UserId = userId,
                            EarnedAt = badge.Value.EarnedAt.Value.ToDateTime(),
                            Seen = badge.Value.NotificationSeen,
                            BadgeName = definition.Name,
                            BadgeDescription = definition.Description,
                            BadgeImageUrl = definition.ImageUrl
                        });
                    }
                }
            }

            return notifications.OrderByDescending(n => n.EarnedAt).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting badge notifications for user: {UserId}", userId);
            throw;
        }
    }

    public async Task MarkNotificationAsSeenAsync(string userId, string badgeId)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null) throw new ArgumentException("User not found");

            if (user.Badges.ContainsKey(badgeId))
            {
                user.Badges[badgeId].NotificationSeen = true;
                await _firebaseService.UpdateUserAsync(userId, user);
                _logger.LogInformation("Badge notification marked as seen for user: {UserId}, badge: {BadgeId}", userId, badgeId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as seen for user: {UserId}, badge: {BadgeId}", userId, badgeId);
            throw;
        }
    }

    public async Task ShareAchievementAsync(string userId, string badgeId, string platform)
    {
        try
        {
            var user = await _firebaseService.GetUserByIdAsync(userId);
            if (user == null) throw new ArgumentException("User not found");

            var badgeDefinitions = await GetBadgeDefinitionsAsync();
            var badge = badgeDefinitions.FirstOrDefault(b => b.Id == badgeId);

            if (badge == null) throw new ArgumentException("Badge not found");

            // Log the sharing activity (could be extended to track sharing stats)
            _logger.LogInformation("Achievement shared by user: {UserId}, badge: {BadgeId}, platform: {Platform}",
                userId, badgeId, platform);

            // Here you could implement actual sharing logic to social platforms
            // For now, we just log the activity
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sharing achievement for user: {UserId}, badge: {BadgeId}", userId, badgeId);
            throw;
        }
    }

    public async Task<AchievementStatsDto> GetAchievementStatsAsync(string userId)
    {
        try
        {
            var userBadges = await GetUserBadgesAsync(userId);
            var earnedBadges = userBadges.Where(b => b.Earned).ToList();
            var recentBadges = earnedBadges
                .Where(b => b.EarnedAt.HasValue)
                .OrderByDescending(b => b.EarnedAt)
                .Take(5)
                .ToList();

            return new AchievementStatsDto
            {
                TotalBadges = userBadges.Count,
                EarnedBadges = earnedBadges.Count,
                RecentBadges = recentBadges,
                ProgressPercentage = userBadges.Count > 0 ? (double)earnedBadges.Count / userBadges.Count * 100 : 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting achievement stats for user: {UserId}", userId);
            throw;
        }
    }
}