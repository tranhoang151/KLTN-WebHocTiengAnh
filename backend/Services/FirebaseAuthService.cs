using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;

namespace BingGoWebAPI.Services;

public interface IFirebaseAuthService
{
    Task<FirebaseToken> VerifyIdTokenAsync(string idToken);
    Task<UserRecord> GetUserAsync(string uid);
    Task<UserRecord> CreateUserAsync(UserRecordArgs args);
    Task<UserRecord> UpdateUserAsync(string uid, UserRecordArgs args);
    Task DeleteUserAsync(string uid);
    Task<string> CreateCustomTokenAsync(string uid, IDictionary<string, object>? claims = null);
    Task<ClaimsPrincipal> GetClaimsPrincipalFromTokenAsync(string idToken);
    Task SetCustomUserClaimsAsync(string uid, IDictionary<string, object> claims);
}

public class FirebaseAuthService : IFirebaseAuthService
{
    private readonly IFirebaseConfigService _firebaseConfig;
    private readonly ILogger<FirebaseAuthService> _logger;

    public FirebaseAuthService(IFirebaseConfigService firebaseConfig, ILogger<FirebaseAuthService> logger)
    {
        _firebaseConfig = firebaseConfig;
        _logger = logger;
    }

    public async Task<FirebaseToken> VerifyIdTokenAsync(string idToken)
    {
        try
        {
            var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
            _logger.LogDebug("Successfully verified Firebase ID token for user: {UserId}", decodedToken.Uid);
            return decodedToken;
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogError(ex, "Failed to verify Firebase ID token");
            throw new UnauthorizedAccessException("Invalid Firebase token", ex);
        }
    }

    public async Task<UserRecord> GetUserAsync(string uid)
    {
        try
        {
            var userRecord = await FirebaseAuth.DefaultInstance.GetUserAsync(uid);
            _logger.LogDebug("Retrieved user record for: {UserId}", uid);
            return userRecord;
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogError(ex, "Failed to get user record for: {UserId}", uid);
            throw new KeyNotFoundException($"User not found: {uid}", ex);
        }
    }

    public async Task<UserRecord> CreateUserAsync(UserRecordArgs args)
    {
        try
        {
            var userRecord = await FirebaseAuth.DefaultInstance.CreateUserAsync(args);
            _logger.LogInformation("Created new user: {UserId}", userRecord.Uid);
            return userRecord;
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogError(ex, "Failed to create user");
            throw new InvalidOperationException("Failed to create user", ex);
        }
    }

    public async Task<UserRecord> UpdateUserAsync(string uid, UserRecordArgs args)
    {
        try
        {
            args.Uid = uid;
            var userRecord = await FirebaseAuth.DefaultInstance.UpdateUserAsync(args);
            _logger.LogInformation("Updated user: {UserId}", uid);
            return userRecord;
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogError(ex, "Failed to update user: {UserId}", uid);
            throw new InvalidOperationException($"Failed to update user: {uid}", ex);
        }
    }

    public async Task DeleteUserAsync(string uid)
    {
        try
        {
            await FirebaseAuth.DefaultInstance.DeleteUserAsync(uid);
            _logger.LogInformation("Deleted user: {UserId}", uid);
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogError(ex, "Failed to delete user: {UserId}", uid);
            throw new InvalidOperationException($"Failed to delete user: {uid}", ex);
        }
    }

    public async Task<string> CreateCustomTokenAsync(string uid, IDictionary<string, object>? claims = null)
    {
        try
        {
            var customToken = await FirebaseAuth.DefaultInstance.CreateCustomTokenAsync(uid, claims);
            _logger.LogDebug("Created custom token for user: {UserId}", uid);
            return customToken;
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogError(ex, "Failed to create custom token for user: {UserId}", uid);
            throw new InvalidOperationException($"Failed to create custom token for user: {uid}", ex);
        }
    }

    public async Task<ClaimsPrincipal> GetClaimsPrincipalFromTokenAsync(string idToken)
    {
        try
        {
            var decodedToken = await VerifyIdTokenAsync(idToken);
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, decodedToken.Uid),
                new Claim(ClaimTypes.Email, decodedToken.Claims.GetValueOrDefault("email")?.ToString() ?? ""),
                new Claim(ClaimTypes.Name, decodedToken.Claims.GetValueOrDefault("name")?.ToString() ?? ""),
                new Claim("firebase_uid", decodedToken.Uid)
            };

            // Add custom claims
            if (decodedToken.Claims.ContainsKey("role"))
            {
                claims.Add(new Claim(ClaimTypes.Role, decodedToken.Claims["role"].ToString() ?? ""));
            }

            if (decodedToken.Claims.ContainsKey("class_ids"))
            {
                var classIds = decodedToken.Claims["class_ids"].ToString();
                if (!string.IsNullOrEmpty(classIds))
                {
                    claims.Add(new Claim("class_ids", classIds));
                }
            }

            var identity = new ClaimsIdentity(claims, "Firebase");
            return new ClaimsPrincipal(identity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create ClaimsPrincipal from Firebase token");
            throw;
        }
    }

    public async Task SetCustomUserClaimsAsync(string uid, IDictionary<string, object> claims)
    {
        try
        {
            var readOnlyClaims = claims.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
            await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(uid, readOnlyClaims);
            _logger.LogInformation("Set custom claims for user: {UserId}", uid);
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogError(ex, "Failed to set custom claims for user: {UserId}", uid);
            throw new InvalidOperationException($"Failed to set custom claims for user: {uid}", ex);
        }
    }
}