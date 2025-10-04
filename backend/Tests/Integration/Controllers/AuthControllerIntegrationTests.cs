using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http;
using Xunit;
using BingGoWebAPI.Tests.Integration;

namespace BingGoWebAPI.Tests.Integration.Controllers
{
    public class AuthControllerIntegrationTests : BaseIntegrationTest
    {
        public AuthControllerIntegrationTests(WebApplicationFactory<Program> factory) : base(factory) { }

        [Fact]
        public async Task Register_ValidUser_ReturnsSuccess()
        {
            // Arrange
            var newUser = new
            {
                Email = $"integration-test-{Guid.NewGuid()}@example.com",
                Password = "TestPassword123!",
                Role = "student",
                DisplayName = "Integration Test User"
            };

            // Act
            var response = await PostJsonAsync("/api/auth/register", newUser);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic>(response);
            Assert.NotNull(result);
            Assert.NotNull(result.UserId);
            Assert.Equal(newUser.Email, result.Email);

            // Cleanup
            await CleanupTestDataAsync("users", result.UserId.ToString());
        }

        [Fact]
        public async Task Register_DuplicateEmail_ReturnsBadRequest()
        {
            // Arrange
            var email = $"duplicate-test-{Guid.NewGuid()}@example.com";
            var user1 = new
            {
                Email = email,
                Password = "TestPassword123!",
                Role = "student",
                DisplayName = "User 1"
            };
            var user2 = new
            {
                Email = email,
                Password = "TestPassword456!",
                Role = "teacher",
                DisplayName = "User 2"
            };

            // Act
            var response1 = await PostJsonAsync("/api/auth/register", user1);
            var response2 = await PostJsonAsync("/api/auth/register", user2);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response1.StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, response2.StatusCode);

            // Cleanup
            var result1 = await DeserializeResponseAsync<dynamic>(response1);
            if (result1?.UserId != null)
            {
                await CleanupTestDataAsync("users", result1.UserId.ToString());
            }
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsToken()
        {
            // Arrange
            var email = $"login-test-{Guid.NewGuid()}@example.com";
            var password = "TestPassword123!";
            var registerData = new
            {
                Email = email,
                Password = password,
                Role = "student",
                DisplayName = "Login Test User"
            };

            var registerResponse = await PostJsonAsync("/api/auth/register", registerData);
            registerResponse.EnsureSuccessStatusCode();

            var loginData = new { Email = email, Password = password };

            // Act
            var response = await PostJsonAsync("/api/auth/login", loginData);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic>(response);
            Assert.NotNull(result);
            Assert.NotNull(result.Token);
            Assert.Equal(email, result.Email);

            // Cleanup
            var registerResult = await DeserializeResponseAsync<dynamic>(registerResponse);
            if (registerResult?.UserId != null)
            {
                await CleanupTestDataAsync("users", registerResult.UserId.ToString());
            }
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var loginData = new
            {
                Email = "nonexistent@example.com",
                Password = "WrongPassword123!"
            };

            // Act
            var response = await PostJsonAsync("/api/auth/login", loginData);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetProfile_AuthenticatedUser_ReturnsProfile()
        {
            // Arrange
            var email = $"profile-test-{Guid.NewGuid()}@example.com";
            var password = "TestPassword123!";
            var registerData = new
            {
                Email = email,
                Password = password,
                Role = "student",
                DisplayName = "Profile Test User"
            };

            var registerResponse = await PostJsonAsync("/api/auth/register", registerData);
            registerResponse.EnsureSuccessStatusCode();

            var token = await GetAuthTokenAsync(email, password);
            SetAuthHeader(token);

            // Act
            var response = await _client.GetAsync("/api/auth/profile");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await DeserializeResponseAsync<dynamic>(response);
            Assert.NotNull(result);
            Assert.Equal(email, result.Email);

            // Cleanup
            var registerResult = await DeserializeResponseAsync<dynamic>(registerResponse);
            if (registerResult?.UserId != null)
            {
                await CleanupTestDataAsync("users", registerResult.UserId.ToString());
            }
        }

        [Fact]
        public async Task GetProfile_UnauthenticatedUser_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/auth/profile");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Logout_AuthenticatedUser_ReturnsSuccess()
        {
            // Arrange
            var email = $"logout-test-{Guid.NewGuid()}@example.com";
            var password = "TestPassword123!";
            var registerData = new
            {
                Email = email,
                Password = password,
                Role = "student",
                DisplayName = "Logout Test User"
            };

            var registerResponse = await PostJsonAsync("/api/auth/register", registerData);
            registerResponse.EnsureSuccessStatusCode();

            var token = await GetAuthTokenAsync(email, password);
            SetAuthHeader(token);

            // Act
            var response = await _client.PostAsync("/api/auth/logout", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            // Cleanup
            var registerResult = await DeserializeResponseAsync<dynamic>(registerResponse);
            if (registerResult?.UserId != null)
            {
                await CleanupTestDataAsync("users", registerResult.UserId.ToString());
            }
        }
    }
}