using BingGoWebAPI.Models;
using System.Threading.Tasks;

namespace BingGoWebAPI.Services
{
    public class AuthResult
    {
        public bool Success { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public User User { get; set; }
        public string Error { get; set; }
    }

    public interface ICustomAuthService
    {
        Task<AuthResult> AuthenticateAsync(string email, string password);
        Task<bool> ValidateTokenAsync(string token);
        Task<string> GenerateJwtTokenAsync(User user);
        Task<string> GenerateRefreshTokenAsync(User user);
        Task<bool> ValidateRefreshTokenAsync(string token);
        Task<User> GetUserByEmailAsync(string email);
    }
}
