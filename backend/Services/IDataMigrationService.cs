namespace BingGoWebAPI.Services
{
    public interface IDataMigrationService
    {
        Task<bool> ImportDataAsync(string jsonData);
        Task<string> ExportDataAsync();
        Task<bool> ValidateDataAsync(string jsonData);
        Task<MigrationResult> MigrateDataAsync(string sourceFormat, string targetFormat, string data);

        // New methods for backup restoration and migration status
        Task<MigrationResult> MigrateDataFromBackupAsync(string backupFilePath);
        Task<MigrationSummary> GetMigrationSummaryAsync();
        Task<bool> ValidateDataIntegrityAsync();
    }

    public class MigrationSummary
    {
        public DateTime LastMigrationDate { get; set; }
        public int TotalMigrationsCompleted { get; set; }
        public int TotalRecordsMigrated { get; set; }
        public List<string> RecentMigrations { get; set; } = new();
        public bool HasPendingMigrations { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}