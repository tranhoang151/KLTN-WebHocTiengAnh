
import { apiService } from './apiService';

export interface UserProfile {
  fullName: string;
  email: string;
  gender: string;
  avatarUrl?: string;
  avatarBase64?: string;
  dateOfBirth?: string;
  interests?: string[];
  classIds?: string[];
}

export interface UpdateProfileData {
  fullName: string;
  gender: string;
  email: string;
}

export interface ChangePasswordData {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const API_URL = '/profile';

export const profileService = {
  getProfile: (): Promise<UserProfile> => {
    return apiService.get<UserProfile>(API_URL);
  },

  updateProfile: (profileData: UserProfile): Promise<UserProfile> => {
    return apiService.put<UserProfile>(API_URL, profileData);
  },

  uploadAvatar: (avatarData: { avatarBase64: string }): Promise<any> => {
    return apiService.post<any>(`${API_URL}/avatar`, avatarData);
  },

  removeAvatar: (): Promise<any> => {
    return apiService.delete<any>(`${API_URL}/avatar`);
  },

  changePassword: (passwordData: any): Promise<any> => {
    return apiService.post<any>(`${API_URL}/change-password`, passwordData);
  },
};
