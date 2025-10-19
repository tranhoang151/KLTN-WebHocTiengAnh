import { ApiResponse } from '../types';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:5000/api'; // Backend running on HTTP port 5000

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Fix: Add credentials include for all API requests
        ...options,
      };

      // Add authentication token if available
      const token = await authService.getCurrentUserToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      const response = await fetch(url, config);

      // Handle authentication errors
      if (response.status === 401) {
        // Token might be expired, try to refresh
        const refreshedToken = await authService.getCurrentUserToken();
        if (refreshedToken && refreshedToken !== token) {
          // Retry with refreshed token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${refreshedToken}`,
          };
          const retryResponse = await fetch(url, config);
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return {
              success: true,
              data: retryData,
            };
          }
        }

        // If still unauthorized, return error instead of redirecting
        return {
          success: false,
          error: 'Authentication required. Please login again.',
        };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
