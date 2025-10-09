using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class Test
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("title")]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty("course_id")]
    public string CourseId { get; set; } = string.Empty;

    [FirestoreProperty("questions")]
    public List<Question> Questions { get; set; } = new();

    [FirestoreProperty("time_limit")]
    public int? TimeLimit { get; set; }

    [FirestoreProperty("difficulty")]
    public string Difficulty { get; set; } = string.Empty;

    [FirestoreProperty("created_by")]
    public string CreatedBy { get; set; } = string.Empty;

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("is_active")]
    public bool IsActive { get; set; } = true;
}