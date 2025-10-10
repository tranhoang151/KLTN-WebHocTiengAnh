import { apiService } from './api';
import { ApiResponse, LearningActivity } from '../types';

// Define the types for the dashboard data
export interface PerformanceDataPoint {
  date: string; // or Date
  score: number;
}

export interface StudentDashboardDto {
  streakCount: number;
  totalStudyTimeHours: number;
  completedFlashcardSets: number;
  completedExercises: number;
  recentActivities: LearningActivity[];
  exercisePerformance: PerformanceDataPoint[];
}

export interface TeacherClassSummaryDto {
  classId: string;
  className: string;
  studentCount: number;
  averageCompletionRate: number;
}

export interface StudentProgressSummaryDto {
  studentId: string;
  studentName: string;
  overallScore: number;
  completedActivities: number;
  totalStudyTimeHours: number;
}

export interface ClassProgressDto {
  classId: string;
  className: string;
  students: StudentProgressSummaryDto[];
}

class ProgressService {
  async getStudentDashboardData(
    userId: string
  ): Promise<ApiResponse<StudentDashboardDto>> {
    try {
      const response = await apiService.get<StudentDashboardDto>(
        `/progress/dashboard/${userId}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
      return { success: false, error: 'Failed to fetch dashboard data.' };
    }
  }

  async getTeacherClassSummaries(
    teacherId: string
  ): Promise<ApiResponse<TeacherClassSummaryDto[]>> {
    try {
      const response = await apiService.get<TeacherClassSummaryDto[]>(
        `/progress/teacher/${teacherId}/classes`
      );
      return response;
    } catch (error) {
      console.error('Error fetching teacher class summaries:', error);
      return { success: false, error: 'Failed to fetch class summaries.' };
    }
  }

  async getClassProgress(
    classId: string
  ): Promise<ApiResponse<ClassProgressDto>> {
    try {
      const response = await apiService.get<ClassProgressDto>(
        `/progress/class/${classId}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching class progress:', error);
      return { success: false, error: 'Failed to fetch class progress.' };
    }
  }

  async getChildrenProgressSummaries(
    parentId: string
  ): Promise<ApiResponse<StudentProgressSummaryDto[]>> {
    try {
      const response = await apiService.get<StudentProgressSummaryDto[]>(
        `/progress/parent/${parentId}/children-summaries`
      );
      return response;
    } catch (error) {
      console.error('Error fetching children progress summaries:', error);
      return {
        success: false,
        error: 'Failed to fetch children progress summaries.',
      };
    }
  }

  async getDetailedChildProgress(
    childId: string
  ): Promise<ApiResponse<StudentDashboardDto>> {
    try {
      const response = await apiService.get<StudentDashboardDto>(
        `/progress/dashboard/${childId}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching detailed child progress:', error);
      return {
        success: false,
        error: 'Failed to fetch detailed child progress.',
      };
    }
  }
}

export const progressService = new ProgressService();
