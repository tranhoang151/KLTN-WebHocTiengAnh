namespace BingGoWebAPI.Exceptions
{
    /// <summary>
    /// Exception thrown when GDPR compliance operations fail
    /// </summary>
    public class GDPRComplianceException : BingGoException
    {
        public string UserId { get; }
        public string Operation { get; }

        public GDPRComplianceException(string userId, string operation, string message)
            : base($"GDPR compliance error for user {userId} during {operation}: {message}")
        {
            UserId = userId;
            Operation = operation;
        }

        public GDPRComplianceException(string userId, string operation, string message, Exception innerException)
            : base($"GDPR compliance error for user {userId} during {operation}: {message}", innerException)
        {
            UserId = userId;
            Operation = operation;
        }
    }
}