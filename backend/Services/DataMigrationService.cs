using System.Text.Json;
using BingGoWebAPI.Models;
using BingGoWebAPI.Exceptions;

namespace BingGoWebAPI.Services
{
    public class DataMigrationService : IDataMigrationService
    {
        private readonly IFirebaseService _firebaseService;
        private readonly ILogger<DataMigrationService> _logger;
        private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

        public DataMigrationService(IFirebaseService firebaseService, ILogger<DataMigrationService> logger)
        {
            _firebaseService = firebaseService;
            _logger = logger;
        }

        public async Task<bool> ImportDataAsync(string jsonData)
        {
            var processedRecords = 0;
            try
            {
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonData);
                if (data == null) return false;

                foreach (var collection in data)
                {
                    _logger.LogInformation($"Importing collection: {collection.Key}");

                    if (collection.Value is JsonElement jsonElement && jsonElement.ValueKind == JsonValueKind.Array)
                    {
                        var items = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonElement.GetRawText());
                        if (items != null)
                        {
                            foreach (var item in items)
                            {
                                await _firebaseService.AddDocumentAsync(collection.Key, item);
                                processedRecords++;
                            }
                        }
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing data");
                throw new DataMigrationException($"Failed to import data: {ex.Message}", processedRecords, ex);
            }
        }

        public async Task<string> ExportDataAsync()
        {
            var processedRecords = 0;
            try
            {
                var exportData = new Dictionary<string, object>();

                // Export users
                var users = await _firebaseService.GetCollectionAsync<User>("users");
                exportData["users"] = users;
                processedRecords += users?.Count ?? 0;

                // Export flashcards
                var flashcards = await _firebaseService.GetCollectionAsync<Flashcard>("flashcards");
                exportData["flashcards"] = flashcards;
                processedRecords += flashcards?.Count ?? 0;

                // Export user progress
                var userProgress = await _firebaseService.GetCollectionAsync<UserProgress>("userProgress");
                exportData["userProgress"] = userProgress;
                processedRecords += userProgress?.Count ?? 0;

                _logger.LogInformation($"Exported {processedRecords} records successfully");
                return JsonSerializer.Serialize(exportData, JsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting data");
                throw new DataMigrationException($"Failed to export data: {ex.Message}", processedRecords, ex);
            }
        }

        public async Task<bool> ValidateDataAsync(string jsonData)
        {
            try
            {
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonData);
                if (data == null || data.Count == 0)
                    return false;

                // Validate required collections exist
                var requiredCollections = new[] { "users", "flashcards" };
                foreach (var collection in requiredCollections)
                {
                    if (!data.ContainsKey(collection))
                    {
                        _logger.LogWarning($"Missing required collection: {collection}");
                        return false;
                    }
                }

                _logger.LogInformation("Data validation completed successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating data");
                return false;
            }
        }

        public async Task<MigrationResult> MigrateDataAsync(string sourceFormat, string targetFormat, string data)
        {
            var result = new MigrationResult();
            var processedRecords = 0;

            try
            {
                _logger.LogInformation($"Starting migration from {sourceFormat} to {targetFormat}");

                // Validate input data
                if (!await ValidateDataAsync(data))
                {
                    throw new DataMigrationException("Invalid source data format", 0);
                }

                // Parse source data
                var sourceData = JsonSerializer.Deserialize<Dictionary<string, object>>(data);
                if (sourceData == null)
                {
                    throw new DataMigrationException("Failed to parse source data", 0);
                }

                // Process each collection
                foreach (var collection in sourceData)
                {
                    _logger.LogInformation($"Migrating collection: {collection.Key}");

                    if (collection.Value is JsonElement jsonElement && jsonElement.ValueKind == JsonValueKind.Array)
                    {
                        var items = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonElement.GetRawText());
                        if (items != null)
                        {
                            processedRecords += items.Count;
                        }
                    }
                }

                result.Success = true;
                result.Message = "Migration completed successfully";
                result.ProcessedRecords = processedRecords;

                _logger.LogInformation($"Migration completed. Processed {processedRecords} records");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during migration");
                result.Success = false;
                result.Message = ex.Message;
                result.Errors.Add(ex.Message);
                result.ProcessedRecords = processedRecords;
            }

            return result;
        }

