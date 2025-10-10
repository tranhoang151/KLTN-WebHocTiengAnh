import { apiService } from './api';
import { ApiResponse } from '../types';

export interface AnalyticsSummaryDto {
  totalUsers: number;
  totalCourses: number;
  totalClasses: number;
  totalVideos: number;
  totalExercises: number;
  totalFlashcardSets: number;
  averageExerciseScore: number;
  activityCountsByType: Record<string, number>;
}

class AnalyticsService {
  async getAnalyticsSummary(): Promise<ApiResponse<AnalyticsSummaryDto>> {
    try {
      const response =
        await apiService.get<AnalyticsSummaryDto>('/analytics/summary');
      return response;
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      return { success: false, error: 'Failed to fetch analytics summary.' };
    }
  }
}

export const analyticsService = new AnalyticsService();
