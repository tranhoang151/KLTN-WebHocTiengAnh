
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await authService.getCurrentUserToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized errors, e.g., by trying to refresh the token
        console.error('Unauthorized request');
      }
      const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(error.message);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Dashboard statistics endpoint
  async getDashboardStats(): Promise<{
    user: any;
    stats: {
      totalUsers: number;
      totalClasses: number;
      totalTeachers: number;
      totalContent: number;
    };
    recentActivity: any;
  }> {
    return this.get('/dashboard/admin');
  }
}

export const apiService = new ApiService();
