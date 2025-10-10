
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace BingGoWebAPI.Middleware
{
    public class JwtAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<JwtAuthenticationMiddleware> _logger;
        private readonly IConfiguration _configuration;

        public JwtAuthenticationMiddleware(RequestDelegate next, ILogger<JwtAuthenticationMiddleware> logger, IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (token != null)
            {
                AttachUserToContext(context, token);
            }

            await _next(context);
        }

        private void AttachUserToContext(HttpContext context, string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtSettings = _configuration.GetSection("Security:JWT");
                var secretKey = jwtSettings["Secret"];

                Console.WriteLine($"JWT Middleware - Secret length: {secretKey?.Length ?? 0}");
                Console.WriteLine($"JWT Middleware - Issuer: {jwtSettings["Issuer"]}");
                Console.WriteLine($"JWT Middleware - Audience: {jwtSettings["Audience"]}");

                if (string.IsNullOrEmpty(secretKey))
                {
                    _logger.LogError("JWT Secret not configured in middleware");
                    return;
                }

                var key = Encoding.UTF8.GetBytes(secretKey);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                // Create claims principal with proper authentication type for ASP.NET Core
                var claimsIdentity = new ClaimsIdentity(jwtToken.Claims, "jwt", JwtRegisteredClaimNames.Sub, ClaimTypes.Role);
                context.User = new ClaimsPrincipal(claimsIdentity);

                // Also store in Items for backward compatibility
                context.Items["UserId"] = jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Sub)?.Value;
                context.Items["User"] = context.User;

                _logger.LogInformation("JWT token validated successfully for user: {UserId} with role: {Role}",
                    jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Sub)?.Value,
                    jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role)?.Value ?? "No role");

                _logger.LogInformation("JWT token validated successfully for user: {UserId}",
                    jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Sub)?.Value);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "JWT validation failed in middleware.");
                Console.WriteLine($"JWT Middleware validation failed: {ex.Message}");
                // Do not attach user to context if validation fails
            }
        }
    }
}
