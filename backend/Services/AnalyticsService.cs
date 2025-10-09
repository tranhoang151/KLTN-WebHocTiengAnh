using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IFirebaseService _firebaseService;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(IFirebaseService firebaseService, ILogger<AnalyticsService> logger)
        {
            _firebaseService = firebaseService;
            _logger = logger;
        }

        public async Task<Dictionary<string, object>> GetUserAnalyticsAsync(string userId)
        {
            try
            {
                var user = await _firebaseService.GetDocumentAsync<User>("users", userId);
                var progress = await _firebaseService.GetDocumentAsync<UserProgress>("user_progress", userId);

                var activitiesQuery = _firebaseService.GetCollection("learning_activities").WhereEqualTo("user_id", userId);
                var activities = await _firebaseService.GetDocumentsAsync<LearningActivity>(activitiesQuery);

                return new Dictionary<string, object>
                {
                    ["userId"] = userId,
                    ["totalXp"] = progress?.TotalXp ?? 0,
                    ["currentLevel"] = progress?.CurrentLevel ?? 1,
                    ["totalActivities"] = activities.Count,
                    ["totalTimeSpent"] = activities.Sum(a => a.Duration),
                    ["averageSessionTime"] = activities.Any() ? activities.Average(a => (double)a.Duration) : 0,
                    ["lastActivity"] = activities.OrderByDescending(a => a.Timestamp).FirstOrDefault()?.Timestamp
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user analytics for {UserId}", userId);
                throw;
            }
        }

        public async Task<Dictionary<string, object>> GetCourseAnalyticsAsync(string courseId)
        {
            try
            {
                var course = await _firebaseService.GetDocumentAsync<Course>("courses", courseId);

                var enrollmentsQuery = _firebaseService.GetCollection("enrollments").WhereEqualTo("course_id", courseId);
                var enrollments = await _firebaseService.GetDocumentsAsync<object>(enrollmentsQuery);

                return new Dictionary<string, object>
                {
                    ["courseId"] = courseId,
                    ["courseName"] = course?.Name ?? "Unknown",
                    ["totalEnrollments"] = enrollments.Count,
                    ["completionRate"] = 0 // Calculate based on progress data
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course analytics for {CourseId}", courseId);
                throw;
            }
        }

        public async Task<Dictionary<string, object>> GetClassAnalyticsAsync(string classId)
        {
            try
            {
                var classData = await _firebaseService.GetDocumentAsync<Class>("classes", classId);

                return new Dictionary<string, object>
                {
                    ["classId"] = classId,
                    ["className"] = classData?.Name ?? "Unknown",
                    ["studentCount"] = classData?.StudentIds?.Count ?? 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting class analytics for {ClassId}", classId);
                throw;
            }
        }

        public async Task<Dictionary<string, object>> GetSystemAnalyticsAsync()
        {
            try
            {
                var usersQuery = _firebaseService.GetCollection("users");
                var users = await _firebaseService.GetDocumentsAsync<User>(usersQuery);

                var coursesQuery = _firebaseService.GetCollection("courses");
                var courses = await _firebaseService.GetDocumentsAsync<Course>(coursesQuery);

                var classesQuery = _firebaseService.GetCollection("classes");
                var classes = await _firebaseService.GetDocumentsAsync<Class>(classesQuery);

                // Fix LastLoginDate comparison - it's a string property, so we need to parse it
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var activeUsersCount = users.Count(u =>
                {
                    if (DateTime.TryParse(u.LastLoginDate, out var lastLogin))
                    {
                        return lastLogin > thirtyDaysAgo;
                    }
                    return false;
                });

                return new Dictionary<string, object>
                {
                    ["totalUsers"] = users.Count,
                    ["totalCourses"] = courses.Count,
                    ["totalClasses"] = classes.Count,
                    ["activeUsers"] = activeUsersCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting system analytics");
                throw;
            }
        }

        public async Task LogEventAsync(string eventName, Dictionary<string, object> properties)
        {
            try
            {
                var eventData = new
                {
                    EventName = eventName,
                    Properties = properties,
                    Timestamp = DateTime.UtcNow
                };

                await _firebaseService.AddDocumentAsync("analytics_events", eventData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging analytics event {EventName}", eventName);
                throw;
            }
        }

        public async Task<List<Dictionary<string, object>>> GetTopPerformersAsync(string? courseId = null, string? classId = null)
        {
            try
            {
                var progressQuery = _firebaseService.GetCollection("user_progress");
                var progressData = await _firebaseService.GetDocumentsAsync<UserProgress>(progressQuery);

                return progressData
                    .OrderByDescending(p => p.TotalXp)
                    .Take(10)
                    .Select(p => new Dictionary<string, object>
                    {
                        ["userId"] = p.UserId,
                        ["totalXp"] = p.TotalXp,
                        ["currentLevel"] = p.CurrentLevel
                    })
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top performers");
                throw;
            }
        }

        public async Task<Dictionary<string, object>> GetLearningTrendsAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var activitiesQuery = _firebaseService.GetCollection("learning_activities")
                    .WhereGreaterThanOrEqualTo("timestamp", fromDate)
                    .WhereLessThanOrEqualTo("timestamp", toDate);
                var activities = await _firebaseService.GetDocumentsAsync<LearningActivity>(activitiesQuery);

                var dailyActivities = activities
                    .GroupBy(a => a.Timestamp.Date)
                    .ToDictionary(g => g.Key.ToString("yyyy-MM-dd"), g => g.Count());

                return new Dictionary<string, object>
                {
                    ["totalActivities"] = activities.Count,
                    ["dailyBreakdown"] = dailyActivities,
                    ["averageDaily"] = dailyActivities.Values.Any() ? dailyActivities.Values.Average() : 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning trends from {FromDate} to {ToDate}", fromDate, toDate);
                throw;
            }
        }

        public async Task<object> GetAnalyticsSummaryAsync()
        {
            try
            {
                var usersQuery = _firebaseService.GetCollection("users");
                var users = await _firebaseService.GetDocumentsAsync<User>(usersQuery);

                var coursesQuery = _firebaseService.GetCollection("courses");
                var courses = await _firebaseService.GetDocumentsAsync<Course>(coursesQuery);

                var classesQuery = _firebaseService.GetCollection("classes");
                var classes = await _firebaseService.GetDocumentsAsync<Class>(classesQuery);

                var videosQuery = _firebaseService.GetCollection("videos");
                var videos = await _firebaseService.GetDocumentsAsync<Video>(videosQuery);

                var exercisesQuery = _firebaseService.GetCollection("exercises");
                var exercises = await _firebaseService.GetDocumentsAsync<Exercise>(exercisesQuery);

                var flashcardSetsQuery = _firebaseService.GetCollection("flashcard_sets");
                var flashcardSets = await _firebaseService.GetDocumentsAsync<FlashcardSet>(flashcardSetsQuery);

                var activitiesQuery = _firebaseService.GetCollection("learning_activities");
                var activities = await _firebaseService.GetDocumentsAsync<LearningActivity>(activitiesQuery);

                // Calculate activity counts by type
                var activityCountsByType = activities
                    .GroupBy(a => a.Type)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Calculate average exercise score from activities
                var exerciseActivities = activities.Where(a => a.Type == "exercise" && a.Score.HasValue);
                var averageExerciseScore = exerciseActivities.Any() ? exerciseActivities.Average(a => a.Score.Value) : 0;

                return new
                {
                    totalUsers = users.Count,
                    totalCourses = courses.Count,
                    totalClasses = classes.Count,
                    totalVideos = videos.Count,
                    totalExercises = exercises.Count,
                    totalFlashcardSets = flashcardSets.Count,
                    averageExerciseScore = averageExerciseScore,
                    activityCountsByType = activityCountsByType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting analytics summary");
                throw;
            }
        }
    }
}