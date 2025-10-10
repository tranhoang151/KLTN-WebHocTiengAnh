import { apiService } from './apiService';

// --- TYPE DEFINITIONS ---

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  gender?: string;
  avatarUrl?: string;
  avatarBase64?: string;
  isActive: boolean;
  createdAt: any; // Firestore Timestamp
  lastLoginDate?: string;
  streakCount?: number;
  classIds?: string[];
  // Compatibility with existing components
  full_name: string;
  is_active: boolean;
  created_at: any;
  last_login_date?: string;
  streak_count?: number;
  class_ids?: string[];
  avatar_url?: string;
  avatar_base64?: string;
}

export interface UserFilters {
  role?: string;
  search?: string;
  isActive?: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  role: string;
  gender?: string;
  classIds?: string[];
  password?: string; // Password might be needed for creation
  avatarBase64?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: string;
  gender?: string;
  classIds?: string[];
  avatarBase64?: string;
}

export interface UpdateUserStatusDto {
    isActive: boolean;
}


const API_URL = '/api/user';

// --- SERVICE FUNCTIONS ---

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const userService = {
  getAllUsers: async (token: string, filters: UserFilters = {}): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    
    const response = await apiService.get(`${API_URL}?${queryParams.toString()}`, getAuthHeaders(token));
    // Map backend fields to frontend fields if they are different
    return response.map((user: any) => ({
        ...user,
        id: user.id,
        fullName: user.fullName,
        full_name: user.fullName,
        isActive: user.isActive,
        is_active: user.isActive,
        createdAt: user.createdAt,
        created_at: user.createdAt,
        lastLoginDate: user.lastLoginDate,
        last_login_date: user.lastLoginDate,
        streakCount: user.streakCount,
        streak_count: user.streakCount,
        classIds: user.classIds,
        class_ids: user.classIds,
        avatarUrl: user.avatarUrl,
        avatar_url: user.avatarUrl,
        avatarBase64: user.avatarBase64,
        avatar_base64: user.avatarBase64,
    }));
  },

  getUserById: async (id: string, token: string): Promise<User> => {
    return apiService.get(`${API_URL}/${id}`, getAuthHeaders(token));
  },

  createUser: async (userData: CreateUserRequest, token: string): Promise<User> => {
    return apiService.post(API_URL, userData, getAuthHeaders(token));
  },

  updateUser: async (id: string, userData: UpdateUserRequest, token: string): Promise<User> => {
    return apiService.put(`${API_URL}/${id}`, userData, getAuthHeaders(token));
  },

  updateUserStatus: async (id: string, data: UpdateUserStatusDto, token: string): Promise<void> => {
    return apiService.patch(`${API_URL}/${id}/status`, data, getAuthHeaders(token));
  },

  deleteUser: async (id: string, token: string): Promise<void> => {
    return apiService.delete(`${API_URL}/${id}`, getAuthHeaders(token));
  },

  getAvailableRoles: async (token: string): Promise<string[]> => {
    return apiService.get(`${API_URL}/roles`, getAuthHeaders(token));
  },
};
