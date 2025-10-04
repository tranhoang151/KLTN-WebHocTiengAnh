using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using Xunit;
using Google.Cloud.Firestore;
using Firebase.Auth;
using System.Text.Json;
using System.Text;

namespace BingGoWebAPI.Tests.Integration
{
    public class BaseIntegrationTest : IClassFixture<WebApplicationFactory<Program>>
    {
        protected readonly WebApplicationFactory<Program> _factory;
        protected readonly HttpClient _client;
        protected readonly IConfiguration _configuration;
        protected readonly FirestoreDb _firestore;

        public BaseIntegrationTest(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.ConfigureServices(services =>
                {
                    // Override services for testing
                    services.AddSingleton<IConfiguration>(provider =>
                    {
                        return new ConfigurationBuilder()
                            .AddJsonFile("appsettings.Testing.json", optional: true)
                            .AddEnvironmentVariables()
                            .Build();
                    });
                });
            });

            _client = _factory.CreateClient();
            _configuration = _factory.Services.GetRequiredService<IConfiguration>();

            // Initialize test Firestore instance
            var projectId = _configuration["Firebase:ProjectId"] ?? "binggo-test";
            _firestore = FirestoreDb.Create(projectId);
        }

        protected async Task<HttpResponseMessage> PostJsonAsync<T>(string requestUri, T data)
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return await _client.PostAsync(requestUri, content);
        }

        protected async Task<HttpResponseMessage> PutJsonAsync<T>(string requestUri, T data)
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return await _client.PutAsync(requestUri, content);
        }

        protected async Task<T?> DeserializeResponseAsync<T>(HttpResponseMessage response)
        {
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }

        protected async Task CleanupTestDataAsync(string collection, string documentId)
        {
            try
            {
                await _firestore.Collection(collection).Document(documentId).DeleteAsync();
            }
            catch
            {
                // Ignore cleanup errors
            }
        }

        protected async Task<string> CreateTestUserAsync()
        {
            var testUser = new
            {
                Email = $"test-{Guid.NewGuid()}@example.com",
                Password = "TestPassword123!",
                Role = "student",
                DisplayName = "Test User"
            };

            var response = await PostJsonAsync("/api/auth/register", testUser);
            response.EnsureSuccessStatusCode();

            var result = await DeserializeResponseAsync<dynamic>(response);
            return result?.UserId ?? throw new Exception("Failed to create test user");
        }

        protected async Task<string> GetAuthTokenAsync(string email, string password)
        {
            var loginData = new { Email = email, Password = password };
            var response = await PostJsonAsync("/api/auth/login", loginData);
            response.EnsureSuccessStatusCode();

            var result = await DeserializeResponseAsync<dynamic>(response);
            return result?.Token ?? throw new Exception("Failed to get auth token");
        }

        protected void SetAuthHeader(string token)
        {
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }
    }
}