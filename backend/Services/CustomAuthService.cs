
using BingGoWebAPI.Models;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BingGoWebAPI.Services
{
    public class CustomAuthService : ICustomAuthService
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly IPasswordHashingService _passwordHashingService;
        private readonly IConfiguration _configuration;

        public CustomAuthService(FirestoreDb firestoreDb, IPasswordHashingService passwordHashingService, IConfiguration configuration)
        {
            _firestoreDb = firestoreDb;
            _passwordHashingService = passwordHashingService;
            _configuration = configuration;
        }

        public async Task<AuthResult> AuthenticateAsync(string email, string password)
        {
            var user = await GetUserByEmailAsync(email);
            if (user == null)
            {
                return new AuthResult { Success = false, Error = "User not found" };
            }

            bool isValidPassword;
            bool needsPasswordUpdate = false;

            if (_passwordHashingService.IsPasswordHashed(user.Password))
            {
                isValidPassword = _passwordHashingService.VerifyPassword(password, user.Password);
            }
            else
            {
                // Legacy plain text comparison
                isValidPassword = password == user.Password;
                if (isValidPassword)
                {
                    needsPasswordUpdate = true;
                }
            }

            if (!isValidPassword)
            {
                return new AuthResult { Success = false, Error = "Invalid password" };
            }

            if (needsPasswordUpdate)
            {
                user.Password = _passwordHashingService.HashPassword(password);
                await _firestoreDb.Collection("users").Document(user.Id).SetAsync(user, SetOptions.MergeAll);
            }

            var token = await GenerateJwtTokenAsync(user);
            var refreshToken = await GenerateRefreshTokenAsync(user);
            return new AuthResult { Success = true, Token = token, RefreshToken = refreshToken, User = user };
        }

        public async Task<string> GenerateJwtTokenAsync(User user)
        {
            var jwtSettings = _configuration.GetSection("Security:JWT");
            var secretKey = jwtSettings["Secret"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
            {
                throw new InvalidOperationException("JWT secret key is not configured or is too short (must be at least 256 bits).");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("role", user.Role),
                new Claim("full_name", user.FullName)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpirationMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<string> GenerateRefreshTokenAsync(User user)
        {
            var jwtSettings = _configuration.GetSection("Security:JWT");
            var secretKey = jwtSettings["Secret"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JWT Secret not configured for refresh token generation");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("type", "refresh"), // Differentiate refresh token
                new Claim("user_id", user.Id) // Additional claim for debugging
            };

            Console.WriteLine($"Generating refresh token for user: {user.Id}, Email: {user.Email}");

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(Convert.ToDouble(jwtSettings["RefreshTokenExpirationDays"] ?? "7")),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            Console.WriteLine($"Generated refresh token: {tokenString.Substring(0, 50)}...");

            return tokenString;
        }

        public Task<bool> ValidateRefreshTokenAsync(string token)
        {
            var jwtSettings = _configuration.GetSection("Security:JWT");
            var secretKey = jwtSettings["Secret"];
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            try
            {
                // First, let's try to read the token without validation to see its contents
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var tokenType = jwtToken.Claims.FirstOrDefault(x => x.Type == "type")?.Value;
                var expiration = jwtToken.Claims.FirstOrDefault(x => x.Type == "exp")?.Value;
                var issuer = jwtToken.Claims.FirstOrDefault(x => x.Type == "iss")?.Value;
                var audience = jwtToken.Claims.FirstOrDefault(x => x.Type == "aud")?.Value;

                Console.WriteLine($"Token details - Type: {tokenType}, Exp: {expiration}, Issuer: {issuer}, Audience: {audience}");
                Console.WriteLine($"Expected - Issuer: {jwtSettings["Issuer"]}, Audience: {jwtSettings["Audience"]}");

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1) // Allow 1 minute clock skew for refresh tokens
                }, out SecurityToken validatedToken);

                var validatedJwtToken = (JwtSecurityToken)validatedToken;
                var validatedTokenType = validatedJwtToken.Claims.FirstOrDefault(x => x.Type == "type")?.Value;

                Console.WriteLine($"Token validation successful - Type: {validatedTokenType}");

                // Also check if it's a refresh token by looking at the JTI claim pattern or other indicators
                return Task.FromResult(validatedTokenType == "refresh");
            }
            catch (Exception ex)
            {
                // Log the specific validation error for debugging
                Console.WriteLine($"Refresh token validation failed: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return Task.FromResult(false);
            }
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            var query = _firestoreDb.Collection("users").WhereEqualTo("email", email);
            var snapshot = await query.GetSnapshotAsync();
            if (snapshot.Documents.Count == 0)
            {
                return null;
            }
            var userDoc = snapshot.Documents[0];
            var user = userDoc.ConvertTo<User>();
            user.Id = userDoc.Id;
            return user;
        }

        public async Task<User> GetUserByIdAsync(string userId)
        {
            var docRef = _firestoreDb.Collection("users").Document(userId);
            var snapshot = await docRef.GetSnapshotAsync();
            if (!snapshot.Exists)
            {
                return null;
            }
            var user = snapshot.ConvertTo<User>();
            user.Id = snapshot.Id;
            return user;
        }

        public Task<bool> ValidateTokenAsync(string token)
        {
            // This will be handled by the JWT middleware, but a basic validation can be added here if needed.
            return Task.FromResult(true);
        }
    }
}
