using System.Text;

namespace BingGoWebAPI.Middleware
{
    /// <summary>
    /// Security headers middleware for HTTPS enforcement and secure headers
    /// Implements comprehensive security headers and HTTPS redirection
    /// </summary>
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityHeadersMiddleware> _logger;
        private readonly SecurityHeadersOptions _options;
        private readonly IWebHostEnvironment _environment;

        public SecurityHeadersMiddleware(
            RequestDelegate next,
            ILogger<SecurityHeadersMiddleware> logger,
            SecurityHeadersOptions options,
            IWebHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _options = options;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Enforce HTTPS in production
                if (_options.EnforceHttps && !context.Request.IsHttps && _environment.IsProduction())
                {
                    await RedirectToHttps(context);
                    return;
                }

                // Add security headers before processing request
                AddSecurityHeaders(context);

                // Check for security violations
                if (await CheckSecurityViolations(context))
                {
                    return; // Request blocked
                }

                await _next(context);

                // Add additional headers after processing
                AddPostProcessingHeaders(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Security headers middleware error");
                await _next(context);
            }
        }

        /// <summary>
        /// Redirect HTTP requests to HTTPS
        /// </summary>
        private async Task RedirectToHttps(HttpContext context)
        {
            var httpsUrl = $"https://{context.Request.Host}{context.Request.PathBase}{context.Request.Path}{context.Request.QueryString}";

            _logger.LogInformation("Redirecting HTTP request to HTTPS: {Url}", httpsUrl);

            context.Response.StatusCode = 301; // Permanent redirect
            context.Response.Headers.Add("Location", httpsUrl);

            await context.Response.WriteAsync("Redirecting to HTTPS...");
        }

        /// <summary>
        /// Add security headers to response
        /// </summary>
        private void AddSecurityHeaders(HttpContext context)
        {
            var response = context.Response;
            var headers = response.Headers;

            // Strict Transport Security (HSTS)
            if (_options.EnableHsts && context.Request.IsHttps)
            {
                headers.Add("Strict-Transport-Security",
                    $"max-age={_options.HstsMaxAge}; includeSubDomains; preload");
            }

            // Content Type Options
            if (_options.EnableContentTypeOptions)
            {
                headers.Add("X-Content-Type-Options", "nosniff");
            }

            // Frame Options
            if (_options.EnableFrameOptions)
            {
                headers.Add("X-Frame-Options", _options.FrameOptions);
            }

            // XSS Protection
            if (_options.EnableXssProtection)
            {
                headers.Add("X-XSS-Protection", "1; mode=block");
            }

            // Referrer Policy
            if (_options.EnableReferrerPolicy)
            {
                headers.Add("Referrer-Policy", _options.ReferrerPolicy);
            }

            // Content Security Policy
            if (_options.EnableContentSecurityPolicy)
            {
                var csp = BuildContentSecurityPolicy();
                headers.Add("Content-Security-Policy", csp);
            }

            // Permissions Policy
            if (_options.EnablePermissionsPolicy)
            {
                headers.Add("Permissions-Policy", _options.PermissionsPolicy);
            }

            // Cross-Origin Policies
            if (_options.EnableCrossOriginPolicies)
            {
                headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
                headers.Add("Cross-Origin-Opener-Policy", "same-origin");
                headers.Add("Cross-Origin-Resource-Policy", "same-origin");
            }

            // Remove server information
            if (_options.RemoveServerHeader)
            {
                headers.Remove("Server");
            }

            // Add custom security headers
            foreach (var customHeader in _options.CustomHeaders)
            {
                headers.Add(customHeader.Key, customHeader.Value);
            }
        }

        /// <summary>
        /// Build Content Security Policy header
        /// </summary>
        private string BuildContentSecurityPolicy()
        {
            var cspBuilder = new StringBuilder();

            // Default source
            cspBuilder.Append("default-src 'self'; ");

            // Script sources
            cspBuilder.Append("script-src 'self' ");
            if (_environment.IsDevelopment())
            {
                cspBuilder.Append("'unsafe-inline' 'unsafe-eval' ");
            }
            cspBuilder.Append("https://www.youtube.com https://www.google.com https://apis.google.com; ");

            // Style sources
            cspBuilder.Append("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ");

            // Font sources
            cspBuilder.Append("font-src 'self' https://fonts.gstatic.com data:; ");

            // Image sources
            cspBuilder.Append("img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; ");

            // Media sources
            cspBuilder.Append("media-src 'self' https: https://firebasestorage.googleapis.com; ");

            // Connect sources
            cspBuilder.Append("connect-src 'self' ");
            cspBuilder.Append("https://firestore.googleapis.com ");
            cspBuilder.Append("https://firebase.googleapis.com ");
            cspBuilder.Append("https://identitytoolkit.googleapis.com ");
            cspBuilder.Append("https://securetoken.googleapis.com ");
            cspBuilder.Append("wss://firestore.googleapis.com; ");

            // Frame sources
            cspBuilder.Append("frame-src 'self' https://www.youtube.com; ");

            // Object and base restrictions
            cspBuilder.Append("object-src 'none'; ");
            cspBuilder.Append("base-uri 'self'; ");
            cspBuilder.Append("form-action 'self'; ");
            cspBuilder.Append("frame-ancestors 'none'; ");

            // Upgrade insecure requests in production
            if (_environment.IsProduction())
            {
                cspBuilder.Append("upgrade-insecure-requests; ");
            }

            return cspBuilder.ToString().TrimEnd();
        }

