using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http;
using Xunit;
using BingGoWebAPI.Tests.Integration;

namespace BingGoWebAPI.Tests.Integration.Controllers
{
    public class UserControllerIntegrationTests : BaseIntegrationTest
    {
        public UserControllerIntegrationTests(WebApplicationFactory<Program> factory) : base(factory) { }

        [Fact]
        public async Task GetUsers_AdminUser_ReturnsUserList()
        {
            // Arrange
            var adminUserId = await CreateAdminUserAsync();
            var token = await GetAuthTokenAsync($"admin-{adminUserId}@example.com", "AdminPassword123!");
            SetAuthHeader(token);

            // Act
            var response = await _client.GetAsync("/api/users");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic[]>(response);
            Assert.NotNull(result);

            // Cleanup
            await CleanupTestDataAsync("users", adminUserId);
        }

        [Fact]
        public async Task GetUsers_NonAdminUser_ReturnsForbidden()
        {
            // Arrange
            var userId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"test-{userId}@example.com", "TestPassword123!");
            SetAuthHeader(token);

            // Act
            var response = await _client.GetAsync("/api/users");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

            // Cleanup
            await CleanupTestDataAsync("users", userId);
        }

        [Fact]
        public async Task GetUserById_ExistingUser_ReturnsUser()
        {
            // Arrange
            var adminUserId = await CreateAdminUserAsync();
            var targetUserId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"admin-{adminUserId}@example.com", "AdminPassword123!");
            SetAuthHeader(token);

            // Act
            var response = await _client.GetAsync($"/api/users/{targetUserId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic>(response);
            Assert.NotNull(result);
            Assert.Equal(targetUserId, result.Id);

            // Cleanup
            await CleanupTestDataAsync("users", adminUserId);
            await CleanupTestDataAsync("users", targetUserId);
        }

        [Fact]
        public async Task CreateUser_AdminUser_ReturnsCreatedUser()
        {
            // Arrange
            var adminUserId = await CreateAdminUserAsync();
            var token = await GetAuthTokenAsync($"admin-{adminUserId}@example.com", "AdminPassword123!");
            SetAuthHeader(token);

            var newUserData = new
            {
                Email = $"new-user-{Guid.NewGuid()}@example.com",
                Password = "NewUserPassword123!",
                Role = "teacher",
                DisplayName = "New Teacher User",
                FirstName = "New",
                LastName = "Teacher"
            };

            // Act
            var response = await PostJsonAsync("/api/users", newUserData);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic>(response);
            Assert.NotNull(result);
            Assert.Equal(newUserData.Email, result.Email);
            Assert.Equal(newUserData.Role, result.Role);

            // Cleanup
            await CleanupTestDataAsync("users", adminUserId);
            await CleanupTestDataAsync("users", result.Id.ToString());
        }

        [Fact]
        public async Task UpdateUser_AdminUser_ReturnsUpdatedUser()
        {
            // Arrange
            var adminUserId = await CreateAdminUserAsync();
            var targetUserId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"admin-{adminUserId}@example.com", "AdminPassword123!");
            SetAuthHeader(token);

            var updateData = new
            {
                DisplayName = "Updated Display Name",
                FirstName = "Updated",
                LastName = "Name",
                Role = "teacher"
            };

            // Act
            var response = await PutJsonAsync($"/api/users/{targetUserId}", updateData);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic>(response);
            Assert.NotNull(result);
            Assert.Equal(updateData.DisplayName, result.DisplayName);
            Assert.Equal(updateData.Role, result.Role);

            // Cleanup
            await CleanupTestDataAsync("users", adminUserId);
            await CleanupTestDataAsync("users", targetUserId);
        }

        [Fact]
        public async Task DeleteUser_AdminUser_ReturnsNoContent()
        {
            // Arrange
            var adminUserId = await CreateAdminUserAsync();
            var targetUserId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"admin-{adminUserId}@example.com", "AdminPassword123!");
            SetAuthHeader(token);

            // Act
            var response = await _client.DeleteAsync($"/api/users/{targetUserId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify deletion
            var getResponse = await _client.GetAsync($"/api/users/{targetUserId}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);

            // Cleanup
            await CleanupTestDataAsync("users", adminUserId);
        }

        [Fact]
        public async Task SearchUsers_AdminUser_ReturnsFilteredUsers()
        {
            // Arrange
            var adminUserId = await CreateAdminUserAsync();
            var token = await GetAuthTokenAsync($"admin-{adminUserId}@example.com", "AdminPassword123!");
            SetAuthHeader(token);

            // Create test users
            var user1Data = new
            {
                Email = $"search-test-1-{Guid.NewGuid()}@example.com",
                Password = "TestPassword123!",
                Role = "student",
                DisplayName = "Search Test Student"
            };

            var user2Data = new
            {
                Email = $"search-test-2-{Guid.NewGuid()}@example.com",
                Password = "TestPassword123!",
                Role = "teacher",
                DisplayName = "Search Test Teacher"
            };

            var createResponse1 = await PostJsonAsync("/api/users", user1Data);
            var createResponse2 = await PostJsonAsync("/api/users", user2Data);

            createResponse1.EnsureSuccessStatusCode();
            createResponse2.EnsureSuccessStatusCode();

            var created1 = await DeserializeResponseAsync<dynamic>(createResponse1);
            var created2 = await DeserializeResponseAsync<dynamic>(createResponse2);

            // Act
            var response = await _client.GetAsync("/api/users/search?role=student");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic[]>(response);
            Assert.NotNull(result);
            Assert.Contains(result, u => u.Role == "student");

            // Cleanup
            await CleanupTestDataAsync("users", adminUserId);
            await CleanupTestDataAsync("users", created1.Id.ToString());
            await CleanupTestDataAsync("users", created2.Id.ToString());
        }

        [Fact]
        public async Task UpdateUserRole_AdminUser_ReturnsUpdatedUser()
        {
            // Arrange
            var adminUserId = await CreateAdminUserAsync();
            var targetUserId = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync($"admin-{adminUserId}@example.com", "AdminPassword123!");
            SetAuthHeader(token);

            var roleUpdateData = new { Role = "teacher" };

            // Act
            var response = await PutJsonAsync($"/api/users/{targetUserId}/role", roleUpdateData);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic>(response);
            Assert.NotNull(result);
            Assert.Equal("teacher", result.Role);

            // Cleanup
            await CleanupTestDataAsync("users", adminUserId);
            await CleanupTestDataAsync("users", targetUserId);
        }

        private async Task<string> CreateAdminUserAsync()
        {
            var adminUser = new
            {
                Email = $"admin-{Guid.NewGuid()}@example.com",
                Password = "AdminPassword123!",
                Role = "admin",
                DisplayName = "Test Admin User"
            };

            var response = await PostJsonAsync("/api/auth/register", adminUser);
            response.EnsureSuccessStatusCode();

            var result = await DeserializeResponseAsync<dynamic>(response);
            return result?.UserId ?? throw new Exception("Failed to create admin user");
        }
    }
}