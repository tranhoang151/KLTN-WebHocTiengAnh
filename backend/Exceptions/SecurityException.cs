namespace BingGoWebAPI.Exceptions
{
    /// <summary>
    /// Exception thrown when security violations occur
    /// </summary>
    public class SecurityException : BingGoException
    {
        public string SecurityEventType { get; }

        public SecurityException(string eventType, string message)
            : base($"Security violation ({eventType}): {message}")
        {
            SecurityEventType = eventType;
        }

        public SecurityException(string eventType, string message, Exception innerException)
            : base($"Security violation ({eventType}): {message}", innerException)
        {
            SecurityEventType = eventType;
        }
    }
}