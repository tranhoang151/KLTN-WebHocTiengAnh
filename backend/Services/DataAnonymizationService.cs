using Google.Cloud.Firestore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using BingGoWebAPI.Exceptions;

namespace BingGoWebAPI.Services
{
    /// <summary>
    /// Data Anonymization Service for privacy protection and analytics
    /// Implements data anonymization techniques while preserving analytical value
    /// </summary>
    public interface IDataAnonymizationService
    {
        Task<string> AnonymizeUserDataAsync(string userId, AnonymizationLevel level);
        Task<Dictionary<string, object>> AnonymizeLearningDataAsync(Dictionary<string, object> data, AnonymizationLevel level);
        Task<string> GenerateAnonymousIdAsync(string originalId);
        Task<bool> ValidateAnonymizationAsync(string originalData, string anonymizedData);
        Task<AnonymizationReport> GenerateAnonymizationReportAsync(DateTime fromDate, DateTime toDate);
    }

    public class DataAnonymizationService : IDataAnonymizationService
    {
        private readonly FirestoreDb _firestore;
        private readonly ILogger<DataAnonymizationService> _logger;
        private readonly IAuditLogService _auditLogService;
        private readonly IConfiguration _configuration;

        // Common anonymization patterns
        private readonly Dictionary<string, string> _anonymizationPatterns = new()
        {
            { "email", @"^[^@]+@[^@]+\.[^@]+$" },
            { "phone", @"^\+?[\d\s\-\(\)]+$" },
            { "name", @"^[A-Za-z\s]+$" },
            { "address", @".*" }
        };

        public DataAnonymizationService(
            FirestoreDb firestore,
            ILogger<DataAnonymizationService> logger,
            IAuditLogService auditLogService,
            IConfiguration configuration)
        {
            _firestore = firestore;
            _logger = logger;
            _auditLogService = auditLogService;
            _configuration = configuration;
        }

        /// <summary>
        /// Anonymize user data based on specified anonymization level
        /// </summary>
        public async Task<string> AnonymizeUserDataAsync(string userId, AnonymizationLevel level)
        {
            try
            {
                _logger.LogInformation("Starting data anonymization for user {UserId} with level {Level}", userId, level);

                var anonymousId = await GenerateAnonymousIdAsync(userId);
                var batch = _firestore.StartBatch();

                // Anonymize user profile
                await AnonymizeUserProfileAsync(userId, anonymousId, level, batch);

                // Anonymize learning data
                await AnonymizeLearningProgressAsync(userId, anonymousId, level, batch);

                // Anonymize flashcard data
                await AnonymizeFlashcardDataAsync(userId, anonymousId, level, batch);

                // Anonymize exercise data
                await AnonymizeExerciseDataAsync(userId, anonymousId, level, batch);

                // Commit all changes
                await batch.CommitAsync();

                // Log anonymization activity
                await _auditLogService.LogDataAccessAsync(userId, "DATA_ANONYMIZATION",
                    $"User data anonymized with level {level} and ID: {anonymousId}");

                _logger.LogInformation("Data anonymization completed for user {UserId}. New anonymous ID: {AnonymousId}",
                    userId, anonymousId);

                return anonymousId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during data anonymization for user {UserId}", userId);
                throw new DataAnonymizationException("Failed to anonymize user data", ex);
            }
        }

        /// <summary>
        /// Anonymize learning data while preserving analytical patterns
        /// </summary>
        public async Task<Dictionary<string, object>> AnonymizeLearningDataAsync(Dictionary<string, object> data, AnonymizationLevel level)
        {
            var anonymizedData = new Dictionary<string, object>();

            foreach (var kvp in data)
            {
                anonymizedData[kvp.Key] = await AnonymizeFieldAsync(kvp.Key, kvp.Value, level);
            }

            return anonymizedData;
        }

        /// <summary>
        /// Generate a consistent anonymous ID for a user
        /// </summary>
        public async Task<string> GenerateAnonymousIdAsync(string originalId)
        {
            try
            {
                // Use HMAC-SHA256 for consistent anonymization
                var secretKey = _configuration["Anonymization:SecretKey"] ?? "default-secret-key";
                var keyBytes = Encoding.UTF8.GetBytes(secretKey);
                var dataBytes = Encoding.UTF8.GetBytes(originalId);

                using var hmac = new HMACSHA256(keyBytes);
                var hashBytes = hmac.ComputeHash(dataBytes);
                var hashString = Convert.ToBase64String(hashBytes);

                // Create a user-friendly anonymous ID
                var anonymousId = $"anon_{hashString[..12].Replace("+", "").Replace("/", "").Replace("=", "")}";

                return anonymousId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating anonymous ID for {OriginalId}", originalId);
                throw;
            }
        }

