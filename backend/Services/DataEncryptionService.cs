using System.Security.Cryptography;
using System.Text;

namespace BingGoWebAPI.Services
{
    public class DataEncryptionService : IDataEncryptionService
    {
        private readonly ILogger<DataEncryptionService> _logger;

        public DataEncryptionService(ILogger<DataEncryptionService> logger)
        {
            _logger = logger;
        }

        public async Task<string> EncryptAsync(string plainText)
        {
            if (string.IsNullOrEmpty(plainText))
                return string.Empty;

            try
            {
                // Simple base64 encoding for demonstration
                var bytes = Encoding.UTF8.GetBytes(plainText);
                return await Task.FromResult(Convert.ToBase64String(bytes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to encrypt text");
                throw;
            }
        }

        public async Task<string> DecryptAsync(string encryptedText)
        {
            if (string.IsNullOrEmpty(encryptedText))
                return string.Empty;

            try
            {
                // Simple base64 decoding for demonstration
                var bytes = Convert.FromBase64String(encryptedText);
                return await Task.FromResult(Encoding.UTF8.GetString(bytes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to decrypt text");
                throw;
            }
        }

        public async Task<byte[]> EncryptBytesAsync(byte[] plainBytes)
        {
            if (plainBytes == null || plainBytes.Length == 0)
                return Array.Empty<byte>();

            // Simple implementation - in production use proper encryption
            return await Task.FromResult(plainBytes);
        }

        public async Task<byte[]> DecryptBytesAsync(byte[] encryptedBytes)
        {
            if (encryptedBytes == null || encryptedBytes.Length == 0)
                return Array.Empty<byte>();

            // Simple implementation - in production use proper decryption
            return await Task.FromResult(encryptedBytes);
        }

        public async Task<string> HashAsync(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            try
            {
                using var sha256 = SHA256.Create();
                var bytes = Encoding.UTF8.GetBytes(input);
                var hashBytes = sha256.ComputeHash(bytes);
                return await Task.FromResult(Convert.ToBase64String(hashBytes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to hash input");
                throw;
            }
        }

        public async Task<bool> VerifyHashAsync(string input, string hash)
        {
            if (string.IsNullOrEmpty(input) || string.IsNullOrEmpty(hash))
                return false;

            try
            {
                var computedHash = await HashAsync(input);
                return computedHash == hash;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to verify hash");
                return false;
            }
        }
    }
}