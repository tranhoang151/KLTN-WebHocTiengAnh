using System.Text.Json;
using Google.Cloud.Firestore;
using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    public class DataMigrationService : IDataMigrationService
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly ILogger<DataMigrationService> _logger;

        public DataMigrationService(FirestoreDb firestoreDb, ILogger<DataMigrationService> logger)
        {
            _firestoreDb = firestoreDb;
            _logger = logger;
        }

        public async Task<bool> MigrateFromBackupJson(string backupFilePath)
        {
            try
            {
                _logger.LogInformation("Starting data migration from backup.json");

                var jsonContent = await File.ReadAllTextAsync(backupFilePath);
                var backupData = JsonSerializer.Deserialize<BackupData>(jsonContent);

                if (backupData == null)
                {
                    _logger.LogError("Failed to deserialize backup data");
                    return false;
                }

                // Migrate badges
                await MigrateBadges(backupData.Badges);

                // Migrate courses
                await MigrateCourses(backupData.Courses);

                // Migrate classes
                await MigrateClasses(backupData.Classes);

                // Migrate users
                await MigrateUsers(backupData.Users);

                // Migrate exercises
                await MigrateExercises(backupData.Exercises);

                // Migrate flashcard sets
                await MigrateFlashcardSets(backupData.FlashcardSets);

                // Migrate video lectures
                await MigrateVideoLectures(backupData.VideoLectures);

                // Migrate tests
                await MigrateTests(backupData.Tests);

                // Migrate questions
                await MigrateQuestions(backupData.Questions);

                _logger.LogInformation("Data migration completed successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during data migration");
                return false;
            }
        }

        private async Task MigrateBadges(List<BadgeDefinition> badges)
        {
            var collection = _firestoreDb.Collection("badges");
            foreach (var badge in badges)
            {
                await collection.Document(badge.Id).SetAsync(badge);
            }
            _logger.LogInformation($"Migrated {badges.Count} badges");
        }

        private async Task MigrateCourses(List<CourseData> courses)
        {
            var collection = _firestoreDb.Collection("courses");
            foreach (var course in courses)
            {
                var courseModel = new Course
                {
                    Id = course.Id,
                    Name = course.Name,
                    Description = course.Description,
                    ImageUrl = course.ImageUrl,
                    CreatedAt = course.CreatedAt,
                    IsActive = true
                };
                await collection.Document(course.Id).SetAsync(courseModel);
            }
            _logger.LogInformation($"Migrated {courses.Count} courses");
        }

        private async Task MigrateClasses(List<ClassData> classes)
        {
            var collection = _firestoreDb.Collection("classes");
            foreach (var classData in classes)
            {
                var classModel = new Class
                {
                    Id = classData.Id,
                    Name = classData.Name,
                    Description = classData.Description,
                    Capacity = classData.Capacity,
                    CourseId = classData.CourseId,
                    TeacherId = classData.TeacherId,
                    StudentIds = classData.StudentIds,
                    CreatedAt = classData.CreatedAt,
                    IsActive = true
                };
                await collection.Document(classData.Id).SetAsync(classModel);
            }
            _logger.LogInformation($"Migrated {classes.Count} classes");
        }

        private async Task MigrateUsers(List<UserData> users)
        {
            var collection = _firestoreDb.Collection("users");
            foreach (var userData in users)
            {
                var userModel = new User
                {
                    Id = userData.Id,
                    FullName = userData.FullName,
                    Email = userData.Email,
                    Password = userData.Password, // Plain text password (no hashing)
                    Role = userData.Role,
                    Gender = userData.Gender,
                    AvatarUrl = userData.AvatarUrl,
                    AvatarBase64 = userData.AvatarBase64,
                    StreakCount = userData.StreakCount,
                    LastLoginDate = userData.LastLoginDate,
                    ClassIds = userData.ClassIds ?? new List<string>(),
                    LearningHistory = userData.LearningHistory ?? new Dictionary<string, bool>(),
                    CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                    IsActive = true
                };
                await collection.Document(userData.Id).SetAsync(userModel);
            }
            _logger.LogInformation($"Migrated {users.Count} users");
        }

        private async Task MigrateExercises(List<ExerciseData> exercises)
        {
            var collection = _firestoreDb.Collection("exercises");
            foreach (var exerciseData in exercises)
            {
                var questions = exerciseData.Questions.Select(q => new Question
                {
                    Id = q.Id,
                    Content = q.QuestionText,
                    Type = exerciseData.Type,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer.ToString(),
                    Difficulty = "easy", // Default value
                    CourseId = exerciseData.CourseId,
                    Tags = new List<string>(),
                    CreatedBy = "admin",
                    CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                    IsActive = true
                }).ToList();

                var exerciseModel = new Exercise
                {
                    Id = exerciseData.Id,
                    Title = exerciseData.Title,
                    Type = exerciseData.Type,
                    CourseId = exerciseData.CourseId,
                    Questions = questions,
                    Difficulty = "easy", // Default value
                    CreatedBy = "admin",
                    CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                    UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                    TotalPoints = questions.Count() * 10, // Default points
                    IsActive = true
                };
                await collection.Document(exerciseData.Id).SetAsync(exerciseModel);
            }
            _logger.LogInformation($"Migrated {exercises.Count} exercises");
        }

        private async Task MigrateFlashcardSets(List<FlashcardSetData> flashcardSets)
        {
            var collection = _firestoreDb.Collection("flashcard_sets");
            foreach (var flashcardSet in flashcardSets)
            {
                var flashcardSetModel = new FlashcardSet
                {
                    Id = flashcardSet.Id,
                    Title = flashcardSet.Title,
                    Description = flashcardSet.Description,
                    CourseId = flashcardSet.CourseId,
                    SetId = flashcardSet.SetId,
                    CreatedBy = flashcardSet.CreatedBy,
                    CreatedAt = flashcardSet.CreatedAt,
                    AssignedClassIds = flashcardSet.AssignedClassIds ?? new List<string>(),
                    IsActive = true
                };
                await collection.Document(flashcardSet.Id).SetAsync(flashcardSetModel);
            }
            _logger.LogInformation($"Migrated {flashcardSets.Count} flashcard sets");
        }

        private async Task MigrateVideoLectures(List<VideoLectureData> videoLectures)
        {
            var collection = _firestoreDb.Collection("video_lectures");
            foreach (var video in videoLectures)
            {
                // Extract YouTube ID from URL
                var youtubeId = ExtractYoutubeId(video.VideoUrl);

                var videoModel = new Video
                {
                    Id = video.Id,
                    Title = video.Title,
                    Description = video.Description,
                    VideoUrl = video.VideoUrl,
                    ThumbnailUrl = video.ThumbnailUrl,
                    Duration = video.Duration,
                    CourseId = video.CourseId,
                    CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                    AssignedClassIds = new List<string>(),
                    IsActive = true
                };
                await collection.Document(video.Id).SetAsync(videoModel);
            }
            _logger.LogInformation($"Migrated {videoLectures.Count} video lectures");
        }

        private string ExtractYoutubeId(string videoUrl)
        {
            if (string.IsNullOrEmpty(videoUrl)) return string.Empty;

            // Handle various YouTube URL formats
            if (videoUrl.Contains("youtube.com/watch?v="))
            {
                var startIndex = videoUrl.IndexOf("v=") + 2;
                var endIndex = videoUrl.IndexOf("&", startIndex);
                if (endIndex == -1) endIndex = videoUrl.Length;
                return videoUrl.Substring(startIndex, endIndex - startIndex);
            }
            else if (videoUrl.Contains("youtu.be/"))
            {
                var startIndex = videoUrl.IndexOf("youtu.be/") + 9;
                var endIndex = videoUrl.IndexOf("?", startIndex);
                if (endIndex == -1) endIndex = videoUrl.Length;
                return videoUrl.Substring(startIndex, endIndex - startIndex);
            }

            return string.Empty;
        }

        private int? ParseDuration(string duration)
        {
            if (string.IsNullOrEmpty(duration)) return null;

            // Parse duration format like "2:57" or "5:36"
            var parts = duration.Split(':');
            if (parts.Length == 2)
            {
                if (int.TryParse(parts[0], out int minutes) && int.TryParse(parts[1], out int seconds))
                {
                    return minutes * 60 + seconds;
                }
            }

            return null;
        }

        private async Task MigrateTests(List<TestData> tests)
        {
            var collection = _firestoreDb.Collection("tests");
            foreach (var testData in tests)
            {
                var testModel = new Test
                {
                    Id = testData.Id,
                    Title = testData.Title,
                    CourseId = testData.CourseId,
                    QuestionIds = testData.Questions.Select(q => q.Id).ToList(),
                    TimeLimit = testData.Duration,
                    Difficulty = "easy",
                    CreatedBy = "admin",
                    CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                    UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                    Type = "multiple_choice",
                    IsPublished = true,
                    TotalPoints = testData.MaxScore,
                    PassingScore = testData.MaxScore / 2, // Default passing score as 50%
                    IsActive = true
                };
                await collection.Document(testData.Id).SetAsync(testModel);
            }
            _logger.LogInformation($"Migrated {tests.Count} tests");
        }

        private async Task MigrateQuestions(List<QuestionData> questions)
        {
            var collection = _firestoreDb.Collection("questions");
            foreach (var questionData in questions)
            {
                var questionModel = new Question
                {
                    Id = questionData.Id ?? Guid.NewGuid().ToString(),
                    Content = questionData.Content,
                    Type = questionData.Type,
                    Options = questionData.Options ?? new List<string>(),
                    CorrectAnswer = questionData.CorrectAnswer,
                    Explanation = questionData.Explanation,
                    Difficulty = questionData.Difficulty,
                    CourseId = questionData.CourseId,
                    Tags = questionData.Tags ?? new List<string>(),
                    CreatedBy = questionData.CreatedBy,
                    CreatedAt = Timestamp.FromDateTime(DateTimeOffset.FromUnixTimeMilliseconds(questionData.CreatedAt).UtcDateTime),
                    IsActive = questionData.IsActive
                };
                await collection.Document(questionModel.Id).SetAsync(questionModel);
            }
            _logger.LogInformation($"Migrated {questions.Count} questions");
        }

        // Interface implementation methods
        public async Task<bool> ImportDataAsync(string jsonData)
        {
            try
            {
                var backupData = JsonSerializer.Deserialize<BackupData>(jsonData);
                if (backupData == null) return false;

                await MigrateBadges(backupData.Badges);
                await MigrateCourses(backupData.Courses);
                await MigrateClasses(backupData.Classes);
                await MigrateUsers(backupData.Users);
                await MigrateExercises(backupData.Exercises);
                await MigrateFlashcardSets(backupData.FlashcardSets);
                await MigrateVideoLectures(backupData.VideoLectures);
                await MigrateTests(backupData.Tests);
                await MigrateQuestions(backupData.Questions);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing data");
                return false;
            }
        }

        public async Task<string> ExportDataAsync()
        {
            try
            {
                var backupData = new BackupData();

                // Export all collections
                var badgesTask = _firestoreDb.Collection("badges").GetSnapshotAsync();
                var coursesTask = _firestoreDb.Collection("courses").GetSnapshotAsync();
                var classesTask = _firestoreDb.Collection("classes").GetSnapshotAsync();
                var usersTask = _firestoreDb.Collection("users").GetSnapshotAsync();
                var exercisesTask = _firestoreDb.Collection("exercises").GetSnapshotAsync();
                var flashcardSetsTask = _firestoreDb.Collection("flashcard_sets").GetSnapshotAsync();
                var videoLecturesTask = _firestoreDb.Collection("video_lectures").GetSnapshotAsync();
                var testsTask = _firestoreDb.Collection("tests").GetSnapshotAsync();
                var questionsTask = _firestoreDb.Collection("questions").GetSnapshotAsync();

                await Task.WhenAll(badgesTask, coursesTask, classesTask, usersTask, exercisesTask, flashcardSetsTask, videoLecturesTask, testsTask, questionsTask);

                // Convert to backup data format (simplified for now)
                return JsonSerializer.Serialize(backupData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting data");
                return "{}";
            }
        }

        public async Task<bool> ValidateDataAsync(string jsonData)
        {
            try
            {
                var backupData = JsonSerializer.Deserialize<BackupData>(jsonData);
                return backupData != null && backupData.Users.Any() && backupData.Courses.Any();
            }
            catch
            {
                return false;
            }
        }

        public async Task<MigrationResult> MigrateDataAsync(string sourceFormat, string targetFormat, string data)
        {
            var result = new MigrationResult
            {
                Success = false,
                Message = "Not implemented"
            };

            if (sourceFormat == "json" && targetFormat == "firestore")
            {
                result.Success = await ImportDataAsync(data);
                result.Message = result.Success ? "Migration completed successfully" : "Migration failed";
            }

            return result;
        }

        public async Task<MigrationResult> MigrateDataFromBackupAsync(string backupFilePath)
        {
            try
            {
                var jsonData = await File.ReadAllTextAsync(backupFilePath);
                var success = await ImportDataAsync(jsonData);

                return new MigrationResult
                {
                    Success = success,
                    Message = success ? "Backup migration completed successfully" : "Backup migration failed"
                };
            }
            catch (Exception ex)
            {
                return new MigrationResult
                {
                    Success = false,
                    Message = $"Backup migration failed: {ex.Message}"
                };
            }
        }

        public async Task<MigrationSummary> GetMigrationSummaryAsync()
        {
            return new MigrationSummary
            {
                LastMigrationDate = DateTime.UtcNow,
                TotalMigrationsCompleted = 1,
                TotalRecordsMigrated = 0, // Would need to count actual records
                Status = "Completed"
            };
        }

        public async Task<bool> ValidateDataIntegrityAsync()
        {
            try
            {
                // Basic validation - check if essential collections exist and have data
                var usersTask = _firestoreDb.Collection("users").Limit(1).GetSnapshotAsync();
                var coursesTask = _firestoreDb.Collection("courses").Limit(1).GetSnapshotAsync();

                await Task.WhenAll(usersTask, coursesTask);

                return usersTask.Result.Count > 0 && coursesTask.Result.Count > 0;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> SeedSampleFlashcardsAsync()
        {
            try
            {
                _logger.LogInformation("Starting sample flashcards seeding");

                // Sample animal flashcards for the "animals" set
                var sampleFlashcards = new List<Flashcard>
                {
                    new Flashcard
                    {
                        Id = Guid.NewGuid().ToString(),
                        FlashcardSetId = "animals",
                        FrontText = "What animal says 'meow'?",
                        BackText = "Cat",
                        ExampleSentence = "The cat says 'meow' when it's hungry.",
                        Order = 1
                    },
                    new Flashcard
                    {
                        Id = Guid.NewGuid().ToString(),
                        FlashcardSetId = "animals",
                        FrontText = "What animal says 'woof'?",
                        BackText = "Dog",
                        ExampleSentence = "The dog says 'woof' when it sees a stranger.",
                        Order = 2
                    },
                    new Flashcard
                    {
                        Id = Guid.NewGuid().ToString(),
                        FlashcardSetId = "animals",
                        FrontText = "What animal can fly?",
                        BackText = "Bird",
                        ExampleSentence = "The bird can fly high in the sky.",
                        Order = 3
                    },
                    new Flashcard
                    {
                        Id = Guid.NewGuid().ToString(),
                        FlashcardSetId = "animals",
                        FrontText = "What animal lives in water?",
                        BackText = "Fish",
                        ExampleSentence = "The fish lives in water and swims.",
                        Order = 4
                    },
                    new Flashcard
                    {
                        Id = Guid.NewGuid().ToString(),
                        FlashcardSetId = "animals",
                        FrontText = "What animal has four legs?",
                        BackText = "Dog",
                        ExampleSentence = "The dog has four legs and runs fast.",
                        Order = 5
                    }
                };

                var collection = _firestoreDb.Collection("flashcards");
                foreach (var flashcard in sampleFlashcards)
                {
                    await collection.Document(flashcard.Id).SetAsync(flashcard);
                }

                _logger.LogInformation($"Seeded {sampleFlashcards.Count} sample flashcards for animals set");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding sample flashcards");
                return false;
            }
        }
    }

    // Data classes for deserializing backup.json
    public class BackupData
    {
        public List<BadgeDefinition> Badges { get; set; } = new();
        public List<ClassData> Classes { get; set; } = new();
        public List<CourseData> Courses { get; set; } = new();
        public List<ExerciseData> Exercises { get; set; } = new();
        public List<FlashcardSetData> FlashcardSets { get; set; } = new();
        public List<QuestionData> Questions { get; set; } = new();
        public List<TestData> Tests { get; set; } = new();
        public List<UserData> Users { get; set; } = new();
        public List<VideoLectureData> VideoLectures { get; set; } = new();
    }

    public class BadgeDefinition
    {
        public string Id { get; set; } = string.Empty;
        public bool Earned { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class ClassData
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string? CourseId { get; set; }
        public string? TeacherId { get; set; }
        public List<string> StudentIds { get; set; } = new();
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class CourseData
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public Timestamp CreatedAt { get; set; }
    }

    public class ExerciseData
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public List<ExerciseQuestionData> Questions { get; set; } = new();
    }

    public class ExerciseQuestionData
    {
        public string Id { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
        public int CorrectAnswer { get; set; }
    }

    public class FlashcardSetData
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public string SetId { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public Timestamp CreatedAt { get; set; }
        public List<string>? AssignedClassIds { get; set; }
    }

    public class QuestionData
    {
        public string? Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public List<string>? Options { get; set; }
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? Explanation { get; set; }
        public string Difficulty { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public List<string>? Tags { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public long CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class TestData
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public int Duration { get; set; }
        public int MaxScore { get; set; }
        public List<TestQuestionData> Questions { get; set; } = new();
    }

    public class TestQuestionData
    {
        public string Id { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
        public string Type { get; set; } = string.Empty;
    }

    public class UserData
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? AvatarBase64 { get; set; }
        public int StreakCount { get; set; }
        public string LastLoginDate { get; set; } = string.Empty;
        public List<string>? ClassIds { get; set; }
        public Dictionary<string, bool>? LearningHistory { get; set; }
    }

    public class VideoLectureData
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string VideoUrl { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public string? TeacherId { get; set; }
    }

    public class MigrationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int RecordsMigrated { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}