using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class Exercise
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("title")]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty("type")]
    public string Type { get; set; } = string.Empty; // multiple_choice, fill_blank

    [FirestoreProperty("course_id")]
    public string CourseId { get; set; } = string.Empty;

    [FirestoreProperty("questions")]
    public List<Question> Questions { get; set; } = new();

    [FirestoreProperty("time_limit")]
    public int? TimeLimit { get; set; }

    [FirestoreProperty("difficulty")]
    public string Difficulty { get; set; } = string.Empty; // easy, medium, hard

    [FirestoreProperty("created_by")]
    public string CreatedBy { get; set; } = string.Empty;

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("is_active")]
    public bool IsActive { get; set; } = true;
}

[FirestoreData]
public class Question
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("content")]
    public string Content { get; set; } = string.Empty;

    [FirestoreProperty("type")]
    public string Type { get; set; } = string.Empty; // multiple_choice, fill_blank

    [FirestoreProperty("options")]
    public List<string> Options { get; set; } = new();

    [FirestoreProperty("correct_answer")]
    public string CorrectAnswer { get; set; } = string.Empty;

    [FirestoreProperty("explanation")]
    public string? Explanation { get; set; }

    [FirestoreProperty("difficulty")]
    public string Difficulty { get; set; } = string.Empty;

    [FirestoreProperty("course_id")]
    public string CourseId { get; set; } = string.Empty;

    [FirestoreProperty("tags")]
    public List<string> Tags { get; set; } = new();

    [FirestoreProperty("created_by")]
    public string CreatedBy { get; set; } = string.Empty;

    [FirestoreProperty("created_at")]
    public long CreatedAt { get; set; }

    [FirestoreProperty("is_active")]
    public bool IsActive { get; set; } = true;
}