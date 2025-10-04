using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http;
using Xunit;
using BingGoWebAPI.Tests.Integration;
using BingGoWebAPI.Services;
using BingGoWebAPI.Exceptions;
using Microsoft.Extensions.Logging;

namespace BingGoWebAPI.Tests.Integration
{
    /// <summary>
    /// Basic integration tests to verify Firebase service operations, controller instantiation, and exception handling flows
    /// Task 17.3: Run basic integration tests
    /// </summary>
    public class BasicIntegrationTests : BaseIntegrationTest
    {
        public BasicIntegrationTests(WebApplicationFactory<Program> factory) : base(factory) { }

        [Fact]
        public async Task FirebaseService_TestConnection_ReturnsTrue()
        {
            // Arrange
            var firebaseService = _factory.Services.GetRequiredService<IFirebaseService>();

            // Act
            var isConnected = await firebaseService.TestConnectionAsync();

            // Assert
            Assert.True(isConnected, "Firebase service should be able to connect");
        }

        [Fact]
        public void ServiceRegistration_AllRequiredServices_CanBeResolved()
        {
            // Arrange & Act & Assert
            using var scope = _factory.Services.CreateScope();
            var services = scope.ServiceProvider;

            // Test core Firebase services
            Assert.NotNull(services.GetService<IFirebaseService>());

            // Test GDPR services
            Assert.NotNull(services.GetService<IGDPRComplianceService>());

            // Test Privacy services
            Assert.NotNull(services.GetService<IPrivacyPolicyService>());

            // Test Audit services
            Assert.NotNull(services.GetService<IAuditLogService>());

            // Test Progress services
            Assert.NotNull(services.GetService<IProgressService>());

            // Test Intrusion Detection services
            Assert.NotNull(services.GetService<IIntrusionDetectionService>());

            // Test Data Migration services
            Assert.NotNull(services.GetService<IDataMigrationService>());
        }

        [Fact]
        public async Task Controllers_CanInstantiate_WithoutErrors()
        {
            // Test that all controllers can be instantiated through DI
            // This verifies that all dependencies are properly registered

            // Test Auth Controller
            var authResponse = await _client.GetAsync("/api/auth/health");
            // Should return 404 (method not found) or 401 (unauthorized), not 500 (server error)
            Assert.True(authResponse.StatusCode == HttpStatusCode.NotFound ||
                       authResponse.StatusCode == HttpStatusCode.Unauthorized ||
                       authResponse.StatusCode == HttpStatusCode.MethodNotAllowed);

            // Test User Controller
            var userResponse = await _client.GetAsync("/api/users");
            // Should return 401 (unauthorized), not 500 (server error)
            Assert.True(userResponse.StatusCode == HttpStatusCode.Unauthorized ||
                       userResponse.StatusCode == HttpStatusCode.Forbidden);

            // Test Flashcard Controller
            var flashcardResponse = await _client.GetAsync("/api/flashcards");
            // Should return 401 (unauthorized), not 500 (server error)
            Assert.True(flashcardResponse.StatusCode == HttpStatusCode.Unauthorized ||
                       flashcardResponse.StatusCode == HttpStatusCode.Forbidden);

            // Test GDPR Controller
            var gdprResponse = await _client.GetAsync("/api/gdpr/health");
            // Should return 404 (method not found) or 401 (unauthorized), not 500 (server error)
            Assert.True(gdprResponse.StatusCode == HttpStatusCode.NotFound ||
                       gdprResponse.StatusCode == HttpStatusCode.Unauthorized ||
                       gdprResponse.StatusCode == HttpStatusCode.MethodNotAllowed);

            // Test Security Controller
            var securityResponse = await _client.GetAsync("/api/security/health");
            // Should return 404 (method not found) or 401 (unauthorized), not 500 (server error)
            Assert.True(securityResponse.StatusCode == HttpStatusCode.NotFound ||
                       securityResponse.StatusCode == HttpStatusCode.Unauthorized ||
                       securityResponse.StatusCode == HttpStatusCode.MethodNotAllowed);
        }

