import { apiService } from './apiService';

const API_URL = '/api/Profile';

// ============================================================================
// Type Definitions
// ============================================================================

export interface UserBadge {
  earned: boolean;
  earnedAt?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  gender?: string;
  avatarUrl?: string;
  avatarBase64?: string;
  streakCount: number;
  lastLoginDate?: string;
  classIds: string[];
  badges: Record<string, UserBadge>;
  isActive: boolean;
}

export interface UpdateProfileData {
  fullName: string;
  gender?: string;
  avatarBase64?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AvatarUploadData {
    avatarBase64: string;
}

// ============================================================================
// Service Functions
// ============================================================================

const createAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
});

/**
 * Fetches the current user's profile.
 * @param token - The authentication token.
 * @returns The user profile data.
 */
const getProfile = async (token: string): Promise<UserProfile> => {
  return apiService.get(API_URL, {
    headers: createAuthHeaders(token),
  });
};

/**
 * Updates the user's profile.
 * @param data - The data to update.
 * @param token - The authentication token.
 * @returns A success message and the updated profile.
 */
const updateProfile = async (data: UpdateProfileData, token: string) => {
  return apiService.put(API_URL, data, {
    headers: createAuthHeaders(token),
  });
};

/**
 * Changes the user's password.
 * @param data - The password change data.
 * @param token - The authentication token.
 * @returns A success message.
 */
const changePassword = async (data: ChangePasswordData, token: string) => {
  return apiService.post(`${API_URL}/change-password`, data, {
    headers: createAuthHeaders(token),
  });
};

/**
 * Uploads a new avatar for the user.
 * @param data - The avatar data.
 * @param token - The authentication token.
 * @returns A success message and the new avatar URL/base64.
 */
const uploadAvatar = async (data: AvatarUploadData, token: string) => {
    return apiService.post(`${API_URL}/avatar`, data, {
      headers: createAuthHeaders(token),
    });
  };
  
  /**
   * Removes the user's current avatar.
   * @param token - The authentication token.
   * @returns A success message.
   */
  const removeAvatar = async (token: string) => {
    return apiService.delete(`${API_URL}/avatar`, {
      headers: createAuthHeaders(token),
    });
  };

// ============================================================================
// Export Service
// ============================================================================

export const profileService = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
};