using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace BingGoWebAPI.Middleware
{
    /// <summary>
    /// Input validation and sanitization middleware
    /// Validates and sanitizes all incoming request data
    /// </summary>
    public class InputValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<InputValidationMiddleware> _logger;
        private readonly InputValidationOptions _options;

        public InputValidationMiddleware(
            RequestDelegate next,
            ILogger<InputValidationMiddleware> logger,
            InputValidationOptions options)
        {
            _next = next;
            _logger = logger;
            _options = options;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Skip validation for certain endpoints
                if (ShouldSkipValidation(context.Request.Path))
                {
                    await _next(context);
                    return;
                }

                // Validate and sanitize request
                var validationResult = await ValidateRequest(context);
                if (!validationResult.IsValid)
                {
                    await HandleValidationFailure(context, validationResult.Errors);
                    return;
                }

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Input validation middleware error");
                await _next(context);
            }
        }

        /// <summary>
        /// Check if validation should be skipped for this path
        /// </summary>
        private static bool ShouldSkipValidation(PathString path)
        {
            var skipPaths = new[]
            {
                "/swagger", "/health", "/favicon.ico", "/api/auth/refresh"
            };

            return skipPaths.Any(skipPath =>
                path.StartsWithSegments(skipPath, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Validate incoming request
        /// </summary>
        private async Task<ValidationResult> ValidateRequest(HttpContext context)
        {
            var errors = new List<string>();
            var request = context.Request;

            // Validate headers
            var headerErrors = ValidateHeaders(request.Headers);
            errors.AddRange(headerErrors);

            // Validate query parameters
            var queryErrors = ValidateQueryParameters(request.Query);
            errors.AddRange(queryErrors);

            // Validate request body for POST/PUT requests
            if (request.Method == "POST" || request.Method == "PUT" || request.Method == "PATCH")
            {
                var bodyErrors = await ValidateRequestBody(context);
                errors.AddRange(bodyErrors);
            }

            // Validate file uploads
            if (request.HasFormContentType && request.Form.Files.Any())
            {
                var fileErrors = ValidateFileUploads(request.Form.Files);
                errors.AddRange(fileErrors);
            }

            return new ValidationResult
            {
                IsValid = !errors.Any(),
                Errors = errors
            };
        }

        /// <summary>
        /// Validate request headers
        /// </summary>
        private List<string> ValidateHeaders(IHeaderDictionary headers)
        {
            var errors = new List<string>();

            // Skip validation for standard browser headers that are commonly flagged
            var skipHeaders = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "accept", "accept-language", "accept-encoding", "user-agent",
                "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform",
                "sec-fetch-dest", "sec-fetch-mode", "sec-fetch-site", "sec-fetch-user",
                "cache-control", "pragma", "connection", "upgrade-insecure-requests",
                "dnt", "upgrade", "host"
            };

            foreach (var header in headers)
            {
                // Skip validation for standard headers
                if (skipHeaders.Contains(header.Key))
                {
                    continue;
                }

                // Check header name
                if (!IsValidHeaderName(header.Key))
                {
                    errors.Add($"Invalid header name: {header.Key}");
                    continue;
                }

                // Check header value
                var headerValue = header.Value.ToString();
                if (!IsValidHeaderValue(headerValue))
                {
                    errors.Add($"Invalid header value for {header.Key}");
                }

                // Check for injection attempts (less aggressive for custom headers)
                if (ContainsMaliciousContent(headerValue))
                {
                    errors.Add($"Malicious content detected in header {header.Key}");
                }

                // Check header length
                if (headerValue.Length > _options.MaxHeaderValueLength)
                {
                    errors.Add($"Header {header.Key} value too long");
                }
            }

            // Check total header count
            if (headers.Count > _options.MaxHeaderCount)
            {
                errors.Add("Too many headers");
            }

            return errors;
        }

        /// <summary>
        /// Validate query parameters
        /// </summary>
        private List<string> ValidateQueryParameters(IQueryCollection query)
        {
            var errors = new List<string>();

            foreach (var param in query)
            {
                // Check parameter name
                if (!IsValidParameterName(param.Key))
                {
                    errors.Add($"Invalid query parameter name: {param.Key}");
                    continue;
                }

                // Check parameter values
                foreach (var value in param.Value)
                {
                    if (value == null) continue;

                    if (!IsValidParameterValue(value))
                    {
                        errors.Add($"Invalid query parameter value for {param.Key}");
                    }

                    if (ContainsMaliciousContent(value))
                    {
                        errors.Add($"Malicious content detected in query parameter {param.Key}");
                    }

                    if (value.Length > _options.MaxParameterValueLength)
                    {
                        errors.Add($"Query parameter {param.Key} value too long");
                    }
                }
            }

            // Check total parameter count
            if (query.Count > _options.MaxQueryParameterCount)
            {
                errors.Add("Too many query parameters");
            }

            return errors;
        }

        /// <summary>
        /// Validate request body
        /// </summary>
        private async Task<List<string>> ValidateRequestBody(HttpContext context)
        {
            var errors = new List<string>();
            var request = context.Request;

            // Check content length
            if (request.ContentLength.HasValue && request.ContentLength.Value > _options.MaxRequestBodySize)
            {
                errors.Add("Request body too large");
                return errors;
            }

            // Read and validate body content
            request.EnableBuffering();
            var body = await ReadRequestBodyAsync(request);

            if (!string.IsNullOrEmpty(body))
            {
                // Check for malicious content
                if (ContainsMaliciousContent(body))
                {
                    errors.Add("Malicious content detected in request body");
                }

                // Validate JSON structure if content type is JSON
                if (request.ContentType?.Contains("application/json") == true)
                {
                    var jsonErrors = ValidateJsonContent(body);
                    errors.AddRange(jsonErrors);
                }

                // Validate specific data types
                var dataErrors = await ValidateDataContent(body, request.ContentType);
                errors.AddRange(dataErrors);
            }

            // Reset stream position for next middleware
            request.Body.Position = 0;

            return errors;
        }

        /// <summary>
        /// Read request body as string
        /// </summary>
        private static async Task<string> ReadRequestBodyAsync(HttpRequest request)
        {
            using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;
            return body;
        }

        /// <summary>
        /// Validate JSON content
        /// /// </summary>
        private List<string> ValidateJsonContent(string jsonContent)
        {
            var errors = new List<string>();

            try
            {
                using var document = JsonDocument.Parse(jsonContent);

                // Check JSON depth
                if (GetJsonDepth(document.RootElement) > _options.MaxJsonDepth)
                {
                    errors.Add("JSON structure too deep");
                }

                // Check for suspicious properties
                var suspiciousErrors = CheckForSuspiciousJsonProperties(document.RootElement);
                errors.AddRange(suspiciousErrors);
            }
            catch (JsonException)
            {
                errors.Add("Invalid JSON format");
            }

            return errors;
        }

        /// <summary>
        /// Get JSON depth
        /// </summary>
        private static int GetJsonDepth(JsonElement element, int currentDepth = 0)
        {
            var maxDepth = currentDepth;

            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    foreach (var property in element.EnumerateObject())
                    {
                        var depth = GetJsonDepth(property.Value, currentDepth + 1);
                        maxDepth = Math.Max(maxDepth, depth);
                    }
                    break;
                case JsonValueKind.Array:
                    foreach (var item in element.EnumerateArray())
                    {
                        var depth = GetJsonDepth(item, currentDepth + 1);
                        maxDepth = Math.Max(maxDepth, depth);
                    }
                    break;
            }

            return maxDepth;
        }

        /// <summary>
        /// Check for suspicious JSON properties
        /// </summary>
        private static List<string> CheckForSuspiciousJsonProperties(JsonElement element)
        {
            var errors = new List<string>();
            var suspiciousProperties = new[]
            {
                "__proto__", "constructor", "prototype", "eval", "function",
                "script", "javascript", "vbscript", "onload", "onerror"
            };

            if (element.ValueKind == JsonValueKind.Object)
            {
                foreach (var property in element.EnumerateObject())
                {
                    // Check property name
                    if (suspiciousProperties.Any(sp =>
                        property.Name.Contains(sp, StringComparison.OrdinalIgnoreCase)))
                    {
                        errors.Add($"Suspicious JSON property: {property.Name}");
                    }

                    // Check property value
                    if (property.Value.ValueKind == JsonValueKind.String)
                    {
                        var value = property.Value.GetString() ?? "";
                        if (ContainsMaliciousContent(value))
                        {
                            errors.Add($"Malicious content in JSON property: {property.Name}");
                        }
                    }

                    // Recursively check nested objects/arrays
                    var nestedErrors = CheckForSuspiciousJsonProperties(property.Value);
                    errors.AddRange(nestedErrors);
                }
            }
            else if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    var nestedErrors = CheckForSuspiciousJsonProperties(item);
                    errors.AddRange(nestedErrors);
                }
            }

            return errors;
        }

        /// <summary>
        /// Validate data content based on content type
        /// </summary>
        private async Task<List<string>> ValidateDataContent(string content, string? contentType)
        {
            var errors = new List<string>();

            if (string.IsNullOrEmpty(contentType))
                return errors;

            // Validate based on content type
            if (contentType.Contains("application/json"))
            {
                // Additional JSON validation
                var jsonErrors = ValidateJsonDataTypes(content);
                errors.AddRange(jsonErrors);
            }
            else if (contentType.Contains("application/x-www-form-urlencoded"))
            {
                var formErrors = ValidateFormData(content);
                errors.AddRange(formErrors);
            }
            else if (contentType.Contains("multipart/form-data"))
            {
                // Multipart validation is handled separately in ValidateFileUploads
            }

            return errors;
        }

        /// <summary>
        /// Validate JSON data types and values
        /// </summary>
        private List<string> ValidateJsonDataTypes(string jsonContent)
        {
            var errors = new List<string>();

            try
            {
                using var document = JsonDocument.Parse(jsonContent);
                var validationErrors = ValidateJsonElement(document.RootElement, "root");
                errors.AddRange(validationErrors);
            }
            catch (JsonException ex)
            {
                errors.Add($"JSON parsing error: {ex.Message}");
            }

            return errors;
        }

        /// <summary>
        /// Validate JSON element recursively
        /// </summary>
        private List<string> ValidateJsonElement(JsonElement element, string path)
        {
            var errors = new List<string>();

            switch (element.ValueKind)
            {
                case JsonValueKind.String:
                    var stringValue = element.GetString() ?? "";
                    if (stringValue.Length > _options.MaxStringLength)
                    {
                        errors.Add($"String too long at {path}");
                    }
                    break;

                case JsonValueKind.Number:
                    if (element.TryGetDouble(out var doubleValue))
                    {
                        if (double.IsInfinity(doubleValue) || double.IsNaN(doubleValue))
                        {
                            errors.Add($"Invalid number at {path}");
                        }
                    }
                    break;

                case JsonValueKind.Object:
                    var propertyCount = 0;
                    foreach (var property in element.EnumerateObject())
                    {
                        propertyCount++;
                        if (propertyCount > _options.MaxObjectProperties)
                        {
                            errors.Add($"Too many properties in object at {path}");
                            break;
                        }

                        var nestedErrors = ValidateJsonElement(property.Value, $"{path}.{property.Name}");
                        errors.AddRange(nestedErrors);
                    }
                    break;

                case JsonValueKind.Array:
                    var arrayIndex = 0;
                    foreach (var item in element.EnumerateArray())
                    {
                        if (arrayIndex >= _options.MaxArrayLength)
                        {
                            errors.Add($"Array too long at {path}");
                            break;
                        }

                        var nestedErrors = ValidateJsonElement(item, $"{path}[{arrayIndex}]");
                        errors.AddRange(nestedErrors);
                        arrayIndex++;
                    }
                    break;
            }

            return errors;
        }

        /// <summary>
        /// Validate form data
        /// </summary>
        private List<string> ValidateFormData(string formData)
        {
            var errors = new List<string>();
            var pairs = formData.Split('&');

            if (pairs.Length > _options.MaxFormFields)
            {
                errors.Add("Too many form fields");
            }

            foreach (var pair in pairs)
            {
                var keyValue = pair.Split('=', 2);
                if (keyValue.Length == 2)
                {
                    var key = Uri.UnescapeDataString(keyValue[0]);
                    var value = Uri.UnescapeDataString(keyValue[1]);

                    if (!IsValidParameterName(key))
                    {
                        errors.Add($"Invalid form field name: {key}");
                    }

                    if (ContainsMaliciousContent(value))
                    {
                        errors.Add($"Malicious content in form field: {key}");
                    }

                    if (value.Length > _options.MaxParameterValueLength)
                    {
                        errors.Add($"Form field {key} value too long");
                    }
                }
            }

            return errors;
        }

        /// <summary>
        /// Validate file uploads
        /// </summary>
        private List<string> ValidateFileUploads(IFormFileCollection files)
        {
            var errors = new List<string>();

            if (files.Count > _options.MaxFileCount)
            {
                errors.Add("Too many files uploaded");
            }

            foreach (var file in files)
            {
                // Check file size
                if (file.Length > _options.MaxFileSize)
                {
                    errors.Add($"File {file.FileName} too large");
                }

                // Check file name
                if (!IsValidFileName(file.FileName))
                {
                    errors.Add($"Invalid file name: {file.FileName}");
                }

                // Check file extension
                if (!IsAllowedFileExtension(file.FileName))
                {
                    errors.Add($"File type not allowed: {file.FileName}");
                }

                // Check content type
                if (!IsAllowedContentType(file.ContentType))
                {
                    errors.Add($"Content type not allowed: {file.ContentType}");
                }
            }

            return errors;
        }

        /// <summary>
        /// Check if header name is valid
        /// </summary>
        private static bool IsValidHeaderName(string headerName)
        {
            return !string.IsNullOrWhiteSpace(headerName) &&
                   headerName.Length <= 100 &&
                   Regex.IsMatch(headerName, @"^[a-zA-Z0-9\-_]+$");
        }

        /// <summary>
        /// Check if header value is valid
        /// </summary>
        private static bool IsValidHeaderValue(string headerValue)
        {
            return headerValue.Length <= 4096 &&
                   !headerValue.Contains('\n') &&
                   !headerValue.Contains('\r');
        }

        /// <summary>
        /// Check if parameter name is valid
        /// </summary>
        private static bool IsValidParameterName(string paramName)
        {
            return !string.IsNullOrWhiteSpace(paramName) &&
                   paramName.Length <= 100 &&
                   Regex.IsMatch(paramName, @"^[a-zA-Z0-9\-_\.]+$");
        }

        /// <summary>
        /// Check if parameter value is valid
        /// </summary>
        private static bool IsValidParameterValue(string paramValue)
        {
            return paramValue.Length <= 2048;
        }

        /// <summary>
        /// Check if content contains malicious patterns
        /// </summary>
        private static bool ContainsMaliciousContent(string content)
        {
            if (string.IsNullOrEmpty(content))
                return false;

            var maliciousPatterns = new[]
            {
                // Script injection
                @"<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>",
                @"javascript:",
                @"vbscript:",
                @"data:text\/html",
                
                // SQL injection
                @"(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)",
                @"(--|#|\/\*|\*\/)",
                @"(\b(or|and)\b\s+\d+\s*=\s*\d+)",
                @"('\s*(or|and)\s*')",
                
                // Command injection
                @"(;|\||&|`|\$\()",
                @"\b(cat|ls|dir|type|copy|move|del|rm|mkdir|rmdir|wget|curl)\b",
                
                // Path traversal
                @"(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)",
                
                // XSS patterns
                @"(on\w+\s*=)",
                @"(eval\s*\(|alert\s*\(|confirm\s*\(|prompt\s*\()",
                @"(document\.(cookie|write|location))",
                @"(window\.(location|open))"
            };

            var lowerContent = content.ToLowerInvariant();

            return maliciousPatterns.Any(pattern =>
                Regex.IsMatch(lowerContent, pattern, RegexOptions.IgnoreCase));
        }

        /// <summary>
        /// Check if file name is valid
        /// </summary>
        private static bool IsValidFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return false;

            var invalidChars = Path.GetInvalidFileNameChars();
            return !fileName.Any(c => invalidChars.Contains(c)) &&
                   fileName.Length <= 255 &&
                   !fileName.StartsWith('.') &&
                   !fileName.Contains("..");
        }

        /// <summary>
        /// Check if file extension is allowed
        /// </summary>
        private bool IsAllowedFileExtension(string fileName)
        {
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
            return !string.IsNullOrEmpty(extension) &&
                   _options.AllowedFileExtensions.Contains(extension);
        }

        /// <summary>
        /// Check if content type is allowed
        /// </summary>
        private bool IsAllowedContentType(string contentType)
        {
            return _options.AllowedContentTypes.Any(allowed =>
                contentType.StartsWith(allowed, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Handle validation failure
        /// </summary>
        private async Task HandleValidationFailure(HttpContext context, List<string> errors)
        {
            var clientIp = GetClientIpAddress(context);
            _logger.LogWarning("Input validation failed for {ClientIp}: {Errors}",
                clientIp, string.Join(", ", errors));

            context.Response.StatusCode = 400; // Bad Request
            context.Response.ContentType = "application/json";

            var response = new
            {
                error = "Validation failed",
                message = "Invalid input data",
                details = _options.IncludeValidationDetails ? errors : null,
                timestamp = DateTimeOffset.UtcNow
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
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

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }

    /// <summary>
    /// Validation result
    /// </summary>
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    /// <summary>
    /// Input validation options
    /// </summary>
    public class InputValidationOptions
    {
        public int MaxHeaderCount { get; set; } = 50;
        public int MaxHeaderValueLength { get; set; } = 4096;
        public int MaxQueryParameterCount { get; set; } = 100;
        public int MaxParameterValueLength { get; set; } = 2048;
        public long MaxRequestBodySize { get; set; } = 50 * 1024 * 1024; // 50MB
        public int MaxJsonDepth { get; set; } = 10;
        public int MaxStringLength { get; set; } = 10000;
        public int MaxObjectProperties { get; set; } = 1000;
        public int MaxArrayLength { get; set; } = 1000;
        public int MaxFormFields { get; set; } = 100;
        public int MaxFileCount { get; set; } = 10;
        public long MaxFileSize { get; set; } = 10 * 1024 * 1024; // 10MB
        public bool IncludeValidationDetails { get; set; } = false;

        public HashSet<string> AllowedFileExtensions { get; set; } = new()
        {
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", // Images
            ".pdf", ".doc", ".docx", ".txt", ".rtf", // Documents
            ".mp3", ".wav", ".ogg", ".m4a", // Audio
            ".mp4", ".avi", ".mov", ".wmv", ".webm" // Video
        };

        public HashSet<string> AllowedContentTypes { get; set; } = new()
        {
            "image/", "audio/", "video/", "application/pdf",
            "application/msword", "application/vnd.openxmlformats-officedocument",
            "text/plain", "text/rtf"
        };
    }

    /// <summary>
    /// Extension methods for input validation
    /// </summary>
    public static class InputValidationExtensions
    {
        public static IServiceCollection AddInputValidation(this IServiceCollection services, Action<InputValidationOptions>? configure = null)
        {
            var options = new InputValidationOptions();
            configure?.Invoke(options);

            services.AddSingleton(options);
            return services;
        }

        public static IApplicationBuilder UseInputValidation(this IApplicationBuilder app)
        {
            return app.UseMiddleware<InputValidationMiddleware>();
        }
    }
}