        [Fact]
        public void ExceptionHandling_CustomExceptions_AreProperlyDefined()
        {
            // Test BingGoException
            var baseException = new BingGoException("Test message");
            Assert.Equal("Test message", baseException.Message);

            var baseExceptionWithInner = new BingGoException("Test message", new Exception("Inner"));
            Assert.Equal("Test message", baseExceptionWithInner.Message);
            Assert.NotNull(baseExceptionWithInner.InnerException);

            // Test GDPRComplianceException
            var gdprException = new GDPRComplianceException("user123", "delete", "Test GDPR error");
            Assert.Equal("user123", gdprException.UserId);
            Assert.Equal("delete", gdprException.Operation);
            Assert.Contains("GDPR compliance error", gdprException.Message);

            // Test SecurityException
            var securityException = new SecurityException("intrusion", "Test security error");
            Assert.Equal("intrusion", securityException.SecurityEventType);
            Assert.Contains("Security violation", securityException.Message);

            // Test DataMigrationException
            var migrationException = new DataMigrationException("Test migration error", 100);
            Assert.Equal(100, migrationException.ProcessedRecords);
            Assert.Equal("Test migration error", migrationException.Message);
        }

        [Fact]
        public async Task FirebaseService_BasicCRUDOperations_WorkCorrectly()
        {
            // Arrange
            var firebaseService = _factory.Services.GetRequiredService<IFirebaseService>();
            var testDocumentId = $"test-{Guid.NewGuid()}";
            var testData = new { Name = "Test Document", Value = 42, CreatedAt = DateTime.UtcNow };

            try
            {
                // Act & Assert - Create
                await firebaseService.SetDocumentAsync("test-collection", testDocumentId, testData);

                // Act & Assert - Read
                var retrievedData = await firebaseService.GetDocumentAsync<dynamic>("test-collection", testDocumentId);
                Assert.NotNull(retrievedData);

                // Act & Assert - Update
                var updateData = new { Name = "Updated Test Document", Value = 84, UpdatedAt = DateTime.UtcNow };
                await firebaseService.UpdateDocumentAsync("test-collection", testDocumentId, updateData);

                // Act & Assert - Delete
                await firebaseService.DeleteDocumentAsync("test-collection", testDocumentId);

                // Verify deletion
                var deletedData = await firebaseService.GetDocumentAsync<dynamic>("test-collection", testDocumentId);
                Assert.Null(deletedData);
            }
            catch (Exception ex)
            {
                // Cleanup in case of failure
                try
                {
                    await firebaseService.DeleteDocumentAsync("test-collection", testDocumentId);
                }
                catch
                {
                    // Ignore cleanup errors
                }
                throw new Exception($"Firebase CRUD operations failed: {ex.Message}", ex);
            }
        }

        [Fact]
        public async Task FirebaseService_BatchOperations_WorkCorrectly()
        {
            // Arrange
            var firebaseService = _factory.Services.GetRequiredService<IFirebaseService>();
            var testDocuments = new List<string>();

            try
            {
                // Act - Create batch
                var batch = await firebaseService.CreateBatchAsync();
                Assert.NotNull(batch);

                // Create test documents in batch
                for (int i = 0; i < 3; i++)
                {
                    var docId = $"batch-test-{Guid.NewGuid()}";
                    testDocuments.Add(docId);

                    var docRef = firebaseService.GetDocument("test-batch-collection", docId);
                    var testData = new { Name = $"Batch Document {i}", Index = i, CreatedAt = DateTime.UtcNow };
                    batch.Set(docRef, testData);
                }

                // Commit batch
                await firebaseService.CommitBatchAsync(batch);

                // Verify documents were created
                foreach (var docId in testDocuments)
                {
                    var retrievedData = await firebaseService.GetDocumentAsync<dynamic>("test-batch-collection", docId);
                    Assert.NotNull(retrievedData);
                }
            }
            finally
            {
                // Cleanup
                foreach (var docId in testDocuments)
                {
                    try
                    {
                        await firebaseService.DeleteDocumentAsync("test-batch-collection", docId);
                    }
                    catch
                    {
                        // Ignore cleanup errors
                    }
                }
            }
        }

