using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class Course
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("name")]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty("description")]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("target_age_group")]
    public string? TargetAgeGroup { get; set; }

    [FirestoreProperty("is_active")]
    public bool IsActive { get; set; } = true;
}