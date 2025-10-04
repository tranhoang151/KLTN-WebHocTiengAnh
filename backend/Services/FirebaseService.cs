using BingGoWebAPI.Models;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Caching.Memory;

namespace BingGoWebAPI.Services;

public class FirebaseService : IFirebaseService
{
    private readonly FirestoreDb _firestore;
    private readonly ILogger<FirebaseService> _logger;
    private readonly IMemoryCache _cache;
    private readonly IFirebaseConfigService _firebaseConfig;
    private readonly IFirebaseStorageService _storageService;
    private readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(15);

    public FirebaseService(
        ILogger<FirebaseService> logger,
        IMemoryCache cache,
        IFirebaseConfigService firebaseConfig,
        IFirebaseStorageService storageService)
    {
        _logger = logger;
        _cache = cache;
        _firebaseConfig = firebaseConfig;
        _storageService = storageService;
        _firestore = _firebaseConfig.GetFirestoreDb();

        _logger.LogInformation("Firebase service initialized with Firestore database");
    }

    // Generic CRUD Operations
    public async Task<T?> GetDocumentAsync<T>(string collection, string documentId) where T : class
    {
        try
        {
            var docRef = _firestore.Collection(collection).Document(documentId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            return snapshot.ConvertTo<T>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting document {DocumentId} from collection {Collection}", documentId, collection);
            throw;
        }
    }

    public async Task<List<T>> GetCollectionAsync<T>(string collection) where T : class
    {
        try
        {
            var collectionRef = _firestore.Collection(collection);
            var snapshot = await collectionRef.GetSnapshotAsync();

            return snapshot.Documents.Select(doc => doc.ConvertTo<T>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting collection {Collection}", collection);
            throw;
        }
    }

    public async Task<List<T>> GetDocumentsAsync<T>(Query query) where T : class
    {
        try
        {
            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<T>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing query");
            throw;
        }
    }

    public async Task SetDocumentAsync<T>(string collection, string documentId, T data) where T : class
    {
        try
        {
            var docRef = _firestore.Collection(collection).Document(documentId);
            await docRef.SetAsync(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting document {DocumentId} in collection {Collection}", documentId, collection);
            throw;
        }
    }

    public async Task<string> AddDocumentAsync<T>(string collection, T data) where T : class
    {
        try
        {
            var collectionRef = _firestore.Collection(collection);
            var docRef = await collectionRef.AddAsync(data);
            return docRef.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding document to collection {Collection}", collection);
            throw;
        }
    }

    public async Task UpdateDocumentAsync<T>(string collection, string documentId, T updates) where T : class
    {
        try
        {
            var docRef = _firestore.Collection(collection).Document(documentId);
            await docRef.SetAsync(updates, SetOptions.MergeAll);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating document {DocumentId} in collection {Collection}", documentId, collection);
            throw;
        }
    }

    public async Task DeleteDocumentAsync(string collection, string documentId)
    {
        try
        {
            var docRef = _firestore.Collection(collection).Document(documentId);
            await docRef.DeleteAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document {DocumentId} from collection {Collection}", documentId, collection);
            throw;
        }
    }

    public async Task<bool> DocumentExistsAsync(string collection, string documentId)
    {
        try
        {
            var docRef = _firestore.Collection(collection).Document(documentId);
            var snapshot = await docRef.GetSnapshotAsync();
            return snapshot.Exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if document {DocumentId} exists in collection {Collection}", documentId, collection);
            throw;
        }
    }

    public CollectionReference GetCollection(string collectionName)
    {
        return _firestore.Collection(collectionName);
    }

    public DocumentReference GetDocument(string collectionName, string documentId)
    {
        return _firestore.Collection(collectionName).Document(documentId);
    }

    public async Task<WriteBatch> CreateBatchAsync()
    {
        return _firestore.StartBatch();
    }

    public async Task CommitBatchAsync(WriteBatch batch)
    {
        await batch.CommitAsync();
    }

    // User Management
    public async Task<User?> GetUserByIdAsync(string userId)
    {
        try
        {
            var cacheKey = $"user_{userId}";
            if (_cache.TryGetValue(cacheKey, out User? cachedUser))
            {
                return cachedUser;
            }

            var docRef = _firestore.Collection("users").Document(userId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var user = snapshot.ConvertTo<User>();
            _cache.Set(cacheKey, user, _cacheExpiry);

            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by ID: {UserId}", userId);
            throw;
        }
    }

    public async Task<List<User>> GetUsersAsync()
    {
        try
        {
            const string cacheKey = "users_all";
            if (_cache.TryGetValue(cacheKey, out List<User>? cachedUsers))
            {
                return cachedUsers ?? new List<User>();
            }

            var snapshot = await _firestore.Collection("users").GetSnapshotAsync();
            var users = snapshot.Documents.Select(doc => doc.ConvertTo<User>()).ToList();

            _cache.Set(cacheKey, users, _cacheExpiry);
            return users;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            throw;
        }
    }

    public async Task<User> CreateUserAsync(User user)
    {
        try
        {
            user.Id = Guid.NewGuid().ToString();
            user.CreatedAt = Timestamp.GetCurrentTimestamp();

            var docRef = _firestore.Collection("users").Document(user.Id);
            await docRef.SetAsync(user);

            // Clear cache
            _cache.Remove("users_all");

            _logger.LogInformation("User created with ID: {UserId}", user.Id);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            throw;
        }
    }

    public async Task<User> UpdateUserAsync(string userId, User user)
    {
        try
        {
            user.Id = userId;
            var docRef = _firestore.Collection("users").Document(userId);
            await docRef.SetAsync(user, SetOptions.MergeAll);

            // Clear cache
            _cache.Remove($"user_{userId}");
            _cache.Remove("users_all");

            _logger.LogInformation("User updated: {UserId}", userId);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user: {UserId}", userId);
            throw;
        }
    }

    public async Task DeleteUserAsync(string userId)
    {
        try
        {
            var docRef = _firestore.Collection("users").Document(userId);
            await docRef.DeleteAsync();

            // Clear cache
            _cache.Remove($"user_{userId}");
            _cache.Remove("users_all");

            _logger.LogInformation("User deleted: {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user: {UserId}", userId);
            throw;
        }
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        try
        {
            var cacheKey = $"user_email_{email}";
            if (_cache.TryGetValue(cacheKey, out User? cachedUser))
            {
                return cachedUser;
            }

            var query = _firestore.Collection("users").WhereEqualTo("email", email);
            var snapshot = await query.GetSnapshotAsync();

            if (snapshot.Documents.Count == 0)
            {
                return null;
            }

            var user = snapshot.Documents.First().ConvertTo<User>();
            _cache.Set(cacheKey, user, _cacheExpiry);

            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by email: {Email}", email);
            throw;
        }
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await GetUsersAsync();
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        try
        {
            var docRef = _firestore.Collection("users").Document(user.Id);
            await docRef.SetAsync(user, SetOptions.MergeAll);

            // Clear cache
            _cache.Remove($"user_{user.Id}");
            _cache.Remove($"user_email_{user.Email}");
            _cache.Remove("users_all");

            _logger.LogInformation("User updated: {UserId}", user.Id);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user: {UserId}", user.Id);
            throw;
        }
    }

    // Course Management
    public async Task<List<Course>> GetCoursesAsync()
    {
        try
        {
            const string cacheKey = "courses_all";
            if (_cache.TryGetValue(cacheKey, out List<Course>? cachedCourses))
            {
                return cachedCourses ?? new List<Course>();
            }

            var snapshot = await _firestore.Collection("courses").GetSnapshotAsync();
            var courses = snapshot.Documents.Select(doc => doc.ConvertTo<Course>()).ToList();

            _cache.Set(cacheKey, courses, _cacheExpiry);
            return courses;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all courses");
            throw;
        }
    }

    public async Task<Course?> GetCourseByIdAsync(string courseId)
    {
        try
        {
            var cacheKey = $"course_{courseId}";
            if (_cache.TryGetValue(cacheKey, out Course? cachedCourse))
            {
                return cachedCourse;
            }

            var docRef = _firestore.Collection("courses").Document(courseId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var course = snapshot.ConvertTo<Course>();
            _cache.Set(cacheKey, course, _cacheExpiry);

            return course;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting course by ID: {CourseId}", courseId);
            throw;
        }
    }

    public async Task<Course> CreateCourseAsync(Course course)
    {
        try
        {
            course.Id = Guid.NewGuid().ToString();
            course.CreatedAt = Timestamp.GetCurrentTimestamp();

            var docRef = _firestore.Collection("courses").Document(course.Id);
            await docRef.SetAsync(course);

            // Clear cache
            _cache.Remove("courses_all");

            _logger.LogInformation("Course created with ID: {CourseId}", course.Id);
            return course;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course");
            throw;
        }
    }

    public async Task<Course> UpdateCourseAsync(string courseId, Course course)
    {
        try
        {
            course.Id = courseId;
            var docRef = _firestore.Collection("courses").Document(courseId);
            await docRef.SetAsync(course, SetOptions.MergeAll);

            // Clear cache
            _cache.Remove($"course_{courseId}");
            _cache.Remove("courses_all");

            _logger.LogInformation("Course updated: {CourseId}", courseId);
            return course;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating course: {CourseId}", courseId);
            throw;
        }
    }

    // Placeholder implementations for other methods
    public Task<List<Class>> GetClassesAsync() => throw new NotImplementedException();
    public async Task<Class?> GetClassByIdAsync(string classId)
    {
        try
        {
            var cacheKey = $"class_{classId}";
            if (_cache.TryGetValue(cacheKey, out Class? cachedClass))
            {
                return cachedClass;
            }

            var docRef = _firestore.Collection("classes").Document(classId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var classData = snapshot.ConvertTo<Class>();
            _cache.Set(cacheKey, classData, _cacheExpiry);

            return classData;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting class by ID: {ClassId}", classId);
            throw;
        }
    }
    public async Task<List<Class>> GetClassesByTeacherAsync(string teacherId)
    {
        try
        {
            var cacheKey = $"classes_teacher_{teacherId}";
            if (_cache.TryGetValue(cacheKey, out List<Class>? cachedClasses))
            {
                return cachedClasses ?? new List<Class>();
            }

            var query = _firestore.Collection("classes")
                .WhereEqualTo("teacher_id", teacherId)
                .WhereEqualTo("is_active", true); // Assuming classes have an IsActive property

            var snapshot = await query.GetSnapshotAsync();
            var classes = snapshot.Documents.Select(doc => doc.ConvertTo<Class>()).ToList();

            _cache.Set(cacheKey, classes, _cacheExpiry);
            return classes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting classes for teacher {TeacherId}", teacherId);
            throw;
        }
    }
    public Task<Class> CreateClassAsync(Class classEntity) => throw new NotImplementedException();
    public Task<Class> UpdateClassAsync(string classId, Class classEntity) => throw new NotImplementedException();
    public async Task<List<FlashcardSet>> GetFlashcardSetsAsync()
    {
        try
        {
            const string cacheKey = "flashcard_sets_all";
            if (_cache.TryGetValue(cacheKey, out List<FlashcardSet>? cachedSets))
            {
                return cachedSets ?? new List<FlashcardSet>();
            }

            var snapshot = await _firestore.Collection("flashcard_sets").GetSnapshotAsync();
            var sets = snapshot.Documents.Select(doc => doc.ConvertTo<FlashcardSet>()).ToList();

            _cache.Set(cacheKey, sets, _cacheExpiry);
            return sets;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all flashcard sets");
            throw;
        }
    }

    public async Task<List<FlashcardSet>> GetFlashcardSetsByCourseAsync(string courseId)
    {
        try
        {
            var cacheKey = $"flashcard_sets_course_{courseId}";
            if (_cache.TryGetValue(cacheKey, out List<FlashcardSet>? cachedSets))
            {
                return cachedSets ?? new List<FlashcardSet>();
            }

            var query = _firestore.Collection("flashcard_sets")
                .WhereEqualTo("course_id", courseId)
                .WhereEqualTo("is_active", true);

            var snapshot = await query.GetSnapshotAsync();
            var sets = snapshot.Documents.Select(doc => doc.ConvertTo<FlashcardSet>()).ToList();

            _cache.Set(cacheKey, sets, _cacheExpiry);
            return sets;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting flashcard sets for course: {CourseId}", courseId);
            throw;
        }
    }

    public async Task<List<Flashcard>> GetFlashcardsBySetAsync(string setId)
    {
        try
        {
            var cacheKey = $"flashcards_set_{setId}";
            if (_cache.TryGetValue(cacheKey, out List<Flashcard>? cachedCards))
            {
                return cachedCards ?? new List<Flashcard>();
            }

            var query = _firestore.Collection("flashcards")
                .WhereEqualTo("flashcard_set_id", setId)
                .OrderBy("order");

            var snapshot = await query.GetSnapshotAsync();
            var cards = snapshot.Documents.Select(doc => doc.ConvertTo<Flashcard>()).ToList();

            _cache.Set(cacheKey, cards, _cacheExpiry);
            return cards;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting flashcards for set: {SetId}", setId);
            throw;
        }
    }

    public async Task<FlashcardSet> CreateFlashcardSetAsync(FlashcardSet flashcardSet)
    {
        try
        {
            flashcardSet.Id = Guid.NewGuid().ToString();
            flashcardSet.CreatedAt = Timestamp.GetCurrentTimestamp();

            var docRef = _firestore.Collection("flashcard_sets").Document(flashcardSet.Id);
            await docRef.SetAsync(flashcardSet);

            // Clear cache
            _cache.Remove("flashcard_sets_all");
            _cache.Remove($"flashcard_sets_course_{flashcardSet.CourseId}");

            _logger.LogInformation("Flashcard set created with ID: {SetId}", flashcardSet.Id);
            return flashcardSet;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating flashcard set");
            throw;
        }
    }

    public async Task<Flashcard> CreateFlashcardAsync(Flashcard flashcard)
    {
        try
        {
            flashcard.Id = Guid.NewGuid().ToString();

            // Handle image upload if base64 data is provided
            if (!string.IsNullOrEmpty(flashcard.ImageBase64))
            {
                var fileName = $"flashcard_{flashcard.Id}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.jpg";
                var imageUrl = await _storageService.UploadBase64ImageAsync(flashcard.ImageBase64, fileName, "flashcards");
                flashcard.ImageUrl = imageUrl;
                flashcard.ImageBase64 = null; // Clear base64 data after upload
            }

            var docRef = _firestore.Collection("flashcards").Document(flashcard.Id);
            await docRef.SetAsync(flashcard);

            // Clear cache
            _cache.Remove($"flashcards_set_{flashcard.FlashcardSetId}");

            _logger.LogInformation("Flashcard created with ID: {CardId}", flashcard.Id);
            return flashcard;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating flashcard");
            throw;
        }
    }

    public async Task<FlashcardSet?> UpdateFlashcardSetAsync(string setId, CreateFlashcardSetDto setDto)
    {
        try
        {
            var docRef = _firestore.Collection("flashcard_sets").Document(setId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var updateData = new Dictionary<string, object>
            {
                ["title"] = setDto.Title,
                ["description"] = setDto.Description,
                ["course_id"] = setDto.CourseId,
                ["assigned_class_ids"] = setDto.AssignedClassIds ?? new List<string>()
            };

            await docRef.UpdateAsync(updateData);

            // Clear cache
            _cache.Remove("flashcard_sets_all");
            _cache.Remove($"flashcard_sets_course_{setDto.CourseId}");

            // Get updated set
            var updatedSnapshot = await docRef.GetSnapshotAsync();
            var updatedSet = updatedSnapshot.ConvertTo<FlashcardSet>();

            _logger.LogInformation("Flashcard set updated: {SetId}", setId);
            return updatedSet;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating flashcard set: {SetId}", setId);
            throw;
        }
    }

    public async Task AssignFlashcardSetAsync(string setId, List<string> classIds)
    {
        try
        {
            var docRef = _firestore.Collection("flashcard_sets").Document(setId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                throw new KeyNotFoundException($"Flashcard set with ID '{setId}' not found.");
            }

            var set = snapshot.ConvertTo<FlashcardSet>();

            var updateData = new Dictionary<string, object>
            {
                { "assigned_class_ids", classIds ?? new List<string>() }
            };

            await docRef.UpdateAsync(updateData);

            // Invalidate caches
            _cache.Remove("flashcard_sets_all");
            if (!string.IsNullOrEmpty(set.CourseId))
            {
                _cache.Remove($"flashcard_sets_course_{set.CourseId}");
            }

            _logger.LogInformation("Assigned flashcard set {SetId} to classes: {ClassIds}", setId, string.Join(", ", classIds ?? new List<string>()));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning flashcard set {SetId}", setId);
            throw;
        }
    }

    public async Task<bool> DeleteFlashcardSetAsync(string setId)
    {
        try
        {
            var docRef = _firestore.Collection("flashcard_sets").Document(setId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return false;
            }

            // Get the course ID for cache clearing
            var set = snapshot.ConvertTo<FlashcardSet>();

            // Delete all flashcards in this set first
            var flashcardsQuery = _firestore.Collection("flashcards")
                .WhereEqualTo("flashcard_set_id", setId);
            var flashcardsSnapshot = await flashcardsQuery.GetSnapshotAsync();

            var batch = _firestore.StartBatch();
            foreach (var flashcardDoc in flashcardsSnapshot.Documents)
            {
                batch.Delete(flashcardDoc.Reference);
            }

            // Delete the set itself
            batch.Delete(docRef);
            await batch.CommitAsync();

            // Clear cache
            _cache.Remove("flashcard_sets_all");
            _cache.Remove($"flashcard_sets_course_{set.CourseId}");
            _cache.Remove($"flashcards_set_{setId}");

            _logger.LogInformation("Flashcard set deleted: {SetId}", setId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting flashcard set: {SetId}", setId);
            throw;
        }
    }

    public async Task<Flashcard?> UpdateFlashcardAsync(string cardId, CreateFlashcardDto cardDto)
    {
        try
        {
            var docRef = _firestore.Collection("flashcards").Document(cardId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var existingCard = snapshot.ConvertTo<Flashcard>();

            var imageUrl = cardDto.ImageUrl ?? "";

            // Handle image upload if base64 data is provided
            if (!string.IsNullOrEmpty(cardDto.ImageBase64))
            {
                var fileName = $"flashcard_{cardId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.jpg";
                imageUrl = await _storageService.UploadBase64ImageAsync(cardDto.ImageBase64, fileName, "flashcards");
            }

            var updateData = new Dictionary<string, object>
            {
                ["front_text"] = cardDto.FrontText,
                ["back_text"] = cardDto.BackText,
                ["example_sentence"] = cardDto.ExampleSentence ?? "",
                ["image_url"] = imageUrl,
                ["image_base64"] = "", // Clear base64 data after upload
                ["order"] = cardDto.Order
            };

            await docRef.UpdateAsync(updateData);

            // Clear cache
            _cache.Remove($"flashcards_set_{existingCard.FlashcardSetId}");

            // Get updated card
            var updatedSnapshot = await docRef.GetSnapshotAsync();
            var updatedCard = updatedSnapshot.ConvertTo<Flashcard>();

            _logger.LogInformation("Flashcard updated: {CardId}", cardId);
            return updatedCard;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating flashcard: {CardId}", cardId);
            throw;
        }
    }

    public async Task<bool> DeleteFlashcardAsync(string cardId)
    {
        try
        {
            var docRef = _firestore.Collection("flashcards").Document(cardId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return false;
            }

            var card = snapshot.ConvertTo<Flashcard>();
            await docRef.DeleteAsync();

            // Clear cache
            _cache.Remove($"flashcards_set_{card.FlashcardSetId}");

            _logger.LogInformation("Flashcard deleted: {CardId}", cardId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting flashcard: {CardId}", cardId);
            throw;
        }
    }

    public async Task ReorderFlashcardsAsync(string setId, List<FlashcardOrderDto> cards)
    {
        try
        {
            var batch = _firestore.StartBatch();

            foreach (var cardOrder in cards)
            {
                var docRef = _firestore.Collection("flashcards").Document(cardOrder.Id);
                batch.Update(docRef, "order", cardOrder.Order);
            }

            await batch.CommitAsync();

            // Clear cache
            _cache.Remove($"flashcards_set_{setId}");

            _logger.LogInformation("Flashcards reordered for set: {SetId}", setId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering flashcards for set: {SetId}", setId);
            throw;
        }
    }
    public async Task<List<Exercise>> GetExercisesByCourseAsync(string courseId)
    {
        try
        {
            var cacheKey = $"exercises_course_{courseId}";
            if (_cache.TryGetValue(cacheKey, out List<Exercise>? cachedExercises))
            {
                return cachedExercises ?? new List<Exercise>();
            }

            var query = _firestore.Collection("exercises")
                .WhereEqualTo("course_id", courseId)
                .WhereEqualTo("is_active", true);

            var snapshot = await query.GetSnapshotAsync();
            var exercises = snapshot.Documents.Select(doc => doc.ConvertTo<Exercise>()).ToList();

            _cache.Set(cacheKey, exercises, _cacheExpiry);
            return exercises;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting exercises for course: {CourseId}", courseId);
            throw;
        }
    }

    public async Task<Exercise?> GetExerciseByIdAsync(string exerciseId)
    {
        try
        {
            var cacheKey = $"exercise_{exerciseId}";
            if (_cache.TryGetValue(cacheKey, out Exercise? cachedExercise))
            {
                return cachedExercise;
            }

            var docRef = _firestore.Collection("exercises").Document(exerciseId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var exercise = snapshot.ConvertTo<Exercise>();
            _cache.Set(cacheKey, exercise, _cacheExpiry);

            return exercise;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting exercise by ID: {ExerciseId}", exerciseId);
            throw;
        }
    }

    public Task<Exercise> CreateExerciseAsync(Exercise exercise) => throw new NotImplementedException();
    public Task<List<Question>> GetQuestionsAsync() => throw new NotImplementedException();
    public Task<List<Question>> GetQuestionsByCourseAsync(string courseId) => throw new NotImplementedException();
    public Task<Question> CreateQuestionAsync(Question question) => throw new NotImplementedException();
    public Task<Question> UpdateQuestionAsync(string questionId, Question question) => throw new NotImplementedException();
    public Task<LearningProgress?> GetLearningProgressAsync(string userId, string courseId) => throw new NotImplementedException();
    public Task UpdateLearningProgressAsync(string userId, LearningProgress progress) => throw new NotImplementedException();
    public async Task UpdateFlashcardProgressAsync(FlashcardProgressDto progress)
    {
        try
        {
            var docRef = _firestore.Collection("flashcard_progress")
                .Document($"{progress.UserId}_{progress.SetId}");

            var progressData = new
            {
                user_id = progress.UserId,
                set_id = progress.SetId,
                course_id = progress.CourseId,
                completion_percentage = progress.CompletionPercentage,
                learned_card_ids = progress.LearnedCardIds,
                time_spent = progress.TimeSpent,
                last_updated = Timestamp.GetCurrentTimestamp()
            };

            await docRef.SetAsync(progressData, SetOptions.MergeAll);

            // Clear cache
            _cache.Remove($"flashcard_progress_{progress.UserId}_{progress.SetId}");

            _logger.LogInformation("Flashcard progress updated for user {UserId}, set {SetId}",
                progress.UserId, progress.SetId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating flashcard progress");
            throw;
        }
    }

    public async Task<FlashcardProgressResponseDto?> GetFlashcardProgressAsync(string userId, string setId)
    {
        try
        {
            var cacheKey = $"flashcard_progress_{userId}_{setId}";
            if (_cache.TryGetValue(cacheKey, out FlashcardProgressResponseDto? cachedProgress))
            {
                return cachedProgress;
            }

            var docRef = _firestore.Collection("flashcard_progress")
                .Document($"{userId}_{setId}");

            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var data = snapshot.ToDictionary();
            var progress = new FlashcardProgressResponseDto
            {
                UserId = data.GetValueOrDefault("user_id", "").ToString() ?? "",
                SetId = data.GetValueOrDefault("set_id", "").ToString() ?? "",
                CourseId = data.GetValueOrDefault("course_id", "").ToString() ?? "",
                CompletionPercentage = Convert.ToInt32(data.GetValueOrDefault("completion_percentage", 0)),
                LearnedCardIds = ((List<object>?)data.GetValueOrDefault("learned_card_ids"))?.Cast<string>().ToList() ?? new List<string>(),
                TimeSpent = Convert.ToInt32(data.GetValueOrDefault("time_spent", 0)),
                LastUpdated = ((Timestamp?)data.GetValueOrDefault("last_updated"))?.ToDateTime() ?? DateTime.UtcNow
            };

            _cache.Set(cacheKey, progress, _cacheExpiry);
            return progress;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting flashcard progress for user {UserId}, set {SetId}", userId, setId);
            throw;
        }
    }
    public async Task UpdateLearningHistoryAsync(string userId, LearningActivity activity)
    {
        try
        {
            var docRef = _firestore.Collection("learning_activities").Document();
            activity.UserId = userId;
            await docRef.SetAsync(activity);
            _logger.LogInformation("Recorded learning activity for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording learning activity for user {UserId}", userId);
            throw;
        }
    }
    public async Task<List<LearningActivity>> GetLearningActivitiesAsync(string userId, string setId)
    {
        try
        {
            var query = _firestore.Collection("learning_activities")
                .WhereEqualTo("UserId", userId)
                .WhereEqualTo("FlashcardSetId", setId)
                .OrderByDescending("CompletedAt");

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<LearningActivity>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting learning activities for user {UserId} and set {SetId}", userId, setId);
            throw;
        }
    }

    public async Task<List<FlashcardSet>> GetFlashcardSetsForStudentAsync(string studentId, string courseId)
    {
        try
        {
            var cacheKey = $"flashcard_sets_student_{studentId}_course_{courseId}";
            if (_cache.TryGetValue(cacheKey, out List<FlashcardSet>? cachedSets))
            {
                return cachedSets ?? new List<FlashcardSet>();
            }

            var student = await GetUserByIdAsync(studentId);
            if (student == null || student.ClassIds == null || !student.ClassIds.Any())
            {
                return new List<FlashcardSet>(); // Student not found or not assigned to any class
            }

            // Assuming a student belongs to one primary class for flashcard assignments
            // Or we can iterate through all classes if multiple assignments are possible
            var studentClassId = student.ClassIds.FirstOrDefault();
            if (string.IsNullOrEmpty(studentClassId))
            {
                return new List<FlashcardSet>();
            }

            var query = _firestore.Collection("flashcard_sets")
                .WhereEqualTo("course_id", courseId)
                .WhereArrayContains("assigned_class_ids", studentClassId) // Filter by assigned class
                .WhereEqualTo("is_active", true);

            var snapshot = await query.GetSnapshotAsync();
            var sets = snapshot.Documents.Select(doc => doc.ConvertTo<FlashcardSet>()).ToList();

            _cache.Set(cacheKey, sets, _cacheExpiry);
            return sets;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting flashcard sets for student {StudentId}, course {CourseId}", studentId, courseId);
            throw;
        }
    }
    public async Task<List<Video>> GetVideosByCourseAsync(string courseId)
    {
        try
        {
            var cacheKey = $"videos_course_{courseId}";
            if (_cache.TryGetValue(cacheKey, out List<Video>? cachedVideos))
            {
                return cachedVideos ?? new List<Video>();
            }

            var query = _firestore.Collection("videos")
                .WhereEqualTo("course_id", courseId)
                .WhereEqualTo("is_active", true);

            var snapshot = await query.GetSnapshotAsync();
            var videos = snapshot.Documents.Select(doc => doc.ConvertTo<Video>()).ToList();

            _cache.Set(cacheKey, videos, _cacheExpiry);
            return videos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting videos for course: {CourseId}", courseId);
            throw;
        }
    }

    public async Task<Video?> GetVideoByIdAsync(string videoId)
    {
        try
        {
            var cacheKey = $"video_{videoId}";
            if (_cache.TryGetValue(cacheKey, out Video? cachedVideo))
            {
                return cachedVideo;
            }

            var docRef = _firestore.Collection("videos").Document(videoId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var video = snapshot.ConvertTo<Video>();
            _cache.Set(cacheKey, video, _cacheExpiry);

            return video;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting video by ID: {VideoId}", videoId);
            throw;
        }
    }

    public async Task<List<Video>> GetAllVideosAsync()
    {
        try
        {
            const string cacheKey = "videos_all";
            if (_cache.TryGetValue(cacheKey, out List<Video>? cachedVideos))
            {
                return cachedVideos ?? new List<Video>();
            }

            var snapshot = await _firestore.Collection("videos").GetSnapshotAsync();
            var videos = snapshot.Documents.Select(doc => doc.ConvertTo<Video>()).ToList();

            _cache.Set(cacheKey, videos, _cacheExpiry);
            return videos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all videos");
            throw;
        }
    }

    public async Task<Video> AddVideoAsync(Video video)
    {
        try
        {
            video.Id = Guid.NewGuid().ToString();
            video.CreatedAt = Timestamp.GetCurrentTimestamp();
            video.IsActive = true; // Default to active

            var docRef = _firestore.Collection("videos").Document(video.Id);
            await docRef.SetAsync(video);

            // Clear cache
            _cache.Remove($"videos_course_{video.CourseId}");
            _cache.Remove("videos_all");

            _logger.LogInformation("Video created with ID: {VideoId}", video.Id);
            return video;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating video");
            throw;
        }
    }

    public async Task<Video> UpdateVideoAsync(string videoId, Video video)
    {
        try
        {
            video.Id = videoId;
            var docRef = _firestore.Collection("videos").Document(videoId);
            await docRef.SetAsync(video, SetOptions.MergeAll);

            // Clear cache
            _cache.Remove($"video_{videoId}");
            _cache.Remove($"videos_course_{video.CourseId}");
            _cache.Remove("videos_all");

            _logger.LogInformation("Video updated: {VideoId}", videoId);
            return video;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating video: {VideoId}", videoId);
            throw;
        }
    }

    public async Task DeleteVideoAsync(string videoId)
    {
        try
        {
            var docRef = _firestore.Collection("videos").Document(videoId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                throw new KeyNotFoundException($"Video with ID '{videoId}' not found.");
            }

            var video = snapshot.ConvertTo<Video>(); // Get video to clear course-specific cache

            await docRef.DeleteAsync();

            // Clear cache
            _cache.Remove($"video_{videoId}");
            _cache.Remove($"videos_course_{video?.CourseId}");
            _cache.Remove("videos_all");

            _logger.LogInformation("Video deleted: {VideoId}", videoId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting video: {VideoId}", videoId);
            throw;
        }
    }

    public async Task AssignVideoToClassesAsync(string videoId, List<string> classIds)
    {
        try
        {
            var docRef = _firestore.Collection("videos").Document(videoId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                throw new KeyNotFoundException($"Video with ID '{videoId}' not found.");
            }

            var updateData = new Dictionary<string, object>
            {
                { "assigned_class_ids", classIds ?? new List<string>() }
            };

            await docRef.UpdateAsync(updateData);

            // Invalidate caches
            _cache.Remove($"video_{videoId}");
            var video = snapshot.ConvertTo<Video>();
            if (!string.IsNullOrEmpty(video.CourseId))
            {
                _cache.Remove($"videos_course_{video.CourseId}");
            }
            _cache.Remove("videos_all");

            _logger.LogInformation("Assigned video {VideoId} to classes: {ClassIds}", videoId, string.Join(", ", classIds ?? new List<string>()));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning video {VideoId}", videoId);
            throw;
        }
    }

    public async Task UpdateVideoProgressAsync(string userId, string videoId, bool completed)
    {
        try
        {
            // This is a simplified progress update. A more detailed one might include watch time, etc.
            var progressRef = _firestore.Collection("video_progress").Document($"{userId}_{videoId}");

            var progressData = new Dictionary<string, object>
            {
                { "user_id", userId },
                { "video_id", videoId },
                { "completed", completed },
                { "last_watched_at", Timestamp.GetCurrentTimestamp() }
            };

            await progressRef.SetAsync(progressData, SetOptions.MergeAll);

            if (completed)
            {
                var activity = new LearningActivity
                {
                    Type = "video",
                    VideoId = videoId,
                    CompletedAt = Timestamp.GetCurrentTimestamp(),
                };
                await UpdateLearningHistoryAsync(userId, activity);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating video progress for user {UserId}, video {VideoId}", userId, videoId);
            throw;
        }
    }
    public async Task<List<LearningActivity>> GetVideoLearningHistoryAsync(string userId)
    {
        try
        {
            var query = _firestore.Collection("learning_activities")
                .WhereEqualTo("UserId", userId)
                .WhereEqualTo("Type", "video")
                .OrderByDescending("CompletedAt");

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<LearningActivity>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting video learning history for user {UserId}", userId);
            throw;
        }
    }

    public async Task<List<LearningActivity>> GetAllLearningActivitiesAsync(string userId)
    {
        try
        {
            var query = _firestore.Collection("learning_activities")
                .WhereEqualTo("user_id", userId);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<LearningActivity>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all learning activities for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> GetCompletedFlashcardSetsCountAsync(string userId)
    {
        try
        {
            var cacheKey = $"completed_flashcard_sets_count_{userId}";
            if (_cache.TryGetValue(cacheKey, out int count))
            {
                return count;
            }

            var query = _firestore.Collection("flashcard_progress")
                .WhereEqualTo("user_id", userId)
                .WhereEqualTo("completion_percentage", 100);

            var snapshot = await query.GetSnapshotAsync();
            _cache.Set(cacheKey, snapshot.Count, _cacheExpiry);
            return snapshot.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting completed flashcard sets count for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> GetCompletedLearningActivitiesCountAsync(string userId, string activityType)
    {
        try
        {
            var cacheKey = $"completed_activities_count_{userId}_{activityType}";
            if (_cache.TryGetValue(cacheKey, out int count))
            {
                return count;
            }

            var query = _firestore.Collection("learning_activities")
                .WhereEqualTo("user_id", userId)
                .WhereEqualTo("type", activityType);

            var snapshot = await query.GetSnapshotAsync();
            _cache.Set(cacheKey, snapshot.Count, _cacheExpiry);
            return snapshot.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting completed learning activities count for user {UserId}, type {ActivityType}", userId, activityType);
            throw;
        }
    }

    // Badge Management
    public async Task<List<Badge>> GetBadgesAsync()
    {
        try
        {
            const string cacheKey = "badges_all";
            if (_cache.TryGetValue(cacheKey, out List<Badge>? cachedBadges))
            {
                return cachedBadges ?? new List<Badge>();
            }

            var snapshot = await _firestore.Collection("badges").GetSnapshotAsync();
            var badges = snapshot.Documents.Select(doc => doc.ConvertTo<Badge>()).ToList();

            _cache.Set(cacheKey, badges, _cacheExpiry);
            return badges;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all badges");
            throw;
        }
    }

    public async Task<Badge?> GetBadgeByConditionKeyAsync(string conditionKey)
    {
        try
        {
            var cacheKey = $"badge_condition_{conditionKey}";
            if (_cache.TryGetValue(cacheKey, out Badge? cachedBadge))
            {
                return cachedBadge;
            }

            var query = _firestore.Collection("badges")
                .WhereEqualTo("condition_key", conditionKey)
                .WhereEqualTo("is_active", true);

            var snapshot = await query.GetSnapshotAsync();
            if (snapshot.Documents.Count == 0)
            {
                return null;
            }

            var badge = snapshot.Documents.First().ConvertTo<Badge>();
            _cache.Set(cacheKey, badge, _cacheExpiry);

            return badge;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting badge by condition key: {ConditionKey}", conditionKey);
            throw;
        }
    }

    public async Task<ExerciseResult> ProcessExerciseSubmissionAsync(ExerciseSubmissionDto submission)
    {

        try
        {
            var exercise = await GetExerciseByIdAsync(submission.ExerciseId);
            if (exercise == null)
            {
                throw new KeyNotFoundException($"Exercise with ID '{submission.ExerciseId}' not found.");
            }

            var result = new ExerciseResult
            {
                TotalQuestions = exercise.Questions.Count,
                QuestionResults = new List<QuestionResult>()
            };

            foreach (var answerDto in submission.Answers)
            {
                var question = exercise.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
                if (question == null) continue;

                bool isCorrect = string.Equals(answerDto.Answer, question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);
                if (isCorrect)
                {
                    result.CorrectAnswers++;
                }

                result.QuestionResults.Add(new QuestionResult
                {
                    QuestionId = question.Id,
                    UserAnswer = answerDto.Answer,
                    CorrectAnswer = question.CorrectAnswer,
                    IsCorrect = isCorrect,
                    Explanation = question.Explanation
                });
            }

            result.Score = result.TotalQuestions > 0 ? (double)result.CorrectAnswers / result.TotalQuestions * 100 : 0;

            // Record learning activity
            var activity = new LearningActivity
            {
                Type = "exercise",
                ExerciseId = submission.ExerciseId,
                Score = result.Score,
                CompletedAt = Timestamp.GetCurrentTimestamp(),
                TimeSpent = submission.TimeSpent
            };
            await UpdateLearningHistoryAsync(submission.UserId, activity);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing exercise submission for user {UserId}", submission.UserId);
            throw;
        }
    }

    // Analytics Methods
    public async Task<TeacherAnalyticsDto> GetTeacherAnalyticsAsync(string teacherId, string? courseId = null, string? setId = null)
    {
        try
        {
            var classes = await GetClassesByTeacherAsync(teacherId);
            var classAnalytics = new List<ClassAnalyticsDto>();

            foreach (var classEntity in classes)
            {
                var classAnalytic = await GetClassAnalyticsAsync(classEntity.Id, courseId, setId);
                classAnalytics.Add(classAnalytic);
            }

            var summary = new TeacherSummaryDto
            {
                TotalStudents = classAnalytics.Sum(c => c.TotalStudents),
                ActiveStudents = classAnalytics.Sum(c => c.ActiveStudents),
                AverageCompletion = classAnalytics.Count > 0 ? classAnalytics.Average(c => c.AverageCompletion) : 0,
                TotalTimeSpent = classAnalytics.Sum(c => c.TotalTimeSpent)
            };

            return new TeacherAnalyticsDto
            {
                Classes = classAnalytics,
                Summary = summary
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting teacher analytics for teacher {TeacherId}", teacherId);
            throw;
        }
    }

    public async Task<ClassAnalyticsDto> GetClassAnalyticsAsync(string classId, string? courseId = null, string? setId = null)
    {
        try
        {
            var classEntity = await GetClassByIdAsync(classId);
            if (classEntity == null)
            {
                throw new KeyNotFoundException($"Class with ID '{classId}' not found.");
            }

            var studentsProgress = new List<StudentProgressDto>();
            var activeStudents = 0;
            var totalTimeSpent = 0;
            var totalCompletion = 0.0;

            foreach (var studentId in classEntity.StudentIds)
            {
                var studentProgress = await GetStudentAnalyticsAsync(studentId, courseId, setId);
                studentsProgress.Add(studentProgress);

                if (studentProgress.LastActivity.HasValue &&
                    studentProgress.LastActivity.Value > DateTime.UtcNow.AddDays(-7))
                {
                    activeStudents++;
                }

                totalTimeSpent += studentProgress.TotalTimeSpent;
                totalCompletion += studentProgress.CompletionPercentage;
            }

            return new ClassAnalyticsDto
            {
                ClassId = classId,
                ClassName = classEntity.Name,
                TotalStudents = classEntity.StudentIds.Count,
                ActiveStudents = activeStudents,
                AverageCompletion = classEntity.StudentIds.Count > 0 ? totalCompletion / classEntity.StudentIds.Count : 0,
                TotalTimeSpent = totalTimeSpent,
                StudentsProgress = studentsProgress
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting class analytics for class {ClassId}", classId);
            throw;
        }
    }

    public async Task<StudentProgressDto> GetStudentAnalyticsAsync(string studentId, string? courseId = null, string? setId = null)
    {
        try
        {
            var user = await GetUserByIdAsync(studentId);
            if (user == null)
            {
                throw new KeyNotFoundException($"Student with ID '{studentId}' not found.");
            }

            FlashcardProgressResponseDto? progress = null;
            if (!string.IsNullOrEmpty(setId))
            {
                progress = await GetFlashcardProgressAsync(studentId, setId);
            }

            // Get all learning activities for the student
            var allActivities = await GetAllLearningActivitiesAsync(studentId);

            // Note: LearningActivity doesn't have CourseId, so we can't filter by course here
            // Course filtering would need to be done at a higher level if needed

            var lastActivity = allActivities.OrderByDescending(a => a.CompletedAt.ToDateTime()).FirstOrDefault()?.CompletedAt.ToDateTime();
            var totalTimeSpent = allActivities.Sum(a => a.TimeSpent);

            // Calculate completion percentage
            double completionPercentage = 0;
            if (progress != null)
            {
                completionPercentage = progress.CompletionPercentage;
            }
            else if (!string.IsNullOrEmpty(courseId))
            {
                // Calculate overall course completion
                var flashcardSets = await GetFlashcardSetsByCourseAsync(courseId);
                var completedSets = 0;

                foreach (var set in flashcardSets)
                {
                    var setProgress = await GetFlashcardProgressAsync(studentId, set.Id);
                    if (setProgress != null && setProgress.CompletionPercentage >= 100)
                    {
                        completedSets++;
                    }
                }

                completionPercentage = flashcardSets.Count > 0 ? (double)completedSets / flashcardSets.Count * 100 : 0;
            }

            return new StudentProgressDto
            {
                UserId = studentId,
                UserName = user.FullName,
                Email = user.Email,
                Progress = progress,
                LastActivity = lastActivity,
                TotalTimeSpent = totalTimeSpent,
                CompletionPercentage = completionPercentage,
                Streak = user.LearningStreakCount
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting student analytics for student {StudentId}", studentId);
            throw;
        }
    }


    // System Configuration Implementation
    public async Task<SystemSettings> GetSystemSettingsAsync()
    {
        try
        {
            var docRef = _firestore.Collection("system_config").Document("settings");
            var snapshot = await docRef.GetSnapshotAsync();

            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<SystemSettings>();
            }

            // Return default settings if not found
            return new SystemSettings();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system settings");
            throw;
        }
    }

    public async Task UpdateSystemSettingsAsync(SystemSettings settings)
    {
        try
        {
            var docRef = _firestore.Collection("system_config").Document("settings");
            await docRef.SetAsync(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating system settings");
            throw;
        }
    }

    public async Task<List<FeatureFlag>> GetFeatureFlagsAsync()
    {
        try
        {
            var query = _firestore.Collection("feature_flags");
            var snapshot = await query.GetSnapshotAsync();

            return snapshot.Documents.Select(doc => doc.ConvertTo<FeatureFlag>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting feature flags");
            throw;
        }
    }

    public async Task UpdateFeatureFlagsAsync(List<FeatureFlag> flags)
    {
        try
        {
            var batch = _firestore.StartBatch();

            foreach (var flag in flags)
            {
                var docRef = _firestore.Collection("feature_flags").Document(flag.Id);
                batch.Set(docRef, flag);
            }

            await batch.CommitAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating feature flags");
            throw;
        }
    }

    public async Task<MaintenanceMode> GetMaintenanceModeAsync()
    {
        try
        {
            var docRef = _firestore.Collection("system_config").Document("maintenance");
            var snapshot = await docRef.GetSnapshotAsync();

            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<MaintenanceMode>();
            }

            // Return default maintenance mode if not found
            return new MaintenanceMode { Enabled = false };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting maintenance mode");
            throw;
        }
    }

    public async Task UpdateMaintenanceModeAsync(MaintenanceMode maintenance)
    {
        try
        {
            var docRef = _firestore.Collection("system_config").Document("maintenance");
            await docRef.SetAsync(maintenance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating maintenance mode");
            throw;
        }
    }

    public async Task<List<SystemAnnouncement>> GetSystemAnnouncementsAsync()
    {
        try
        {
            var query = _firestore.Collection("system_announcements").OrderByDescending("created_at");
            var snapshot = await query.GetSnapshotAsync();

            return snapshot.Documents.Select(doc => doc.ConvertTo<SystemAnnouncement>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system announcements");
            throw;
        }
    }

    public async Task CreateSystemAnnouncementAsync(SystemAnnouncement announcement)
    {
        try
        {
            var docRef = _firestore.Collection("system_announcements").Document(announcement.Id);
            await docRef.SetAsync(announcement);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating system announcement");
            throw;
        }
    }

    public async Task UpdateSystemAnnouncementAsync(SystemAnnouncement announcement)
    {
        try
        {
            var docRef = _firestore.Collection("system_announcements").Document(announcement.Id);
            await docRef.SetAsync(announcement);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating system announcement");
            throw;
        }
    }

    public async Task DeleteSystemAnnouncementAsync(string id)
    {
        try
        {
            var docRef = _firestore.Collection("system_announcements").Document(id);
            await docRef.DeleteAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting system announcement");
            throw;
        }
    }

    public async Task CreateSystemBackupAsync(SystemBackup backup)
    {
        try
        {
            var docRef = _firestore.Collection("system_backups").Document(backup.Id);
            await docRef.SetAsync(backup);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating system backup");
            throw;
        }
    }

    public async Task<List<SystemBackup>> GetSystemBackupsAsync()
    {
        try
        {
            var query = _firestore.Collection("system_backups").OrderByDescending("created_at");
            var snapshot = await query.GetSnapshotAsync();

            return snapshot.Documents.Select(doc => doc.ConvertTo<SystemBackup>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system backups");
            throw;
        }
    }

    public async Task<bool> TestConnectionAsync()
    {
        try
        {
            // Simple test to check if Firebase connection is working
            var testDoc = _firestore.Collection("_test").Document("connection");
            await testDoc.GetSnapshotAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Firebase connection test failed");
            return false;
        }
    }
}
