using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class Course
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("name")]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty("description")]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty("image_url")]
    public string? ImageUrl { get; set; }

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; } = Timestamp.GetCurrentTimestamp();
}