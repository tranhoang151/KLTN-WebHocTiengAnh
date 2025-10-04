# Firebase Integration Setup

## Overview
This document outlines the Firebase integration setup for the BingGo Web API project.

## Firebase Services Configured

### 1. Firebase Project Configuration ✅
- **Project ID**: `kltn-c5cf0`
- **Service Account Key**: `kltn-c5cf0-firebase-adminsdk-fbsvc-036427bc95.json`
- **Storage Bucket**: `kltn-c5cf0.appspot.com`

### 2. Firebase SDK for .NET ✅
**Packages Installed:**
- `FirebaseAdmin` (v2.4.0) - Firebase Admin SDK
- `Google.Cloud.Firestore` (v3.4.0) - Firestore database
- `Google.Cloud.Storage.V1` (v4.6.0) - Firebase Storage
- `Microsoft.AspNetCore.Authentication.JwtBearer` (v8.0.0) - JWT Authentication

### 3. Firebase Authentication ✅
**Components:**
- `FirebaseAuthService` - Handles token verification and user management
- `FirebaseAuthenticationHandler` - Custom authentication handler for ASP.NET Core
- JWT Bearer token authentication scheme
- Custom claims support for role-based access

**Features:**
- ID token verification
- Custom token creation
- User record management (CRUD operations)
- Claims-based authentication
- Role-based authorization support

### 4. Firestore Database Connection ✅
**Components:**
- `FirebaseConfigService` - Manages Firebase app initialization
- `FirebaseService` - Implements database operations
- Connection with service account credentials
- Memory caching for performance optimization

**Collections Supported:**
- `users` - User management
- `courses` - Course data
- `classes` - Class management
- `flashcard_sets` - Flashcard collections
- `flashcards` - Individual flashcards
- `exercises` - Exercise data
- `questions` - Question bank
- `videos` - Video lessons

### 5. Firebase Storage Configuration ✅
**Components:**
- `FirebaseStorageService` - File upload/download operations
- Base64 image upload support
- File existence checking
- File listing capabilities

**Features:**
- Upload files to organized folders
- Base64 image processing
- Public URL generation
- File management operations

## Configuration Files

### appsettings.json
```json
{
  "Firebase": {
    "ServiceAccountKeyPath": "firebase-service-account.json",
    "ProjectId": "kltn-c5cf0",
    "StorageBucket": "kltn-c5cf0.appspot.com"
  }
}
```

### appsettings.Development.json
```json
{
  "Firebase": {
    "ServiceAccountKeyPath": "../WebConversion/kltn-c5cf0-firebase-adminsdk-fbsvc-036427bc95.json",
    "ProjectId": "kltn-c5cf0",
    "StorageBucket": "kltn-c5cf0.appspot.com"
  }
}
```

## Service Registration

### Program.cs
```csharp
// Register Firebase services
builder.Services.AddSingleton<IFirebaseConfigService, FirebaseConfigService>();
builder.Services.AddSingleton<IFirebaseAuthService, FirebaseAuthService>();
builder.Services.AddSingleton<IFirebaseStorageService, FirebaseStorageService>();
builder.Services.AddSingleton<IFirebaseService, FirebaseService>();

// Configure JWT Authentication
builder.Services.AddAuthentication("Firebase")
    .AddScheme<FirebaseAuthenticationSchemeOptions, FirebaseAuthenticationHandler>(
        "Firebase", options => { });
```

## API Endpoints for Testing

### Health Checks
- `GET /api/health` - Basic API health
- `GET /api/health/firebase` - Firebase connection status

### Firebase Testing
- `GET /api/firebase/test-firestore` - Test Firestore connection
- `POST /api/firebase/test-storage` - Test Firebase Storage upload
- `GET /api/firebase/test-storage-list` - Test Firebase Storage listing
- `POST /api/firebase/test-auth` - Test Firebase Authentication
- `GET /api/firebase/protected` - Test protected endpoint with Firebase auth

## Security Features

### Authentication
- Firebase ID token verification
- Custom authentication handler
- JWT Bearer token support
- Role-based claims

### Authorization
- Role-based access control
- Custom claims support
- Protected endpoints
- User permission validation

## Error Handling

### Global Exception Middleware
- Firebase authentication errors
- Firestore connection errors
- Storage operation errors
- Structured error responses

### Logging
- Firebase initialization logging
- Operation success/failure logging
- Security event logging
- Performance monitoring

## Testing

### Automated Tests
Run the Firebase integration test:
```powershell
.\test-firebase-integration.ps1
```

### Manual Testing
1. Start the API: `dotnet run --environment=Development`
2. Test endpoints using Swagger UI: `http://localhost:5000/swagger`
3. Verify Firebase connections through test endpoints

## Requirements Compliance

### R01 (User Authentication and Role Management) ✅
- Firebase Authentication integration
- Role-based access control
- User management capabilities
- Secure token handling

### R11 (Data Security and Privacy) ✅
- Firebase Authentication with secure tokens
- HTTPS encryption support
- Server-side permission validation
- Audit logging capabilities

### R14 (Performance and Scalability) ✅
- Memory caching implementation
- Efficient Firebase connections
- Connection pooling
- Performance monitoring

## Next Steps

1. **Frontend Integration**: Configure Firebase SDK for React
2. **Security Rules**: Implement Firestore security rules
3. **Production Setup**: Configure production Firebase credentials
4. **Monitoring**: Setup Firebase Analytics and Performance Monitoring
5. **Backup**: Configure automated database backups

## Troubleshooting

### Common Issues
1. **Service Account Key Not Found**
   - Ensure the key file path is correct in configuration
   - Verify file permissions

2. **Firestore Connection Errors**
   - Check internet connectivity
   - Verify Firebase project settings
   - Ensure service account has proper permissions

3. **Authentication Failures**
   - Verify Firebase project configuration
   - Check token format and expiration
   - Ensure proper claims setup

### Debug Commands
```bash
# Check Firebase configuration
dotnet run --environment=Development

# Test specific endpoints
curl -X GET "http://localhost:5000/api/health/firebase"
curl -X GET "http://localhost:5000/api/firebase/test-firestore"
```