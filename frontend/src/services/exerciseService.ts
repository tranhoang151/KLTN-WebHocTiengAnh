import { apiService } from './api';
import { Exercise, ExerciseSubmissionDto, ExerciseResult, Question } from '../types';
import { triggerAchievementCheck } from '../components/achievement';

export interface ExerciseFilters {
  courseId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'multiple_choice' | 'fill_blank';
  createdBy?: string;
  isActive?: boolean;
}

export interface QuestionSelectionCriteria {
  courseId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'multiple_choice' | 'fill_blank';
  tags?: string[];
  count: number;
  excludeQuestionIds?: string[];
}

class ExerciseService {
  // Existing methods
  async getExercisesByCourse(courseId: string): Promise<Exercise[]> {
    const response = await apiService.get<Exercise[]>(
      `/exercise/course/${courseId}`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch exercises');
    }
    return response.data || [];
  }

  async getExerciseById(exerciseId: string): Promise<Exercise> {
    const response = await apiService.get<Exercise>(`/exercise/${exerciseId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch exercise');
    }
    return response.data!;
  }

  async submitExercise(
    submission: ExerciseSubmissionDto
  ): Promise<ExerciseResult> {
    const response = await apiService.post<ExerciseResult>(
      '/exercise/submit',
      submission
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to submit exercise');
    }

    // Trigger achievement check after successful exercise submission
    triggerAchievementCheck();

    return response.data!;
  }

  // New methods for exercise management
  async getAllExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    const params = new URLSearchParams();

    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.createdBy) params.append('createdBy', filters.createdBy);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/exercise?${queryString}` : '/exercise';

    const response = await apiService.get<Exercise[]>(endpoint);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch exercises');
    }
    return response.data || [];
  }

  async createExercise(exerciseData: Omit<Exercise, 'id'>): Promise<Exercise> {
    const response = await apiService.post<Exercise>('/exercise', exerciseData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create exercise');
    }
    return response.data!;
  }

  async updateExercise(exerciseId: string, exerciseData: Partial<Exercise>): Promise<Exercise> {
    const response = await apiService.put<Exercise>(`/exercise/${exerciseId}`, exerciseData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update exercise');
    }
    return response.data!;
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    const response = await apiService.delete(`/exercise/${exerciseId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete exercise');
    }
  }

  async duplicateExercise(exerciseId: string): Promise<Exercise> {
    const response = await apiService.post<Exercise>(`/exercise/${exerciseId}/duplicate`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to duplicate exercise');
    }
    return response.data!;
  }

  // Question selection for exercise creation
  async getQuestionsForSelection(criteria: QuestionSelectionCriteria): Promise<Question[]> {
    const response = await apiService.post<Question[]>('/exercise/questions/select', criteria);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get questions for selection');
    }
    return response.data || [];
  }

  async autoSelectQuestions(criteria: QuestionSelectionCriteria): Promise<Question[]> {
    const response = await apiService.post<Question[]>('/exercise/questions/auto-select', criteria);
    if (!response.success) {
      throw new Error(response.error || 'Failed to auto-select questions');
    }
    return response.data || [];
  }

  // Exercise preview and validation
  async previewExercise(exerciseData: Omit<Exercise, 'id'>): Promise<{
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  }> {
    const response = await apiService.post('/exercise/preview', exerciseData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to preview exercise');
    }
    const defaultResult = { isValid: false, warnings: [], suggestions: [] };
    return (response.data && Object.keys(response.data).length > 0 ? response.data : defaultResult) as { isValid: boolean; warnings: string[]; suggestions: string[]; };
  }

  // Exercise statistics
  async getExerciseStatistics(exerciseId?: string, courseId?: string): Promise<{
    totalExercises: number;
    byDifficulty: Record<string, number>;
    byType: Record<string, number>;
    averageScore: number;
    completionRate: number;
  }> {
    const params = new URLSearchParams();
    if (exerciseId) params.append('exerciseId', exerciseId);
    if (courseId) params.append('courseId', courseId);

    const queryString = params.toString();
    const endpoint = queryString ? `/exercise/statistics?${queryString}` : '/exercise/statistics';

    const response = await apiService.get(endpoint);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch exercise statistics');
    }
    const defaultStats = {
      totalExercises: 0,
      byDifficulty: {},
      byType: {},
      averageScore: 0,
      completionRate: 0
    };
    return (response.data && Object.keys(response.data).length > 0 ? response.data : defaultStats) as { totalExercises: number; byDifficulty: Record<string, number>; byType: Record<string, number>; averageScore: number; completionRate: number; };
  }
}

export const exerciseService = new ExerciseService();
