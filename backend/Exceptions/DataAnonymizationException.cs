namespace BingGoWebAPI.Exceptions
{
    /// <summary>
    /// Exception thrown when data anonymization operations fail
    /// </summary>
    public class DataAnonymizationException : BingGoException
    {
        public DataAnonymizationException(string message) : base(message) { }

        public DataAnonymizationException(string message, Exception innerException) : base(message, innerException) { }
    }
}