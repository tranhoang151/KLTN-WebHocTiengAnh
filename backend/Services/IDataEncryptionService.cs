namespace BingGoWebAPI.Services
{
    public interface IDataEncryptionService
    {
        Task<string> EncryptAsync(string plainText);
        Task<string> DecryptAsync(string encryptedText);
        Task<byte[]> EncryptBytesAsync(byte[] plainBytes);
        Task<byte[]> DecryptBytesAsync(byte[] encryptedBytes);
        Task<string> HashAsync(string input);
        Task<bool> VerifyHashAsync(string input, string hash);
    }
}