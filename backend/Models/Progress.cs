using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class LearningProgress
{
    [FirestoreProperty("user_id")]
    public string UserId { get; set; } = string.Empty;

    [FirestoreProperty("course_id")]
    public string CourseId { get; set; } = string.Empty;

    [FirestoreProperty("flashcard_sets_completed")]
    public List<string> FlashcardSetsCompleted { get; set; } = new();

    [FirestoreProperty("exercises_completed")]
    public List<string> ExercisesCompleted { get; set; } = new();

    [FirestoreProperty("tests_completed")]
    public List<string> TestsCompleted { get; set; } = new();

    [FirestoreProperty("videos_watched")]
    public List<string> VideosWatched { get; set; } = new();

    [FirestoreProperty("total_study_time")]
    public int TotalStudyTime { get; set; }

    [FirestoreProperty("last_activity")]
    public Timestamp LastActivity { get; set; }

    [FirestoreProperty("streak_data")]
    public StreakData StreakData { get; set; } = new();
}

[FirestoreData]
public class StreakData
{
    [FirestoreProperty("current_streak")]
    public int CurrentStreak { get; set; }

    [FirestoreProperty("longest_streak")]
    public int LongestStreak { get; set; }

    [FirestoreProperty("last_activity_date")]
    public string LastActivityDate { get; set; } = string.Empty;
}

[FirestoreData]
public class LearningActivity
{
    [FirestoreProperty("user_id")]
    public string UserId { get; set; } = string.Empty;

    [FirestoreProperty("type")]
    public string Type { get; set; } = string.Empty; // flashcard, exercise, test, video

    [FirestoreProperty("exercise_id")]
    public string? ExerciseId { get; set; }

    [FirestoreProperty("flashcard_set_id")]
    public string? FlashcardSetId { get; set; }

    [FirestoreProperty("video_id")]
    public string? VideoId { get; set; }

    [FirestoreProperty("score")]
    public double? Score { get; set; }

    [FirestoreProperty("completed_at")]
    public Timestamp CompletedAt { get; set; }

    [FirestoreProperty("time_spent")]
    public int TimeSpent { get; set; }

    // New Properties
    [FirestoreProperty("duration")]
    public int Duration { get; set; } // in seconds

    [FirestoreProperty("timestamp")]
    public DateTime Timestamp { get; set; }
}