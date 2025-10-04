# Authentication System Mapping: Android to Web

## Overview

This document provides a detailed mapping between the current Android authentication implementation and the required web application authentication system.

## Authentication Flow Mapping

### Android Authentication Flow
```
1. User Input (LoginActivity)
   ↓
2. Firestore Query: users.whereEqualTo("email", email)
   ↓
3. Plain Text Password Check: password.equals(user.getPassword())
   ↓
4. Update Login Streak & Last Login Date
   ↓
5. Navigate to Role-Based Dashboard
   ↓
6. Store User Data in Local Variables/Intent Extras
```

### Required Web Authentication Flow
```
1. User Input (Login Component)
   ↓
2. POST /api/auth/login {email, password}
   ↓
3. Backend: Query Firestore users collection
   ↓
4. Backend: Verify Hashed Password
   ↓
5. Backend: Generate JWT Token with User Claims
   ↓
6. Frontend: Store JWT Token Securely
   ↓
7. Frontend: Update AuthContext State
   ↓
8. Frontend: Navigate to Role-Based Dashboard
```

## Data Structure Mapping

### Android User Model
```java
public class User {
    private String user_id;           // Primary identifier
    private String full_name;         // Display name
    private String email;             // Login credential
    private String password;          // PLAIN TEXT (security issue)
    private String role;              // "student", "teacher", "admin"
    private String gender;            // "Male", "Female"
    private String avatar_url;        // Profile image URL
    private String avatar_base64;     // Base64 encoded avatar
    private long streak_count;        // Login streak counter
    private String last_login_date;   // "yyyy-MM-dd" format
    // Additional fields for learning tracking
    private long learning_streak_count;
    private String last_learning_date;
    private Map<String, Boolean> learningHistory;
}
```

### Web User Interface (TypeScript)
```typescript
interface User {
    id: string;                    // Maps to user_id
    user_id: string;              // Same as id for compatibility
    email: string;                // Login credential
    password?: string;            // Should be hashed, not exposed to frontend
    full_name: string;            // Display name
    role: 'student' | 'teacher' | 'admin';  // Role-based access
    gender: string;               // Profile information
    avatar_url?: string;          // Profile image URL
    avatar_base64?: string;       // Base64 encoded avatar
    streak_count?: number;        // Login streak counter
    last_login_date?: string;     // ISO date string
    class_ids?: string[];         // Associated classes
    learning_streak_count?: number;
    last_learning_date?: string;
    learningHistory?: Record<string, boolean>;
}
```

## Authentication Method Mapping

### Android Methods → Web API Endpoints

| Android Method | Web API Endpoint | Purpose |
|----------------|------------------|---------|
| `attemptLogin()` | `POST /api/auth/login` | Authenticate user credentials |
| `navigateToHome()` | Frontend routing | Navigate based on role |
| `updateLastLogin()` | Included in login response | Update login tracking |
| N/A | `POST /api/auth/logout` | Clear session |
| N/A | `POST /api/auth/validate` | Validate JWT token |
| N/A | `POST /api/auth/refresh` | Refresh JWT token |

### Session Management Mapping

| Android Approach | Web Approach | Implementation |
|------------------|--------------|----------------|
| Intent extras | JWT tokens | Secure token storage |
| Local variables | AuthContext state | React context management |
| Activity lifecycle | Token expiration | Automatic refresh/logout |
| Direct Firestore access | API-based access | Centralized backend |

## Role-Based Navigation Mapping

### Android Navigation
```java
if ("student".equalsIgnoreCase(role)) {
    intent = new Intent(LoginActivity.this, StudentHomeActivity.class);
} else if ("teacher".equalsIgnoreCase(role)) {
    intent = new Intent(LoginActivity.this, TeacherDashboardActivity.class);
} else if ("admin".equalsIgnoreCase(role)) {
    intent = new Intent(LoginActivity.this, AdminDashboardActivity.class);
}
```

