using Google.Cloud.Firestore;

namespace BingGoWebAPI.Models;

[FirestoreData]
public class FlashcardSet
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("title")]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty("description")]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty("course_id")]
    public string CourseId { get; set; } = string.Empty;

    [FirestoreProperty("created_by")]
    public string CreatedBy { get; set; } = string.Empty;

    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty("assigned_class_ids")]
    public List<string> AssignedClassIds { get; set; } = new();

    [FirestoreProperty("set_id")]
    public string SetId { get; set; } = string.Empty;

    [FirestoreProperty("is_active")]
    public bool IsActive { get; set; } = true;
}

[FirestoreData]
public class Flashcard
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("flashcard_set_id")]
    public string FlashcardSetId { get; set; } = string.Empty;

    [FirestoreProperty("front_text")]
    public string FrontText { get; set; } = string.Empty;

    [FirestoreProperty("back_text")]
    public string BackText { get; set; } = string.Empty;

    [FirestoreProperty("example_sentence")]
    public string? ExampleSentence { get; set; }

    [FirestoreProperty("image_url")]
    public string? ImageUrl { get; set; }

    [FirestoreProperty("image_base64")]
    public string? ImageBase64 { get; set; }

    [FirestoreProperty("order")]
    public int Order { get; set; }
}