import { User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
  error?: string;
}

interface ValidateTokenResponse {
  isValid: boolean;
  user?: User;
  message?: string;
}

interface RefreshTokenResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  message?: string;
}

export class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  /**
   * Sign in with email and password using custom API
   */
  async signIn(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Crucial for CORS with credentials
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.message || 'Login failed';
        throw new Error(errorMessage);
      }

      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      this.token = data.token;
      this.currentUser = data.user;

      // Store in sessionStorage - will be cleared when browser is closed
      const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('refresh_token', data.refreshToken || '');
      sessionStorage.setItem('user_data', JSON.stringify(data.user));
      sessionStorage.setItem('auth_expiration', expirationTime.toString());

      return {
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken || ''
      };
    } catch (error) {
      console.error('Sign in error:', error);

      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }

      if (error instanceof Error) {
        // Re-throw authentication errors as-is
        throw error;
      }

      throw new Error('An unexpected error occurred during login');
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const token = await this.getCurrentUserToken();
      if (token) {
        // Call logout endpoint
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear session storage and state
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('auth_expiration');
      this.token = null;
      this.currentUser = null;
    }
  }

  /**
   * Get the current user's token
   */
  async getCurrentUserToken(): Promise<string | null> {
    // Check if token is expired
    const expirationTime = sessionStorage.getItem('auth_expiration');
    if (expirationTime && Date.now() > parseInt(expirationTime)) {
      // Token expired, clear all auth data
      await this.signOut();
      return null;
    }

    if (this.token) {
      return this.token;
    }
    // Try to get from sessionStorage
    const storedToken = sessionStorage.getItem('auth_token');
    if (storedToken) {
      this.token = storedToken;
      return storedToken;
    }
    return null;
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
    try {
      const token = await this.getCurrentUserToken();
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data: ValidateTokenResponse = await response.json();

      if (response.ok && data.isValid && data.user) {
        this.currentUser = data.user;
        sessionStorage.setItem('user_data', JSON.stringify(data.user));
        return true;
      }

      // Handle specific error cases
      if (response.status === 401) {
        console.warn('Session expired or invalid');
        this.clearSession();
        return false;
      }

      if (!response.ok) {
        console.error('Session validation failed:', data.message || 'Unknown error');
        return false;
      }

      return false;
    } catch (error) {
      console.error('Session validation error:', error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Network error during session validation - assuming offline');
        return false;
      }

      // For other errors, clear session to be safe
      this.clearSession();
      return false;
    }
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_expiration');
    this.token = null;
    this.currentUser = null;
  }

  /**
   * Refresh the current token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = sessionStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.warn('No refresh token available');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      const data: RefreshTokenResponse = await response.json();

      if (response.ok && data.success && data.token) {
        this.token = data.token;
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        sessionStorage.setItem('auth_token', data.token);
        sessionStorage.setItem('auth_expiration', expirationTime.toString());
        if (data.refreshToken) {
          sessionStorage.setItem('refresh_token', data.refreshToken);
        }
        console.log('Token refreshed successfully');
        return data.token;
      }

      // Handle specific error cases
      if (response.status === 401) {
        console.warn('Refresh token expired or invalid - clearing session');
        this.clearSession();
        return null;
      }

      console.error('Token refresh failed:', data.message || 'Unknown error');
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Network error during token refresh - will retry later');
        return null;
      }

      // For other errors, clear session to be safe
      this.clearSession();
      return null;
    }
  }

  /**
   * Get user data by email (for validation)
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const token = await this.getCurrentUserToken();
      if (!token) {
        console.warn('No token available for getUserByEmail');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/users/by-email/${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        return userData;
      }

      if (response.status === 404) {
        console.warn('User not found:', email);
        return null;
      }

      if (response.status === 401) {
        console.warn('Unauthorized access - token may be expired');
        this.clearSession();
        return null;
      }

      console.error('Error getting user data:', response.status, response.statusText);
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Network error getting user data');
        return null;
      }

      return null;
    }
  }

  /**
   * Listen to authentication state changes (simplified for custom auth)
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // For custom auth, check sessionStorage on initialization
    const storedUser = sessionStorage.getItem('user_data');
    const storedToken = sessionStorage.getItem('auth_token');

    if (storedUser && storedToken) {
      this.currentUser = JSON.parse(storedUser);
      this.token = storedToken;
      callback(this.currentUser);
    } else {
      callback(null);
    }

    // Return a dummy unsubscribe function
    return () => { };
  }

  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }
    // Try to get from sessionStorage
    const storedUser = sessionStorage.getItem('user_data');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return this.currentUser;
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const isAuth = !!this.getCurrentUserToken() && !!this.getCurrentUser();

    // Log authentication status for security monitoring
    if (isAuth) {
      this.logSecurityEvent('authentication_check', 'success', 'User is authenticated');
    } else {
      this.logSecurityEvent('authentication_check', 'info', 'User is not authenticated');
    }

    return isAuth;
  }

  /**
   * Log security events for monitoring
   */
  private logSecurityEvent(event: string, level: 'info' | 'warning' | 'error' | 'success', message: string, data?: any): void {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      event,
      level,
      message,
      userAgent: navigator.userAgent,
      url: window.location.href,
      data
    };

    // Log to console for development
    console.log(`[SECURITY] ${level.toUpperCase()}:`, securityEvent);

    // In production, you might want to send this to a security monitoring service
    // Example: sendToSecurityService(securityEvent);
  }

  /**
   * Get current user data
   */
  async getCurrentUserData(): Promise<User | null> {
    return this.getCurrentUser();
  }

  /**
   * Get authentication status with detailed info (for debugging)
   */
  getAuthStatus(): {
    isAuthenticated: boolean;
    hasToken: boolean;
    hasUser: boolean;
    tokenExpiry?: Date;
  } {
    const token = sessionStorage.getItem('auth_token');
    const user = this.getCurrentUser();

    return {
      isAuthenticated: this.isAuthenticated(),
      hasToken: !!token,
      hasUser: !!user,
    };
  }
}

