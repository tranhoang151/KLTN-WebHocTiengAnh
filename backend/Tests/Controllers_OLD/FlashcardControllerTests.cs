using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using BingGoWebAPI.Controllers;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace BingGoWebAPI.Tests.Controllers
{
    public class FlashcardControllerTests
    {
        private readonly Mock<IFirebaseService> _mockFirebaseService;
        private readonly Mock<ILogger<FlashcardController>> _mockLogger;
        private readonly FlashcardController _controller;

        public FlashcardControllerTests()
        {
            _mockFirebaseService = new Mock<IFirebaseService>();
            _mockLogger = new Mock<ILogger<FlashcardController>>();
            _controller = new FlashcardController(_mockFirebaseService.Object, _mockLogger.Object);

            // Setup authenticated user context
            SetupAuthenticatedUser("test-user-id", "teacher");
        }

        private void SetupAuthenticatedUser(string userId, string role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, role)
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };
        }

        [Fact]
        public async Task GetFlashcardSets_ReturnsAllSets()
        {
            // Arrange
            var expectedSets = new List<FlashcardSet>
            {
                new FlashcardSet
                {
                    Id = "set1",
                    Title = "Basic Greetings",
                    Description = "Common greeting phrases",
                    FlashcardCount = 10,
                    Difficulty = "easy",
                    IsPublic = true,
                    CreatedBy = "teacher1"
                },
                new FlashcardSet
                {
                    Id = "set2",
                    Title = "Numbers",
                    Description = "Numbers 1-100",
                    FlashcardCount = 100,
                    Difficulty = "medium",
                    IsPublic = true,
                    CreatedBy = "teacher2"
                }
            };

            _mockFirebaseService
                .Setup(x => x.GetFlashcardSetsAsync())
                .ReturnsAsync(expectedSets);

            // Act
            var result = await _controller.GetFlashcardSets();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<FlashcardSet>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(2, response.Data.Count);
            Assert.Equal("Basic Greetings", response.Data[0].Title);
        }

        [Fact]
        public async Task GetFlashcardSet_ExistingId_ReturnsSet()
        {
            // Arrange
            var setId = "set1";
            var expectedSet = new FlashcardSet
            {
                Id = setId,
                Title = "Test Set",
                Description = "A test flashcard set",
                FlashcardCount = 5,
                Difficulty = "easy",
                IsPublic = true,
                CreatedBy = "test-user-id"
            };

            _mockFirebaseService
                .Setup(x => x.GetFlashcardSetAsync(setId))
                .ReturnsAsync(expectedSet);

            // Act
            var result = await _controller.GetFlashcardSet(setId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<FlashcardSet>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedSet.Title, response.Data.Title);
        }

        [Fact]
        public async Task GetFlashcardSet_NonExistentId_ReturnsNotFound()
        {
            // Arrange
            var setId = "nonexistent";

            _mockFirebaseService
                .Setup(x => x.GetFlashcardSetAsync(setId))
                .ReturnsAsync((FlashcardSet)null);

            // Act
            var result = await _controller.GetFlashcardSet(setId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(notFoundResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Flashcard set not found", response.Error);
        }

        [Fact]
        public async Task CreateFlashcardSet_ValidData_ReturnsCreated()
        {
            // Arrange
            var createRequest = new CreateFlashcardSetRequest
            {
                Title = "New Set",
                Description = "A new flashcard set",
                Difficulty = "medium",
                IsPublic = false
            };

            var createdSet = new FlashcardSet
            {
                Id = "new-set-id",
                Title = createRequest.Title,
                Description = createRequest.Description,
                Difficulty = createRequest.Difficulty,
                IsPublic = createRequest.IsPublic,
                CreatedBy = "test-user-id",
                FlashcardCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _mockFirebaseService
                .Setup(x => x.CreateFlashcardSetAsync(It.IsAny<FlashcardSet>()))
                .ReturnsAsync(createdSet);

            // Act
            var result = await _controller.CreateFlashcardSet(createRequest);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var response = Assert.IsType<ApiResponse<FlashcardSet>>(createdResult.Value);
            Assert.True(response.Success);
            Assert.Equal(createRequest.Title, response.Data.Title);
            Assert.Equal("test-user-id", response.Data.CreatedBy);
        }

        [Fact]
        public async Task CreateFlashcardSet_MissingTitle_ReturnsBadRequest()
        {
            // Arrange
            var createRequest = new CreateFlashcardSetRequest
            {
                Title = "",
                Description = "Description without title",
                Difficulty = "easy"
            };

            // Act
            var result = await _controller.CreateFlashcardSet(createRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Title is required", response.Error);
        }

        [Fact]
        public async Task UpdateFlashcardSet_ValidData_ReturnsUpdated()
        {
            // Arrange
            var setId = "set1";
            var updateRequest = new UpdateFlashcardSetRequest
            {
                Title = "Updated Title",
                Description = "Updated description",
                Difficulty = "hard"
            };

            var existingSet = new FlashcardSet
            {
                Id = setId,
                Title = "Original Title",
                CreatedBy = "test-user-id"
            };

            var updatedSet = new FlashcardSet
            {
                Id = setId,
                Title = updateRequest.Title,
                Description = updateRequest.Description,
                Difficulty = updateRequest.Difficulty,
                CreatedBy = "test-user-id",
                UpdatedAt = DateTime.UtcNow
            };

            _mockFirebaseService
                .Setup(x => x.GetFlashcardSetAsync(setId))
                .ReturnsAsync(existingSet);

            _mockFirebaseService
                .Setup(x => x.UpdateFlashcardSetAsync(setId, It.IsAny<FlashcardSet>()))
                .ReturnsAsync(updatedSet);

            // Act
            var result = await _controller.UpdateFlashcardSet(setId, updateRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<FlashcardSet>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(updateRequest.Title, response.Data.Title);
        }

        [Fact]
        public async Task UpdateFlashcardSet_UnauthorizedUser_ReturnsForbidden()
        {
            // Arrange
            var setId = "set1";
            var updateRequest = new UpdateFlashcardSetRequest
            {
                Title = "Updated Title"
            };

            var existingSet = new FlashcardSet
            {
                Id = setId,
                Title = "Original Title",
                CreatedBy = "different-user-id" // Different from authenticated user
            };

            _mockFirebaseService
                .Setup(x => x.GetFlashcardSetAsync(setId))
                .ReturnsAsync(existingSet);

            // Act
            var result = await _controller.UpdateFlashcardSet(setId, updateRequest);

            // Assert
            var forbiddenResult = Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task DeleteFlashcardSet_ExistingSet_ReturnsNoContent()
        {
            // Arrange
            var setId = "set1";
            var existingSet = new FlashcardSet
            {
                Id = setId,
                CreatedBy = "test-user-id"
            };

            _mockFirebaseService
                .Setup(x => x.GetFlashcardSetAsync(setId))
                .ReturnsAsync(existingSet);

            _mockFirebaseService
                .Setup(x => x.DeleteFlashcardSetAsync(setId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeleteFlashcardSet(setId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task GetFlashcards_ExistingSet_ReturnsFlashcards()
        {
            // Arrange
            var setId = "set1";
            var expectedFlashcards = new List<Flashcard>
            {
                new Flashcard
                {
                    Id = "card1",
                    Front = "Hello",
                    Back = "Xin chào",
                    SetId = setId,
                    Order = 0
                },
                new Flashcard
                {
                    Id = "card2",
                    Front = "Goodbye",
                    Back = "Tạm biệt",
                    SetId = setId,
                    Order = 1
                }
            };

            _mockFirebaseService
                .Setup(x => x.GetFlashcardsAsync(setId))
                .ReturnsAsync(expectedFlashcards);

            // Act
            var result = await _controller.GetFlashcards(setId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<Flashcard>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(2, response.Data.Count);
            Assert.Equal("Hello", response.Data[0].Front);
        }

        [Fact]
        public async Task CreateFlashcard_ValidData_ReturnsCreated()
        {
            // Arrange
            var setId = "set1";
            var createRequest = new CreateFlashcardRequest
            {
                Front = "New Card",
                Back = "Thẻ mới",
                Difficulty = "easy"
            };

            var createdCard = new Flashcard
            {
                Id = "new-card-id",
                Front = createRequest.Front,
                Back = createRequest.Back,
                SetId = setId,
                Difficulty = createRequest.Difficulty,
                Order = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _mockFirebaseService
                .Setup(x => x.CreateFlashcardAsync(It.IsAny<Flashcard>()))
                .ReturnsAsync(createdCard);

            // Act
            var result = await _controller.CreateFlashcard(setId, createRequest);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var response = Assert.IsType<ApiResponse<Flashcard>>(createdResult.Value);
            Assert.True(response.Success);
            Assert.Equal(createRequest.Front, response.Data.Front);
            Assert.Equal(setId, response.Data.SetId);
        }

        [Fact]
        public async Task AssignFlashcardSet_ValidData_ReturnsCreated()
        {
            // Arrange
            var assignRequest = new AssignFlashcardSetRequest
            {
                SetId = "set1",
                ClassId = "class1",
                DueDate = DateTime.UtcNow.AddDays(7)
            };

            var assignment = new FlashcardAssignment
            {
                Id = "assignment1",
                SetId = assignRequest.SetId,
                ClassId = assignRequest.ClassId,
                DueDate = assignRequest.DueDate,
                AssignedBy = "test-user-id",
                CreatedAt = DateTime.UtcNow
            };

            _mockFirebaseService
                .Setup(x => x.CreateFlashcardAssignmentAsync(It.IsAny<FlashcardAssignment>()))
                .ReturnsAsync(assignment);

            // Act
            var result = await _controller.AssignFlashcardSet(assignRequest);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var response = Assert.IsType<ApiResponse<FlashcardAssignment>>(createdResult.Value);
            Assert.True(response.Success);
            Assert.Equal(assignRequest.SetId, response.Data.SetId);
            Assert.Equal("test-user-id", response.Data.AssignedBy);
        }

        [Fact]
        public async Task GetStudentProgress_ValidIds_ReturnsProgress()
        {
            // Arrange
            var setId = "set1";
            var studentId = "student1";
            var expectedProgress = new FlashcardProgress
            {
                SetId = setId,
                StudentId = studentId,
                CompletedCards = 5,
                TotalCards = 10,
                Accuracy = 0.8,
                TimeSpent = 300,
                LastStudied = DateTime.UtcNow
            };

            _mockFirebaseService
                .Setup(x => x.GetFlashcardProgressAsync(setId, studentId))
                .ReturnsAsync(expectedProgress);

            // Act
            var result = await _controller.GetStudentProgress(setId, studentId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<FlashcardProgress>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(5, response.Data.CompletedCards);
            Assert.Equal(0.8, response.Data.Accuracy);
        }

        [Fact]
        public async Task SearchFlashcardSets_WithQuery_ReturnsFilteredResults()
        {
            // Arrange
            var query = "greeting";
            var expectedResults = new List<FlashcardSet>
            {
                new FlashcardSet
                {
                    Id = "set1",
                    Title = "Basic Greetings",
                    Description = "Common greeting phrases"
                }
            };

            _mockFirebaseService
                .Setup(x => x.SearchFlashcardSetsAsync(query, null, null, null))
                .ReturnsAsync(expectedResults);

            // Act
            var result = await _controller.SearchFlashcardSets(query);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<FlashcardSet>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Single(response.Data);
            Assert.Contains("Greetings", response.Data[0].Title);
        }
    }
}