        public async Task<MigrationResult> MigrateDataFromBackupAsync(string backupFilePath)
        {
            var result = new MigrationResult();
            var processedRecords = 0;

            try
            {
                _logger.LogInformation($"Starting migration from backup file: {backupFilePath}");

                // Check if backup file exists
                if (!File.Exists(backupFilePath))
                {
                    throw new DataMigrationException($"Backup file not found: {backupFilePath}", 0);
                }

                // Read backup file
                var backupData = await File.ReadAllTextAsync(backupFilePath);

                // Validate backup data
                if (!await ValidateDataAsync(backupData))
                {
                    throw new DataMigrationException("Invalid backup data format", 0);
                }

                // Import backup data
                var importSuccess = await ImportDataAsync(backupData);
                if (!importSuccess)
                {
                    throw new DataMigrationException("Failed to import backup data", processedRecords);
                }

                // Count processed records
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(backupData);
                if (data != null)
                {
                    foreach (var collection in data)
                    {
                        if (collection.Value is JsonElement jsonElement && jsonElement.ValueKind == JsonValueKind.Array)
                        {
                            var items = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonElement.GetRawText());
                            processedRecords += items?.Count ?? 0;
                        }
                    }
                }

                result.Success = true;
                result.Message = "Backup restoration completed successfully";
                result.ProcessedRecords = processedRecords;

                _logger.LogInformation($"Backup restoration completed. Processed {processedRecords} records");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during backup restoration");
                result.Success = false;
                result.Message = ex.Message;
                result.Errors.Add(ex.Message);
                result.ProcessedRecords = processedRecords;
            }

            return result;
        }

        public async Task<MigrationSummary> GetMigrationSummaryAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving migration summary");

                var summary = new MigrationSummary
                {
                    LastMigrationDate = DateTime.UtcNow.AddDays(-1), // Mock data - in real implementation, this would come from audit logs
                    TotalMigrationsCompleted = 5, // Mock data
                    TotalRecordsMigrated = 1250, // Mock data
                    HasPendingMigrations = false,
                    Status = "Completed"
                };

                // Get recent migrations from audit logs (mock data)
                summary.RecentMigrations.AddRange(new[]
                {
                    "User data migration - 2024-01-15",
                    "Flashcard migration - 2024-01-14",
                    "Progress data migration - 2024-01-13"
                });

                // In a real implementation, you would query Firebase for actual migration history
                // var migrationLogs = await _firebaseService.GetCollectionAsync<MigrationLog>("migrationLogs");

                _logger.LogInformation("Migration summary retrieved successfully");
                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving migration summary");
                throw new DataMigrationException($"Failed to retrieve migration summary: {ex.Message}", 0, ex);
            }
        }

        public async Task<bool> ValidateDataIntegrityAsync()
        {
            try
            {
                _logger.LogInformation("Starting data integrity validation");

                var validationErrors = new List<string>();

                // Validate users collection
                var users = await _firebaseService.GetCollectionAsync<User>("users");
                if (users == null || users.Count == 0)
                {
                    validationErrors.Add("Users collection is empty or missing");
                }
                else
                {
                    foreach (var user in users)
                    {
                        if (string.IsNullOrEmpty(user.Id) || string.IsNullOrEmpty(user.Email))
                        {
                            validationErrors.Add($"User {user.Id} has missing required fields");
                        }
                    }
                }

                // Validate flashcards collection
                var flashcards = await _firebaseService.GetCollectionAsync<Flashcard>("flashcards");
                if (flashcards != null)
                {
                    foreach (var flashcard in flashcards)
                    {
                        if (string.IsNullOrEmpty(flashcard.Id) || string.IsNullOrEmpty(flashcard.FrontText))
                        {
                            validationErrors.Add($"Flashcard {flashcard.Id} has missing required fields");
                        }
                    }
                }

                // Validate user progress collection
                var userProgress = await _firebaseService.GetCollectionAsync<UserProgress>("userProgress");
                if (userProgress != null)
                {
                    foreach (var progress in userProgress)
                    {
                        if (string.IsNullOrEmpty(progress.Id) || string.IsNullOrEmpty(progress.UserId))
                        {
                            validationErrors.Add($"UserProgress {progress.Id} has missing required fields");
                        }
                    }
                }

                if (validationErrors.Count > 0)
                {
                    _logger.LogWarning($"Data integrity validation found {validationErrors.Count} issues");
                    foreach (var error in validationErrors)
                    {
                        _logger.LogWarning($"Validation error: {error}");
                    }
                    return false;
                }

                _logger.LogInformation("Data integrity validation completed successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during data integrity validation");
                throw new DataMigrationException($"Failed to validate data integrity: {ex.Message}", 0, ex);
            }
        }
    }

    public class MigrationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int ProcessedRecords { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}