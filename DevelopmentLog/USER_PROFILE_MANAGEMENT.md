# User Profile Management System

This document describes the comprehensive User Profile Management system implemented for the BingGo Web Application.

## Overview

The User Profile Management system allows users to view and update their personal information, upload avatars, and change passwords. The system provides a secure, user-friendly interface for managing account settings while maintaining data integrity and security.

## Features

### 1. Profile Display and Updates
- View complete user profile information
- Update personal details (name, gender)
- Real-time form validation
- Success/error message handling

### 2. Avatar Management
- Upload profile pictures with base64 encoding
- Automatic image resizing (300x300 pixels)
- Image format validation (JPG, PNG, GIF)
- File size validation (max 5MB)
- Avatar preview and removal

### 3. Password Management
- Secure password change functionality
- Current password verification
- Password strength indicator
- Comprehensive validation rules
- Firebase Authentication integration

### 4. Security Features
- Authentication required for all operations
- Input validation and sanitization
- Secure API endpoints
- Error handling and logging

## Backend Implementation

### 1. Profile Controller (`ProfileController.cs`)

Main controller handling all profile-related operations:

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
```

**Endpoints:**
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile information
- `POST /api/profile/avatar` - Upload avatar
- `POST /api/profile/change-password` - Change password
- `DELETE /api/profile/avatar` - Remove avatar

### 2. Data Transfer Objects (`DTOs.cs`)

Profile-specific DTOs for data transfer:

```csharp
public class UserProfileDto
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
    public string Gender { get; set; }
    public string? AvatarUrl { get; set; }
    public string? AvatarBase64 { get; set; }
    // ... other properties
}

public class UpdateProfileDto
{
    public string FullName { get; set; }
    public string Gender { get; set; }
    public string? AvatarBase64 { get; set; }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmPassword { get; set; }
}
```

### 3. Profile Operations

#### Get Profile
```csharp
[HttpGet]
public async Task<IActionResult> GetProfile()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var user = await _firebaseService.GetUserByIdAsync(userId);
    
    var profileDto = new UserProfileDto
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        // ... map other properties
    };
    
    return Ok(profileDto);
}
```

#### Update Profile
```csharp
[HttpPut]
public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
{
    // Validate input
    if (string.IsNullOrWhiteSpace(updateDto.FullName))
    {
        return BadRequest(new { message = "Full name is required" });
    }
    
    // Handle avatar upload if provided
    if (!string.IsNullOrEmpty(updateDto.AvatarBase64))
    {
        // Validate and process base64 image
        var base64Data = updateDto.AvatarBase64.Split(',')[1];
        var imageBytes = Convert.FromBase64String(base64Data);
        
        // Validate image size (max 5MB)
        if (imageBytes.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "Avatar image must be less than 5MB" });
        }
    }
    
    // Update user in database
    var updatedUser = await _firebaseService.UpdateUserAsync(userId, user);
    return Ok(new { message = "Profile updated successfully", profile = profileDto });
}
```

#### Change Password
```csharp
[HttpPost("change-password")]
public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto passwordDto)
{
    // Validate input
    if (passwordDto.NewPassword != passwordDto.ConfirmPassword)
    {
        return BadRequest(new { message = "New password and confirmation do not match" });
    }
    
    if (passwordDto.NewPassword.Length < 6)
    {
        return BadRequest(new { message = "New password must be at least 6 characters long" });
    }
    
    // Update password in Firebase Auth
    var updateArgs = new UserRecordArgs
    {
        Uid = userId,
        Password = passwordDto.NewPassword
    };
    
    await _firebaseAuthService.UpdateUserAsync(userId, updateArgs);
    return Ok(new { message = "Password changed successfully" });
}
```

## Frontend Implementation

### 1. Profile Service (`profileService.ts`)

Service handling all profile-related API calls:

```typescript
export class ProfileService {
    async getProfile(): Promise<User | null>
    async updateProfile(profileData: UpdateProfileData): Promise<Result>
    async uploadAvatar(avatarData: AvatarUploadData): Promise<Result>
    async changePassword(passwordData: ChangePasswordData): Promise<Result>
    async removeAvatar(): Promise<Result>
    
