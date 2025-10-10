using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class Evaluation
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("student_id")]
    public string StudentId { get; set; } = string.Empty;

    [FirestoreProperty("teacher_id")]
    public string TeacherId { get; set; } = string.Empty;

    [FirestoreProperty("class_id")]
    public string? ClassId { get; set; }

    [FirestoreProperty("evaluation_date")]
    public string EvaluationDate { get; set; } = string.Empty;

    [FirestoreProperty("overall_rating")]
    public double OverallRating { get; set; }

    [FirestoreProperty("rating_participation")]
    public double RatingParticipation { get; set; }

    [FirestoreProperty("rating_understanding")]
    public double RatingUnderstanding { get; set; }

    [FirestoreProperty("rating_progress")]
    public double RatingProgress { get; set; }

    [FirestoreProperty("score")]
    public int Score { get; set; }

    [FirestoreProperty("comments")]
    public string Comments { get; set; } = string.Empty;

    [FirestoreProperty("strengths")]
    public List<string> Strengths { get; set; } = new();

    [FirestoreProperty("areas_for_improvement")]
    public List<string> AreasForImprovement { get; set; } = new();

    [FirestoreProperty("recommendations")]
    public List<string> Recommendations { get; set; } = new();

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("updated_at")]
    public Timestamp UpdatedAt { get; set; }
}