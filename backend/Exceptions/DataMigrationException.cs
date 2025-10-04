namespace BingGoWebAPI.Exceptions
{
    /// <summary>
    /// Exception thrown when data migration operations fail
    /// </summary>
    public class DataMigrationException : BingGoException
    {
        public int ProcessedRecords { get; }

        public DataMigrationException(string message, int processedRecords) : base(message)
        {
            ProcessedRecords = processedRecords;
        }

        public DataMigrationException(string message, int processedRecords, Exception innerException)
            : base(message, innerException)
        {
            ProcessedRecords = processedRecords;
        }
    }
}