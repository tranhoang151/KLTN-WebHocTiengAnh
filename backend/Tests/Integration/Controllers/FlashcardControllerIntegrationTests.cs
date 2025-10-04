using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http;
using Xunit;
using BingGoWebAPI.Tests.Integration;

namespace BingGoWebAPI.Tests.Integration.Controllers
{
    public class FlashcardControllerIntegrationTests : BaseIntegrationTest
    {
        public FlashcardControllerIntegrationTests(WebApplicationFactory<Program> factory) : base(factory) { }

        [Fact]
        public async Task GetFlashcards_AuthenticatedUser_ReturnsFlashcards()
        {
            // Arrange
            var userId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"test-{userId}@example.com", "TestPassword123!");
            SetAuthHeader(token);

            // Act
            var response = await _client.GetAsync("/api/flashcards");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic[]>(response);
            Assert.NotNull(result);

            // Cleanup
            await CleanupTestDataAsync("users", userId);
        }

        [Fact]
        public async Task CreateFlashcard_ValidData_ReturnsCreatedFlashcard()
        {
            // Arrange
            var userId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"test-{userId}@example.com", "TestPassword123!");
            SetAuthHeader(token);

            var flashcardData = new
            {
                Front = "Hello",
                Back = "Xin chào",
                CourseId = "test-course-id",
                SetId = "test-set-id",
                ImageUrl = "https://example.com/image.jpg",
                AudioUrl = "https://example.com/audio.mp3",
                Difficulty = "beginner",
                Tags = new[] { "greeting", "basic" }
            };

            // Act
            var response = await PostJsonAsync("/api/flashcards", flashcardData);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic>(response);
            Assert.NotNull(result);
            Assert.Equal(flashcardData.Front, result.Front);
            Assert.Equal(flashcardData.Back, result.Back);

            // Cleanup
            await CleanupTestDataAsync("flashcards", result.Id.ToString());
            await CleanupTestDataAsync("users", userId);
        }

        [Fact]
        public async Task UpdateFlashcard_ValidData_ReturnsUpdatedFlashcard()
        {
            // Arrange
            var userId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"test-{userId}@example.com", "TestPassword123!");
            SetAuthHeader(token);

            // Create flashcard first
            var createData = new
            {
                Front = "Original Front",
                Back = "Original Back",
                CourseId = "test-course-id",
                SetId = "test-set-id"
            };

            var createResponse = await PostJsonAsync("/api/flashcards", createData);
            createResponse.EnsureSuccessStatusCode();
            var createdFlashcard = await DeserializeResponseAsync<dynamic>(createResponse);

            // Update data
            var updateData = new
            {
                Front = "Updated Front",
                Back = "Updated Back",
                CourseId = "test-course-id",
                SetId = "test-set-id"
            };

            // Act
            var response = await PutJsonAsync($"/api/flashcards/{createdFlashcard.Id}", updateData);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic>(response);
            Assert.NotNull(result);
            Assert.Equal(updateData.Front, result.Front);
            Assert.Equal(updateData.Back, result.Back);

            // Cleanup
            await CleanupTestDataAsync("flashcards", createdFlashcard.Id.ToString());
            await CleanupTestDataAsync("users", userId);
        }

        [Fact]
        public async Task DeleteFlashcard_ExistingFlashcard_ReturnsNoContent()
        {
            // Arrange
            var userId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"test-{userId}@example.com", "TestPassword123!");
            SetAuthHeader(token);

            // Create flashcard first
            var createData = new
            {
                Front = "To Delete",
                Back = "Sẽ xóa",
                CourseId = "test-course-id",
                SetId = "test-set-id"
            };

            var createResponse = await PostJsonAsync("/api/flashcards", createData);
            createResponse.EnsureSuccessStatusCode();
            var createdFlashcard = await DeserializeResponseAsync<dynamic>(createResponse);

            // Act
            var response = await _client.DeleteAsync($"/api/flashcards/{createdFlashcard.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify deletion
            var getResponse = await _client.GetAsync($"/api/flashcards/{createdFlashcard.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);

            // Cleanup
            await CleanupTestDataAsync("users", userId);
        }

        [Fact]
        public async Task GetFlashcardsByCourse_ValidCourseId_ReturnsFilteredFlashcards()
        {
            // Arrange
            var userId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"test-{userId}@example.com", "TestPassword123!");
            SetAuthHeader(token);

            var courseId = "integration-test-course";

            // Create test flashcards
            var flashcard1 = new
            {
                Front = "Test 1",
                Back = "Kiểm tra 1",
                CourseId = courseId,
                SetId = "test-set-1"
            };

            var flashcard2 = new
            {
                Front = "Test 2",
                Back = "Kiểm tra 2",
                CourseId = "different-course",
                SetId = "test-set-2"
            };

            var response1 = await PostJsonAsync("/api/flashcards", flashcard1);
            var response2 = await PostJsonAsync("/api/flashcards", flashcard2);

            response1.EnsureSuccessStatusCode();
            response2.EnsureSuccessStatusCode();

            var created1 = await DeserializeResponseAsync<dynamic>(response1);
            var created2 = await DeserializeResponseAsync<dynamic>(response2);

            // Act
            var response = await _client.GetAsync($"/api/flashcards/course/{courseId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic[]>(response);
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(flashcard1.Front, result[0].Front);

            // Cleanup
            await CleanupTestDataAsync("flashcards", created1.Id.ToString());
            await CleanupTestDataAsync("flashcards", created2.Id.ToString());
            await CleanupTestDataAsync("users", userId);
        }

        [Fact]
        public async Task GetFlashcards_UnauthenticatedUser_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/flashcards");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task CreateFlashcard_InvalidData_ReturnsBadRequest()
        {
            // Arrange
            var userId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"test-{userId}@example.com", "TestPassword123!");
            SetAuthHeader(token);

            var invalidData = new
            {
                // Missing required fields
                Front = "",
                Back = ""
            };

            // Act
            var response = await PostJsonAsync("/api/flashcards", invalidData);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            // Cleanup
            await CleanupTestDataAsync("users", userId);
        }
    }
}