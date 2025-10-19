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
            _logger.LogInformation($"Loaded course: {course.Name} (ID: {course.Id}, CreatedAt: {course.CreatedAt})");
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

    public async Task DeleteCourseAsync(string courseId)
    {
        try
        {
            var docRef = _firestore.Collection("courses").Document(courseId);
            await docRef.DeleteAsync();

            // Clear cache
            _cache.Remove($"course_{courseId}");
            _cache.Remove("courses_all");

            _logger.LogInformation("Course deleted: {CourseId}", courseId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting course: {CourseId}", courseId);
            throw;
        }
    }

    public async Task<List<Course>> GetAllCoursesAsync()
    {
        return await GetCoursesAsync();
    }

    public async Task AssignClassesToCourseAsync(string courseId, List<string> classIds)
    {
        try
        {
            var docRef = _firestore.Collection("courses").Document(courseId);
            var updateData = new Dictionary<string, object>
            {
                { "assigned_class_ids", classIds ?? new List<string>() }
            };

            await docRef.UpdateAsync(updateData);

            // Clear cache
            _cache.Remove($"course_{courseId}");
            _cache.Remove("courses_all");

            _logger.LogInformation("Assigned classes to course {CourseId}: {ClassIds}", courseId, string.Join(", ", classIds ?? new List<string>()));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning classes to course {CourseId}", courseId);
            throw;
        }
    }

    public async Task<List<Class>> GetCourseClassesAsync(string courseId)
    {
        try
        {
            var cacheKey = $"course_classes_{courseId}";
            if (_cache.TryGetValue(cacheKey, out List<Class>? cachedClasses))
            {
                return cachedClasses ?? new List<Class>();
            }

            var query = _firestore.Collection("classes")
                .WhereEqualTo("course_id", courseId);

            var snapshot = await query.GetSnapshotAsync();
            var classes = snapshot.Documents.Select(doc => doc.ConvertTo<Class>()).ToList();

            _logger.LogInformation($"Found {classes.Count} classes for course {courseId}");
            foreach (var cls in classes)
            {
                _logger.LogInformation($"Class: {cls.Name} (ID: {cls.Id}, CourseId: {cls.CourseId})");
            }

            _cache.Set(cacheKey, classes, _cacheExpiry);
            return classes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting classes for course: {CourseId}", courseId);
            throw;
        }
    }

    public async Task<AnalyticsSummaryDto> GetCourseStatisticsAsync(string courseId)
    {
        try
        {
            var course = await GetCourseByIdAsync(courseId);
            if (course == null)
            {
                throw new KeyNotFoundException($"Course with ID '{courseId}' not found.");
            }

            var classes = await GetCourseClassesAsync(courseId);
            var totalStudents = classes.Sum(c => c.StudentIds.Count);

            // Get exercises and flashcards for this course
            var exercises = await GetExercisesByCourseAsync(courseId);
            var flashcardSets = await GetFlashcardSetsByCourseAsync(courseId);

            return new AnalyticsSummaryDto
            {
                TotalUsers = totalStudents,
                TotalCourses = 1,
                TotalClasses = classes.Count,
                TotalVideos = 0, // Would need to implement video counting
                TotalExercises = exercises.Count,
                TotalFlashcardSets = flashcardSets.Count,
                AverageExerciseScore = 0, // Would need to calculate from submissions
                ActivityCountsByType = new Dictionary<string, int>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting course statistics for course {CourseId}", courseId);
            throw;
        }
    }

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
                .WhereEqualTo("is_active", true);

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

    public async Task<List<Class>> GetClassesAsync()
    {
        try
        {
            const string cacheKey = "classes_all";
            if (_cache.TryGetValue(cacheKey, out List<Class>? cachedClasses))
            {
                return cachedClasses ?? new List<Class>();
            }

            var snapshot = await _firestore.Collection("classes").GetSnapshotAsync();
            var classes = snapshot.Documents.Select(doc => doc.ConvertTo<Class>()).ToList();

            _cache.Set(cacheKey, classes, _cacheExpiry);
            return classes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all classes");
            throw;
        }
    }

    public async Task<List<Class>> GetAllClassesAsync()
    {
        return await GetClassesAsync();
    }

    public async Task<Class> CreateClassAsync(Class classEntity)
    {
        try
        {
            classEntity.Id = Guid.NewGuid().ToString();
            classEntity.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            classEntity.IsActive = true;

            var docRef = _firestore.Collection("classes").Document(classEntity.Id);
            await docRef.SetAsync(classEntity);

            // Clear cache
            _cache.Remove("classes_all");

            _logger.LogInformation("Class created with ID: {ClassId}", classEntity.Id);
            return classEntity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating class");
            throw;
        }
    }

    public async Task<Class> UpdateClassAsync(string classId, Class classEntity)
    {
        try
        {
            classEntity.Id = classId;
            var docRef = _firestore.Collection("classes").Document(classId);
            await docRef.SetAsync(classEntity, SetOptions.MergeAll);

            // Clear cache
            _cache.Remove($"class_{classId}");
            _cache.Remove("classes_all");

            _logger.LogInformation("Class updated: {ClassId}", classId);
            return classEntity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating class: {ClassId}", classId);
            throw;
        }
    }

    public async Task DeleteClassAsync(string classId)
    {
        try
        {
            var docRef = _firestore.Collection("classes").Document(classId);
            await docRef.DeleteAsync();

            // Clear cache
            _cache.Remove($"class_{classId}");
            _cache.Remove("classes_all");

            _logger.LogInformation("Class deleted: {ClassId}", classId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting class: {ClassId}", classId);
            throw;
        }
    }

    public async Task AssignTeacherToClassAsync(string classId, string teacherId)
    {
        try
        {
            var docRef = _firestore.Collection("classes").Document(classId);
            var updateData = new Dictionary<string, object>
            {
                { "teacher_id", teacherId }
            };

            await docRef.UpdateAsync(updateData);

            // Clear cache
            _cache.Remove($"class_{classId}");
            _cache.Remove("classes_all");

            _logger.LogInformation("Assigned teacher {TeacherId} to class {ClassId}", teacherId, classId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning teacher to class {ClassId}", classId);
            throw;
        }
    }

    public async Task AssignStudentsToClassAsync(string classId, List<string> studentIds)
    {
        try
        {
            var docRef = _firestore.Collection("classes").Document(classId);
            var updateData = new Dictionary<string, object>
            {
                { "student_ids", studentIds ?? new List<string>() }
            };

            await docRef.UpdateAsync(updateData);

            // Clear cache
            _cache.Remove($"class_{classId}");
            _cache.Remove("classes_all");

            _logger.LogInformation("Assigned students to class {ClassId}: {StudentIds}", classId, string.Join(", ", studentIds ?? new List<string>()));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning students to class {ClassId}", classId);
            throw;
        }
    }

    public async Task RemoveStudentFromClassAsync(string classId, string studentId)
    {
        try
        {
            var classEntity = await GetClassByIdAsync(classId);
            if (classEntity == null)
            {
                throw new KeyNotFoundException($"Class with ID '{classId}' not found.");
            }

            classEntity.StudentIds.Remove(studentId);
            await UpdateClassAsync(classId, classEntity);

            _logger.LogInformation("Removed student {StudentId} from class {ClassId}", studentId, classId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing student from class {ClassId}", classId);
            throw;
        }
    }

    public async Task<List<User>> GetClassStudentsAsync(string classId)
    {
        try
        {
            var classEntity = await GetClassByIdAsync(classId);
            if (classEntity == null || classEntity.StudentIds == null)
            {
                return new List<User>();
            }

            var students = new List<User>();
            foreach (var studentId in classEntity.StudentIds)
            {
                var student = await GetUserByIdAsync(studentId);
                if (student != null)
                {
                    students.Add(student);
                }
            }

            return students;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting students for class {ClassId}", classId);
            throw;
        }
    }

    public async Task<ClassAnalyticsDto> GetClassStatisticsAsync(string classId)
    {
        try
        {
            var classEntity = await GetClassByIdAsync(classId);
            if (classEntity == null)
            {
                throw new KeyNotFoundException($"Class with ID '{classId}' not found.");
            }

            var students = await GetClassStudentsAsync(classId);
            var activeStudents = students.Count(s => s.IsActive);

            // Calculate average completion and time spent
            // This is a simplified implementation - would need more detailed analytics
            var averageCompletion = 0.0;
            var totalTimeSpent = 0;

            return new ClassAnalyticsDto
            {
                ClassId = classId,
                ClassName = classEntity.Name,
                TotalStudents = students.Count,
                ActiveStudents = activeStudents,
                AverageCompletion = averageCompletion,
                TotalTimeSpent = totalTimeSpent,
                StudentsProgress = new List<StudentProgressDto>() // Would need to implement detailed progress tracking
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting class statistics for class {ClassId}", classId);
            throw;
        }
    }
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
                .WhereEqualTo("course_id", courseId);

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

            var query = _firestore.Collection("flashcard_sets").Document(setId).Collection("cards").OrderBy("order");

            var snapshot = await query.GetSnapshotAsync();
            var cards = snapshot.Documents.Select(doc => doc.ConvertTo<Flashcard>()).ToList();

            // Ensure we always return a list, even if empty
            if (cards == null)
            {
                cards = new List<Flashcard>();
            }

            _cache.Set(cacheKey, cards, _cacheExpiry);
            return cards;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting flashcards for set: {SetId}", setId);
            // Return empty list instead of throwing exception
            return new List<Flashcard>();
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

            // Handle image - keep base64 data for now (like Android app)
            if (!string.IsNullOrEmpty(flashcard.ImageBase64))
            {
                // Keep the base64 data in the document (like Android app does)
                // Don't upload to storage for now
                flashcard.ImageUrl = ""; // Clear URL when using base64
            }

            var docRef = _firestore.Collection("flashcard_sets").Document(flashcard.FlashcardSetId).Collection("cards").Document(flashcard.Id);
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
                ["course_id"] = setDto.CourseId
                // ["assigned_class_ids"] = setDto.AssignedClassIds ?? new List<string>() // Removed - using course-based access instead
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

    // AssignFlashcardSetAsync method removed - using course-based access instead
    /*
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
    */

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

            // Delete all flashcards in this set first (using new subcollection structure)
            var flashcardsQuery = _firestore.Collection("flashcard_sets").Document(setId).Collection("cards");
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
            // We need to find which set this card belongs to
            // Since we don't have the setId, we'll need to search through all sets
            // This is not ideal but necessary with the current structure
            var setsQuery = _firestore.Collection("flashcard_sets");
            var setsSnapshot = await setsQuery.GetSnapshotAsync();

            DocumentReference? docRef = null;
            foreach (var setDoc in setsSnapshot.Documents)
            {
                var cardDoc = _firestore.Collection("flashcard_sets").Document(setDoc.Id).Collection("cards").Document(cardId);
                var cardSnapshot = await cardDoc.GetSnapshotAsync();
                if (cardSnapshot.Exists)
                {
                    docRef = cardDoc;
                    break;
                }
            }

            if (docRef == null)
            {
                return null;
            }
            var snapshot = await docRef.GetSnapshotAsync();
            var existingCard = snapshot.ConvertTo<Flashcard>();

            var imageUrl = cardDto.ImageUrl ?? "";

            // Handle image - keep base64 data for now (like Android app)
            if (!string.IsNullOrEmpty(cardDto.ImageBase64))
            {
                // Keep the base64 data in the document (like Android app does)
                // Don't upload to storage for now
                imageUrl = ""; // Clear URL when using base64
            }

            var updateData = new Dictionary<string, object>
            {
                ["front_text"] = cardDto.FrontText,
                ["back_text"] = cardDto.BackText,
                ["example_sentence"] = cardDto.ExampleSentence ?? "",
                ["image_url"] = imageUrl,
                ["image_base64"] = cardDto.ImageBase64 ?? "", // Keep base64 data
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
            // We need to find which set this card belongs to
            var setsQuery = _firestore.Collection("flashcard_sets");
            var setsSnapshot = await setsQuery.GetSnapshotAsync();

            DocumentReference? docRef = null;
            string? setId = null;
            foreach (var setDoc in setsSnapshot.Documents)
            {
                var cardDoc = _firestore.Collection("flashcard_sets").Document(setDoc.Id).Collection("cards").Document(cardId);
                var cardSnapshot = await cardDoc.GetSnapshotAsync();
                if (cardSnapshot.Exists)
                {
                    docRef = cardDoc;
                    setId = setDoc.Id;
                    break;
                }
            }

            if (docRef == null)
            {
                return false;
            }

            await docRef.DeleteAsync();

            // Clear cache
            if (!string.IsNullOrEmpty(setId))
            {
                _cache.Remove($"flashcards_set_{setId}");
            }

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
    public async Task<List<Exercise>> GetAllExercisesAsync()
    {
        try
        {
            const string cacheKey = "exercises_all";
            if (_cache.TryGetValue(cacheKey, out List<Exercise>? cachedExercises))
            {
                return cachedExercises ?? new List<Exercise>();
            }

            var snapshot = await _firestore.Collection("exercises").GetSnapshotAsync();
            var exercises = snapshot.Documents.Select(doc => doc.ConvertTo<Exercise>()).ToList();

            _cache.Set(cacheKey, exercises, _cacheExpiry);
            return exercises;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all exercises");
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
                .WhereEqualTo("course_id", courseId);

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

    public async Task<Exercise> CreateExerciseAsync(Exercise exercise)
    {
        try
        {
            exercise.Id = Guid.NewGuid().ToString();
            exercise.CreatedAt = Timestamp.GetCurrentTimestamp();

            var docRef = _firestore.Collection("exercises").Document(exercise.Id);
            await docRef.SetAsync(exercise);

            // Clear cache
            _cache.Remove($"exercises_course_{exercise.CourseId}");

            _logger.LogInformation("Exercise created with ID: {ExerciseId}", exercise.Id);
            return exercise;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating exercise");
            throw;
        }
    }

    public async Task<Exercise> UpdateExerciseAsync(string exerciseId, Exercise exercise)
    {
        try
        {
            exercise.Id = exerciseId;

            var docRef = _firestore.Collection("exercises").Document(exerciseId);
            await docRef.SetAsync(exercise, SetOptions.MergeAll);

            // Clear cache
            _cache.Remove($"exercise_{exerciseId}");
            _cache.Remove($"exercises_course_{exercise.CourseId}");

            _logger.LogInformation("Exercise updated: {ExerciseId}", exerciseId);
            return exercise;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating exercise: {ExerciseId}", exerciseId);
            throw;
        }
    }

    public async Task DeleteExerciseAsync(string exerciseId)
    {
        try
        {
            var exercise = await GetExerciseByIdAsync(exerciseId);
            if (exercise == null)
            {
                throw new KeyNotFoundException($"Exercise with ID '{exerciseId}' not found.");
            }

            var docRef = _firestore.Collection("exercises").Document(exerciseId);
            await docRef.DeleteAsync();

            // Clear cache
            _cache.Remove($"exercise_{exerciseId}");
            _cache.Remove($"exercises_course_{exercise?.CourseId}");

            _logger.LogInformation("Exercise deleted: {ExerciseId}", exerciseId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting exercise: {ExerciseId}", exerciseId);
            throw;
        }
    }

    public async Task<Exercise> DuplicateExerciseAsync(string exerciseId)
    {
        try
        {
            var originalExercise = await GetExerciseByIdAsync(exerciseId);
            if (originalExercise == null)
            {
                throw new KeyNotFoundException($"Exercise with ID '{exerciseId}' not found.");
            }

            var duplicatedExercise = new Exercise
            {
                Id = Guid.NewGuid().ToString(),
                Title = $"{originalExercise.Title} (Copy)",
                Type = originalExercise.Type,
                CourseId = originalExercise.CourseId,
                Questions = originalExercise.Questions.Select(q => new Question
                {
                    Id = Guid.NewGuid().ToString(),
                    Content = q.Content,
                    Type = q.Type,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer,
                    Explanation = q.Explanation,
                    Difficulty = q.Difficulty,
                    CourseId = q.CourseId,
                    Tags = q.Tags,
                    CreatedBy = q.CreatedBy,
                    CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                    IsActive = q.IsActive
                }).ToList(),
                TimeLimit = originalExercise.TimeLimit,
                Difficulty = originalExercise.Difficulty,
                CreatedBy = originalExercise.CreatedBy,
                CreatedAt = Timestamp.GetCurrentTimestamp(),
                IsActive = originalExercise.IsActive
            };

            return await CreateExerciseAsync(duplicatedExercise);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating exercise: {ExerciseId}", exerciseId);
            throw;
        }
    }

    public async Task<List<Question>> GetQuestionsAsync()
    {
        try
        {
            const string cacheKey = "questions_all";
            if (_cache.TryGetValue(cacheKey, out List<Question>? cachedQuestions))
            {
                return cachedQuestions ?? new List<Question>();
            }

            var snapshot = await _firestore.Collection("questions").GetSnapshotAsync();
            var questions = snapshot.Documents.Select(doc => doc.ConvertTo<Question>()).ToList();

            _cache.Set(cacheKey, questions, _cacheExpiry);
            return questions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all questions");
            throw;
        }
    }

    public async Task<List<Question>> GetQuestionsByCourseAsync(string courseId)
    {
        try
        {
            var cacheKey = $"questions_course_{courseId}";
            if (_cache.TryGetValue(cacheKey, out List<Question>? cachedQuestions))
            {
                return cachedQuestions ?? new List<Question>();
            }

            var questionsQuery = _firestore.Collection("questions")
                .WhereEqualTo("course_id", courseId)
                .WhereEqualTo("is_active", true);
            var questionsSnapshot = await questionsQuery.GetSnapshotAsync();
            var questions = questionsSnapshot.Documents.Select(doc => doc.ConvertTo<Question>()).ToList();

            var exercisesQuery = _firestore.Collection("exercises")
                .WhereEqualTo("course_id", courseId);
            var exercisesSnapshot = await exercisesQuery.GetSnapshotAsync();
            var exercises = exercisesSnapshot.Documents.Select(doc => doc.ConvertTo<Exercise>()).ToList();

            foreach (var exercise in exercises)
            {
                questions.AddRange(exercise.Questions);
            }

            _cache.Set(cacheKey, questions, _cacheExpiry);
            return questions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting questions for course: {CourseId}", courseId);
            throw;
        }
    }

    public async Task<Question> CreateQuestionAsync(Question question)
    {
        try
        {
            question.Id = Guid.NewGuid().ToString();

            var docRef = _firestore.Collection("questions").Document(question.Id);
            await docRef.SetAsync(question);

            // Clear cache
            _cache.Remove("questions_all");
            _cache.Remove($"questions_course_{question.CourseId}");

            _logger.LogInformation("Question created with ID: {QuestionId}", question.Id);
            return question;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating question");
            throw;
        }
    }

    public async Task<Question> UpdateQuestionAsync(string questionId, Question question)
    {
        try
        {
            question.Id = questionId;

            var docRef = _firestore.Collection("questions").Document(questionId);
            await docRef.SetAsync(question, SetOptions.MergeAll);

            // Clear cache
            _cache.Remove($"questions_course_{question.CourseId}");
            _cache.Remove("questions_all");

            _logger.LogInformation("Question updated: {QuestionId}", questionId);
            return question;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating question: {QuestionId}", questionId);
            throw;
        }
    }

    public async Task<Question?> GetQuestionByIdAsync(string questionId)
    {
        try
        {
            var cacheKey = $"question_{questionId}";
            if (_cache.TryGetValue(cacheKey, out Question? cachedQuestion))
            {
                return cachedQuestion;
            }

            var docRef = _firestore.Collection("questions").Document(questionId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var question = snapshot.ConvertTo<Question>();
            _cache.Set(cacheKey, question, _cacheExpiry);

            return question;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting question by ID: {QuestionId}", questionId);
            throw;
        }
    }
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

            // Get student's classes
            var studentClassIds = student.ClassIds;
            var accessibleSets = new List<FlashcardSet>();

            // 1. Get flashcard sets for the specific course (course-based access)
            var courseQuery = _firestore.Collection("flashcard_sets")
                .WhereEqualTo("course_id", courseId)
                .WhereEqualTo("is_active", true);

            var courseSnapshot = await courseQuery.GetSnapshotAsync();
            var courseSets = courseSnapshot.Documents.Select(doc => doc.ConvertTo<FlashcardSet>()).ToList();

            // Filter sets that belong to courses where student's classes are enrolled
            foreach (var set in courseSets)
            {
                // Check if any of student's classes belong to this course
                var classQuery = _firestore.Collection("classes")
                    .WhereEqualTo("course_id", set.CourseId)
                    .WhereIn("id", studentClassIds);

                var classSnapshot = await classQuery.GetSnapshotAsync();
                if (classSnapshot.Documents.Any())
                {
                    accessibleSets.Add(set);
                }
            }

            // 2. Get global flashcard sets (animals, colors, numbers) - accessible to all students
            var globalSetIds = new[] { "animals", "colors", "numbers" };
            var globalQuery = _firestore.Collection("flashcard_sets")
                .WhereIn("set_id", globalSetIds)
                .WhereEqualTo("is_active", true);

            var globalSnapshot = await globalQuery.GetSnapshotAsync();
            var globalSets = globalSnapshot.Documents.Select(doc => doc.ConvertTo<FlashcardSet>()).ToList();
            accessibleSets.AddRange(globalSets);

            // Remove duplicates based on ID
            accessibleSets = accessibleSets.GroupBy(s => s.Id).Select(g => g.First()).ToList();

            _cache.Set(cacheKey, accessibleSets, _cacheExpiry);
            return accessibleSets;
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

            var query = _firestore.Collection("video_lectures")
                .WhereEqualTo("course_id", courseId);

            var snapshot = await query.GetSnapshotAsync();
            var videos = snapshot.Documents.Select(doc =>
            {
                var video = doc.ConvertTo<Video>();
                video.Id = doc.Id; // Set the document ID
                return video;
            }).ToList();

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

            var docRef = _firestore.Collection("video_lectures").Document(videoId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var video = snapshot.ConvertTo<Video>();
            video.Id = snapshot.Id; // Set the document ID
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

            _logger.LogInformation("Getting videos from collection 'video_lectures'");
            var snapshot = await _firestore.Collection("video_lectures").GetSnapshotAsync();
            _logger.LogInformation($"Found {snapshot.Documents.Count} video documents");

            var videos = snapshot.Documents.Select(doc =>
            {
                var video = doc.ConvertTo<Video>();
                video.Id = doc.Id; // Set the document ID
                return video;
            }).ToList();
            _logger.LogInformation($"Converted {videos.Count} videos");

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

            var docRef = _firestore.Collection("video_lectures").Document(video.Id);
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
            var docRef = _firestore.Collection("video_lectures").Document(videoId);
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
            var docRef = _firestore.Collection("video_lectures").Document(videoId);
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

                bool isCorrect = string.Equals(answerDto.Answer, question.CorrectAnswer.ToString(), StringComparison.OrdinalIgnoreCase);
                if (isCorrect)
                {
                    result.CorrectAnswers++;
                }

                result.QuestionResults.Add(new QuestionResult
                {
                    QuestionId = question.Id,
                    UserAnswer = answerDto.Answer,
                    CorrectAnswer = question.CorrectAnswer.ToString(),
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

    // Missing Test Management Methods
    public async Task<List<Test>> GetAllTestsAsync()
    {
        try
        {
            const string cacheKey = "tests_all";
            if (_cache.TryGetValue(cacheKey, out List<Test>? cachedTests))
            {
                return cachedTests ?? new List<Test>();
            }

            var snapshot = await _firestore.Collection("tests").GetSnapshotAsync();
            var tests = snapshot.Documents.Select(doc => doc.ConvertTo<Test>()).ToList();

            _cache.Set(cacheKey, tests, _cacheExpiry);
            return tests;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all tests");
            throw;
        }
    }

    public async Task<Test?> GetTestByIdAsync(string testId)
    {
        try
        {
            var cacheKey = $"test_{testId}";
            if (_cache.TryGetValue(cacheKey, out Test? cachedTest))
            {
                return cachedTest;
            }

            var docRef = _firestore.Collection("tests").Document(testId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            var test = snapshot.ConvertTo<Test>();
            _cache.Set(cacheKey, test, _cacheExpiry);

            return test;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting test by ID: {TestId}", testId);
            throw;
        }
    }

    public async Task<List<Test>> GetTestsByCourseAsync(string courseId)
    {
        try
        {
            var cacheKey = $"tests_course_{courseId}";
            if (_cache.TryGetValue(cacheKey, out List<Test>? cachedTests))
            {
                return cachedTests ?? new List<Test>();
            }

            var query = _firestore.Collection("tests")
                .WhereEqualTo("course_id", courseId);
            var snapshot = await query.GetSnapshotAsync();
            var tests = snapshot.Documents.Select(doc => doc.ConvertTo<Test>()).ToList();

            _cache.Set(cacheKey, tests, _cacheExpiry);
            return tests;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tests for course: {CourseId}", courseId);
            throw;
        }
    }

    public async Task<Test> CreateTestAsync(Test test)
    {
        try
        {
            test.Id = Guid.NewGuid().ToString();
            test.CreatedAt = Timestamp.GetCurrentTimestamp();

            var docRef = _firestore.Collection("tests").Document(test.Id);
            await docRef.SetAsync(test);

            // Clear cache
            _cache.Remove("tests_all");
            _cache.Remove($"tests_course_{test.CourseId}");

            _logger.LogInformation("Test created with ID: {TestId}", test.Id);
            return test;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating test");
            throw;
        }
    }

    public async Task<Test> UpdateTestAsync(string testId, Test test)
    {
        try
        {
            test.Id = testId;

            var docRef = _firestore.Collection("tests").Document(testId);
            await docRef.SetAsync(test, SetOptions.MergeAll);

            // Clear cache
            _cache.Remove($"test_{testId}");
            _cache.Remove("tests_all");
            _cache.Remove($"tests_course_{test.CourseId}");

            _logger.LogInformation("Test updated: {TestId}", testId);
            return test;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating test: {TestId}", testId);
            throw;
        }
    }

    public async Task DeleteTestAsync(string testId)
    {
        try
        {
            var test = await GetTestByIdAsync(testId);
            if (test == null)
            {
                throw new KeyNotFoundException($"Test with ID '{testId}' not found.");
            }

            var docRef = _firestore.Collection("tests").Document(testId);
            await docRef.DeleteAsync();

            // Clear cache
            _cache.Remove($"test_{testId}");
            _cache.Remove("tests_all");
            _cache.Remove($"tests_course_{test?.CourseId}");

            _logger.LogInformation("Test deleted: {TestId}", testId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting test: {TestId}", testId);
            throw;
        }
    }

    public async Task PublishTestAsync(string testId)
    {
        try
        {
            var docRef = _firestore.Collection("tests").Document(testId);
            var updateData = new Dictionary<string, object>
            {
                { "is_published", true },
                { "published_at", Timestamp.GetCurrentTimestamp() }
            };

            await docRef.UpdateAsync(updateData);

            // Clear cache
            _cache.Remove($"test_{testId}");

            _logger.LogInformation("Test published: {TestId}", testId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing test: {TestId}", testId);
            throw;
        }
    }

    public async Task<Test> DuplicateTestAsync(string testId)
    {
        try
        {
            var originalTest = await GetTestByIdAsync(testId);
            if (originalTest == null)
            {
                throw new KeyNotFoundException($"Test with ID '{testId}' not found.");
            }

            var duplicatedTest = new Test
            {
                Id = Guid.NewGuid().ToString(),
                Title = $"{originalTest.Title} (Copy)",
                CourseId = originalTest.CourseId,
                QuestionIds = originalTest.QuestionIds?.ToList() ?? new List<string>(),
                TimeLimit = originalTest.TimeLimit,
                Difficulty = originalTest.Difficulty,
                CreatedBy = originalTest.CreatedBy,
                CreatedAt = Timestamp.GetCurrentTimestamp(),
                IsActive = originalTest.IsActive
            };

            return await CreateTestAsync(duplicatedTest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating test: {TestId}", testId);
            throw;
        }
    }

    public async Task<TestResult> ProcessTestSubmissionAsync(TestSubmissionDto submission)
    {
        try
        {
            var test = await GetTestByIdAsync(submission.TestId);
            if (test == null)
            {
                throw new KeyNotFoundException($"Test with ID '{submission.TestId}' not found.");
            }

            // Get questions for this test
            var questions = new List<Question>();
            if (test.QuestionIds != null)
            {
                foreach (var questionId in test.QuestionIds)
                {
                    var question = await GetQuestionByIdAsync(questionId);
                    if (question != null)
                    {
                        questions.Add(question);
                    }
                }
            }

            var result = new TestResult
            {
                TestId = submission.TestId,
                UserId = submission.UserId,
                TotalQuestions = questions.Count,
                Answers = submission.Answers,
                SubmittedAt = DateTime.UtcNow
            };

            // Process answers
            foreach (var question in questions)
            {
                var userAnswer = submission.Answers.ContainsKey(question.Id) ? submission.Answers[question.Id] : "";
                var isCorrect = string.Equals(userAnswer, question.CorrectAnswer.ToString(), StringComparison.OrdinalIgnoreCase);

                if (isCorrect)
                {
                    result.CorrectAnswers++;
                }
            }

            result.Score = result.TotalQuestions > 0 ? (double)result.CorrectAnswers / result.TotalQuestions * 100 : 0;
            result.Passed = result.Score >= 50; // Default passing score of 50%

            // Record learning activity
            var activity = new LearningActivity
            {
                UserId = submission.UserId,
                Type = "test",
                Score = result.Score,
                CompletedAt = Timestamp.GetCurrentTimestamp(),
                TimeSpent = submission.TimeSpent
            };
            await UpdateLearningHistoryAsync(submission.UserId, activity);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing test submission for user {UserId}", submission.UserId);
            throw;
        }
    }

    public async Task<TestResult> SubmitTestAsync(string testId, TestSubmissionDto submission)
    {
        return await ProcessTestSubmissionAsync(submission);
    }

    public async Task<AnalyticsSummaryDto> GetTestStatisticsAsync(string testId)
    {
        try
        {
            var test = await GetTestByIdAsync(testId);
            if (test == null)
            {
                throw new KeyNotFoundException($"Test with ID '{testId}' not found.");
            }

            // Get all submissions for this test
            var query = _firestore.Collection("test_results")
                .WhereEqualTo("test_id", testId);

            var snapshot = await query.GetSnapshotAsync();
            var submissions = snapshot.Documents.Select(doc => doc.ConvertTo<TestResult>()).ToList();

            var totalSubmissions = submissions.Count;
            var averageScore = totalSubmissions > 0 ? submissions.Average(s => s.Score) : 0;

            return new AnalyticsSummaryDto
            {
                TotalUsers = totalSubmissions, // Number of students who took the test
                TotalCourses = 1, // This test belongs to one course
                TotalClasses = 0, // Would need to calculate from test assignments
                TotalVideos = 0,
                TotalExercises = 0,
                TotalFlashcardSets = 0,
                AverageExerciseScore = averageScore, // Using test score as average
                ActivityCountsByType = new Dictionary<string, int>
                {
                    { "test", totalSubmissions }
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting test statistics for test {TestId}", testId);
            throw;
        }
    }

    // Evaluation Management Methods
    public async Task<List<Evaluation>> GetStudentEvaluationsAsync(string studentId, string? classId = null)
    {
        try
        {
            Query query = _firestore.Collection("evaluations")
                .WhereEqualTo("student_id", studentId);

            if (!string.IsNullOrEmpty(classId))
            {
                query = query.WhereEqualTo("class_id", classId);
            }

            query = query.OrderByDescending("evaluation_date");

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<Evaluation>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting evaluations for student {StudentId}", studentId);
            throw;
        }
    }

    public async Task<List<Evaluation>> GetTeacherEvaluationsAsync(string teacherId, string? classId = null)
    {
        try
        {
            Query query = _firestore.Collection("evaluations")
                .WhereEqualTo("teacher_id", teacherId);

            if (!string.IsNullOrEmpty(classId))
            {
                query = query.WhereEqualTo("class_id", classId);
            }

            query = query.OrderByDescending("evaluation_date");

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<Evaluation>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting evaluations for teacher {TeacherId}", teacherId);
            throw;
        }
    }

    public async Task<List<Evaluation>> GetClassEvaluationsAsync(string classId)
    {
        try
        {
            var query = _firestore.Collection("evaluations")
                .WhereEqualTo("class_id", classId)
                .OrderByDescending("evaluation_date");

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<Evaluation>()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting evaluations for class {ClassId}", classId);
            throw;
        }
    }

    public async Task<Evaluation?> GetEvaluationByIdAsync(string evaluationId)
    {
        try
        {
            var docRef = _firestore.Collection("evaluations").Document(evaluationId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                return null;
            }

            return snapshot.ConvertTo<Evaluation>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting evaluation by ID: {EvaluationId}", evaluationId);
            throw;
        }
    }

    public async Task<Evaluation> CreateEvaluationAsync(Evaluation evaluation)
    {
        try
        {
            evaluation.Id = Guid.NewGuid().ToString();
            evaluation.CreatedAt = Timestamp.GetCurrentTimestamp();
            evaluation.UpdatedAt = Timestamp.GetCurrentTimestamp();

            var docRef = _firestore.Collection("evaluations").Document(evaluation.Id);
            await docRef.SetAsync(evaluation);

            _logger.LogInformation("Evaluation created with ID: {EvaluationId}", evaluation.Id);
            return evaluation;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating evaluation");
            throw;
        }
    }

    public async Task<Evaluation?> UpdateEvaluationAsync(string evaluationId, Evaluation evaluation)
    {
        try
        {
            var existingEvaluation = await GetEvaluationByIdAsync(evaluationId);
            if (existingEvaluation == null)
            {
                return null;
            }

            evaluation.Id = evaluationId;
            evaluation.UpdatedAt = Timestamp.GetCurrentTimestamp();

            var docRef = _firestore.Collection("evaluations").Document(evaluationId);
            await docRef.SetAsync(evaluation, SetOptions.MergeAll);

            _logger.LogInformation("Evaluation updated: {EvaluationId}", evaluationId);
            return evaluation;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating evaluation: {EvaluationId}", evaluationId);
            throw;
        }
    }

    public async Task DeleteEvaluationAsync(string evaluationId)
    {
        try
        {
            var docRef = _firestore.Collection("evaluations").Document(evaluationId);
            await docRef.DeleteAsync();

            _logger.LogInformation("Evaluation deleted: {EvaluationId}", evaluationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting evaluation: {EvaluationId}", evaluationId);
            throw;
        }
    }

    public async Task<EvaluationAnalyticsDto> GetStudentEvaluationAnalyticsAsync(string studentId)
    {
        try
        {
            var evaluations = await GetStudentEvaluationsAsync(studentId);

            if (!evaluations.Any())
            {
                return new EvaluationAnalyticsDto();
            }

            var totalEvaluations = evaluations.Count;
            var averageOverallRating = evaluations.Average(e => e.OverallRating);
            var averageParticipation = evaluations.Average(e => e.RatingParticipation);
            var averageUnderstanding = evaluations.Average(e => e.RatingUnderstanding);
            var averageProgress = evaluations.Average(e => e.RatingProgress);
            var averageScore = evaluations.Average(e => e.Score);

            // Calculate rating distribution
            var ratingDistribution = new Dictionary<string, int>();
            foreach (var evaluation in evaluations)
            {
                var ratingKey = $"{evaluation.OverallRating:F1}";
                if (ratingDistribution.ContainsKey(ratingKey))
                {
                    ratingDistribution[ratingKey]++;
                }
                else
                {
                    ratingDistribution[ratingKey] = 1;
                }
            }

            // Get common strengths and areas for improvement
            var allStrengths = evaluations.Where(e => e.Strengths != null)
                .SelectMany(e => e.Strengths).ToList();
            var allAreasForImprovement = evaluations.Where(e => e.AreasForImprovement != null)
                .SelectMany(e => e.AreasForImprovement).ToList();

            var commonStrengths = allStrengths.GroupBy(s => s)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => g.Key)
                .ToList();

            var commonAreasForImprovement = allAreasForImprovement.GroupBy(a => a)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => g.Key)
                .ToList();

            // Calculate trend data (last 30 days)
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var recentEvaluations = evaluations
                .Where(e => DateTime.TryParse(e.EvaluationDate, out var date) && date >= thirtyDaysAgo)
                .OrderBy(e => DateTime.Parse(e.EvaluationDate))
                .ToList();

            var trendData = new List<EvaluationTrendDto>();
            var groupedByDate = recentEvaluations.GroupBy(e => e.EvaluationDate);
            foreach (var group in groupedByDate)
            {
                trendData.Add(new EvaluationTrendDto
                {
                    Date = group.Key,
                    AverageRating = group.Average(e => e.OverallRating),
                    EvaluationCount = group.Count()
                });
            }

            return new EvaluationAnalyticsDto
            {
                TotalEvaluations = totalEvaluations,
                AverageOverallRating = averageOverallRating,
                AverageParticipation = averageParticipation,
                AverageUnderstanding = averageUnderstanding,
                AverageProgress = averageProgress,
                AverageScore = (int)averageScore,
                CommonStrengths = commonStrengths,
                CommonAreasForImprovement = commonAreasForImprovement,
                RatingDistribution = ratingDistribution,
                TrendData = trendData
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting evaluation analytics for student {StudentId}", studentId);
            throw;
        }
    }

    public async Task<EvaluationAnalyticsDto> GetTeacherEvaluationAnalyticsAsync(string teacherId)
    {
        try
        {
            var evaluations = await GetTeacherEvaluationsAsync(teacherId);

            if (!evaluations.Any())
            {
                return new EvaluationAnalyticsDto();
            }

            var totalEvaluations = evaluations.Count;
            var averageOverallRating = evaluations.Average(e => e.OverallRating);
            var averageParticipation = evaluations.Average(e => e.RatingParticipation);
            var averageUnderstanding = evaluations.Average(e => e.RatingUnderstanding);
            var averageProgress = evaluations.Average(e => e.RatingProgress);
            var averageScore = evaluations.Average(e => e.Score);

            // Calculate rating distribution
            var ratingDistribution = new Dictionary<string, int>();
            foreach (var evaluation in evaluations)
            {
                var ratingKey = $"{evaluation.OverallRating:F1}";
                if (ratingDistribution.ContainsKey(ratingKey))
                {
                    ratingDistribution[ratingKey]++;
                }
                else
                {
                    ratingDistribution[ratingKey] = 1;
                }
            }

            // Get common strengths and areas for improvement
            var allStrengths = evaluations.Where(e => e.Strengths != null)
                .SelectMany(e => e.Strengths).ToList();
            var allAreasForImprovement = evaluations.Where(e => e.AreasForImprovement != null)
                .SelectMany(e => e.AreasForImprovement).ToList();

            var commonStrengths = allStrengths.GroupBy(s => s)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => g.Key)
                .ToList();

            var commonAreasForImprovement = allAreasForImprovement.GroupBy(a => a)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => g.Key)
                .ToList();

            // Calculate trend data (last 30 days)
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var recentEvaluations = evaluations
                .Where(e => DateTime.TryParse(e.EvaluationDate, out var date) && date >= thirtyDaysAgo)
                .OrderBy(e => DateTime.Parse(e.EvaluationDate))
                .ToList();

            var trendData = new List<EvaluationTrendDto>();
            var groupedByDate = recentEvaluations.GroupBy(e => e.EvaluationDate);
            foreach (var group in groupedByDate)
            {
                trendData.Add(new EvaluationTrendDto
                {
                    Date = group.Key,
                    AverageRating = group.Average(e => e.OverallRating),
                    EvaluationCount = group.Count()
                });
            }

            return new EvaluationAnalyticsDto
            {
                TotalEvaluations = totalEvaluations,
                AverageOverallRating = averageOverallRating,
                AverageParticipation = averageParticipation,
                AverageUnderstanding = averageUnderstanding,
                AverageProgress = averageProgress,
                AverageScore = (int)averageScore,
                CommonStrengths = commonStrengths,
                CommonAreasForImprovement = commonAreasForImprovement,
                RatingDistribution = ratingDistribution,
                TrendData = trendData
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting evaluation analytics for teacher {TeacherId}", teacherId);
            throw;
        }
    }
}
