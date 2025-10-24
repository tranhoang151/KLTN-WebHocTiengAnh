import { apiService } from './api';

// --- TYPE DEFINITIONS ---

export interface Class {
  id: string;
  name: string;
  description: string;
  capacity: number;
  teacherId?: string;
  studentIds: string[];
  courseId?: string;
  createdAt: string;
  isActive: boolean;
}

export interface ClassWithStudents extends Class {
  students?: any[];
}

export interface CreateClassRequest {
  name: string;
  description: string;
  capacity: number;
  courseId?: string;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
  capacity?: number;
  courseId?: string;
  teacherId?: string;
  studentIds?: string[];
}

export interface AssignStudentsRequest {
  studentIds: string[];
}

// --- SERVICE FUNCTIONS ---

const API_URL = '/class';

export const classService = {
  // Get all classes (admin/teacher)
  getAllClasses: async (search?: string, courseId?: string): Promise<Class[]> => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (courseId) queryParams.append('courseId', courseId);

    const response = await apiService.get<Class[]>(`${API_URL}?${queryParams.toString()}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch classes');
    }
    return response.data || [];
  },

  // Get classes for current teacher
  getTeacherClasses: async (): Promise<Class[]> => {
    const response = await apiService.get<Class[]>(`${API_URL}/teacher`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch teacher classes');
    }
    return response.data || [];
  },

  // Get class by ID
  getClassById: async (classId: string): Promise<Class> => {
    const response = await apiService.get<Class>(`${API_URL}/${classId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch class');
    }
    return response.data as Class;
  },

  // Get students in a class
  getClassStudents: async (classId: string): Promise<any[]> => {
    const response = await apiService.get<any[]>(`${API_URL}/${classId}/students`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch class students');
    }
    return response.data || [];
  },

  // Create new class
  createClass: async (classData: CreateClassRequest): Promise<Class> => {
    const response = await apiService.post<Class>(API_URL, classData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create class');
    }
    return response.data as Class;
  },

  // Update class
  updateClass: async (classId: string, classData: UpdateClassRequest): Promise<Class> => {
    const response = await apiService.put<Class>(`${API_URL}/${classId}`, classData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update class');
    }
    return response.data as Class;
  },

  // Delete class
  deleteClass: async (classId: string): Promise<void> => {
    const response = await apiService.delete<void>(`${API_URL}/${classId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete class');
    }
  },

  // Assign students to class
  assignStudentsToClass: async (classId: string, studentIds: string[]): Promise<void> => {
    const response = await apiService.post<void>(`${API_URL}/${classId}/assign-students`, studentIds);
    if (!response.success) {
      throw new Error(response.error || 'Failed to assign students');
    }
  },

  // Remove student from class
  removeStudentFromClass: async (classId: string, studentId: string): Promise<void> => {
    const response = await apiService.delete<void>(`${API_URL}/${classId}/students/${studentId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove student');
    }
  },

  // Get class statistics
  getClassStatistics: async (classId: string): Promise<any> => {
    const response = await apiService.get<any>(`${API_URL}/${classId}/statistics`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch class statistics');
    }
    return response.data;
  },
};
