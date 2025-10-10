using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using BingGoWebAPI.Services;
using BingGoWebAPI.Authentication;
using BingGoWebAPI.Middleware;
using BingGoWebAPI.Models;
using Google.Cloud.Firestore;

var builder = WebApplication.CreateBuilder(args);

// Add additional configuration files
builder.Configuration.AddJsonFile("appsettings.Security.json", optional: true, reloadOnChange: true);

builder.Services.AddHttpContextAccessor();

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS with security considerations
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        // Specific origins for development (like KhoaLuan-main but with more ports)
        var allowedOrigins = new[] {
            "http://localhost:3000",
            "https://localhost:3000",
            "http://localhost:3001",
            "https://localhost:3001",
            "http://localhost:5000",
            "https://localhost:5001"
        };
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetPreflightMaxAge(TimeSpan.FromMinutes(10)); // Cache preflight requests
    });
});

// Add security services (basic configuration)
// Note: Custom security middleware will be configured in the pipeline

// Add Memory Cache
builder.Services.AddMemoryCache();

// Register Firebase services
builder.Services.AddSingleton<IFirebaseConfigService, FirebaseConfigService>();
builder.Services.AddSingleton<IFirebaseAuthService, FirebaseAuthService>();
builder.Services.AddSingleton<IFirebaseStorageService, FirebaseStorageService>();
builder.Services.AddSingleton<IFirebaseService, FirebaseService>();
builder.Services.AddSingleton<IPasswordHashingService, PasswordHashingService>();
builder.Services.AddScoped<IBadgeService, BadgeService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ISystemConfigService, SystemConfigService>();

// Register Firebase Configuration
builder.Services.Configure<FirebaseConfig>(builder.Configuration.GetSection("Firebase"));
builder.Services.AddScoped<IOptimizedFirebaseService, OptimizedFirebaseService>();

// Register Firestore Database using FirebaseConfigService
builder.Services.AddSingleton(provider =>
{
    var firebaseConfigService = provider.GetRequiredService<IFirebaseConfigService>();
    return firebaseConfigService.GetFirestoreDb();
});


// Register GDPR and Privacy services
builder.Services.AddScoped<IGDPRComplianceService, GdprComplianceService>();
builder.Services.AddScoped<IPrivacyPolicyService, PrivacyPolicyService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IDataAnonymizationService, DataAnonymizationService>();
builder.Services.AddScoped<IConsentManagementService, ConsentManagementService>();
builder.Services.AddScoped<IDataEncryptionService, DataEncryptionService>();

// Register Security Monitoring services
builder.Services.AddScoped<ISecurityMonitoringService, SecurityMonitoringService>();
builder.Services.AddScoped<IIntrusionDetectionService, IntrusionDetectionService>();
builder.Services.AddScoped<ISecurityEventService, SecurityEventService>();

// Register other services
builder.Services.AddScoped<IDataMigrationService, DataMigrationService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<ICustomAuthService, CustomAuthService>();

// Configure InputValidationOptions
builder.Services.Configure<InputValidationOptions>(options =>
{
    var securityConfig = builder.Configuration.GetSection("Security:InputValidation");
    if (securityConfig.Exists())
    {
        securityConfig.Bind(options);
    }
});
builder.Services.AddSingleton<InputValidationOptions>(provider =>
{
    var options = new InputValidationOptions();
    var securityConfig = builder.Configuration.GetSection("Security:InputValidation");
    if (securityConfig.Exists())
    {
        securityConfig.Bind(options);
    }
    return options;
});

// Configure RateLimitOptions
builder.Services.Configure<RateLimitOptions>(options =>
{
    var securityConfig = builder.Configuration.GetSection("Security:RateLimit");
    if (securityConfig.Exists())
    {
        securityConfig.Bind(options);
    }
});
builder.Services.AddSingleton<RateLimitOptions>(provider =>
{
    var options = new RateLimitOptions();
    var securityConfig = builder.Configuration.GetSection("Security:RateLimit");
    if (securityConfig.Exists())
    {
        securityConfig.Bind(options);
    }
    return options;
});

// Configure SecurityHeadersOptions
builder.Services.Configure<SecurityHeadersOptions>(options =>
{
    var securityConfig = builder.Configuration.GetSection("Security:Headers");
    if (securityConfig.Exists())
    {
        securityConfig.Bind(options);
    }
});
builder.Services.AddSingleton<SecurityHeadersOptions>(provider =>
{
    var options = new SecurityHeadersOptions();
    var securityConfig = builder.Configuration.GetSection("Security:Headers");
    if (securityConfig.Exists())
    {
        securityConfig.Bind(options);
    }
    return options;
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global exception handling must be first to catch all exceptions
app.UseMiddleware<GlobalExceptionMiddleware>();

// Core ASP.NET Core middleware
app.UseHttpsRedirection();

// Routing must come before CORS for endpoint routing to work
app.UseRouting();

// CORS must be placed after UseRouting and before UseAuthorization.
// Placing it early ensures it runs before other middleware that might short-circuit the request.
app.UseCors("AllowReactApp");

// Security middleware - order matters
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<RateLimitingMiddleware>();
app.UseMiddleware<InputValidationMiddleware>();

// Custom JWT Authentication
app.UseMiddleware<JwtAuthenticationMiddleware>();

app.UseAuthorization();

app.MapControllers();

Console.WriteLine("BingGo Web API starting up...");

app.Run();
