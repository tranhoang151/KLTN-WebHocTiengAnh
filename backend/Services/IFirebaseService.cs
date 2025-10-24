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
    Task<List<Course>> GetAllCoursesAsync();
    Task<Course?> GetCourseByIdAsync(string courseId);
    Task<Course> CreateCourseAsync(Course course);
    Task<Course> UpdateCourseAsync(string courseId, Course course);
    Task DeleteCourseAsync(string courseId);
    Task AssignClassesToCourseAsync(string courseId, List<string> classIds);
    Task<List<Class>> GetCourseClassesAsync(string courseId);
    Task<AnalyticsSummaryDto> GetCourseStatisticsAsync(string courseId);

    // Class Management
    Task<List<Class>> GetClassesAsync();
    Task<List<Class>> GetAllClassesAsync();
    Task<Class?> GetClassByIdAsync(string classId);
    Task<List<Class>> GetClassesByTeacherAsync(string teacherId);
    Task<Class> CreateClassAsync(Class classEntity);
    Task<Class> UpdateClassAsync(string classId, Class classEntity);
    Task DeleteClassAsync(string classId);
    Task AssignTeacherToClassAsync(string classId, string teacherId);
    Task AssignStudentsToClassAsync(string classId, List<string> studentIds);
    Task RemoveStudentFromClassAsync(string classId, string studentId);
    Task<List<User>> GetClassStudentsAsync(string classId);
    Task<ClassAnalyticsDto> GetClassStatisticsAsync(string classId);

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
    // Task AssignFlashcardSetAsync(string setId, List<string> classIds); // Removed - using course-based access instead

    // Exercise Management
    Task<List<Exercise>> GetAllExercisesAsync();
    Task<List<Exercise>> GetExercisesByCourseAsync(string courseId);
    Task<Exercise?> GetExerciseByIdAsync(string exerciseId);
    Task<Exercise> CreateExerciseAsync(Exercise exercise);
    Task<Exercise> UpdateExerciseAsync(string exerciseId, Exercise exercise);
    Task DeleteExerciseAsync(string exerciseId);
    Task<Exercise> DuplicateExerciseAsync(string exerciseId);

    // Question Management
    Task<List<Question>> GetQuestionsAsync();
    Task<List<Question>> GetQuestionsByCourseAsync(string courseId);
    Task<Question> CreateQuestionAsync(Question question);
    Task<Question> UpdateQuestionAsync(string questionId, Question question);

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
    Task<List<Test>> GetAllTestsAsync();
    Task<Test?> GetTestByIdAsync(string testId);
    Task<List<Test>> GetTestsByCourseAsync(string courseId);
    Task<Test> CreateTestAsync(Test test);
    Task<Test> UpdateTestAsync(string testId, Test test);
    Task DeleteTestAsync(string testId);
    Task PublishTestAsync(string testId);
    Task<Test> DuplicateTestAsync(string testId);
    Task<TestResult> ProcessTestSubmissionAsync(TestSubmissionDto submission);
    Task<TestResult> SubmitTestAsync(string testId, TestSubmissionDto submission);
    Task<AnalyticsSummaryDto> GetTestStatisticsAsync(string testId);
    Task<ExerciseResult> ProcessExerciseSubmissionAsync(ExerciseSubmissionDto submission);

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

    // Evaluation Management
    Task<List<Evaluation>> GetStudentEvaluationsAsync(string studentId, string? classId = null);
    Task<List<Evaluation>> GetTeacherEvaluationsAsync(string teacherId, string? classId = null);
    Task<List<Evaluation>> GetClassEvaluationsAsync(string classId);
    Task<Evaluation?> GetEvaluationByIdAsync(string evaluationId);
    Task<Evaluation> CreateEvaluationAsync(Evaluation evaluation);
    Task<Evaluation?> UpdateEvaluationAsync(string evaluationId, Evaluation evaluation);
    Task DeleteEvaluationAsync(string evaluationId);
    Task<EvaluationAnalyticsDto> GetStudentEvaluationAnalyticsAsync(string studentId);
    Task<EvaluationAnalyticsDto> GetTeacherEvaluationAnalyticsAsync(string teacherId);
}
