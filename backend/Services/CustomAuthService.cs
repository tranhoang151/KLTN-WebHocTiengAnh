
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

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("type", "refresh") // Differentiate refresh token
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(Convert.ToDouble(jwtSettings["RefreshTokenExpirationDays"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public Task<bool> ValidateRefreshTokenAsync(string token)
        {
            var jwtSettings = _configuration.GetSection("Security:JWT");
            var secretKey = jwtSettings["Secret"];
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var tokenType = jwtToken.Claims.FirstOrDefault(x => x.Type == "type")?.Value;

                return Task.FromResult(tokenType == "refresh");
            }
            catch
            {
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

        public Task<bool> ValidateTokenAsync(string token)
        {
            // This will be handled by the JWT middleware, but a basic validation can be added here if needed.
            return Task.FromResult(true);
        }
    }
}
