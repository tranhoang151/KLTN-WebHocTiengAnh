using Google.Cloud.Firestore;
using System.Text.Json.Serialization;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class Exercise
{
    [FirestoreDocumentId]
    public string? Id { get; set; }

    [FirestoreProperty("title")]
    public string? Title { get; set; }

    [FirestoreProperty("type")]
    public string? Type { get; set; } // multiple_choice, fill_blank, true_false, essay

    [FirestoreProperty("course_id")]
    public string? CourseId { get; set; }

    [FirestoreProperty("questions")]
    public List<Question> Questions { get; set; } = new();

    [FirestoreProperty("time_limit")]
    public int? TimeLimit { get; set; }

    [FirestoreProperty("difficulty")]
    public string? Difficulty { get; set; } // easy, medium, hard

    [FirestoreProperty("createdBy")]
    public string? CreatedBy { get; set; }

    [FirestoreProperty("createdAt")]
    public Timestamp? CreatedAt { get; set; }

    [FirestoreProperty("updated_at")]
    public Timestamp? UpdatedAt { get; set; }

    [FirestoreProperty("total_points")]
    [JsonPropertyName("totalPoints")]
    public int TotalPoints { get; set; }

    [FirestoreProperty("isActive")]
    public bool IsActive { get; set; } = true;
}

[FirestoreData]
public class Question
{
    [FirestoreDocumentId]
    public string? Id { get; set; }

    [FirestoreProperty("content")]
    public string? Content { get; set; }

    [FirestoreProperty("question_text")]
    [JsonPropertyName("question_text")]
    public string? QuestionText { get; set; }

    [FirestoreProperty("type")]
    public string? Type { get; set; } // multiple_choice, fill_blank, true_false, essay

    [FirestoreProperty("options")]
    public List<string> Options { get; set; } = new();

    [FirestoreProperty("correctAnswer")]
    public object? CorrectAnswer { get; set; } // Can be string, int, or bool

    [FirestoreProperty("explanation")]
    public string? Explanation { get; set; }

    [FirestoreProperty("difficulty")]
    public string? Difficulty { get; set; }

    [FirestoreProperty("course_id")]
    public string? CourseId { get; set; }

    [FirestoreProperty("tags")]
    public List<string> Tags { get; set; } = new();

    [FirestoreProperty("createdBy")]
    public string? CreatedBy { get; set; }

    private Timestamp? _createdAt;

    [FirestoreProperty("createdAt")]
    public object? CreatedAtTimestamp
    {
        get => _createdAt;
        set
        {
            if (value is long longValue)
            {
                _createdAt = Timestamp.FromDateTime(DateTimeOffset.FromUnixTimeMilliseconds(longValue).UtcDateTime);
            }
            else if (value is Timestamp timestampValue)
            {
                _createdAt = timestampValue;
            }
            else if (value == null)
            {
                _createdAt = null;
            }
        }
    }

    public Timestamp? CreatedAt
    {
        get => _createdAt;
        set => _createdAt = value;
    }

    [FirestoreProperty("isActive")]
    public bool IsActive { get; set; } = true;
}