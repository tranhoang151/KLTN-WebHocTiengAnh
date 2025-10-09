namespace BingGoWebAPI.Models;

public class FlashcardProgressDto
{
    public string UserId { get; set; } = string.Empty;
    public string SetId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public int CompletionPercentage { get; set; }
    public List<string> LearnedCardIds { get; set; } = new();
    public int TimeSpent { get; set; }
}

public class ExerciseSubmissionDto
{
    public string UserId { get; set; } = string.Empty;
    public string ExerciseId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public List<AnswerDto> Answers { get; set; } = new();
    public int TimeSpent { get; set; }
}

public class AnswerDto
{
    public string QuestionId { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

public class ExerciseResult
{
    public double Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public bool Passed { get; set; }
    public List<QuestionResult> QuestionResults { get; set; } = new();
}

public class QuestionResult
{
    public string QuestionId { get; set; } = string.Empty;
    public string UserAnswer { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
}

public class VideoProgressDto
{
    public string UserId { get; set; } = string.Empty;
    public string VideoId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public bool Completed { get; set; }
    public int WatchTime { get; set; }
}

public class LoginStreakDto
{
    public string UserId { get; set; } = string.Empty;
    public DateTime LoginDate { get; set; }
}

// Profile Management DTOs
public class UserProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? AvatarBase64 { get; set; }
    public int StreakCount { get; set; }
    public string LastLoginDate { get; set; } = string.Empty;
    public List<string> ClassIds { get; set; } = new();
    public Dictionary<string, UserBadgeDto> Badges { get; set; } = new();
    public bool IsActive { get; set; } = true;
}

public class UserBadgeDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool Earned { get; set; }
    public DateTime? EarnedAt { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Rarity { get; set; } = string.Empty;
}



public class UpdateProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string? AvatarBase64 { get; set; }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class AvatarUploadDto
{
    public string AvatarBase64 { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}

// User Management DTOs
public class CreateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public List<string>? ClassIds { get; set; }
}

public class UpdateUserDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? Gender { get; set; }
    public List<string>? ClassIds { get; set; }
}

public class UpdateUserStatusDto
{
    public bool IsActive { get; set; }
}

// Flashcard DTOs
public class CreateFlashcardSetDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public List<string> AssignedClassIds { get; set; } = new();
}

public class StudentDashboardDto
{
    public int StreakCount { get; set; }
    public double TotalStudyTimeHours { get; set; }
    public int CompletedFlashcardSets { get; set; }
    public int CompletedExercises { get; set; }
    public List<LearningActivity> RecentActivities { get; set; } = new();
    public List<PerformanceDataPoint> ExercisePerformance { get; set; } = new();
}

public class PerformanceDataPoint
{
    public DateTime Date { get; set; }
    public double Score { get; set; }
}

public class AnalyticsSummaryDto
{
    public int TotalUsers { get; set; }
    public int TotalCourses { get; set; }
    public int TotalClasses { get; set; }
    public int TotalVideos { get; set; }
    public int TotalExercises { get; set; }
    public int TotalFlashcardSets { get; set; }
    public double AverageExerciseScore { get; set; }
    public Dictionary<string, int> ActivityCountsByType { get; set; } = new();
}

