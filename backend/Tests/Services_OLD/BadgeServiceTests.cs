using Moq;
using Xunit;
using FluentAssertions;
using BingGoWebAPI.Services;
using BingGoWebAPI.Models;
using Microsoft.Extensions.Logging;

namespace BingGoWebAPI.Tests.Services
{
    public class BadgeServiceTests
    {
        private readonly Mock<IFirebaseService> _mockFirebaseService;
        private readonly Mock<ILogger<BadgeService>> _mockLogger;
        private readonly BadgeService _badgeService;

        public BadgeServiceTests()
        {
            _mockFirebaseService = new Mock<IFirebaseService>();
            _mockLogger = new Mock<ILogger<BadgeService>>();
            _badgeService = new BadgeService(_mockFirebaseService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetBadgeDefinitionsAsync_ReturnsAllDefinitions()
        {
            // Arrange
            var expectedDefinitions = new List<BadgeDefinition>
            {
                new BadgeDefinition
                {
                    Id = "first_lesson",
                    Name = "First Lesson",
                    Description = "Complete your first lesson",
                    ImageUrl = "https://example.com/first-lesson.png",
                    ConditionKey = "lessons_completed",
                    ConditionValue = 1,
                    IsActive = true
                },
                new BadgeDefinition
                {
                    Id = "streak_7",
                    Name = "Week Warrior",
                    Description = "Maintain a 7-day learning streak",
                    ImageUrl = "https://example.com/week-warrior.png",
                    ConditionKey = "streak_days",
                    ConditionValue = 7,
                    IsActive = true
                }
            };

            _mockFirebaseService
                .Setup(x => x.GetBadgeDefinitionsAsync())
                .ReturnsAsync(expectedDefinitions);

            // Act
            var result = await _badgeService.GetBadgeDefinitionsAsync();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("First Lesson", result[0].Name);
            Assert.Equal("Week Warrior", result[1].Name);
        }

        [Fact]
        public async Task GetUserBadgesAsync_ReturnsUserBadges()
        {
            // Arrange
            var userId = "user123";
            var expectedBadges = new List<Badge>
            {
                new Badge
                {
                    Id = "badge1",
                    UserId = userId,
                    BadgeDefinitionId = "first_lesson",
                    EarnedAt = DateTime.UtcNow.AddDays(-5),
                    IsNotified = true
                }
            };

            _mockFirebaseService
                .Setup(x => x.GetUserBadgesAsync(userId))
                .ReturnsAsync(expectedBadges);

            // Act
            var result = await _badgeService.GetUserBadgesAsync(userId);

            // Assert
            Assert.Single(result);
            Assert.Equal(userId, result[0].UserId);
            Assert.Equal("first_lesson", result[0].BadgeDefinitionId);
        }

        [Fact]
        public async Task CheckAndAwardBadgesAsync_NewBadgeEarned_AwardsBadge()
        {
            // Arrange
            var userId = "user123";
            var userProgress = new Dictionary<string, object>
            {
                { "lessons_completed", 1 },
                { "streak_days", 3 }
            };

            var badgeDefinitions = new List<BadgeDefinition>
            {
                new BadgeDefinition
                {
                    Id = "first_lesson",
                    Name = "First Lesson",
                    ConditionKey = "lessons_completed",
                    ConditionValue = 1,
                    IsActive = true
                }
            };

            var existingBadges = new List<Badge>(); // No existing badges

            _mockFirebaseService
                .Setup(x => x.GetBadgeDefinitionsAsync())
                .ReturnsAsync(badgeDefinitions);

            _mockFirebaseService
                .Setup(x => x.GetUserBadgesAsync(userId))
                .ReturnsAsync(existingBadges);

            _mockFirebaseService
                .Setup(x => x.CreateBadgeAsync(It.IsAny<Badge>()))
                .ReturnsAsync((Badge badge) => badge);

            // Act
            var result = await _badgeService.CheckAndAwardBadgesAsync(userId, userProgress);

            // Assert
            Assert.Single(result);
            Assert.Equal("first_lesson", result[0].BadgeDefinitionId);
            Assert.Equal(userId, result[0].UserId);

            _mockFirebaseService.Verify(
                x => x.CreateBadgeAsync(It.Is<Badge>(b => b.BadgeDefinitionId == "first_lesson")),
                Times.Once
            );
        }

        [Fact]
        public async Task CheckAndAwardBadgesAsync_BadgeAlreadyEarned_DoesNotAwardAgain()
        {
            // Arrange
            var userId = "user123";
            var userProgress = new Dictionary<string, object>
            {
                { "lessons_completed", 5 }
            };

            var badgeDefinitions = new List<BadgeDefinition>
            {
                new BadgeDefinition
                {
                    Id = "first_lesson",
                    Name = "First Lesson",
                    ConditionKey = "lessons_completed",
                    ConditionValue = 1,
                    IsActive = true
                }
            };

            var existingBadges = new List<Badge>
            {
                new Badge
                {
                    Id = "existing-badge",
                    UserId = userId,
                    BadgeDefinitionId = "first_lesson",
                    EarnedAt = DateTime.UtcNow.AddDays(-1)
                }
            };

            _mockFirebaseService
                .Setup(x => x.GetBadgeDefinitionsAsync())
                .ReturnsAsync(badgeDefinitions);

            _mockFirebaseService
                .Setup(x => x.GetUserBadgesAsync(userId))
                .ReturnsAsync(existingBadges);

            // Act
            var result = await _badgeService.CheckAndAwardBadgesAsync(userId, userProgress);

            // Assert
            Assert.Empty(result); // No new badges awarded

            _mockFirebaseService.Verify(
                x => x.CreateBadgeAsync(It.IsAny<Badge>()),
                Times.Never
            );
        }

        [Fact]
        public async Task CheckAndAwardBadgesAsync_ConditionNotMet_DoesNotAwardBadge()
        {
            // Arrange
            var userId = "user123";
            var userProgress = new Dictionary<string, object>
            {
                { "lessons_completed", 0 } // Condition not met
            };

            var badgeDefinitions = new List<BadgeDefinition>
            {
                new BadgeDefinition
                {
                    Id = "first_lesson",
                    Name = "First Lesson",
                    ConditionKey = "lessons_completed",
                    ConditionValue = 1,
                    IsActive = true
                }
            };

            var existingBadges = new List<Badge>();

            _mockFirebaseService
                .Setup(x => x.GetBadgeDefinitionsAsync())
                .ReturnsAsync(badgeDefinitions);

            _mockFirebaseService
                .Setup(x => x.GetUserBadgesAsync(userId))
                .ReturnsAsync(existingBadges);

            // Act
            var result = await _badgeService.CheckAndAwardBadgesAsync(userId, userProgress);

            // Assert
            Assert.Empty(result);

            _mockFirebaseService.Verify(
                x => x.CreateBadgeAsync(It.IsAny<Badge>()),
                Times.Never
            );
        }

        [Fact]
        public async Task GetBadgeNotificationsAsync_ReturnsUnseenNotifications()
        {
            // Arrange
            var userId = "user123";
            var expectedNotifications = new List<BadgeNotification>
            {
                new BadgeNotification
                {
                    Id = "notification1",
                    UserId = userId,
                    BadgeId = "badge1",
                    CreatedAt = DateTime.UtcNow,
                    IsSeen = false
                }
            };

            _mockFirebaseService
                .Setup(x => x.GetBadgeNotificationsAsync(userId))
                .ReturnsAsync(expectedNotifications);

            // Act
            var result = await _badgeService.GetBadgeNotificationsAsync(userId);

            // Assert
            Assert.Single(result);
            Assert.Equal(userId, result[0].UserId);
            Assert.False(result[0].IsSeen);
        }

        [Fact]
        public async Task MarkNotificationAsSeenAsync_UpdatesNotification()
        {
            // Arrange
            var userId = "user123";
            var badgeId = "badge1";

            _mockFirebaseService
                .Setup(x => x.MarkBadgeNotificationAsSeenAsync(userId, badgeId))
                .Returns(Task.CompletedTask);

            // Act
            await _badgeService.MarkNotificationAsSeenAsync(userId, badgeId);

            // Assert
            _mockFirebaseService.Verify(
                x => x.MarkBadgeNotificationAsSeenAsync(userId, badgeId),
                Times.Once
            );
        }

        [Fact]
        public async Task GetAchievementStatsAsync_ReturnsCorrectStats()
        {
            // Arrange
            var userId = "user123";

            var allDefinitions = new List<BadgeDefinition>
            {
                new BadgeDefinition { Id = "badge1", IsActive = true },
                new BadgeDefinition { Id = "badge2", IsActive = true },
                new BadgeDefinition { Id = "badge3", IsActive = false } // Inactive
            };

            var userBadges = new List<Badge>
            {
                new Badge
                {
                    Id = "earned1",
                    BadgeDefinitionId = "badge1",
                    EarnedAt = DateTime.UtcNow.AddDays(-1)
                }
            };

            _mockFirebaseService
                .Setup(x => x.GetBadgeDefinitionsAsync())
                .ReturnsAsync(allDefinitions);

            _mockFirebaseService
                .Setup(x => x.GetUserBadgesAsync(userId))
                .ReturnsAsync(userBadges);

            // Act
            var result = await _badgeService.GetAchievementStatsAsync(userId);

            // Assert
            Assert.Equal(2, result.TotalBadges); // Only active badges
            Assert.Equal(1, result.EarnedBadges);
            Assert.Equal(50, result.ProgressPercentage); // 1/2 * 100
            Assert.Single(result.RecentBadges);
        }

        [Theory]
        [InlineData("lessons_completed", 5, 5, true)]
        [InlineData("lessons_completed", 3, 5, false)]
        [InlineData("streak_days", 7, 7, true)]
        [InlineData("streak_days", 5, 7, false)]
        public void EvaluateBadgeCondition_VariousConditions_ReturnsExpectedResult(
            string conditionKey,
            int userValue,
            int requiredValue,
            bool expectedResult)
        {
            // Arrange
            var userProgress = new Dictionary<string, object>
            {
                { conditionKey, userValue }
            };

            var badgeDefinition = new BadgeDefinition
            {
                ConditionKey = conditionKey,
                ConditionValue = requiredValue
            };

            // Act
            var result = _badgeService.EvaluateBadgeCondition(badgeDefinition, userProgress);

            // Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void EvaluateBadgeCondition_MissingProgressKey_ReturnsFalse()
        {
            // Arrange
            var userProgress = new Dictionary<string, object>
            {
                { "other_key", 5 }
            };

            var badgeDefinition = new BadgeDefinition
            {
                ConditionKey = "missing_key",
                ConditionValue = 1
            };

            // Act
            var result = _badgeService.EvaluateBadgeCondition(badgeDefinition, userProgress);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task ShareAchievementAsync_CreatesShareRecord()
        {
            // Arrange
            var userId = "user123";
            var badgeId = "badge1";
            var platform = "facebook";

            _mockFirebaseService
                .Setup(x => x.CreateBadgeShareAsync(It.IsAny<BadgeShare>()))
                .Returns(Task.CompletedTask);

            // Act
            await _badgeService.ShareAchievementAsync(userId, badgeId, platform);

            // Assert
            _mockFirebaseService.Verify(
                x => x.CreateBadgeShareAsync(It.Is<BadgeShare>(
                    s => s.UserId == userId &&
                         s.BadgeId == badgeId &&
                         s.Platform == platform
                )),
                Times.Once
            );
        }
    }
}