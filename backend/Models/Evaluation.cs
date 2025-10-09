
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

    [FirestoreProperty("evaluation_date")]
    public Timestamp EvaluationDate { get; set; }

    [FirestoreProperty("overall_rating")]
    public float OverallRating { get; set; }

    [FirestoreProperty("comments")]
    public string Comments { get; set; } = string.Empty;

    [FirestoreProperty("score")]
    public int Score { get; set; }

    [FirestoreProperty("rating_participation")]
    public float RatingParticipation { get; set; }

    [FirestoreProperty("rating_understanding")]
    public float RatingUnderstanding { get; set; }

    [FirestoreProperty("rating_progress")]
    public float RatingProgress { get; set; }
}
