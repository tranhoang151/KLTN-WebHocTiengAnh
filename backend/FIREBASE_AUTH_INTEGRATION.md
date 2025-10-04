# Firebase Authentication Integration

This document describes the Firebase Authentication integration implemented for the BingGo Web Application.

## Overview

The authentication system uses Firebase Authentication for user management and JWT tokens for API authorization. The integration includes:

- Firebase Authentication service for user sign-in/sign-out
- JWT token verification middleware
- Role-based access control
- Protected API endpoints
- Frontend authentication context

## Backend Components

### 1. Firebase Authentication Service (`FirebaseAuthService.cs`)
- Verifies Firebase ID tokens
- Creates custom tokens with user claims
- Manages user records in Firebase Auth
- Provides claims principal for ASP.NET Core authentication

### 2. Authentication Handler (`FirebaseAuthenticationHandler.cs`)
- Custom authentication handler for ASP.NET Core
- Validates Bearer tokens from Authorization header
- Integrates with Firebase token verification
- Provides user claims for authorization

### 3. Authentication Controller (`AuthController.cs`)
- `/api/auth/verify` - Verifies current token and returns user data
- `/api/auth/refresh-token` - Refreshes user token with updated claims
- `/api/auth/update-login` - Updates user's last login timestamp

## Frontend Components

### 1. Firebase Configuration (`firebase.ts`)
- Initializes Firebase app with project configuration
- Exports Firebase Auth, Firestore, and Storage instances
- Uses environment variables for configuration

### 2. Authentication Service (`authService.ts`)
- Handles sign-in/sign-out operations
- Manages Firebase user state
- Retrieves user data from Firestore
- Provides authentication token for API calls

### 3. Authentication Context (`AuthContext.tsx`)
- React context for authentication state management
- Listens to Firebase auth state changes
- Provides login/logout functions to components
- Manages user data and loading states

### 4. Protected Route Component (`ProtectedRoute.tsx`)
- Wraps components that require authentication
- Supports role-based access control
- Redirects unauthenticated users to login
- Shows loading state during authentication check

### 5. Login Component (`Login.tsx`)
- User-friendly login form
- Firebase authentication integration
- Error handling and validation
- Role-based redirect after login

## Configuration

### Backend Configuration
The backend requires Firebase service account credentials:

```json
{
  "Firebase": {
    "ProjectId": "kltn-c5cf0",
    "ServiceAccountKeyPath": "kltn-c5cf0-firebase-adminsdk-fbsvc-036427bc95.json",
    "StorageBucket": "kltn-c5cf0.appspot.com"
  }
}
```

### Frontend Configuration
The frontend requires Firebase web app configuration in `.env`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=kltn-c5cf0.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=kltn-c5cf0
REACT_APP_FIREBASE_STORAGE_BUCKET=kltn-c5cf0.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Authentication Flow

1. **User Login**:
   - User enters credentials in login form
   - Frontend calls Firebase Authentication
   - Firebase returns ID token
   - Frontend stores token and user data
   - User is redirected to role-appropriate dashboard

2. **API Requests**:
   - Frontend includes Bearer token in Authorization header
   - Backend validates token using Firebase Admin SDK
   - Backend extracts user claims from token
   - API returns data based on user permissions

3. **Token Refresh**:
   - Firebase automatically refreshes tokens
   - Frontend updates stored token
   - Backend validates new tokens seamlessly

4. **User Logout**:
   - Frontend calls Firebase sign out
   - Local storage is cleared
   - User is redirected to login page

## Role-Based Access Control

The system supports four user roles:
- **Student**: Access to learning content and progress
- **Teacher**: Access to class management and student progress
- **Admin**: Full system access and user management
- **Parent**: Access to child's progress (using student credentials)

## Security Features

- JWT token validation on all protected endpoints
- Role-based authorization middleware
- Secure token storage and transmission
- Automatic token refresh
- Session timeout handling
- CORS configuration for cross-origin requests

## Testing

Run the authentication integration test:

```bash
cd backend
./test-auth-integration.ps1
```

This test verifies:
- API accessibility
- Token validation
- Firebase configuration
- Service initialization

## Usage Examples

### Frontend Authentication
```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.full_name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

### Protected API Endpoint
```csharp
[HttpGet("protected")]
[Authorize]
public async Task<IActionResult> GetProtectedData()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
    
    // Return data based on user permissions
    return Ok(new { userId, userRole });
}
```

## Troubleshooting

### Common Issues

1. **Token Validation Fails**:
   - Check Firebase service account key path
   - Verify Firebase project configuration
   - Ensure system clock is synchronized

2. **CORS Errors**:
   - Verify CORS policy includes frontend URL
   - Check that credentials are allowed

3. **User Not Found**:
   - Ensure user exists in both Firebase Auth and Firestore
   - Check user document structure in Firestore

4. **Role Access Denied**:
   - Verify user role in Firestore document
   - Check custom claims in Firebase token
   - Ensure role-based routing is configured correctly

## Next Steps

After implementing Firebase Authentication integration:

1. Test login functionality with real user accounts
2. Implement user registration flow
3. Add password reset functionality
4. Set up role-based dashboard routing
5. Implement user profile management
6. Add multi-factor authentication (optional)