        /// <summary>
        /// Check for security violations in the request
        /// </summary>
        private async Task<bool> CheckSecurityViolations(HttpContext context)
        {
            var request = context.Request;
            var violations = new List<string>();

            // Check for suspicious headers
            if (CheckSuspiciousHeaders(request, out var headerViolations))
            {
                violations.AddRange(headerViolations);
            }

            // Check for suspicious user agents
            if (CheckSuspiciousUserAgent(request, out var userAgentViolation))
            {
                violations.Add(userAgentViolation);
            }

            // Check for suspicious request patterns
            if (CheckSuspiciousRequestPatterns(request, out var patternViolations))
            {
                violations.AddRange(patternViolations);
            }

            // Check request size limits
            if (CheckRequestSizeLimits(request, out var sizeViolation))
            {
                violations.Add(sizeViolation);
            }

            // Log violations
            if (violations.Any())
            {
                var clientIp = GetClientIpAddress(context);
                _logger.LogWarning("Security violations detected from {ClientIp}: {Violations}",
                    clientIp, string.Join(", ", violations));

                // Block request if critical violations found
                if (violations.Any(v => IsCriticalViolation(v)))
                {
                    await BlockRequest(context, "Security violation detected");
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Check for suspicious headers
        /// </summary>
        private static bool CheckSuspiciousHeaders(HttpRequest request, out List<string> violations)
        {
            violations = new List<string>();

            // Check for injection attempts in headers
            var suspiciousPatterns = new[]
            {
                "<script", "javascript:", "vbscript:", "onload=", "onerror=",
                "eval(", "alert(", "document.cookie", "document.write"
            };

            foreach (var header in request.Headers)
            {
                var headerValue = header.Value.ToString().ToLowerInvariant();

                foreach (var pattern in suspiciousPatterns)
                {
                    if (headerValue.Contains(pattern))
                    {
                        violations.Add($"suspicious_header_{header.Key}");
                        break;
                    }
                }
            }

            // Check for unusual header combinations
            if (request.Headers.ContainsKey("X-Forwarded-For") &&
                request.Headers.ContainsKey("X-Real-IP") &&
                request.Headers["X-Forwarded-For"] != request.Headers["X-Real-IP"])
            {
                violations.Add("ip_header_mismatch");
            }

            return violations.Any();
        }

        /// <summary>
        /// Check for suspicious user agents
        /// </summary>
        private static bool CheckSuspiciousUserAgent(HttpRequest request, out string violation)
        {
            violation = string.Empty;

            var userAgent = request.Headers["User-Agent"].FirstOrDefault() ?? "";

            // Check for empty or very short user agents
            if (string.IsNullOrWhiteSpace(userAgent) || userAgent.Length < 10)
            {
                violation = "suspicious_user_agent_empty";
                return true;
            }

            // Check for known malicious patterns
            var maliciousPatterns = new[]
            {
                "sqlmap", "nikto", "nmap", "masscan", "zap", "burp", "havij",
                "acunetix", "netsparker", "appscan", "w3af", "skipfish"
            };

            if (maliciousPatterns.Any(pattern =>
                userAgent.Contains(pattern, StringComparison.OrdinalIgnoreCase)))
            {
                violation = "malicious_user_agent";
                return true;
            }

            return false;
        }

        /// <summary>
        /// Check for suspicious request patterns
        /// </summary>
        private static bool CheckSuspiciousRequestPatterns(HttpRequest request, out List<string> violations)
        {
            violations = new List<string>();

            var path = request.Path.Value?.ToLowerInvariant() ?? "";
            var query = request.QueryString.Value?.ToLowerInvariant() ?? "";

            // Check for path traversal attempts
            if (path.Contains("../") || path.Contains("..\\") || path.Contains("%2e%2e"))
            {
                violations.Add("path_traversal_attempt");
            }

            // Check for SQL injection patterns
            var sqlPatterns = new[]
            {
                "union select", "drop table", "insert into", "delete from",
                "update set", "exec(", "execute(", "sp_", "xp_", "'; --", "' or '1'='1"
            };

            var fullRequest = $"{path} {query}";
            foreach (var pattern in sqlPatterns)
            {
                if (fullRequest.Contains(pattern))
                {
                    violations.Add("sql_injection_attempt");
                    break;
                }
            }

            // Check for XSS patterns
            var xssPatterns = new[]
            {
                "<script", "javascript:", "vbscript:", "onload=", "onerror=",
                "alert(", "confirm(", "prompt(", "document.cookie"
            };

            foreach (var pattern in xssPatterns)
            {
                if (fullRequest.Contains(pattern))
                {
                    violations.Add("xss_attempt");
                    break;
                }
            }

            // Check for command injection patterns
            var cmdPatterns = new[]
            {
                "; cat ", "; ls ", "; dir ", "| cat ", "| ls ", "| dir ",
                "&& cat ", "&& ls ", "&& dir ", "$(", "`", "wget ", "curl "
            };

            foreach (var pattern in cmdPatterns)
            {
                if (fullRequest.Contains(pattern))
                {
                    violations.Add("command_injection_attempt");
                    break;
                }
            }

            return violations.Any();
        }

        /// <summary>
        /// Check request size limits
        /// </summary>
        private static bool CheckRequestSizeLimits(HttpRequest request, out string violation)
        {
            violation = string.Empty;

            // Check content length
            if (request.ContentLength.HasValue && request.ContentLength.Value > 50 * 1024 * 1024) // 50MB
            {
                violation = "request_too_large";
                return true;
            }

            // Check URL length
            var fullUrl = $"{request.Path}{request.QueryString}";
            if (fullUrl.Length > 2048)
            {
                violation = "url_too_long";
                return true;
            }

            // Check header count
            if (request.Headers.Count > 50)
            {
                violation = "too_many_headers";
                return true;
            }

            return false;
        }

        /// <summary>
        /// Check if violation is critical
        /// </summary>
        private static bool IsCriticalViolation(string violation)
        {
            var criticalViolations = new[]
            {
                "malicious_user_agent", "sql_injection_attempt",
                "command_injection_attempt", "path_traversal_attempt"
            };

            return criticalViolations.Contains(violation);
        }

        /// <summary>
        /// Block request due to security violation
        /// </summary>
        private async Task BlockRequest(HttpContext context, string reason)
        {
            context.Response.StatusCode = 403; // Forbidden
            context.Response.ContentType = "application/json";

            var response = new
            {
                error = "Forbidden",
                message = reason,
                timestamp = DateTimeOffset.UtcNow
            };

            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
        }

        /// <summary>
        /// Add headers after request processing
        /// </summary>
        private void AddPostProcessingHeaders(HttpContext context)
        {
            // Add security headers that depend on response
            if (context.Response.ContentType?.StartsWith("text/html") == true)
            {
                // Add additional HTML-specific security headers
                context.Response.Headers.Add("X-Permitted-Cross-Domain-Policies", "none");
            }

            // Add cache control for sensitive endpoints
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
            if (IsSensitiveEndpoint(path))
            {
                context.Response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate, private");
                context.Response.Headers.Add("Pragma", "no-cache");
                context.Response.Headers.Add("Expires", "0");
            }
        }

        /// <summary>
        /// Check if endpoint is sensitive
        /// </summary>
        private static bool IsSensitiveEndpoint(string path)
        {
            var sensitivePatterns = new[]
            {
                "/api/auth/", "/api/admin/", "/api/user/profile",
                "/api/payment/", "/api/security/"
            };

            return sensitivePatterns.Any(pattern => path.Contains(pattern));
        }

        /// <summary>
        /// Get client IP address
        /// </summary>
        private static string GetClientIpAddress(HttpContext context)
        {
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
            {
                return realIp;
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }

    /// <summary>
    /// Security headers options
    /// </summary>
    public class SecurityHeadersOptions
    {
        public bool EnforceHttps { get; set; } = true;
        public bool EnableHsts { get; set; } = true;
        public int HstsMaxAge { get; set; } = 31536000; // 1 year
        public bool EnableContentTypeOptions { get; set; } = true;
        public bool EnableFrameOptions { get; set; } = true;
        public string FrameOptions { get; set; } = "DENY";
        public bool EnableXssProtection { get; set; } = true;
        public bool EnableReferrerPolicy { get; set; } = true;
        public string ReferrerPolicy { get; set; } = "strict-origin-when-cross-origin";
        public bool EnableContentSecurityPolicy { get; set; } = true;
        public bool EnablePermissionsPolicy { get; set; } = true;
        public string PermissionsPolicy { get; set; } = "camera=(), microphone=(), geolocation=(), payment=()";
        public bool EnableCrossOriginPolicies { get; set; } = true;
        public bool RemoveServerHeader { get; set; } = true;
        public Dictionary<string, string> CustomHeaders { get; set; } = new();
    }

    /// <summary>
    /// Extension methods for security headers
    /// </summary>
    public static class SecurityHeadersExtensions
    {
        public static IServiceCollection AddSecurityHeaders(this IServiceCollection services, Action<SecurityHeadersOptions>? configure = null)
        {
            var options = new SecurityHeadersOptions();
            configure?.Invoke(options);

            services.AddSingleton(options);
            return services;
        }

        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        {
            return app.UseMiddleware<SecurityHeadersMiddleware>();
        }
    }
}