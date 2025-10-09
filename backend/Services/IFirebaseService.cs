using BingGoWebAPI.Models;
using Google.Cloud.Firestore;

namespace BingGoWebAPI.Services;

public interface IFirebaseService
{
    // Generic CRUD Operations
    Task<T?> GetDocumentAsync<T>(string collection, string documentId) where T : class;
    Task<List<T>> GetCollectionAsync<T>(string collection) where T : class;
    Task<List<T>> GetDocumentsAsync<T>(Query query) where T : class;
    Task SetDocumentAsync<T>(string collection, string documentId, T data) where T : class;
    Task<string> AddDocumentAsync<T>(string collection, T data) where T : class;
    Task UpdateDocumentAsync<T>(string collection, string documentId, T updates) where T : class;
    Task DeleteDocumentAsync(string collection, string documentId);
    Task<bool> DocumentExistsAsync(string collection, string documentId);

    // Collection and Document References
    CollectionReference GetCollection(string collectionName);
    DocumentReference GetDocument(string collectionName, string documentId);

    // Batch Operations
    Task<WriteBatch> CreateBatchAsync();
    Task CommitBatchAsync(WriteBatch batch);

    // User Management
    Task<User?> GetUserByIdAsync(string userId);
    Task<User?> GetUserByEmailAsync(string email);
    Task<List<User>> GetAllUsersAsync();
    Task<List<User>> GetUsersAsync();
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task<User> UpdateUserAsync(string userId, User user);
    Task DeleteUserAsync(string userId);

    // Course Management
    Task<List<Course>> GetCoursesAsync();
    Task<Course?> GetCourseByIdAsync(string courseId);
    Task<Course> CreateCourseAsync(Course course);
    Task<Course> UpdateCourseAsync(string courseId, Course course);
    Task DeleteCourseAsync(string courseId);
    Task AssignClassesToCourseAsync(string courseId, List<string> classIds);

    // Class Management
    Task<List<Class>> GetClassesAsync();
    Task<Class?> GetClassByIdAsync(string classId);
    Task<List<Class>> GetClassesByTeacherAsync(string teacherId);
    Task<Class> CreateClassAsync(Class classEntity);
    Task<Class> UpdateClassAsync(string classId, Class classEntity);
    Task DeleteClassAsync(string classId);

    // Flashcard Management
    Task<List<FlashcardSet>> GetFlashcardSetsAsync();
    Task<List<FlashcardSet>> GetFlashcardSetsByCourseAsync(string courseId);
    Task<List<FlashcardSet>> GetFlashcardSetsForStudentAsync(string studentId, string courseId);
    Task<List<Flashcard>> GetFlashcardsBySetAsync(string setId);
    Task<FlashcardSet> CreateFlashcardSetAsync(FlashcardSet flashcardSet);
    Task<FlashcardSet?> UpdateFlashcardSetAsync(string setId, CreateFlashcardSetDto setDto);
    Task<bool> DeleteFlashcardSetAsync(string setId);
    Task<Flashcard> CreateFlashcardAsync(Flashcard flashcard);
    Task<Flashcard?> UpdateFlashcardAsync(string cardId, CreateFlashcardDto cardDto);
    Task<bool> DeleteFlashcardAsync(string cardId);
    Task ReorderFlashcardsAsync(string setId, List<FlashcardOrderDto> cards);
    Task<FlashcardProgressResponseDto?> GetFlashcardProgressAsync(string userId, string setId);
    Task AssignFlashcardSetAsync(string setId, List<string> classIds);

    // Exercise Management
    Task<List<Exercise>> GetAllExercisesAsync(string? courseId = null, string? difficulty = null, string? type = null);
    Task<List<Exercise>> GetExercisesByCourseAsync(string courseId);
    Task<Exercise?> GetExerciseByIdAsync(string exerciseId);
    Task<Exercise> CreateExerciseAsync(Exercise exercise);

    // Question Management
    Task<List<Question>> GetQuestionsAsync();
    Task<List<Question>> GetQuestionsByCourseAsync(string courseId);
    Task<Question> CreateQuestionAsync(Question question);
    Task<Question> UpdateQuestionAsync(string questionId, Question question);
    Task<Question?> GetQuestionByIdAsync(string questionId);
    Task DeleteQuestionAsync(string questionId);

    // Progress Tracking
    Task<LearningProgress?> GetLearningProgressAsync(string userId, string courseId);
    Task UpdateLearningProgressAsync(string userId, LearningProgress progress);
    Task UpdateFlashcardProgressAsync(FlashcardProgressDto progress);
    Task UpdateLearningHistoryAsync(string userId, LearningActivity activity);
    Task<List<LearningActivity>> GetLearningActivitiesAsync(string userId, string setId);

    // Video Management
    Task<List<Video>> GetAllVideosAsync();
    Task<Video?> GetVideoByIdAsync(string videoId);
    Task<List<Video>> GetVideosByCourseAsync(string courseId);
    Task<Video> AddVideoAsync(Video video);
    Task<Video> UpdateVideoAsync(string videoId, Video video);
    Task DeleteVideoAsync(string videoId);
    Task UpdateVideoProgressAsync(string userId, string videoId, bool completed);
    Task AssignVideoToClassesAsync(string videoId, List<string> classIds);
    Task<List<LearningActivity>> GetVideoLearningHistoryAsync(string userId);
    Task<List<LearningActivity>> GetAllLearningActivitiesAsync(string userId);
    Task<int> GetCompletedFlashcardSetsCountAsync(string userId);
    Task<int> GetCompletedLearningActivitiesCountAsync(string userId, string activityType);

    // Badge Management
    Task<List<Badge>> GetBadgesAsync();
    Task<Badge?> GetBadgeByConditionKeyAsync(string conditionKey);

    // Test Management
    Task<Test?> GetTestByIdAsync(string testId);
    Task<List<Test>> GetTestsByCourseAsync(string courseId);
    Task<TestResultDto> SaveTestSubmissionAsync(TestResultDto submission);
    Task<ExerciseResult> ProcessExerciseSubmissionAsync(ExerciseSubmissionDto submission);

    // Evaluation Management
    Task<Evaluation> SaveEvaluationAsync(Evaluation evaluation);
    Task<List<Evaluation>> GetEvaluationsForStudentAsync(string studentId);

    // Analytics
    Task<TeacherAnalyticsDto> GetTeacherAnalyticsAsync(string teacherId, string? courseId = null, string? setId = null);
    Task<ClassAnalyticsDto> GetClassAnalyticsAsync(string classId, string? courseId = null, string? setId = null);
    Task<StudentProgressDto> GetStudentAnalyticsAsync(string studentId, string? courseId = null, string? setId = null);

    // Authentication Support

    // System Configuration
    Task<SystemSettings> GetSystemSettingsAsync();
    Task UpdateSystemSettingsAsync(SystemSettings settings);
    Task<List<FeatureFlag>> GetFeatureFlagsAsync();
    Task UpdateFeatureFlagsAsync(List<FeatureFlag> flags);
    Task<MaintenanceMode> GetMaintenanceModeAsync();
    Task UpdateMaintenanceModeAsync(MaintenanceMode maintenance);
    Task<List<SystemAnnouncement>> GetSystemAnnouncementsAsync();
    Task CreateSystemAnnouncementAsync(SystemAnnouncement announcement);
    Task UpdateSystemAnnouncementAsync(SystemAnnouncement announcement);
    Task DeleteSystemAnnouncementAsync(string id);
    Task CreateSystemBackupAsync(SystemBackup backup);
    Task<List<SystemBackup>> GetSystemBackupsAsync();
    Task<bool> TestConnectionAsync();
}
