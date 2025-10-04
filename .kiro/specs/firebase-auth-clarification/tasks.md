# Implementation Plan

- [x] 1. Phân tích và document kiến trúc authentication hiện tại








  - Phân tích code Android để hiểu flow authentication thực tế
  - Document cấu trúc Firestore users collection
  - Xác định format password hashing được sử dụng
  - Tạo mapping giữa Android authentication và web requirements
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implement backend custom authentication service



- [x] 2.1 Tạo CustomAuthService class


  - Implement method AuthenticateAsync để validate credentials với Firestore
  - Implement password verification logic tương thích với Android
  - Implement JWT token generation với proper claims
  - Add error handling cho Firestore connection issues
  - _Requirements: 2.1, 2.2, 5.1_

- [x] 2.2 Update AuthController với custom authentication endpoints


  - Implement POST /api/auth/login endpoint
  - Implement POST /api/auth/validate endpoint cho session validation
  - Implement POST /api/auth/refresh endpoint cho token refresh
  - Implement POST /api/auth/logout endpoint
  - Add proper error responses và status codes
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.3_

- [x] 2.3 Implement JWT middleware cho authentication
  - Tạo JWT authentication middleware
  - Configure JWT settings trong appsettings
  - Implement token validation logic
  - Add role-based authorization support
  - _Requirements: 4.1, 4.2, 5.3_

- [ ]* 2.4 Write unit tests cho backend authentication
  - Test CustomAuthService methods
  - Test AuthController endpoints
  - Test JWT middleware functionality
  - Test error handling scenarios
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 3. Refactor frontend authentication system
- [ ] 3.1 Update AuthService để sử dụng custom API
  - Replace Firebase Auth calls với custom API calls
  - Implement login method với email/password validation
  - Implement logout method với proper cleanup
  - Implement session validation method
  - Add token refresh logic
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 5.1_

- [ ] 3.2 Update AuthContext cho custom authentication
  - Modify AuthContext state management
  - Update authentication state logic
  - Implement proper loading states
  - Add error state management
  - _Requirements: 5.2, 7.1, 7.2, 7.3_

- [ ] 3.3 Update ProtectedRoute component
  - Modify route protection logic để sử dụng custom session
  - Implement role-based route protection
  - Add proper redirect logic cho unauthorized access
  - Handle session expiration scenarios
  - _Requirements: 4.2, 5.3, 7.4_

- [ ]* 3.4 Write unit tests cho frontend authentication
  - Test AuthService methods
  - Test AuthContext state management
  - Test ProtectedRoute functionality
  - Test error handling scenarios
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4. Implement secure session management
- [ ] 4.1 Configure secure token storage
  - Implement secure token storage mechanism
  - Add token expiration handling
  - Implement automatic token refresh
  - Add proper cleanup on logout
  - _Requirements: 4.1, 4.2, 4.3, 8.2, 8.3_

- [ ] 4.2 Implement session validation và refresh
  - Add periodic session validation
  - Implement token refresh before expiration
  - Handle refresh token rotation
  - Add session timeout handling
  - _Requirements: 4.1, 4.2, 8.2, 8.3_

- [ ] 5. Ensure data compatibility với Android app
- [ ] 5.1 Verify Firestore data format compatibility
  - Test user data structure compatibility
  - Verify progress tracking format
  - Check badge/achievement data format
  - Validate learning history structure
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ] 5.2 Implement data synchronization logic
  - Ensure profile updates maintain Android compatibility
  - Implement progress updates trong compatible format
  - Add achievement tracking tương thích với Android
  - Verify streak counting logic consistency
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ] 6. Implement comprehensive error handling
- [ ] 6.1 Add network error handling
  - Implement retry logic cho network failures
  - Add offline detection và handling
  - Implement graceful degradation
  - Add user-friendly error messages
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 6.2 Add authentication-specific error handling
  - Handle invalid credentials errors
  - Add session expiration notifications
  - Implement account lockout handling
  - Add Firestore unavailability fallback
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7. Implement security measures
- [ ] 7.1 Add password security enhancements
  - Verify password hashing compatibility với Android
  - Implement secure password validation
  - Add password strength requirements
  - Implement account lockout after failed attempts
  - _Requirements: 8.1, 8.4_

- [ ] 7.2 Implement JWT security best practices
  - Configure proper JWT expiration times
  - Implement secure token generation
  - Add token integrity validation
  - Implement refresh token rotation
  - _Requirements: 8.2, 8.3_

- [ ] 7.3 Add security monitoring và logging
  - Implement authentication event logging
  - Add suspicious activity detection
  - Implement rate limiting cho login endpoints
  - Add security headers middleware
  - _Requirements: 8.4_

- [ ] 8. Testing và validation
- [ ] 8.1 Conduct integration testing
  - Test complete authentication flow
  - Verify cross-platform compatibility
  - Test concurrent sessions between web và Android
  - Validate data synchronization
  - _Requirements: 6.3, 6.4_

- [ ] 8.2 Perform security testing
  - Test JWT token security
  - Verify password hashing security
  - Test rate limiting effectiveness
  - Conduct penetration testing
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 8.3 Write integration tests
  - Test end-to-end authentication workflows
  - Test Android app compatibility
  - Test error scenarios và recovery
  - Test performance under load
  - _Requirements: 5.4, 6.3, 6.4_

- [ ] 9. Documentation và deployment preparation
- [ ] 9.1 Update API documentation
  - Document new authentication endpoints
  - Update authentication flow documentation
  - Add error code documentation
  - Create migration guide từ Firebase Auth
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 9.2 Prepare deployment configuration
  - Update environment configurations
  - Configure JWT settings cho production
  - Set up monitoring và alerting
  - Prepare rollback procedures
  - _Requirements: 8.2, 8.3, 8.4_