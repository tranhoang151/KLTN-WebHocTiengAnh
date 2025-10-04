using Google.Cloud.Firestore;
using Microsoft.Extensions.Configuration;
using Xunit;
using BingGoWebAPI.Services;
using BingGoWebAPI.Models;

namespace BingGoWebAPI.Tests.Integration.Firebase
{
    public class FirebaseIntegrationTests : IDisposable
    {
        private readonly FirestoreDb _firestore;
        private readonly IFirebaseService _firebaseService;
        private readonly List<string> _testDocuments;

        public FirebaseIntegrationTests()
        {
            var configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.Testing.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var projectId = configuration["Firebase:ProjectId"] ?? "binggo-test";
            _firestore = FirestoreDb.Create(projectId);
            _firebaseService = new FirebaseService(configuration);
            _testDocuments = new List<string>();
        }

        [Fact]
        public async Task CreateUser_ValidData_CreatesUserInFirestore()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = $"firebase-test-{Guid.NewGuid()}@example.com",
                DisplayName = "Firebase Test User",
                Role = "student",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _testDocuments.Add($"users/{user.Id}");

            // Act
            await _firebaseService.CreateUserAsync(user);

            // Assert
            var docRef = _firestore.Collection("users").Document(user.Id);
            var snapshot = await docRef.GetSnapshotAsync();

            Assert.True(snapshot.Exists);
            var retrievedUser = snapshot.ConvertTo<User>();
            Assert.Equal(user.Email, retrievedUser.Email);
            Assert.Equal(user.DisplayName, retrievedUser.DisplayName);
            Assert.Equal(user.Role, retrievedUser.Role);
        }

