using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class Class
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("name")]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty("description")]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty("capacity")]
    public int Capacity { get; set; }

    [FirestoreProperty("course_id")]
    public string? CourseId { get; set; }

    [FirestoreProperty("teacher_id")]
    public string? TeacherId { get; set; }

    [FirestoreProperty("student_ids")]
    public List<string> StudentIds { get; set; } = new();

    [FirestoreProperty("created_at")]
    public string CreatedAt { get; set; } = string.Empty;

    [FirestoreProperty("is_active")]
    public bool? IsActive { get; set; } = true;
}