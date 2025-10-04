# Design Document

## Overview

Thiết kế này mô tả cách chuyển đổi từ Firebase Authentication sang custom authentication system dựa trên Firestore, đảm bảo tương thích với Android app hiện tại và cung cấp trải nghiệm người dùng nhất quán.

## Architecture

### Current Android App Authentication Flow
```
User Input (email/password) 
    ↓
Custom Validation Logic
    ↓
Query Firestore users collection
    ↓
Compare credentials
    ↓
Create local session
    ↓
Navigate to appropriate dashboard
```

### Proposed Web Application Authentication Flow
```
User Input (email/password)
    ↓
Frontend AuthService
    ↓
Backend AuthController
    ↓
Query Firestore users collection
    ↓
Validate credentials + Generate JWT
    ↓
Return JWT to frontend
    ↓
Store JWT in secure storage
    ↓
Navigate to dashboard
```

## Components and Interfaces

### 1. Backend Authentication Components

#### AuthController (Updated)
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Custom login endpoint
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    
    // Validate session endpoint
    [HttpPost("validate")]
    public async Task<IActionResult> ValidateSession([FromBody] string token)
    
    // Refresh token endpoint
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
    
    // Logout endpoint
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
}
```

#### CustomAuthService
```csharp
public class CustomAuthService : ICustomAuthService
{
    private readonly IFirebaseService _firebaseService;
    private readonly IConfiguration _configuration;
    
    public async Task<AuthResult> AuthenticateAsync(string email, string password)
    public async Task<bool> ValidateTokenAsync(string token)
    public async Task<string> GenerateJwtTokenAsync(User user)
    public async Task<User> GetUserByEmailAsync(string email)
    private bool VerifyPassword(string password, string hashedPassword)
}
```

### 2. Frontend Authentication Components

#### Updated AuthService
```typescript
class AuthService {
    // Replace Firebase Auth methods with custom API calls
    async login(email: string, password: string): Promise<AuthResult>
    async logout(): Promise<void>
    async validateSession(): Promise<boolean>
    async refreshToken(): Promise<string>
    async getCurrentUser(): Promise<User | null>
    
    // Helper methods
    private setAuthToken(token: string): void
    private getAuthToken(): string | null
    private clearAuthToken(): void
}
```

#### Updated AuthContext
```typescript
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}
```

### 3. Data Models

#### User Model (Firestore Compatible)
```typescript
interface User {
    id: string;
    user_id: string;
    email: string;
    full_name: string;
    role: 'student' | 'teacher' | 'admin';
    gender: string;
    avatar_url?: string;
    avatar_base64?: string;
    password: string; // Hashed
    class_ids?: string[];
    streak_count?: number;
    last_login_date?: string;
    learning_streak_count?: number;
    last_learning_date?: string;
    learningHistory?: Record<string, boolean>;
}
```

#### Authentication Models
```typescript
interface LoginRequest {
    email: string;
    password: string;
}

interface AuthResult {
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: User;
    error?: string;
}

interface SessionInfo {
    token: string;
    refreshToken: string;
    expiresAt: Date;
    user: User;
}
```

## Data Models

### Firestore Collections Structure
```
users/
├── {userId}/
    ├── id: string
    ├── user_id: string
    ├── email: string
    ├── full_name: string
    ├── role: string
    ├── password: string (hashed)
    ├── avatar_base64?: string
    ├── class_ids?: string[]
    ├── streak_count?: number
    ├── last_login_date?: string
    ├── learning_streak_count?: number
    ├── last_learning_date?: string
    └── learningHistory?: object
```

### JWT Token Structure
```json
{
    "sub": "user_id",
    "email": "user@example.com",
    "role": "student",
    "full_name": "User Name",
    "iat": 1234567890,
    "exp": 1234567890,
    "iss": "binggo-web-app"
}
```

## Error Handling

### Authentication Errors
```typescript
enum AuthErrorType {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    NETWORK_ERROR = 'NETWORK_ERROR',
    SESSION_EXPIRED = 'SESSION_EXPIRED',
    FIRESTORE_ERROR = 'FIRESTORE_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR'
}

interface AuthError {
    type: AuthErrorType;
    message: string;
    details?: any;
}
```

### Error Handling Strategy
1. **Network Errors**: Retry mechanism với exponential backoff
2. **Firestore Errors**: Fallback to cached data nếu có
3. **Invalid Credentials**: Clear error message cho user
4. **Session Expired**: Auto-redirect to login với thông báo

## Testing Strategy

### Unit Tests
1. **AuthService Tests**
   - Test login với valid/invalid credentials
   - Test token validation
   - Test session management
   - Test error handling

2. **AuthController Tests**
   - Test API endpoints
   - Test JWT generation/validation
   - Test Firestore integration
   - Test security measures

### Integration Tests
1. **End-to-End Authentication Flow**
   - Complete login process
   - Session persistence
   - Role-based navigation
   - Logout process

2. **Cross-Platform Compatibility**
   - Verify Android app still works
   - Test concurrent sessions
   - Test data synchronization

### Security Tests
1. **Token Security**
   - JWT signature validation
   - Token expiration handling
   - Refresh token rotation

2. **Password Security**
   - Password hashing verification
   - Brute force protection
   - Input validation

## Migration Strategy

### Phase 1: Backend Implementation
1. Implement CustomAuthService
2. Update AuthController
3. Add JWT middleware
4. Test with existing Firestore data

### Phase 2: Frontend Refactoring
1. Update AuthService to use custom API
2. Modify AuthContext
3. Update ProtectedRoute logic
4. Test authentication flow

### Phase 3: Security Hardening
1. Implement rate limiting
2. Add security headers
3. Enhance password policies
4. Add audit logging

### Phase 4: Testing & Validation
1. Comprehensive testing
2. Android app compatibility check
3. Performance testing
4. Security audit

## Security Considerations

### Password Security
- Use bcrypt hoặc Argon2 cho password hashing
- Implement minimum password requirements
- Add account lockout after failed attempts

### Token Security
- JWT với short expiration time (15-30 minutes)
- Refresh token với longer expiration (7 days)
- Secure token storage (httpOnly cookies hoặc secure localStorage)

### Session Management
- Implement proper session invalidation
- Add concurrent session limits
- Log authentication events

### API Security
- Rate limiting cho login endpoints
- Input validation và sanitization
- CORS configuration
- Security headers (HSTS, CSP, etc.)

## Performance Considerations

### Caching Strategy
- Cache user data sau successful login
- Implement token validation caching
- Use Firestore offline persistence

### Optimization
- Minimize Firestore queries
- Implement connection pooling
- Use CDN cho static assets
- Lazy load user-specific data

## Monitoring and Logging

### Authentication Metrics
- Login success/failure rates
- Session duration statistics
- Popular login times
- Geographic distribution

### Security Monitoring
- Failed login attempts
- Suspicious activity patterns
- Token validation failures
- Account lockouts

### Error Tracking
- Authentication errors
- Firestore connection issues
- JWT validation failures
- Session management problems