### Web Navigation (React Router)
```typescript
const navigateByRole = (role: string) => {
    switch (role) {
        case 'student':
            navigate('/student/dashboard');
            break;
        case 'teacher':
            navigate('/teacher/dashboard');
            break;
        case 'admin':
            navigate('/admin/dashboard');
            break;
        default:
            navigate('/student/dashboard');
    }
};
```

## Security Enhancement Mapping

### Current Android Security Issues → Web Solutions

| Android Issue | Security Risk | Web Solution |
|---------------|---------------|--------------|
| Plain text passwords | High | bcrypt/Argon2 hashing |
| No rate limiting | Medium | Express rate limiting |
| No account lockout | Medium | Failed attempt tracking |
| Direct Firestore access | Low | API abstraction layer |
| No session timeout | Low | JWT expiration |

## API Endpoint Specifications

### Login Endpoint
```typescript
POST /api/auth/login
Request: {
    email: string;
    password: string;
}
Response: {
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: User;
    error?: string;
}
```

### Validation Endpoint
```typescript
POST /api/auth/validate
Headers: {
    Authorization: "Bearer <jwt_token>"
}
Response: {
    valid: boolean;
    user?: User;
    error?: string;
}
```

### Logout Endpoint
```typescript
POST /api/auth/logout
Headers: {
    Authorization: "Bearer <jwt_token>"
}
Response: {
    success: boolean;
    message: string;
}
```

## Firestore Query Mapping

### Android Firestore Query
```java
FirebaseFirestore db = FirebaseFirestore.getInstance();
db.collection("users")
  .whereEqualTo("email", email)
  .get()
  .addOnCompleteListener(task -> {
      if (task.isSuccessful() && !task.getResult().isEmpty()) {
          DocumentSnapshot document = task.getResult().getDocuments().get(0);
          User user = document.toObject(User.class);
          // Plain text password check
          if (user != null && password.equals(user.getPassword())) {
              navigateToHome(user);
          }
      }
  });
```

### Web Backend Query (C#)
```csharp
public async Task<AuthResult> AuthenticateAsync(string email, string password)
{
    var query = _firestore.Collection("users").WhereEqualTo("email", email);
    var snapshot = await query.GetSnapshotAsync();
    
    if (snapshot.Documents.Count == 0)
        return new AuthResult { Success = false, Error = "User not found" };
    
    var userDoc = snapshot.Documents.First();
    var user = userDoc.ConvertTo<User>();
    
    // Verify hashed password
    if (!VerifyPassword(password, user.Password))
        return new AuthResult { Success = false, Error = "Invalid password" };
    
    // Generate JWT token
    var token = await GenerateJwtTokenAsync(user);
    
    return new AuthResult 
    { 
        Success = true, 
        Token = token, 
        User = user 
    };
}
```

## Migration Strategy

### Phase 1: Backend Implementation
1. Create `CustomAuthService`
2. Implement password hashing utilities
3. Create JWT token management
4. Add authentication endpoints

### Phase 2: Security Migration
1. Hash existing passwords in Firestore
2. Update Android app to use hashed passwords
3. Test compatibility between platforms

### Phase 3: Frontend Implementation
1. Remove Firebase Auth dependencies
2. Implement custom AuthService
3. Update AuthContext and components
4. Add secure token storage

### Phase 4: Testing & Deployment
1. Cross-platform compatibility testing
2. Security testing and validation
3. Performance testing
4. Coordinated deployment

## Compatibility Considerations

### Data Format Compatibility
- Maintain existing Firestore document structure
- Ensure date formats are consistent ("yyyy-MM-dd")
- Preserve all existing user fields
- Handle optional fields gracefully

### Behavioral Compatibility
- Login streak calculation must match Android logic
- Role-based access must be identical
- User data updates must sync between platforms
- Badge/achievement logic must remain consistent

### Error Handling Compatibility
- Similar error messages for user experience
- Consistent validation rules
- Matching timeout behaviors
- Compatible offline handling (where applicable)

This mapping ensures that the web application authentication system will be fully compatible with the existing Android app while providing enhanced security and proper session management.