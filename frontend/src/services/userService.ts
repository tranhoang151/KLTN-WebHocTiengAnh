import { apiService } from './api';

// --- TYPE DEFINITIONS ---

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  gender: string;
  avatarUrl?: string;
  avatarBase64?: string;
  isActive: boolean;
  createdAt: any; // Firestore Timestamp
  lastLoginDate?: string;
  streakCount?: number;
  classIds?: string[];
  badges: Record<
    string,
    {
      earned: boolean;
      earnedAt?: Date;
    }
  >;
  // Compatibility with existing components
  full_name: string;
  is_active: boolean;
  created_at: any;
  last_login_date: string;
  streak_count: number;
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


const API_URL = '/user';

// --- SERVICE FUNCTIONS ---

export const userService = {
  getAllUsers: async (token: string, filters: UserFilters = {}): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));

    const response = await apiService.get<User[]>(`${API_URL}?${queryParams.toString()}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch users');
    }

    // Map backend fields to frontend fields if they are different
    return (response.data || []).map((user: any) => ({
      ...user,
      id: user.id || user.Id, // Handle both id and Id fields
      fullName: user.fullName || user.full_name,
      full_name: user.fullName || user.full_name,
      isActive: user.isActive ?? user.is_active ?? true,
      is_active: user.isActive ?? user.is_active ?? true,
      createdAt: user.createdAt || user.created_at,
      created_at: user.createdAt || user.created_at,
      lastLoginDate: user.lastLoginDate || user.last_login_date,
      last_login_date: user.lastLoginDate || user.last_login_date,
      streakCount: user.streakCount || user.streak_count || 0,
      streak_count: user.streakCount || user.streak_count || 0,
      classIds: user.classIds || user.class_ids || [],
      class_ids: user.classIds || user.class_ids || [],
      avatarUrl: user.avatarUrl || user.avatar_url,
      avatar_url: user.avatarUrl || user.avatar_url,
      avatarBase64: user.avatarBase64 || user.avatar_base64,
      avatar_base64: user.avatarBase64 || user.avatar_base64,
      role: user.role || 'student',
      email: user.email || '',
      gender: user.gender || '',
      badges: user.badges || {},
    }));
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiService.get<User>(`${API_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user');
    }
    return response.data as User;
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiService.post<User>(API_URL, userData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create user');
    }
    return response.data as User;
  },

  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    const response = await apiService.put<User>(`${API_URL}/${id}`, userData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update user');
    }
    return response.data as User;
  },

  updateUserStatus: async (id: string, data: UpdateUserStatusDto): Promise<void> => {
    const response = await apiService.patch<void>(`${API_URL}/${id}/status`, data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update user status');
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    const response = await apiService.delete<void>(`${API_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user');
    }
  },

  getAvailableRoles: async (): Promise<string[]> => {
    const response = await apiService.get<string[]>(`${API_URL}/roles`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch roles');
    }
    return (response.data as string[]) || [];
  },
};