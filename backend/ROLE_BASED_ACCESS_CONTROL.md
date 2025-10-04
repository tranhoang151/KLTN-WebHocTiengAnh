# Role-Based Access Control (RBAC) Implementation

This document describes the comprehensive Role-Based Access Control system implemented for the BingGo Web Application.

## Overview

The RBAC system provides fine-grained access control based on user roles, ensuring that users can only access resources and perform actions appropriate to their role within the system.

## User Roles

The system supports four distinct user roles:

### 1. Student
- **Purpose**: End users who consume learning content
- **Dashboard**: `/student`
- **Permissions**:
  - Read and learn from flashcards
  - Submit exercises and tests
  - Watch videos
  - View personal progress and badges
  - Update personal profile

### 2. Teacher
- **Purpose**: Educators who manage classes and monitor student progress
- **Dashboard**: `/teacher`
- **Permissions**:
  - Manage assigned classes
  - View student progress and reports
  - Create and assign content
  - Generate class reports
  - Update personal profile

### 3. Admin
- **Purpose**: System administrators with full access
- **Dashboard**: `/admin`
- **Permissions**:
  - Full system access
  - Manage users, courses, and classes
  - Create and manage all content types
  - Access system reports and analytics
  - System configuration

### 4. Parent
- **Purpose**: Parents monitoring their children's progress
- **Dashboard**: `/parent`
- **Permissions**:
  - View children's progress
  - Access learning reports
  - Update personal profile

## Frontend Implementation

### 1. Role Service (`roleService.ts`)

Central service managing role permissions and access rules:

```typescript
// Check route access
roleService.hasRouteAccess(role, '/student/flashcards')

// Check specific permission
roleService.hasPermission(role, 'flashcards', 'read')

// Get dashboard path
roleService.getDashboardPath(role)
```

### 2. Permission Hooks (`usePermissions.ts`)

React hooks for checking permissions in components:

```typescript
const { hasPermission, hasRouteAccess, isAdmin } = usePermissions();

// In component
if (hasPermission('users', 'create')) {
  return <CreateUserButton />;
}
```

### 3. Protected Routes (`ProtectedRoute.tsx`)

Route protection with multiple authorization levels:

```typescript
// Role-specific protection
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Permission-specific protection
<ProtectedRoute requirePermission={{ resource: 'users', action: 'create' }}>
  <CreateUserForm />
</ProtectedRoute>
```

### 4. Role-Specific Dashboards

Each role has a dedicated dashboard with appropriate functionality:

- **StudentDashboard**: Learning activities and progress
- **TeacherDashboard**: Class management and student monitoring
- **AdminDashboard**: System administration
- **ParentDashboard**: Child progress monitoring

## Backend Implementation

### 1. Role Authorization Middleware (`RoleAuthorizationMiddleware.cs`)

Middleware that enforces API access based on user roles:

```csharp
// Automatic role-based API protection
app.UseRoleAuthorization();
```

**API Access Rules**:
- Students: `/api/flashcards`, `/api/exercises`, `/api/progress`
- Teachers: `/api/classes`, `/api/students`, `/api/assignments`
- Admins: Full API access
- Parents: `/api/children`, `/api/reports`

### 2. Session Management (`SessionService.cs`)

Manages user sessions with role-based context:

```csharp
// Create session with role context
await sessionService.CreateSessionAsync(userId, sessionId);

// Validate session
var isValid = await sessionService.IsSessionValidAsync(userId, sessionId);
```

### 3. Authentication Integration

Role information is embedded in JWT tokens and claims:

```csharp
// Role claim in JWT
claims.Add(new Claim(ClaimTypes.Role, user.Role));

// Class access for teachers/students
claims.Add(new Claim("class_ids", string.Join(",", user.ClassIds)));
```

## Permission Matrix

| Resource | Student | Teacher | Admin | Parent |
|----------|---------|---------|-------|--------|
| Flashcards | Read, Learn | Read, Assign | Full | - |
| Exercises | Read, Submit | Read, Assign | Full | - |
| Tests | Read, Submit | Read, Assign | Full | - |
| Videos | Read, Watch | Read, Assign | Full | - |
| Progress | Read (own) | Read (students) | Read (all) | Read (children) |
| Classes | - | Read, Update | Full | - |
| Users | Read (own) | Read (students) | Full | Read (own) |
| Reports | - | Read, Export | Read, Export | Read (children) |
| System | - | - | Full | - |

