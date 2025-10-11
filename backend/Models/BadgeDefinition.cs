using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class BadgeDefinition
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("name")]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty("description")]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [FirestoreProperty("condition_key")]
    public string ConditionKey { get; set; } = string.Empty;

    [FirestoreProperty("is_active")]
    public bool IsActive { get; set; } = true;

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; } = Timestamp.GetCurrentTimestamp();
}