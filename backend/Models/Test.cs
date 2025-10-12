using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class Test
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("title")]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty("course_id")]
    public string CourseId { get; set; } = string.Empty;

    [FirestoreProperty("question_ids")]
    public List<string> QuestionIds { get; set; } = new();

    [FirestoreProperty("time_limit")]
    public int? TimeLimit { get; set; }

    [FirestoreProperty("difficulty")]
    public string Difficulty { get; set; } = string.Empty;

    [FirestoreProperty("created_by")]
    public string CreatedBy { get; set; } = string.Empty;

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("updated_at")]
    public Timestamp UpdatedAt { get; set; }

    [FirestoreProperty("type")]
    public string Type { get; set; } = string.Empty;

    [FirestoreProperty("is_published")]
    public bool IsPublished { get; set; } = false;

    [FirestoreProperty("total_points")]
    public int TotalPoints { get; set; }

    [FirestoreProperty("passing_score")]
    public int PassingScore { get; set; }

    [FirestoreProperty("start_date")]
    public Timestamp? StartDate { get; set; }

    [FirestoreProperty("end_date")]
    public Timestamp? EndDate { get; set; }

    [FirestoreProperty("is_active")]
    public bool IsActive { get; set; } = true;
}