## Route Access Control

### Frontend Routes

```typescript
// Role-specific route patterns
const roleRoutes = {
  student: ['/student/*'],
  teacher: ['/teacher/*'],
  admin: ['/admin/*'],
  parent: ['/parent/*']
};
```

### API Endpoints

```csharp
// Automatic protection based on role
"/api/users" -> Admin only
"/api/classes" -> Teacher, Admin
"/api/flashcards" -> Student, Teacher, Admin
"/api/children" -> Parent only
```

## Security Features

### 1. Route Protection
- Automatic redirect to appropriate dashboard
- Unauthorized access blocked with 403 responses
- Role-based navigation menus

### 2. API Security
- Middleware-level authorization
- JWT token validation
- Role claim verification

### 3. Session Management
- Session tracking and validation
- Automatic session cleanup
- Multi-session support per user

### 4. UI Security
- Permission-based component rendering
- Role-specific feature visibility
- Secure navigation guards

## Usage Examples

### Frontend Permission Checking

```typescript
// Component with role-based rendering
const Dashboard = () => {
  const { hasPermission, isAdmin, isTeacher } = usePermissions();
  
  return (
    <div>
      {hasPermission('users', 'create') && (
        <CreateUserButton />
      )}
      
      {isAdmin && (
        <SystemSettings />
      )}
      
      {isTeacher && (
        <ClassManagement />
      )}
    </div>
  );
};
```

### Backend Authorization

```csharp
[HttpGet("sensitive-data")]
[Authorize]
public async Task<IActionResult> GetSensitiveData()
{
    var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
    
    if (userRole != "admin")
    {
        return Forbid("Admin access required");
    }
    
    // Return sensitive data
    return Ok(data);
}
```

### Route Protection

```typescript
// App routing with protection
<Routes>
  <Route path="/admin/*" element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } />
  
  <Route path="/teacher/classes" element={
    <ProtectedRoute 
      requiredRole="teacher"
      requirePermission={{ resource: 'classes', action: 'read' }}
    >
      <ClassList />
    </ProtectedRoute>
  } />
</Routes>
```

## Testing

### Frontend Testing
```bash
# Test role-based routing
npm test -- --testNamePattern="role-based routing"

# Test permission hooks
npm test -- --testNamePattern="usePermissions"
```

### Backend Testing
```bash
# Test role authorization middleware
dotnet test --filter "RoleAuthorizationTests"

# Test session management
dotnet test --filter "SessionServiceTests"
```

### Integration Testing
```powershell
# Run role access control tests
./test-role-access-control.ps1
```

## Configuration

### Role Permissions Configuration

Permissions are defined in `roleService.ts` and can be modified to adjust access levels:

```typescript
const rolePermissions: RolePermissions[] = [
  {
    role: 'student',
    permissions: [
      { resource: 'flashcards', actions: ['read', 'learn'] },
      // ... other permissions
    ]
  }
];
```

### API Access Rules

API access rules are defined in the middleware and can be updated:

```csharp
var rolePermissions = new Dictionary<string, string[]>
{
    ["student"] = new[] { "/api/flashcards", "/api/exercises" },
    // ... other roles
};
```

## Troubleshooting

### Common Issues

1. **Access Denied Errors**
   - Check user role in JWT token
   - Verify permission definitions
   - Ensure middleware is properly configured

2. **Route Redirect Loops**
   - Check default dashboard paths
   - Verify role-based routing logic
   - Ensure authentication state is properly managed

3. **Permission Check Failures**
   - Verify role service configuration
   - Check permission hook implementation
   - Ensure user context is available

### Debug Tools

```typescript
// Debug user permissions
const { getAllPermissions, getAllowedRoutes } = usePermissions();
console.log('User permissions:', getAllPermissions());
console.log('Allowed routes:', getAllowedRoutes());
```

## Future Enhancements

1. **Dynamic Permissions**: Load permissions from database
2. **Hierarchical Roles**: Support role inheritance
3. **Resource-Level Permissions**: Fine-grained resource access
4. **Audit Logging**: Track permission usage and violations
5. **Permission Caching**: Improve performance with caching

## Conclusion

The Role-Based Access Control system provides comprehensive security and access management for the BingGo Web Application. It ensures that users can only access appropriate resources and perform authorized actions based on their assigned roles, maintaining data security and system integrity.