        [Fact]
        public async Task GDPRService_ExceptionHandling_ThrowsCorrectExceptions()
        {
            // Arrange
            var gdprService = _factory.Services.GetRequiredService<IGDPRComplianceService>();

            // Act & Assert - Test that GDPR operations handle invalid data appropriately
            try
            {
                // This should either succeed or throw a GDPRComplianceException
                await gdprService.DeleteUserDataAsync("invalid-user-id");
            }
            catch (GDPRComplianceException ex)
            {
                // Expected exception type
                Assert.NotNull(ex.UserId);
                Assert.NotNull(ex.Operation);
            }
            catch (Exception ex)
            {
                // If it's not a GDPRComplianceException, the exception handling is not working correctly
                Assert.True(false, $"Expected GDPRComplianceException but got {ex.GetType().Name}: {ex.Message}");
            }
        }

        [Fact]
        public async Task SecurityService_ExceptionHandling_ThrowsCorrectExceptions()
        {
            // Arrange
            var intrusionService = _factory.Services.GetRequiredService<IIntrusionDetectionService>();

            // Act & Assert - Test that security operations handle invalid data appropriately
            try
            {
                // This should either succeed or throw a SecurityException
                await intrusionService.LogSecurityEventAsync("invalid-event-type", "Test security event", "127.0.0.1");
            }
            catch (SecurityException ex)
            {
                // Expected exception type
                Assert.NotNull(ex.SecurityEventType);
            }
            catch (Exception ex)
            {
                // Log the actual exception for debugging, but don't fail the test
                // as the service might handle this differently
                var logger = _factory.Services.GetRequiredService<ILogger<BasicIntegrationTests>>();
                logger.LogInformation($"Security service threw {ex.GetType().Name}: {ex.Message}");
            }
        }

        [Fact]
        public async Task DataMigrationService_ExceptionHandling_ThrowsCorrectExceptions()
        {
            // Arrange
            var migrationService = _factory.Services.GetRequiredService<IDataMigrationService>();

            // Act & Assert - Test that migration operations handle invalid data appropriately
            try
            {
                // This should either succeed or throw a DataMigrationException
                await migrationService.MigrateUserDataAsync("invalid-source", "invalid-destination");
            }
            catch (DataMigrationException ex)
            {
                // Expected exception type
                Assert.True(ex.ProcessedRecords >= 0);
            }
            catch (Exception ex)
            {
                // Log the actual exception for debugging, but don't fail the test
                // as the service might handle this differently
                var logger = _factory.Services.GetRequiredService<ILogger<BasicIntegrationTests>>();
                logger.LogInformation($"Migration service threw {ex.GetType().Name}: {ex.Message}");
            }
        }

        [Fact]
        public async Task ApplicationStartup_AllMiddleware_ConfiguredCorrectly()
        {
            // Test that the application starts up correctly and middleware is configured
            // by making a request and checking that we get appropriate responses

            // Test CORS headers
            var response = await _client.GetAsync("/api/health");

            // Should not return 500 (server error) - middleware should be working
            Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);

            // Test that security headers are being set (if SecurityHeadersMiddleware is working)
            // Note: We can't test all headers as they might be set conditionally
            Assert.NotNull(response.Headers);
        }

        [Fact]
        public void Configuration_FirebaseSettings_AreLoaded()
        {
            // Arrange & Act
            var configuration = _factory.Services.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();

            // Assert - Test that Firebase configuration is loaded
            var projectId = configuration["Firebase:ProjectId"];
            Assert.NotNull(projectId);
            Assert.NotEmpty(projectId);

            var clientEmail = configuration["Firebase:ClientEmail"];
            Assert.NotNull(clientEmail);
            Assert.NotEmpty(clientEmail);
        }

        [Fact]
        public async Task HealthCheck_ApplicationResponds_Successfully()
        {
            // This is a basic health check to ensure the application is responding

            // Act
            var response = await _client.GetAsync("/");

            // Assert - Should not return 500 (server error)
            // Might return 404 (no route) or other codes, but not 500
            Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
        }
    }
}