using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using BingGoWebAPI.Services;
using BingGoWebAPI.Authentication;
using BingGoWebAPI.Middleware;
using BingGoWebAPI.Models;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add additional configuration files
// builder.Configuration.AddJsonFile("appsettings.Security.json", optional: true, reloadOnChange: true);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

builder.Services.AddHttpContextAccessor();

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization to use camelCase
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT Bearer authentication
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "BingGo Web API",
        Version = "v1",
        Description = "BingGo Learning Management System API"
    });

    // Add JWT Bearer authentication to Swagger
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by a space and your JWT token."
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

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

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("Security:JWT");
    var secretKey = jwtSettings["Secret"];
    if (string.IsNullOrEmpty(secretKey))
    {
        throw new InvalidOperationException("JWT Secret not configured.");
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            var result = System.Text.Json.JsonSerializer.Serialize(new { message = "Unauthorized: Invalid or expired token" });
            return context.Response.WriteAsync(result);
        }
    };
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
// Removed password hashing service - using plain text passwords
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
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "BingGo Web API v1");
        options.RoutePrefix = "swagger"; // Serve Swagger UI at /swagger
        options.EnableTryItOutByDefault();
        options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        options.DisplayRequestDuration();

        // Configure OAuth for JWT Bearer tokens
        options.OAuthClientId("swagger-ui");
        options.OAuthClientSecret("swagger-ui-secret");
        options.OAuthRealm("swagger-ui-realm");
        options.OAuthAppName("BingGo Web API");
        options.OAuthUseBasicAuthenticationWithAccessCodeGrant();
    });
}

// Global exception handling must be first to catch all exceptions
app.UseMiddleware<GlobalExceptionMiddleware>();

// Core ASP.NET Core middleware
// app.UseHttpsRedirection(); // Commented out for development

// Routing must come before CORS for endpoint routing to work
app.UseRouting();

// CORS must be placed after UseRouting and before UseAuthorization.
// Placing it early ensures it runs before other middleware that might short-circuit the request.
app.UseCors("AllowReactApp");

// Security middleware - order matters
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<RateLimitingMiddleware>();
app.UseMiddleware<InputValidationMiddleware>();

// Add the authentication middleware to the pipeline.
// It must come before UseAuthorization.
app.UseAuthentication();
app.UseMiddleware<ApiAuthenticationMiddleware>();
app.UseAuthorization();

app.MapControllers();

Console.WriteLine("BingGo Web API starting up...");

app.Run();