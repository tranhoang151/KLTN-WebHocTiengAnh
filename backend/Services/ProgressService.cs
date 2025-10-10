using BingGoWebAPI.Models;
using Google.Cloud.Firestore;

namespace BingGoWebAPI.Services
{
    public class ProgressService : IProgressService
    {
        private readonly IFirebaseService _firebaseService;
        private readonly ILogger<ProgressService> _logger;

        public ProgressService(IFirebaseService firebaseService, ILogger<ProgressService> logger)
        {
            _firebaseService = firebaseService;
            _logger = logger;
        }

        public async Task<UserProgress> GetUserProgressAsync(string userId)
        {
            try
            {
                var progress = await _firebaseService.GetDocumentAsync<UserProgress>("user_progress", userId);
                return progress ?? new UserProgress { UserId = userId };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user progress for user {UserId}", userId);
                throw;
            }
        }

        public async Task UpdateUserProgressAsync(string userId, UserProgress progress)
        {
            try
            {
                progress.UserId = userId;
                progress.LastUpdated = DateTime.UtcNow;
                await _firebaseService.SetDocumentAsync("user_progress", userId, progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user progress for user {UserId}", userId);
                throw;
            }
        }

        public async Task<LearningStreak> GetUserStreakAsync(string userId)
        {
            try
            {
                var streak = await _firebaseService.GetDocumentAsync<LearningStreak>("learning_streaks", userId);
                return streak ?? new LearningStreak { UserId = userId };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user streak for user {UserId}", userId);
                throw;
            }
        }

        public async Task UpdateUserStreakAsync(string userId, LearningStreak streak)
        {
            try
            {
                streak.UserId = userId;
                streak.LastUpdated = DateTime.UtcNow;
                await _firebaseService.SetDocumentAsync("learning_streaks", userId, streak);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user streak for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<LearningActivity>> GetUserActivitiesAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _firebaseService.GetCollection("learning_activities")
                    .WhereEqualTo("UserId", userId);

                if (fromDate.HasValue)
                    query = query.WhereGreaterThanOrEqualTo("Timestamp", fromDate.Value);

                if (toDate.HasValue)
                    query = query.WhereLessThanOrEqualTo("Timestamp", toDate.Value);

                return await _firebaseService.GetDocumentsAsync<LearningActivity>(query);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user activities for user {UserId}", userId);
                throw;
            }
        }

        public async Task LogLearningActivityAsync(string userId, LearningActivity activity)
        {
            try
            {
                activity.UserId = userId;
                activity.Timestamp = DateTime.UtcNow;
                await _firebaseService.AddDocumentAsync("learning_activities", activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging learning activity for user {UserId}", userId);
                throw;
            }
        }

        public async Task<Dictionary<string, object>> GetProgressAnalyticsAsync(string userId)
        {
            try
            {
                var progress = await GetUserProgressAsync(userId);
                var streak = await GetUserStreakAsync(userId);
                var activities = await GetUserActivitiesAsync(userId, DateTime.UtcNow.AddDays(-30));

                return new Dictionary<string, object>
                {
                    ["totalXp"] = progress.TotalXp,
                    ["currentLevel"] = progress.CurrentLevel,
                    ["currentStreak"] = streak.CurrentStreak,
                    ["longestStreak"] = streak.LongestStreak,
                    ["activitiesLast30Days"] = activities.Count,
                    ["averageSessionTime"] = activities.Any() ? activities.Average(a => a.Duration) : 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting progress analytics for user {UserId}", userId);
                throw;
            }
        }

        public async Task<StudentDashboardDto> GetStudentDashboardDataAsync(string userId)
        {
            try
            {
                var progress = await GetUserProgressAsync(userId);
                var streak = await GetUserStreakAsync(userId);
                var activities = await GetUserActivitiesAsync(userId, DateTime.UtcNow.AddDays(-30));

                // Calculate completed flashcard sets and exercises from activities
                var completedFlashcardSets = activities
                    .Where(a => a.Type == "flashcard" && !string.IsNullOrEmpty(a.FlashcardSetId))
                    .Select(a => a.FlashcardSetId)
                    .Distinct()
                    .Count();

                var completedExercises = activities
                    .Where(a => a.Type == "exercise" && !string.IsNullOrEmpty(a.ExerciseId))
                    .Select(a => a.ExerciseId)
                    .Distinct()
                    .Count();

                // Calculate total study time in hours
                var totalStudyTimeHours = activities.Sum(a => a.TimeSpent) / 3600.0;

                // Get recent activities (last 10)
                var recentActivities = activities
                    .OrderByDescending(a => a.Timestamp)
                    .Take(10)
                    .ToList();

                // Generate performance data points from exercise activities
                var exercisePerformance = activities
                    .Where(a => a.Type == "exercise" && a.Score.HasValue)
                    .GroupBy(a => a.Timestamp.Date)
                    .Select(g => new PerformanceDataPoint
                    {
                        Date = g.Key,
                        Score = g.Average(a => a.Score ?? 0)
                    })
                    .OrderBy(p => p.Date)
                    .ToList();

                return new StudentDashboardDto
                {
                    StreakCount = streak.CurrentStreak,
                    TotalStudyTimeHours = totalStudyTimeHours,
                    CompletedFlashcardSets = completedFlashcardSets,
                    CompletedExercises = completedExercises,
                    RecentActivities = recentActivities,
                    ExercisePerformance = exercisePerformance
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting student dashboard data for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<TeacherClassSummaryDto>> GetTeacherClassSummariesAsync(string teacherId)
        {
            try
            {
                // Get classes taught by this teacher
                var classesQuery = _firebaseService.GetCollection("classes")
                    .WhereEqualTo("TeacherId", teacherId);
                var classes = await _firebaseService.GetDocumentsAsync<Class>(classesQuery);

                var summaries = new List<TeacherClassSummaryDto>();

                foreach (var classItem in classes)
                {
                    // Calculate completion rates for students in this class
                    var completionRates = new List<double>();

                    foreach (var studentId in classItem.StudentIds)
                    {
                        var studentProgress = await GetUserProgressAsync(studentId);
                        var studentActivities = await GetUserActivitiesAsync(studentId, DateTime.UtcNow.AddDays(-30));

                        // Calculate completion rate based on activities and progress
                        var completionRate = CalculateCompletionRate(studentProgress, studentActivities);
                        completionRates.Add(completionRate);
                    }

                    summaries.Add(new TeacherClassSummaryDto
                    {
                        ClassId = classItem.Id,
                        ClassName = classItem.Name,
                        StudentCount = classItem.StudentIds.Count,
                        AverageCompletionRate = completionRates.Any() ? completionRates.Average() : 0
                    });
                }

                return summaries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teacher class summaries for teacher {TeacherId}", teacherId);
                throw;
            }
        }

        public async Task<ClassProgressDto> GetClassProgressAsync(string classId)
        {
            try
            {
                // Get class information
                var classInfo = await _firebaseService.GetDocumentAsync<Class>("classes", classId);
                if (classInfo == null)
                {
                    throw new ArgumentException($"Class with ID {classId} not found");
                }

                var studentSummaries = new List<StudentProgressSummaryDto>();

                foreach (var studentId in classInfo.StudentIds)
                {
                    // Get student information
                    var student = await _firebaseService.GetDocumentAsync<User>("users", studentId);
                    if (student == null) continue;

                    var progress = await GetUserProgressAsync(studentId);
                    var activities = await GetUserActivitiesAsync(studentId, DateTime.UtcNow.AddDays(-30));

                    // Calculate overall score from recent exercise activities
                    var exerciseScores = activities
                        .Where(a => a.Type == "exercise" && a.Score.HasValue)
                        .Select(a => a.Score!.Value);
                    var overallScore = exerciseScores.Any() ? exerciseScores.Average() : 0;

                    // Calculate total study time in hours
                    var totalStudyTimeHours = activities.Sum(a => a.TimeSpent) / 3600.0;

                    studentSummaries.Add(new StudentProgressSummaryDto
                    {
                        StudentId = studentId,
                        StudentName = student.FullName,
                        OverallScore = overallScore,
                        CompletedActivities = activities.Count,
                        TotalStudyTimeHours = totalStudyTimeHours
                    });
                }

                return new ClassProgressDto
                {
                    ClassId = classId,
                    ClassName = classInfo.Name,
                    Students = studentSummaries
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting class progress for class {ClassId}", classId);
                throw;
            }
        }

        public async Task<List<StudentProgressSummaryDto>> GetChildrenProgressSummariesAsync(string parentId)
        {
            try
            {
                // Get parent user to access child IDs
                var parent = await _firebaseService.GetDocumentAsync<User>("users", parentId);
                if (parent == null || parent.ChildIds == null || !parent.ChildIds.Any())
                {
                    return new List<StudentProgressSummaryDto>();
                }

                var childrenSummaries = new List<StudentProgressSummaryDto>();

                foreach (var childId in parent.ChildIds)
                {
                    // Get child information
                    var child = await _firebaseService.GetDocumentAsync<User>("users", childId);
                    if (child == null) continue;

                    var progress = await GetUserProgressAsync(childId);
                    var activities = await GetUserActivitiesAsync(childId, DateTime.UtcNow.AddDays(-30));

                    // Calculate overall score from recent exercise activities
                    var exerciseScores = activities
                        .Where(a => a.Type == "exercise" && a.Score.HasValue)
                        .Select(a => a.Score!.Value);
                    var overallScore = exerciseScores.Any() ? exerciseScores.Average() : 0;

                    // Calculate total study time in hours
                    var totalStudyTimeHours = activities.Sum(a => a.TimeSpent) / 3600.0;

                    childrenSummaries.Add(new StudentProgressSummaryDto
                    {
                        StudentId = childId,
                        StudentName = child.FullName,
                        OverallScore = overallScore,
                        CompletedActivities = activities.Count,
                        TotalStudyTimeHours = totalStudyTimeHours
                    });
                }

                return childrenSummaries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting children progress summaries for parent {ParentId}", parentId);
                throw;
            }
        }

        private double CalculateCompletionRate(UserProgress progress, List<LearningActivity> activities)
        {
            // Calculate completion rate based on completed sets and total XP
            // This is a simplified calculation - in a real scenario, you might have more sophisticated logic
            var completedSets = progress.CompletedSets?.Count ?? 0;
            var totalXp = progress.TotalXp;
            var recentActivityCount = activities.Count;

            // Simple heuristic: combine completed sets, XP, and recent activity
            var completionScore = (completedSets * 10) + (totalXp / 100.0) + (recentActivityCount * 2);

            // Normalize to a percentage (0-100)
            return Math.Min(100, completionScore);
        }
    }
}