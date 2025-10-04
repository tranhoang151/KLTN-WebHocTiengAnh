using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Authentication;

public class FirebaseAuthenticationSchemeOptions : AuthenticationSchemeOptions
{
}

public class FirebaseAuthenticationHandler : AuthenticationHandler<FirebaseAuthenticationSchemeOptions>
{
    private readonly IFirebaseAuthService _firebaseAuthService;

    public FirebaseAuthenticationHandler(
        IOptionsMonitor<FirebaseAuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IFirebaseAuthService firebaseAuthService)
        : base(options, logger, encoder)
    {
        _firebaseAuthService = firebaseAuthService;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        try
        {
            // Check if Authorization header exists
            if (!Request.Headers.ContainsKey("Authorization"))
            {
                return AuthenticateResult.NoResult();
            }

            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return AuthenticateResult.NoResult();
            }

            // Extract the token
            var token = authHeader.Substring("Bearer ".Length).Trim();
            if (string.IsNullOrEmpty(token))
            {
                return AuthenticateResult.Fail("Invalid token format");
            }

            // Verify the Firebase token and get claims
            var claimsPrincipal = await _firebaseAuthService.GetClaimsPrincipalFromTokenAsync(token);
            
            var ticket = new AuthenticationTicket(claimsPrincipal, Scheme.Name);
            return AuthenticateResult.Success(ticket);
        }
        catch (UnauthorizedAccessException ex)
        {
            Logger.LogWarning(ex, "Firebase token verification failed");
            return AuthenticateResult.Fail("Invalid Firebase token");
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error during Firebase authentication");
            return AuthenticateResult.Fail("Authentication error");
        }
    }
}