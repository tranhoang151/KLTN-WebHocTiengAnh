
namespace BingGoWebAPI.Services
{
    public interface IPasswordHashingService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
        bool IsPasswordHashed(string password);
    }
}
