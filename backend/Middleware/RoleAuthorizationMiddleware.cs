using System.Security.Claims;

namespace BingGoWebAPI.Middleware;

public class RoleAuthorizationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RoleAuthorizationMiddleware> _logger;

    public RoleAuthorizationMiddleware(RequestDelegate next, ILogger<RoleAuthorizationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip authorization for certain paths
        var path = context.Request.Path.Value?.ToLower();
        if (ShouldSkipAuthorization(path))
        {
            await _next(context);
            return;
        }

        // Check if user is authenticated
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            await _next(context);
            return;
        }

        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userRole) || string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("User {UserId} has no role claim", userId ?? "unknown");
            await _next(context);
            return;
        }

        // Check role-based access for API endpoints
        if (path?.StartsWith("/api/") == true)
        {
            if (!HasApiAccess(path, userRole))
            {
                _logger.LogWarning("User {UserId} with role {Role} attempted to access {Path}", userId, userRole, path);
                context.Response.StatusCode = 403;
                await context.Response.WriteAsync("Access denied: Insufficient permissions");
                return;
            }
        }

        await _next(context);
    }

    private static bool ShouldSkipAuthorization(string? path)
    {
        if (string.IsNullOrEmpty(path)) return false;

        var skipPaths = new[]
        {
            "/api/auth/verify",
            "/api/auth/refresh-token",
            "/api/auth/update-login",
            "/swagger",
            "/health",
            "/"
        };

        return skipPaths.Any(skipPath => path.StartsWith(skipPath));
    }

    private static bool HasApiAccess(string path, string role)
    {
        // Define role-based API access rules
        var rolePermissions = new Dictionary<string, string[]>
        {
            ["student"] = new[]
            {
                "/api/flashcards",
                "/api/exercises",
                "/api/tests",
                "/api/videos",
                "/api/progress",
                "/api/badges",
                "/api/users/profile"
            },
            ["teacher"] = new[]
            {
                "/api/classes",
                "/api/students",
                "/api/assignments",
                "/api/progress",
                "/api/reports",
                "/api/content",
                "/api/flashcards",
                "/api/exercises",
                "/api/tests",
                "/api/videos",
                "/api/analytics",
                "/api/users/profile"
            },
            ["admin"] = new[]
            {
                "/api/users",
                "/api/courses",
                "/api/classes",
                "/api/content",
                "/api/flashcards",
                "/api/exercises",
                "/api/tests",
                "/api/videos",
                "/api/questions",
                "/api/reports",
                "/api/system",
                "/api/progress",
                "/api/analytics",
                "/api/badges"
            },
            ["parent"] = new[]
            {
                "/api/children",
                "/api/progress",
                "/api/reports",
                "/api/users/profile"
            }
        };

        if (!rolePermissions.ContainsKey(role))
        {
            return false;
        }

        var allowedPaths = rolePermissions[role];
        return allowedPaths.Any(allowedPath => path.StartsWith(allowedPath));
    }
}

public static class RoleAuthorizationMiddlewareExtensions
{
    public static IApplicationBuilder UseRoleAuthorization(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RoleAuthorizationMiddleware>();
    }
}