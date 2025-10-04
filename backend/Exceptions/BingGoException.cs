namespace BingGoWebAPI.Exceptions
{
    /// <summary>
    /// Base exception class for all BingGo application exceptions
    /// </summary>
    public class BingGoException : Exception
    {
        public BingGoException() : base() { }

        public BingGoException(string message) : base(message) { }

        public BingGoException(string message, Exception innerException) : base(message, innerException) { }
    }
}