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
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:3000", "https://localhost:3000" };

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

// Register Firestore Database (will be configured by FirebaseConfigService)

// Register Firebase Configuration
builder.Services.Configure<FirebaseConfig>(builder.Configuration.GetSection("Firebase"));
builder.Services.AddScoped<IOptimizedFirebaseService, OptimizedFirebaseService>();
builder.Services.AddSingleton(provider =>
    FirestoreDb.Create("kltn-c5cf0")); // Replace "your-project-id" with your Firebase project ID.


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

// Security middleware
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseHttpsRedirection();
app.UseMiddleware<RateLimitingMiddleware>();
app.UseMiddleware<InputValidationMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();

// CORS
app.UseCors("AllowReactApp");

// Custom JWT Authentication
app.UseMiddleware<JwtAuthenticationMiddleware>();

app.MapControllers();

Console.WriteLine("BingGo Web API starting up...");

app.Run();
