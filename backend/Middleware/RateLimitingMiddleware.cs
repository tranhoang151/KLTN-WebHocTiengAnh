using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;

namespace BingGoWebAPI.Middleware
{
    /// <summary>
    /// Rate limiting and abuse prevention middleware
    /// Implements sliding window rate limiting with different limits for different endpoints
    /// </summary>
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly IMemoryCache _cache;
        private readonly RateLimitOptions _options;
        private readonly ConcurrentDictionary<string, SlidingWindow> _windows;

        public RateLimitingMiddleware(
            RequestDelegate next,
            ILogger<RateLimitingMiddleware> logger,
            IMemoryCache cache,
            RateLimitOptions options)
        {
            _next = next;
            _logger = logger;
            _cache = cache;
            _options = options;
            _windows = new ConcurrentDictionary<string, SlidingWindow>();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                var clientId = GetClientIdentifier(context);
                var endpoint = GetEndpointKey(context);
                var rateLimitRule = GetRateLimitRule(context);

                if (rateLimitRule == null)
                {
                    await _next(context);
                    return;
                }

                var key = $"{clientId}:{endpoint}";
                var window = _windows.GetOrAdd(key, _ => new SlidingWindow(rateLimitRule.WindowSize));

                if (!window.TryAddRequest(rateLimitRule.RequestLimit))
                {
                    await HandleRateLimitExceeded(context, rateLimitRule);
                    return;
                }

                // Add rate limit headers
                AddRateLimitHeaders(context, window, rateLimitRule);

                // Check for suspicious patterns
                await CheckForAbusePatterns(context, clientId);

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Rate limiting middleware error");
                await _next(context);
            }
        }

        /// <summary>
        /// Get client identifier (IP address or user ID)
        /// </summary>
        private static string GetClientIdentifier(HttpContext context)
        {
            // Try to get user ID first (for authenticated requests)
            var userId = context.Items["UserId"]?.ToString();
            if (!string.IsNullOrEmpty(userId))
            {
                return $"user:{userId}";
            }

            // Fall back to IP address
            var ipAddress = GetClientIpAddress(context);
            return $"ip:{ipAddress}";
        }

        /// <summary>
        /// Get client IP address considering proxies
        /// </summary>
        private static string GetClientIpAddress(HttpContext context)
        {
            // Check for forwarded IP (behind proxy/load balancer)
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                var ips = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries);
                if (ips.Length > 0)
                {
                    return ips[0].Trim();
                }
            }

            // Check for real IP header
            var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
            {
                return realIp;
            }

            // Fall back to connection remote IP
            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        /// <summary>
        /// Get endpoint key for rate limiting
        /// </summary>
        private static string GetEndpointKey(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
            var method = context.Request.Method.ToUpperInvariant();

            // Normalize paths with parameters
            path = NormalizePath(path);

            return $"{method}:{path}";
        }

        /// <summary>
        /// Normalize path by replacing IDs with placeholders
        /// </summary>
        private static string NormalizePath(string path)
        {
            // Replace Firebase IDs (20+ characters) with placeholder
            path = System.Text.RegularExpressions.Regex.Replace(
                path,
                @"/[a-zA-Z0-9_-]{20,}",
                "/{id}");

            // Replace numeric IDs with placeholder
            path = System.Text.RegularExpressions.Regex.Replace(
                path,
                @"/\d+",
                "/{id}");

            return path;
        }

        /// <summary>
        /// Get rate limit rule for the current request
        /// </summary>
        private RateLimitRule? GetRateLimitRule(HttpContext context)
        {
            var endpoint = GetEndpointKey(context);
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
            var method = context.Request.Method.ToUpperInvariant();

            // Check for specific endpoint rules
            var specificRule = _options.EndpointRules.FirstOrDefault(rule =>
                endpoint.StartsWith($"{rule.Method}:{rule.Path}", StringComparison.OrdinalIgnoreCase));

            if (specificRule != null)
            {
                return specificRule;
            }

            // Check for path pattern rules
            var patternRule = _options.PathPatternRules.FirstOrDefault(rule =>
                System.Text.RegularExpressions.Regex.IsMatch(path, rule.PathPattern) &&
                (string.IsNullOrEmpty(rule.Method) || rule.Method.Equals(method, StringComparison.OrdinalIgnoreCase)));

            if (patternRule != null)
            {
                return patternRule;
            }

            // Return default rule
            return _options.DefaultRule;
        }

        /// <summary>
        /// Handle rate limit exceeded
        /// </summary>
        private async Task HandleRateLimitExceeded(HttpContext context, RateLimitRule rule)
        {
            var clientId = GetClientIdentifier(context);
            var endpoint = GetEndpointKey(context);

            _logger.LogWarning("Rate limit exceeded for client {ClientId} on endpoint {Endpoint}",
                clientId, endpoint);

            context.Response.StatusCode = 429; // Too Many Requests
            context.Response.ContentType = "application/json";

            // Add retry-after header
            var retryAfter = rule.WindowSize.TotalSeconds;
            context.Response.Headers.Add("Retry-After", retryAfter.ToString());

            var response = new
            {
                error = "Rate limit exceeded",
                message = $"Too many requests. Limit: {rule.RequestLimit} requests per {rule.WindowSize.TotalMinutes} minutes",
                retryAfter = retryAfter,
                timestamp = DateTimeOffset.UtcNow
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));

            // Log potential abuse
            await LogPotentialAbuse(clientId, endpoint, "rate_limit_exceeded");
        }

        /// <summary>
        /// Add rate limit headers to response
        /// </summary>
        private static void AddRateLimitHeaders(HttpContext context, SlidingWindow window, RateLimitRule rule)
        {
            // Check if response has already started
            if (context.Response.HasStarted)
            {
                return;
            }

            var remaining = Math.Max(0, rule.RequestLimit - window.RequestCount);
            var resetTime = DateTimeOffset.UtcNow.Add(rule.WindowSize);

            context.Response.Headers.Add("X-RateLimit-Limit", rule.RequestLimit.ToString());
            context.Response.Headers.Add("X-RateLimit-Remaining", remaining.ToString());
            context.Response.Headers.Add("X-RateLimit-Reset", resetTime.ToUnixTimeSeconds().ToString());
            context.Response.Headers.Add("X-RateLimit-Window", rule.WindowSize.TotalSeconds.ToString());
        }

        /// <summary>
        /// Check for abuse patterns
        /// </summary>
        private async Task CheckForAbusePatterns(HttpContext context, string clientId)
        {
            var cacheKey = $"abuse_check:{clientId}";
            var abuseData = _cache.Get<AbuseTrackingData>(cacheKey) ?? new AbuseTrackingData();

            // Update abuse tracking data
            abuseData.RequestCount++;
            abuseData.LastRequestTime = DateTimeOffset.UtcNow;

            // Check for suspicious patterns
            var suspiciousPatterns = new List<string>();

            // Pattern 1: Too many requests in short time
            if (abuseData.RequestCount > _options.AbuseThresholds.RequestsPerMinute)
            {
                suspiciousPatterns.Add("high_frequency_requests");
            }

            // Pattern 2: Requests to sensitive endpoints
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
            if (_options.SensitiveEndpoints.Any(endpoint => path.Contains(endpoint)))
            {
                abuseData.SensitiveEndpointAccess++;
                if (abuseData.SensitiveEndpointAccess > _options.AbuseThresholds.SensitiveEndpointAccess)
                {
                    suspiciousPatterns.Add("sensitive_endpoint_abuse");
                }
            }

            // Pattern 3: Multiple failed authentication attempts
            if (context.Response.StatusCode == 401)
            {
                abuseData.FailedAuthAttempts++;
                if (abuseData.FailedAuthAttempts > _options.AbuseThresholds.FailedAuthAttempts)
                {
                    suspiciousPatterns.Add("brute_force_auth");
                }
            }

            // Pattern 4: Unusual user agent patterns
            var userAgent = context.Request.Headers["User-Agent"].FirstOrDefault() ?? "";
            if (IsBot(userAgent) && !IsAllowedBot(userAgent))
            {
                suspiciousPatterns.Add("suspicious_bot");
            }

            // Update cache
            _cache.Set(cacheKey, abuseData, TimeSpan.FromMinutes(60));

            // Log suspicious patterns
            if (suspiciousPatterns.Any())
            {
                await LogPotentialAbuse(clientId, GetEndpointKey(context), string.Join(",", suspiciousPatterns));
            }
        }

        /// <summary>
        /// Check if user agent is a bot
        /// </summary>
        private static bool IsBot(string userAgent)
        {
            var botPatterns = new[]
            {
                "bot", "crawler", "spider", "scraper", "curl", "wget", "python", "java", "go-http-client"
            };

            return botPatterns.Any(pattern =>
                userAgent.Contains(pattern, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Check if bot is allowed
        /// </summary>
        private static bool IsAllowedBot(string userAgent)
        {
            var allowedBots = new[]
            {
                "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider", "yandexbot", "facebookexternalhit"
            };

            return allowedBots.Any(bot =>
                userAgent.Contains(bot, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Log potential abuse
        /// </summary>
        private async Task LogPotentialAbuse(string clientId, string endpoint, string pattern)
        {
            _logger.LogWarning("Potential abuse detected: Client={ClientId}, Endpoint={Endpoint}, Pattern={Pattern}",
                clientId, endpoint, pattern);

            // Here you could integrate with external security services
            // like sending alerts to security team, updating WAF rules, etc.

            await Task.CompletedTask;
        }
    }

    /// <summary>
    /// Sliding window for rate limiting
    /// </summary>
    public class SlidingWindow
    {
        private readonly Queue<DateTimeOffset> _requests;
        private readonly TimeSpan _windowSize;
        private readonly object _lock = new();

        public SlidingWindow(TimeSpan windowSize)
        {
            _windowSize = windowSize;
            _requests = new Queue<DateTimeOffset>();
        }

        public int RequestCount
        {
            get
            {
                lock (_lock)
                {
                    CleanOldRequests();
                    return _requests.Count;
                }
            }
        }

        public bool TryAddRequest(int limit)
        {
            lock (_lock)
            {
                CleanOldRequests();

                if (_requests.Count >= limit)
                {
                    return false;
                }

                _requests.Enqueue(DateTimeOffset.UtcNow);
                return true;
            }
        }

        private void CleanOldRequests()
        {
            var cutoff = DateTimeOffset.UtcNow.Subtract(_windowSize);

            while (_requests.Count > 0 && _requests.Peek() < cutoff)
            {
                _requests.Dequeue();
            }
        }
    }

    /// <summary>
    /// Abuse tracking data
    /// </summary>
    public class AbuseTrackingData
    {
        public int RequestCount { get; set; }
        public int SensitiveEndpointAccess { get; set; }
        public int FailedAuthAttempts { get; set; }
        public DateTimeOffset LastRequestTime { get; set; }
        public DateTimeOffset FirstRequestTime { get; set; } = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Rate limit rule
    /// </summary>
    public class RateLimitRule
    {
        public string Method { get; set; } = "";
        public string Path { get; set; } = "";
        public string PathPattern { get; set; } = "";
        public int RequestLimit { get; set; }
        public TimeSpan WindowSize { get; set; }
    }

    /// <summary>
    /// Rate limit options
    /// </summary>
    public class RateLimitOptions
    {
        public RateLimitRule DefaultRule { get; set; } = new()
        {
            RequestLimit = 100,
            WindowSize = TimeSpan.FromMinutes(1)
        };

        public List<RateLimitRule> EndpointRules { get; set; } = new();
        public List<RateLimitRule> PathPatternRules { get; set; } = new();
        public List<string> SensitiveEndpoints { get; set; } = new();
        public AbuseThresholds AbuseThresholds { get; set; } = new();
    }

    /// <summary>
    /// Abuse detection thresholds
    /// </summary>
    public class AbuseThresholds
    {
        public int RequestsPerMinute { get; set; } = 200;
        public int SensitiveEndpointAccess { get; set; } = 10;
        public int FailedAuthAttempts { get; set; } = 5;
    }

    /// <summary>
    /// Extension methods for rate limiting
    /// </summary>
    public static class RateLimitingExtensions
    {
        public static IServiceCollection AddRateLimiting(this IServiceCollection services, Action<RateLimitOptions> configure)
        {
            var options = new RateLimitOptions();
            configure(options);

            services.AddSingleton(options);
            services.AddMemoryCache();

            return services;
        }

        public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder app)
        {
            return app.UseMiddleware<RateLimitingMiddleware>();
        }
    }
}