        /// <summary>
        /// Validate that anonymization was successful
        /// </summary>
        public async Task<bool> ValidateAnonymizationAsync(string originalData, string anonymizedData)
        {
            try
            {
                // Check that no PII patterns exist in anonymized data
                var piiPatterns = new[]
                {
                    @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", // Email
                    @"\b\d{3}-\d{2}-\d{4}\b", // SSN
                    @"\b\d{3}-\d{3}-\d{4}\b", // Phone
                    @"\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b" // Credit card
                };

                foreach (var pattern in piiPatterns)
                {
                    if (System.Text.RegularExpressions.Regex.IsMatch(anonymizedData, pattern))
                    {
                        _logger.LogWarning("PII pattern detected in anonymized data: {Pattern}", pattern);
                        return false;
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating anonymization");
                return false;
            }
        }

        /// <summary>
        /// Generate anonymization report for compliance
        /// </summary>
        public async Task<AnonymizationReport> GenerateAnonymizationReportAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var report = new AnonymizationReport
                {
                    GeneratedAt = DateTime.UtcNow,
                    FromDate = fromDate,
                    ToDate = toDate
                };

                // Get anonymization activities from audit logs
                var auditLogs = await _auditLogService.GetAuditLogsByActionAsync("DATA_ANONYMIZATION", fromDate);

                report.TotalAnonymizations = auditLogs.Count();
                report.AnonymizationsByLevel = auditLogs
                    .GroupBy(log => log.Details)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Calculate anonymization success rate
                var validationLogs = await _auditLogService.GetAuditLogsByActionAsync("ANONYMIZATION_VALIDATION", fromDate);
                var successfulValidations = validationLogs.Count(log => log.Details.Contains("SUCCESS"));

                report.SuccessRate = validationLogs.Count() > 0 ?
                    (double)successfulValidations / validationLogs.Count() * 100 : 100;

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating anonymization report");
                throw;
            }
        }

        #region Private Methods

        private async Task AnonymizeUserProfileAsync(string userId, string anonymousId, AnonymizationLevel level, WriteBatch batch)
        {
            var userDoc = _firestore.Collection("users").Document(userId);
            var userSnapshot = await userDoc.GetSnapshotAsync();

            if (!userSnapshot.Exists) return;

            var userData = userSnapshot.ToDictionary();
            var anonymizedData = new Dictionary<string, object>
            {
                ["userId"] = anonymousId,
                ["isAnonymized"] = true,
                ["anonymizedAt"] = DateTime.UtcNow,
                ["anonymizationLevel"] = level.ToString()
            };

            // Anonymize based on level
            switch (level)
            {
                case AnonymizationLevel.Basic:
                    anonymizedData["fullName"] = "Anonymous User";
                    anonymizedData["email"] = $"{anonymousId}@anonymous.com";
                    break;

                case AnonymizationLevel.Standard:
                    anonymizedData["fullName"] = "Anonymous User";
                    anonymizedData["email"] = $"{anonymousId}@anonymous.com";
                    anonymizedData["dateOfBirth"] = null;
                    anonymizedData["profileImageUrl"] = null;
                    break;

                case AnonymizationLevel.Complete:
                    anonymizedData["fullName"] = "Anonymous User";
                    anonymizedData["email"] = $"{anonymousId}@anonymous.com";
                    anonymizedData["dateOfBirth"] = null;
                    anonymizedData["profileImageUrl"] = null;
                    anonymizedData["phoneNumber"] = null;
                    anonymizedData["address"] = null;
                    break;
            }

            // Preserve non-PII data for analytics
            if (userData.ContainsKey("role"))
                anonymizedData["role"] = userData["role"];
            if (userData.ContainsKey("preferredLanguage"))
                anonymizedData["preferredLanguage"] = userData["preferredLanguage"];
            if (userData.ContainsKey("timezone"))
                anonymizedData["timezone"] = userData["timezone"];
            if (userData.ContainsKey("createdAt"))
                anonymizedData["createdAt"] = userData["createdAt"];

            batch.Update(userDoc, anonymizedData);
        }

        private async Task AnonymizeLearningProgressAsync(string userId, string anonymousId, AnonymizationLevel level, WriteBatch batch)
        {
            var progressQuery = _firestore.Collection("progress").WhereEqualTo("userId", userId);
            var progressDocs = await progressQuery.GetSnapshotAsync();

            foreach (var doc in progressDocs.Documents)
            {
                var anonymizedData = new Dictionary<string, object>
                {
                    ["userId"] = anonymousId,
                    ["isAnonymized"] = true,
                    ["anonymizedAt"] = DateTime.UtcNow
                };

                // Preserve learning analytics data
                var originalData = doc.ToDictionary();
                var preserveFields = new[] { "courseId", "lessonId", "completionPercentage", "timeSpent", "score", "lastAccessedAt" };

                foreach (var field in preserveFields)
                {
                    if (originalData.ContainsKey(field))
                        anonymizedData[field] = originalData[field];
                }

                batch.Update(doc.Reference, anonymizedData);
            }
        }