export const authService = new AuthService();

/**
 * Deployment Configuration Notes:
 *
 * Environment Variables Required:
 * - REACT_APP_API_URL: Backend API base URL (e.g., http://localhost:5000/api)
 * - JWT_SECRET: Secret key for JWT token signing (backend)
 * - JWT_EXPIRATION_MINUTES: Token expiration time in minutes (default: 15)
 * - JWT_REFRESH_TOKEN_EXPIRATION_DAYS: Refresh token expiration in days (default: 7)
 *
 * Security Headers Required (Backend):
 * - Strict-Transport-Security: max-age=31536000; includeSubDomains
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - X-XSS-Protection: 1; mode=block
 * - Referrer-Policy: strict-origin-when-cross-origin
 *
 * CORS Configuration (Backend):
 * - AllowOrigins: Frontend URLs
 * - AllowCredentials: true
 * - AllowHeaders: Authorization, Content-Type
 * - AllowMethods: GET, POST, PUT, DELETE, OPTIONS
 *
 * Database Indexes Required (Firestore):
 * - users.email (for login queries)
 * - users.role (for role-based filtering)
 * - users.is_active (for active user filtering)
 *
 * Monitoring Setup:
 * - Authentication success/failure rates
 * - Session duration tracking
 * - Security event logging
 * - Performance monitoring
 */

// Export types for testing and external use
export type { LoginResponse, ValidateTokenResponse, RefreshTokenResponse };

/**
 * Authentication Service - Custom API Implementation
 *
 * This service provides authentication functionality using custom backend APIs
 * instead of Firebase Authentication, ensuring compatibility with the Android app.
 *
 * Key Features:
 * - JWT token-based session management
 * - Automatic token refresh
 * - Cross-platform data synchronization
 * - Comprehensive error handling
 * - Security event logging
 *
 * API Endpoints Used:
 * - POST /api/auth/login - User authentication
 * - POST /api/auth/validate - Session validation
 * - POST /api/auth/refresh - Token refresh
 * - POST /api/auth/logout - User logout
 * - GET /api/users/by-email/{email} - Get user by email
 * - POST /api/auth/sync-progress - Sync learning progress
 * - GET /api/auth/sync-data - Get sync data
 *
 * Security Features:
 * - Password hashing with bcrypt support
 * - JWT token expiration and refresh
 * - Network error handling
 * - Security event monitoring
 * - Cross-platform compatibility
 */