        [Fact]
        public async Task GetUser_ExistingUser_ReturnsUser()
        {
            // Arrange
            var userId = Guid.NewGuid().ToString();
            var user = new User
            {
                Id = userId,
                Email = $"get-test-{Guid.NewGuid()}@example.com",
                DisplayName = "Get Test User",
                Role = "teacher",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _testDocuments.Add($"users/{userId}");

            // Create user first
            await _firebaseService.CreateUserAsync(user);

            // Act
            var retrievedUser = await _firebaseService.GetUserAsync(userId);

            // Assert
            Assert.NotNull(retrievedUser);
            Assert.Equal(user.Email, retrievedUser.Email);
            Assert.Equal(user.DisplayName, retrievedUser.DisplayName);
            Assert.Equal(user.Role, retrievedUser.Role);
        }

        [Fact]
        public async Task UpdateUser_ExistingUser_UpdatesUserInFirestore()
        {
            // Arrange
            var userId = Guid.NewGuid().ToString();
            var originalUser = new User
            {
                Id = userId,
                Email = $"update-test-{Guid.NewGuid()}@example.com",
                DisplayName = "Original Name",
                Role = "student",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _testDocuments.Add($"users/{userId}");

            await _firebaseService.CreateUserAsync(originalUser);

            var updatedUser = new User
            {
                Id = userId,
                Email = originalUser.Email,
                DisplayName = "Updated Name",
                Role = "teacher",
                CreatedAt = originalUser.CreatedAt,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            // Act
            await _firebaseService.UpdateUserAsync(updatedUser);

            // Assert
            var retrievedUser = await _firebaseService.GetUserAsync(userId);
            Assert.NotNull(retrievedUser);
            Assert.Equal(updatedUser.DisplayName, retrievedUser.DisplayName);
            Assert.Equal(updatedUser.Role, retrievedUser.Role);
            Assert.NotNull(retrievedUser.UpdatedAt);
        }

        [Fact]
        public async Task DeleteUser_ExistingUser_DeletesUserFromFirestore()
        {
            // Arrange
            var userId = Guid.NewGuid().ToString();
            var user = new User
            {
                Id = userId,
                Email = $"delete-test-{Guid.NewGuid()}@example.com",
                DisplayName = "Delete Test User",
                Role = "student",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _firebaseService.CreateUserAsync(user);

            // Act
            await _firebaseService.DeleteUserAsync(userId);

            // Assert
            var retrievedUser = await _firebaseService.GetUserAsync(userId);
            Assert.Null(retrievedUser);
        }

        [Fact]
        public async Task CreateFlashcard_ValidData_CreatesFlashcardInFirestore()
        {
            // Arrange
            var flashcard = new Flashcard
            {
                Id = Guid.NewGuid().ToString(),
                Front = "Firebase Test",
                Back = "Kiểm tra Firebase",
                CourseId = "test-course",
                SetId = "test-set",
                CreatedBy = "test-user",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _testDocuments.Add($"flashcards/{flashcard.Id}");

            // Act
            await _firebaseService.CreateFlashcardAsync(flashcard);

            // Assert
            var docRef = _firestore.Collection("flashcards").Document(flashcard.Id);
            var snapshot = await docRef.GetSnapshotAsync();

            Assert.True(snapshot.Exists);
            var retrievedFlashcard = snapshot.ConvertTo<Flashcard>();
            Assert.Equal(flashcard.Front, retrievedFlashcard.Front);
            Assert.Equal(flashcard.Back, retrievedFlashcard.Back);
            Assert.Equal(flashcard.CourseId, retrievedFlashcard.CourseId);
        }

        [Fact]
        public async Task GetFlashcardsByCourse_ExistingFlashcards_ReturnsFilteredFlashcards()
        {
            // Arrange
            var courseId = $"test-course-{Guid.NewGuid()}";
            var flashcards = new List<Flashcard>
            {
                new Flashcard
                {
                    Id = Guid.NewGuid().ToString(),
                    Front = "Test 1",
                    Back = "Kiểm tra 1",
                    CourseId = courseId,
                    SetId = "set-1",
                    CreatedBy = "test-user",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new Flashcard
                {
                    Id = Guid.NewGuid().ToString(),
                    Front = "Test 2",
                    Back = "Kiểm tra 2",
                    CourseId = courseId,
                    SetId = "set-2",
                    CreatedBy = "test-user",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new Flashcard
                {
                    Id = Guid.NewGuid().ToString(),
                    Front = "Different Course",
                    Back = "Khóa học khác",
                    CourseId = "different-course",
                    SetId = "set-3",
                    CreatedBy = "test-user",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                }
            };

            foreach (var flashcard in flashcards)
            {
                _testDocuments.Add($"flashcards/{flashcard.Id}");
                await _firebaseService.CreateFlashcardAsync(flashcard);
            }

            // Act
            var retrievedFlashcards = await _firebaseService.GetFlashcardsByCourseAsync(courseId);

            // Assert
            Assert.NotNull(retrievedFlashcards);
            Assert.Equal(2, retrievedFlashcards.Count());
            Assert.All(retrievedFlashcards, fc => Assert.Equal(courseId, fc.CourseId));
        }

        [Fact]
        public async Task CreateProgress_ValidData_CreatesProgressInFirestore()
        {
            // Arrange
            var progress = new Progress
            {
                Id = Guid.NewGuid().ToString(),
                UserId = "test-user",
                CourseId = "test-course",
                FlashcardId = "test-flashcard",
                IsLearned = true,
                LastReviewedAt = DateTime.UtcNow,
                ReviewCount = 1,
                CorrectCount = 1,
                CreatedAt = DateTime.UtcNow
            };

            _testDocuments.Add($"progress/{progress.Id}");

            // Act
            await _firebaseService.CreateProgressAsync(progress);

            // Assert
            var docRef = _firestore.Collection("progress").Document(progress.Id);
            var snapshot = await docRef.GetSnapshotAsync();

            Assert.True(snapshot.Exists);
            var retrievedProgress = snapshot.ConvertTo<Progress>();
            Assert.Equal(progress.UserId, retrievedProgress.UserId);
            Assert.Equal(progress.CourseId, retrievedProgress.CourseId);
            Assert.Equal(progress.IsLearned, retrievedProgress.IsLearned);
        }

        [Fact]
        public async Task GetUserProgress_ExistingProgress_ReturnsUserProgress()
        {
            // Arrange
            var userId = $"test-user-{Guid.NewGuid()}";
            var courseId = $"test-course-{Guid.NewGuid()}";

            var progressItems = new List<Progress>
            {
                new Progress
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    CourseId = courseId,
                    FlashcardId = "flashcard-1",
                    IsLearned = true,
                    LastReviewedAt = DateTime.UtcNow,
                    ReviewCount = 3,
                    CorrectCount = 2,
                    CreatedAt = DateTime.UtcNow
                },
                new Progress
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    CourseId = courseId,
                    FlashcardId = "flashcard-2",
                    IsLearned = false,
                    LastReviewedAt = DateTime.UtcNow,
                    ReviewCount = 1,
                    CorrectCount = 0,
                    CreatedAt = DateTime.UtcNow
                }
            };

            foreach (var progress in progressItems)
            {
                _testDocuments.Add($"progress/{progress.Id}");
                await _firebaseService.CreateProgressAsync(progress);
            }

            // Act
            var retrievedProgress = await _firebaseService.GetUserProgressAsync(userId, courseId);

            // Assert
            Assert.NotNull(retrievedProgress);
            Assert.Equal(2, retrievedProgress.Count());
            Assert.All(retrievedProgress, p => Assert.Equal(userId, p.UserId));
            Assert.All(retrievedProgress, p => Assert.Equal(courseId, p.CourseId));
        }

        [Fact]
        public async Task TestConnection_ValidConfiguration_ReturnsTrue()
        {
            // Act
            var isConnected = await _firebaseService.TestConnectionAsync();

            // Assert
            Assert.True(isConnected);
        }

        [Fact]
        public async Task BatchOperations_MultipleOperations_ExecutesSuccessfully()
        {
            // Arrange
            var batch = _firestore.StartBatch();
            var users = new List<User>();

            for (int i = 0; i < 3; i++)
            {
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = $"batch-test-{i}-{Guid.NewGuid()}@example.com",
                    DisplayName = $"Batch Test User {i}",
                    Role = "student",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                users.Add(user);
                _testDocuments.Add($"users/{user.Id}");

                var docRef = _firestore.Collection("users").Document(user.Id);
                batch.Set(docRef, user);
            }

            // Act
            await batch.CommitAsync();

            // Assert
            foreach (var user in users)
            {
                var retrievedUser = await _firebaseService.GetUserAsync(user.Id);
                Assert.NotNull(retrievedUser);
                Assert.Equal(user.Email, retrievedUser.Email);
            }
        }

        public void Dispose()
        {
            // Cleanup test documents
            var cleanupTasks = _testDocuments.Select(async docPath =>
            {
                try
                {
                    var parts = docPath.Split('/');
                    if (parts.Length == 2)
                    {
                        await _firestore.Collection(parts[0]).Document(parts[1]).DeleteAsync();
                    }
                }
                catch
                {
                    // Ignore cleanup errors
                }
            });

            Task.WaitAll(cleanupTasks.ToArray(), TimeSpan.FromSeconds(30));
        }
    }
}