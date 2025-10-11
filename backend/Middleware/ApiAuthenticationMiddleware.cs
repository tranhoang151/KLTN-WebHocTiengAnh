
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace BingGoWebAPI.Middleware
{
    public class ApiAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        public ApiAuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments("/api") && !context.User.Identity.IsAuthenticated)
            {
                if (!context.Request.Path.Equals("/api/Auth/login", StringComparison.OrdinalIgnoreCase) && 
                    !context.Request.Path.Equals("/api/Auth/register", StringComparison.OrdinalIgnoreCase) && 
                    !context.Request.Path.StartsWithSegments("/swagger"))
                {
                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync("{\"message\":\"Unauthorized\"}");
                    return;
                }
            }

            await _next(context);
        }
    }
}
