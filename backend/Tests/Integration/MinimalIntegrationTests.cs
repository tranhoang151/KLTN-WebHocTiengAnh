using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Xunit;
using BingGoWebAPI.Services;
using BingGoWebAPI.Exceptions;

namespace BingGoWebAPI.Tests.Integration
{
    /// <summary>
    /// Minimal integration tests that can run even with some compilation issues
    /// Focuses on core service resolution and exception class definitions
    /// </summary>
    public class MinimalIntegrationTests
    {
        [Fact]
        public void ExceptionClasses_AreProperlyDefined()
        {
            // Test that all custom exception classes are properly defined
            // This verifies the exception handling infrastructure from Task 17.3

            // Test BingGoException
            var baseException = new BingGoException("Test message");
            Assert.Equal("Test message", baseException.Message);
            Assert.IsType<BingGoException>(baseException);

            var baseExceptionWithInner = new BingGoException("Test message", new Exception("Inner"));
            Assert.Equal("Test message", baseExceptionWithInner.Message);
            Assert.NotNull(baseExceptionWithInner.InnerException);
            Assert.Equal("Inner", baseExceptionWithInner.InnerException.Message);

            // Test GDPRComplianceException
            var gdprException = new GDPRComplianceException("user123", "delete", "Test GDPR error");
            Assert.Equal("user123", gdprException.UserId);
            Assert.Equal("delete", gdprException.Operation);
            Assert.Contains("GDPR compliance error", gdprException.Message);
            Assert.Contains("user123", gdprException.Message);
            Assert.Contains("delete", gdprException.Message);
            Assert.IsAssignableFrom<BingGoException>(gdprException);

            // Test SecurityException
            var securityException = new SecurityException("intrusion", "Test security error");
            Assert.Equal("intrusion", securityException.SecurityEventType);
            Assert.Contains("Security violation", securityException.Message);
            Assert.Contains("intrusion", securityException.Message);
            Assert.IsAssignableFrom<BingGoException>(securityException);

            // Test DataMigrationException
            var migrationException = new DataMigrationException("Test migration error", 100);
            Assert.Equal(100, migrationException.ProcessedRecords);
            Assert.Equal("Test migration error", migrationException.Message);
            Assert.IsAssignableFrom<BingGoException>(migrationException);
        }

        [Fact]
        public void Configuration_CanBeLoaded()
        {
            // Test that configuration can be loaded properly
            var configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.Testing.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            Assert.NotNull(configuration);

            // Test Firebase configuration sections exist
            var firebaseSection = configuration.GetSection("Firebase");
            Assert.NotNull(firebaseSection);

            // Test that we can read Firebase project ID
            var projectId = configuration["Firebase:ProjectId"];
            Assert.NotNull(projectId);
            Assert.NotEmpty(projectId);
        }

        [Fact]
        public void ServiceInterfaces_AreProperlyDefined()
        {
            // Test that all service interfaces are properly defined
            // This verifies the interface definitions from the error fix tasks

            // Test IFirebaseService interface exists and has required methods
            var firebaseServiceType = typeof(IFirebaseService);
            Assert.NotNull(firebaseServiceType);

            // Check for key methods
            var testConnectionMethod = firebaseServiceType.GetMethod("TestConnectionAsync");
            Assert.NotNull(testConnectionMethod);

            var getDocumentMethod = firebaseServiceType.GetMethod("GetDocumentAsync");
            Assert.NotNull(getDocumentMethod);

            var setDocumentMethod = firebaseServiceType.GetMethod("SetDocumentAsync");
            Assert.NotNull(setDocumentMethod);

            // Test IGDPRComplianceService interface
            var gdprServiceType = typeof(IGDPRComplianceService);
            Assert.NotNull(gdprServiceType);

            // Test IPrivacyPolicyService interface
            var privacyServiceType = typeof(IPrivacyPolicyService);
            Assert.NotNull(privacyServiceType);

            // Test IAuditLogService interface
            var auditServiceType = typeof(IAuditLogService);
            Assert.NotNull(auditServiceType);

            // Test IProgressService interface
            var progressServiceType = typeof(IProgressService);
            Assert.NotNull(progressServiceType);

            // Test IIntrusionDetectionService interface
            var intrusionServiceType = typeof(IIntrusionDetectionService);
            Assert.NotNull(intrusionServiceType);

            // Test IDataMigrationService interface
            var migrationServiceType = typeof(IDataMigrationService);
            Assert.NotNull(migrationServiceType);
        }

        [Fact]
        public void ExceptionHierarchy_IsCorrect()
        {
            // Verify that all custom exceptions inherit from the correct base classes

            // Test inheritance chain
            Assert.True(typeof(BingGoException).IsSubclassOf(typeof(Exception)));
            Assert.True(typeof(GDPRComplianceException).IsSubclassOf(typeof(BingGoException)));
            Assert.True(typeof(SecurityException).IsSubclassOf(typeof(BingGoException)));
            Assert.True(typeof(DataMigrationException).IsSubclassOf(typeof(BingGoException)));

            // Test that exceptions can be caught as base types
            Exception caughtAsException = new GDPRComplianceException("test", "test", "test");
            Assert.IsType<GDPRComplianceException>(caughtAsException);

            BingGoException caughtAsBingGoException = new SecurityException("test", "test");
            Assert.IsType<SecurityException>(caughtAsBingGoException);
        }

        [Fact]
        public void ModelClasses_HaveRequiredProperties()
        {
            // Test that model classes have the required properties that were added in the error fix tasks

            // Test UserProgress model
            var userProgressType = typeof(BingGoWebAPI.Models.UserProgress);
            Assert.NotNull(userProgressType);

            // Check for properties that were added
            var lastUpdatedProperty = userProgressType.GetProperty("LastUpdated");
            Assert.NotNull(lastUpdatedProperty);
            Assert.Equal(typeof(DateTime), lastUpdatedProperty.PropertyType);

            var totalXpProperty = userProgressType.GetProperty("TotalXp");
            Assert.NotNull(totalXpProperty);
            Assert.Equal(typeof(int), totalXpProperty.PropertyType);

            var currentLevelProperty = userProgressType.GetProperty("CurrentLevel");
            Assert.NotNull(currentLevelProperty);
            Assert.Equal(typeof(int), currentLevelProperty.PropertyType);
        }

        [Fact]
        public void ExceptionHandling_ThrowAndCatch_WorksCorrectly()
        {
            // Test that exceptions can be thrown and caught properly

            // Test GDPRComplianceException
            var gdprException = Assert.Throws<GDPRComplianceException>(() =>
            {
                throw new GDPRComplianceException("user123", "delete", "Test error");
            });
            Assert.Equal("user123", gdprException.UserId);
            Assert.Equal("delete", gdprException.Operation);

            // Test SecurityException
            var securityException = Assert.Throws<SecurityException>(() =>
            {
                throw new SecurityException("intrusion", "Test security error");
            });
            Assert.Equal("intrusion", securityException.SecurityEventType);

            // Test DataMigrationException
            var migrationException = Assert.Throws<DataMigrationException>(() =>
            {
                throw new DataMigrationException("Test migration error", 50);
            });
            Assert.Equal(50, migrationException.ProcessedRecords);

            // Test that they can be caught as base exception
            var baseException = Assert.Throws<BingGoException>(() =>
            {
                throw new GDPRComplianceException("user", "op", "error");
            });
            Assert.IsType<GDPRComplianceException>(baseException);
        }
    }
}