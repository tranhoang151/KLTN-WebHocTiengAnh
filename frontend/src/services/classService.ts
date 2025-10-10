import { apiService } from './api';
import { Class, User } from '../types';

export interface ClassFilters {
  search?: string;
  courseId?: string;
}

class ClassService {
  async getClassesForTeacher(): Promise<Class[]> {
    const response = await apiService.get<Class[]>('/class/teacher');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch classes');
    }
    return response.data || [];
  }

  async getAllClasses(filters?: ClassFilters): Promise<Class[]> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append('search', filters.search);
    }

    if (filters?.courseId) {
      params.append('courseId', filters.courseId);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/class?${queryString}` : '/class';

    const response = await apiService.get<Class[]>(endpoint);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch classes');
    }
    return response.data || [];
  }

  async getClassById(classId: string): Promise<Class | null> {
    const response = await apiService.get<Class>(`/class/${classId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch class');
    }
    return response.data || null;
  }

  async createClass(classData: Omit<Class, 'id' | 'created_at' | 'is_active'>): Promise<Class> {
    const response = await apiService.post<Class>('/class', classData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create class');
    }
    return response.data!;
  }

  async updateClass(classId: string, classData: Partial<Class>): Promise<Class> {
    const response = await apiService.put<Class>(`/class/${classId}`, classData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update class');
    }
    return response.data!;
  }

  async deleteClass(classId: string): Promise<void> {
    const response = await apiService.delete(`/class/${classId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete class');
    }
  }

  async assignTeacherToClass(classId: string, teacherId: string): Promise<void> {
    const response = await apiService.post(`/class/${classId}/assign-teacher/${teacherId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to assign teacher to class');
    }
  }

  async assignStudentsToClass(classId: string, studentIds: string[]): Promise<void> {
    const response = await apiService.post(`/class/${classId}/assign-students`, studentIds);
    if (!response.success) {
      throw new Error(response.error || 'Failed to assign students to class');
    }
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    const response = await apiService.delete(`/class/${classId}/students/${studentId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove student from class');
    }
  }

  async getClassStudents(classId: string): Promise<User[]> {
    const response = await apiService.get<User[]>(`/class/${classId}/students`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch class students');
    }
    return response.data || [];
  }

  async getClassStatistics(classId: string): Promise<any> {
    const response = await apiService.get(`/class/${classId}/statistics`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch class statistics');
    }
    return response.data;
  }

  async getAvailableStudents(): Promise<User[]> {
    const response = await apiService.get<User[]>('/user?role=student');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch available students');
    }
    return response.data || [];
  }

  async getAvailableTeachers(): Promise<User[]> {
    const response = await apiService.get<User[]>('/user?role=teacher');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch available teachers');
    }
    return response.data || [];
  }
}

export const classService = new ClassService();