        private async Task AnonymizeFlashcardDataAsync(string userId, string anonymousId, AnonymizationLevel level, WriteBatch batch)
        {
            var flashcardQuery = _firestore.Collection("flashcards").WhereEqualTo("createdBy", userId);
            var flashcardDocs = await flashcardQuery.GetSnapshotAsync();

            foreach (var doc in flashcardDocs.Documents)
            {
                var originalData = doc.ToDictionary();
                var anonymizedData = new Dictionary<string, object>
                {
                    ["createdBy"] = anonymousId,
                    ["isAnonymized"] = true,
                    ["anonymizedAt"] = DateTime.UtcNow
                };

                // Preserve educational content but anonymize creator
                var preserveFields = new[] { "frontText", "backText", "category", "difficulty", "tags", "createdAt" };

                foreach (var field in preserveFields)
                {
                    if (originalData.ContainsKey(field))
                        anonymizedData[field] = originalData[field];
                }

                batch.Update(doc.Reference, anonymizedData);
            }
        }

        private async Task AnonymizeExerciseDataAsync(string userId, string anonymousId, AnonymizationLevel level, WriteBatch batch)
        {
            var exerciseQuery = _firestore.Collection("exercises").WhereEqualTo("userId", userId);
            var exerciseDocs = await exerciseQuery.GetSnapshotAsync();

            foreach (var doc in exerciseDocs.Documents)
            {
                var originalData = doc.ToDictionary();
                var anonymizedData = new Dictionary<string, object>
                {
                    ["userId"] = anonymousId,
                    ["isAnonymized"] = true,
                    ["anonymizedAt"] = DateTime.UtcNow
                };

                // Preserve performance analytics
                var preserveFields = new[] { "type", "score", "timeSpent", "completedAt", "difficulty" };

                foreach (var field in preserveFields)
                {
                    if (originalData.ContainsKey(field))
                        anonymizedData[field] = originalData[field];
                }

                // Anonymize answers if they contain PII
                if (originalData.ContainsKey("answers") && level >= AnonymizationLevel.Standard)
                {
                    anonymizedData["answers"] = await AnonymizeAnswersAsync(originalData["answers"], level);
                }

                batch.Update(doc.Reference, anonymizedData);
            }
        }

        private async Task<object> AnonymizeFieldAsync(string fieldName, object value, AnonymizationLevel level)
        {
            if (value == null) return null;

            var stringValue = value.ToString();

            // Check if field contains PII
            if (ContainsPII(fieldName, stringValue))
            {
                return await AnonymizeValueAsync(fieldName, stringValue, level);
            }

            return value;
        }

        private bool ContainsPII(string fieldName, string value)
        {
            var piiFields = new[] { "name", "email", "phone", "address", "ssn", "creditcard" };

            if (piiFields.Any(field => fieldName.ToLower().Contains(field)))
                return true;

            // Check for common PII patterns
            var emailPattern = @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}";
            var phonePattern = @"\b\d{3}-\d{3}-\d{4}\b";

            return System.Text.RegularExpressions.Regex.IsMatch(value, emailPattern) ||
                   System.Text.RegularExpressions.Regex.IsMatch(value, phonePattern);
        }

        private async Task<string> AnonymizeValueAsync(string fieldName, string value, AnonymizationLevel level)
        {
            switch (level)
            {
                case AnonymizationLevel.Basic:
                    return fieldName.ToLower().Contains("email") ? "anonymous@example.com" : "[REDACTED]";

                case AnonymizationLevel.Standard:
                    if (fieldName.ToLower().Contains("email"))
                        return $"user_{await GenerateAnonymousIdAsync(value)}@anonymous.com";
                    return $"[ANONYMIZED_{fieldName.ToUpper()}]";

                case AnonymizationLevel.Complete:
                    return $"[REMOVED_{fieldName.ToUpper()}]";

                default:
                    return "[REDACTED]";
            }
        }

        private async Task<object> AnonymizeAnswersAsync(object answers, AnonymizationLevel level)
        {
            if (answers is string answersString)
            {
                try
                {
                    var answersDict = JsonSerializer.Deserialize<Dictionary<string, object>>(answersString);
                    var anonymizedAnswers = new Dictionary<string, object>();

                    foreach (var kvp in answersDict)
                    {
                        // Only anonymize if the answer might contain PII
                        if (ContainsPII(kvp.Key, kvp.Value?.ToString() ?? ""))
                        {
                            anonymizedAnswers[kvp.Key] = await AnonymizeValueAsync(kvp.Key, kvp.Value?.ToString() ?? "", level);
                        }
                        else
                        {
                            anonymizedAnswers[kvp.Key] = kvp.Value;
                        }
                    }

                    return JsonSerializer.Serialize(anonymizedAnswers);
                }
                catch
                {
                    // If parsing fails, treat as regular string
                    return ContainsPII("answer", answersString) ?
                        await AnonymizeValueAsync("answer", answersString, level) : answersString;
                }
            }

            return answers;
        }

        #endregion
    }

    #region Enums and Models

    public enum AnonymizationLevel
    {
        Basic = 1,      // Remove direct identifiers
        Standard = 2,   // Remove direct and quasi-identifiers
        Complete = 3    // Remove all potentially identifying information
    }

    public class AnonymizationReport
    {
        public DateTime GeneratedAt { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int TotalAnonymizations { get; set; }
        public Dictionary<string, int> AnonymizationsByLevel { get; set; } = new();
        public double SuccessRate { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
    }



    #endregion
}