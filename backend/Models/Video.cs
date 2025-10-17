using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class Video
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("title")]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty("description")]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty("video_url")]
    public string VideoUrl { get; set; } = string.Empty;

    [FirestoreProperty("topic")]
    public string? Topic { get; set; }

    [FirestoreProperty("teacher_id")]
    public string? TeacherId { get; set; }

    [FirestoreProperty("course_id")]
    public string CourseId { get; set; } = string.Empty;

    [FirestoreProperty("duration")]
    public string? Duration { get; set; }

    [FirestoreProperty("thumbnail_url")]
    public string? ThumbnailUrl { get; set; }

    [FirestoreProperty("assigned_class_ids")]
    public List<string> AssignedClassIds { get; set; } = new();

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("is_active")]
    public bool IsActive { get; set; } = true;
}