    // Utility methods
    fileToBase64(file: File): Promise<string>
    validateImageFile(file: File): ValidationResult
    resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string>
}
```

### 2. Profile Component (`Profile.tsx`)

Main profile management interface:

```typescript
export const Profile: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [formData, setFormData] = useState({
        fullName: '',
        gender: '',
    });
    
    const handleSubmit = async (e: React.FormEvent) => {
        const result = await profileService.updateProfile(updateData);
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
        }
    };
    
    return (
        <div className="profile-container">
            {/* Tabbed interface */}
            {/* Profile form */}
            {/* Password change form */}
        </div>
    );
};
```

### 3. Avatar Upload Component (`AvatarUpload.tsx`)

Specialized component for avatar management:

```typescript
export const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
    currentAvatar, 
    onAvatarChange 
}) => {
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Validate file
        const validation = profileService.validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }
        
        // Resize and upload
        const resizedBase64 = await profileService.resizeImage(file, 300, 300);
        const result = await profileService.uploadAvatar({
            avatarBase64: resizedBase64,
            fileName: file.name
        });
        
        if (result.success) {
            setPreview(result.avatarBase64);
        }
    };
    
    return (
        <div className="avatar-upload">
            {/* Avatar display */}
            {/* Upload/Remove buttons */}
            {/* File input */}
        </div>
    );
};
```

### 4. Change Password Component (`ChangePassword.tsx`)

Secure password change interface:

```typescript
export const ChangePassword: React.FC<ChangePasswordProps> = ({ onMessage }) => {
    const [formData, setFormData] = useState<ChangePasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const validateForm = (): boolean => {
        const newErrors: Partial<ChangePasswordData> = {};
        
        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'New password must be at least 6 characters long';
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const getPasswordStrength = (password: string) => {
        // Calculate password strength
        let strength = 0;
        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return { strength, label: strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong' };
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {/* Password fields with validation */}
            {/* Password strength indicator */}
            {/* Requirements checklist */}
        </form>
    );
};
```

## User Interface Features

### 1. Profile Information Tab
- **User Header**: Avatar, name, email, role badge
- **Editable Fields**: Full name, gender
- **Read-only Fields**: Email, role
- **Learning Statistics**: Streak count, badges earned, classes enrolled
- **Form Validation**: Real-time validation with error messages

### 2. Password Change Tab
- **Current Password**: Secure input with visibility toggle
- **New Password**: With strength indicator
- **Confirm Password**: Matching validation
- **Requirements Checklist**: Visual feedback for password requirements
- **Security Features**: Password visibility toggles, strength meter

### 3. Avatar Management
- **Current Avatar Display**: 24x24 rounded avatar
- **Upload Interface**: Drag-and-drop or click to upload
- **Image Processing**: Automatic resizing to 300x300 pixels
- **Validation**: File type and size validation
- **Preview**: Real-time preview before upload
- **Remove Option**: Ability to remove current avatar

## Security Considerations

### 1. Authentication & Authorization
- All endpoints require valid JWT token
- User can only access their own profile
- Role-based access control maintained

### 2. Input Validation
- Server-side validation for all inputs
- Client-side validation for user experience
- Sanitization of user inputs
- File type and size validation for avatars

### 3. Password Security
- Minimum password requirements enforced
- Password strength validation
- Current password verification required
- Firebase Authentication integration for secure storage

### 4. Data Protection
- Sensitive data not logged
- Secure error messages (no information leakage)
- HTTPS enforcement for all communications
- Base64 encoding for avatar storage

## Image Processing

### 1. Avatar Upload Process
```typescript
// 1. File selection and validation
const validation = profileService.validateImageFile(file);

// 2. Image resizing
const resizedBase64 = await profileService.resizeImage(file, 300, 300);

// 3. Upload to server
const result = await profileService.uploadAvatar({
    avatarBase64: resizedBase64,
    fileName: file.name
});
```

### 2. Image Validation Rules
- **Supported Formats**: JPG, PNG, GIF
- **Maximum Size**: 5MB
- **Automatic Resizing**: 300x300 pixels
- **Quality**: JPEG compression at 80% quality

### 3. Storage Strategy
- **Base64 Encoding**: Images stored as base64 strings in Firestore
- **Future Enhancement**: Can be upgraded to Firebase Storage for better performance
- **Fallback**: Support for both base64 and URL-based avatars

## API Endpoints

### Profile Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/profile` | Get user profile | Required |
| PUT | `/api/profile` | Update profile | Required |
| POST | `/api/profile/avatar` | Upload avatar | Required |
| DELETE | `/api/profile/avatar` | Remove avatar | Required |
| POST | `/api/profile/change-password` | Change password | Required |

### Request/Response Examples

#### Get Profile
```http
GET /api/profile
Authorization: Bearer <jwt_token>

Response:
{
  "id": "user123",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "gender": "male",
  "avatarBase64": "data:image/jpeg;base64,...",
  "streakCount": 5,
  "badges": {...}
}
```

#### Update Profile
```http
PUT /api/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "gender": "male",
  "avatarBase64": "data:image/jpeg;base64,..."
}

Response:
{
  "message": "Profile updated successfully",
  "profile": {...}
}
```

#### Change Password
```http
POST /api/profile/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}

Response:
{
  "message": "Password changed successfully"
}
```

## Testing

### Backend Testing
```powershell
# Run profile management tests
./test-profile-management.ps1
```

### Frontend Testing
```typescript
// Component testing
describe('Profile Component', () => {
  test('should display user information', () => {
    render(<Profile />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  test('should update profile on form submission', async () => {
    const mockUpdate = jest.fn();
    render(<Profile />);
    
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Jane Doe' }
    });
    
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
```

## Error Handling

### Common Error Scenarios

1. **Authentication Errors**
   - Invalid or expired token
   - User not found
   - Insufficient permissions

2. **Validation Errors**
   - Empty required fields
   - Invalid email format
   - Password too short
   - Image file too large

3. **Server Errors**
   - Database connection issues
   - Firebase service errors
   - Network timeouts

### Error Response Format
```json
{
  "message": "User-friendly error message",
  "details": "Technical details (development only)"
}
```

## Future Enhancements

1. **Enhanced Avatar Management**
   - Firebase Storage integration
   - Multiple avatar sizes
   - Avatar cropping interface
   - Social media avatar import

2. **Advanced Profile Features**
   - Profile completion percentage
   - Privacy settings
   - Account deletion
   - Data export functionality

3. **Security Enhancements**
   - Two-factor authentication
   - Login history
   - Device management
   - Security notifications

4. **User Experience Improvements**
   - Real-time profile sync
   - Offline profile editing
   - Profile themes
   - Accessibility enhancements

## Conclusion

The User Profile Management system provides a comprehensive, secure, and user-friendly interface for managing user accounts in the BingGo Web Application. It includes all essential features for profile management while maintaining high security standards and providing an excellent user experience.