public class TeacherClassSummaryDto
{
    public string ClassId { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public double AverageCompletionRate { get; set; }
}

public class ClassProgressDto
{
    public string ClassId { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public List<StudentProgressSummaryDto> Students { get; set; } = new();
}

public class StudentProgressSummaryDto
{
    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public double OverallScore { get; set; }
    public int CompletedActivities { get; set; }
    public double TotalStudyTimeHours { get; set; }
}




public class CreateFlashcardDto
{
    public string FrontText { get; set; } = string.Empty;
    public string BackText { get; set; } = string.Empty;
    public string? ExampleSentence { get; set; }
    public string? ImageUrl { get; set; }
    public string? ImageBase64 { get; set; }
    public int Order { get; set; }
}

public class FlashcardProgressResponseDto
{
    public string UserId { get; set; } = string.Empty;
    public string SetId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public int CompletionPercentage { get; set; }
    public List<string> LearnedCardIds { get; set; } = new();
    public int TimeSpent { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class ReorderFlashcardsDto
{
    public List<FlashcardOrderDto> Cards { get; set; } = new();
}

public class FlashcardOrderDto
{
    public string Id { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class VideoWatchDto
{
    public string UserId { get; set; } = string.Empty;
    public string VideoId { get; set; } = string.Empty;
    public bool Completed { get; set; }
    public int WatchTime { get; set; }
}

// Teacher Analytics DTOs
public class TeacherAnalyticsDto
{
    public List<ClassAnalyticsDto> Classes { get; set; } = new();
    public TeacherSummaryDto Summary { get; set; } = new();
}

public class ClassAnalyticsDto
{
    public string ClassId { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int ActiveStudents { get; set; }
    public double AverageCompletion { get; set; }
    public int TotalTimeSpent { get; set; }
    public List<StudentProgressDto> StudentsProgress { get; set; } = new();
}

public class StudentProgressDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public FlashcardProgressResponseDto? Progress { get; set; }
    public DateTime? LastActivity { get; set; }
    public int TotalTimeSpent { get; set; }
    public double CompletionPercentage { get; set; }
    public int Streak { get; set; }
}

public class TeacherSummaryDto
{
    public int TotalStudents { get; set; }
    public int ActiveStudents { get; set; }
    public double AverageCompletion { get; set; }
    public int TotalTimeSpent { get; set; }
}


// Badge-related DTOs
public class BadgeNotificationDto
{
    public string BadgeId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime EarnedAt { get; set; }
    public bool Seen { get; set; }
    public string BadgeName { get; set; } = string.Empty;
    public string BadgeDescription { get; set; } = string.Empty;
    public string BadgeImageUrl { get; set; } = string.Empty;
}

public class AchievementStatsDto
{
    public int TotalBadges { get; set; }
    public int EarnedBadges { get; set; }
    public List<UserBadgeDto> RecentBadges { get; set; } = new();
    public double ProgressPercentage { get; set; }
}

// System Configuration DTOs
public class SystemSettingsDto
{
    public string AppName { get; set; } = string.Empty;
    public string AppVersion { get; set; } = string.Empty;
    public int MaxLoginAttempts { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public int MaxFileUploadSizeMB { get; set; }
    public List<string> AllowedFileTypes { get; set; } = new();
    public bool EnableRegistration { get; set; }
    public bool EnablePasswordReset { get; set; }
    public string DefaultLanguage { get; set; } = string.Empty;
    public List<string> SupportedLanguages { get; set; } = new();
}

public class FeatureFlagDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool Enabled { get; set; }
    public List<string> TargetRoles { get; set; } = new();
    public List<string> TargetUsers { get; set; } = new();
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class MaintenanceModeDto
{
    public bool Enabled { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public List<string> AllowedRoles { get; set; } = new();
}

public class SystemAnnouncementDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public int Priority { get; set; } = 1;
    public List<string> TargetRoles { get; set; } = new();
    public bool Active { get; set; } = true;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class SystemBackupDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BackupType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class SystemHealthDto
{
    public string Status { get; set; } = string.Empty;
    public string DatabaseStatus { get; set; } = string.Empty;
    public string FirebaseStatus { get; set; } = string.Empty;
    public string StorageStatus { get; set; } = string.Empty;
    public double MemoryUsageMB { get; set; }
    public double CpuUsagePercent { get; set; }
    public int ActiveUsers { get; set; }
    public long UptimeSeconds { get; set; }
    public DateTime LastCheck { get; set; }
}

// Test Submission DTOs
public class SubmissionAnswerDto
{
    public string QuestionId { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
}

public class TestSubmissionDto
{
    public string TestId { get; set; } = string.Empty;
    public List<SubmissionAnswerDto> Answers { get; set; } = new();
}

public class TestResultDto
{
    public string SubmissionId { get; set; } = string.Empty;
    public string TestId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public double Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public DateTime SubmittedAt { get; set; }
    public List<QuestionResult> QuestionResults { get; set; } = new();
}

// Evaluation DTO
public class EvaluationDto
{
    public string StudentId { get; set; } = string.Empty;
    public float OverallRating { get; set; }
    public string Comments { get; set; } = string.Empty;
    public int Score { get; set; }
    public float RatingParticipation { get; set; }
    public float RatingUnderstanding { get; set; }
    public float RatingProgress { get; set; }
}