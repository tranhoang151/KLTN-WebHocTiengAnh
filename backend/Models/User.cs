using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class User
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("full_name")]
    public string FullName { get; set; } = string.Empty;

    [FirestoreProperty("email")]
    public string Email { get; set; } = string.Empty;

    [FirestoreProperty("password")]
    public string Password { get; set; } = string.Empty;

    [FirestoreProperty("role")]
    public string Role { get; set; } = string.Empty; // student, teacher, admin

    [FirestoreProperty("gender")]
    public string Gender { get; set; } = string.Empty;

    [FirestoreProperty("avatar_url")]
    public string? AvatarUrl { get; set; }

    [FirestoreProperty("avatar_base64")]
    public string? AvatarBase64 { get; set; }

    [FirestoreProperty("login_streak_count")]
    public int LoginStreakCount { get; set; }

    [FirestoreProperty("learning_streak_count")]
    public int LearningStreakCount { get; set; }

    // Alias for compatibility - not a Firestore property
    public int StreakCount
    {
        get => LearningStreakCount;
        set => LearningStreakCount = value;
    }

    [FirestoreProperty("last_learning_date")]
    public string LastLearningDate { get; set; } = string.Empty;

    [FirestoreProperty("last_login_date")]
    public string LastLoginDate { get; set; } = string.Empty;

    [FirestoreProperty("class_ids")]
    public List<string> ClassIds { get; set; } = new();

    [FirestoreProperty("badges")]
    public Dictionary<string, UserBadge> Badges { get; set; } = new();

    [FirestoreProperty("learningHistory")]
    public Dictionary<string, bool> LearningHistory { get; set; } = new();

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("is_active")]
    public bool IsActive { get; set; } = true;
}

[FirestoreData]
public class UserBadge
{
    [FirestoreProperty("earned")]
    public bool Earned { get; set; }

    [FirestoreProperty("earned_at")]
    public Timestamp? EarnedAt { get; set; }

    [FirestoreProperty("notification_seen")]
    public bool NotificationSeen { get; set; } = false;
}