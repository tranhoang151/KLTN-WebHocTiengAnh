# Test User CRUD Operations

## Test Cases for User Management

### 1. Create User (New User)
**Test Data:**
- Full Name: "Test User"
- Email: "test@example.com"
- Password: "password123"
- Role: "student"
- Gender: "male"
- Avatar: Upload a test image

**Expected Result:**
- User should be created successfully
- Password should be hashed and stored
- Avatar should be converted to base64 and stored
- User should appear in the users list

### 2. Update User (Edit Existing User)
**Test Data:**
- Full Name: "Updated Test User"
- Email: "updated@example.com"
- Password: "newpassword123" (optional)
- Role: "teacher"
- Gender: "female"
- Avatar: Upload a new test image

**Expected Result:**
- User should be updated successfully
- If password is provided, it should be updated
- If avatar is provided, it should be updated
- Changes should be reflected in the users list

### 3. Update User (Without Password/Avatar)
**Test Data:**
- Full Name: "Name Only Update"
- Email: "nameonly@example.com"
- Password: (leave blank)
- Role: "student"
- Gender: "other"
- Avatar: (leave unchanged)

**Expected Result:**
- User should be updated successfully
- Password should remain unchanged
- Avatar should remain unchanged
- Only provided fields should be updated

### 4. Validation Tests
**Test Cases:**
- Create user without password (should fail)
- Create user with invalid email (should fail)
- Create user with password less than 6 characters (should fail)
- Create user with duplicate email (should fail)

**Expected Result:**
- Appropriate error messages should be displayed
- Form should not submit with invalid data

### 5. Avatar Upload Tests
**Test Cases:**
- Upload valid image file (JPG, PNG, GIF)
- Upload file larger than 5MB (should fail)
- Remove avatar
- Upload invalid file type (should fail)

**Expected Result:**
- Valid images should be uploaded and converted to base64
- Large files should be rejected with error message
- Avatar removal should work correctly
- Invalid file types should be rejected

## Manual Testing Steps

1. **Start the application:**
   ```bash
   # Backend
   cd backend && dotnet run
   
   # Frontend
   cd frontend && npm start
   ```

2. **Login as Admin:**
   - Navigate to login page
   - Use admin credentials
   - Verify admin dashboard loads

3. **Navigate to User Management:**
   - Click on "User Management" in admin menu
   - Verify users list loads

4. **Test Create User:**
   - Click "Add New User" button
   - Fill in all required fields including password
   - Upload an avatar image
   - Click "Create User"
   - Verify user appears in list

5. **Test Edit User:**
   - Click edit button on a user
   - Modify some fields
   - Upload new avatar
   - Click "Update User"
   - Verify changes are reflected

6. **Test Validation:**
   - Try creating user without password
   - Try creating user with invalid email
   - Verify error messages appear

7. **Test Avatar Upload:**
   - Try uploading large file
   - Try uploading invalid file type
   - Try removing avatar
   - Verify appropriate responses

## Expected Backend API Calls

### Create User
```
POST /api/User
Content-Type: application/json
Authorization: Bearer <token>

{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "student",
  "gender": "male",
  "avatarBase64": "data:image/jpeg;base64,...",
  "classIds": []
}
```

### Update User
```
PUT /api/User/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "fullName": "Updated Test User",
  "email": "updated@example.com",
  "password": "newpassword123",
  "role": "teacher",
  "gender": "female",
  "avatarBase64": "data:image/jpeg;base64,...",
  "classIds": []
}
```

## Success Criteria

✅ **All test cases pass**
✅ **No console errors**
✅ **Proper validation messages**
✅ **Avatar upload/removal works**
✅ **Password field is required for new users**
✅ **Password field is optional for updates**
✅ **Data persists correctly in database**
✅ **UI updates reflect changes immediately**
