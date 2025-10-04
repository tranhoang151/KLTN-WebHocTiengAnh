using BCrypt.Net;

namespace BingGoWebAPI.Services
{
    public class PasswordHashingService : IPasswordHashingService
    {
        private const int WorkFactor = 12; // Adjust based on performance requirements

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch
            {
                return false;
            }
        }

        public bool IsPasswordHashed(string password)
        {
            if (string.IsNullOrEmpty(password)) return false;
            // bcrypt hashes start with $2a$, $2b$, or $2y$
            return password.StartsWith("$2");
        }
    }
}
