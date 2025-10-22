import { apiService } from './api';
import { Question } from '../types';

export interface QuestionFilters {
    courseId?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    type?: 'multiple_choice' | 'fill_blank';
    tags?: string[];
    searchTerm?: string;
}

class QuestionService {
    async getAllQuestions(filters?: QuestionFilters): Promise<Question[]> {
        const params = new URLSearchParams();

        if (filters?.courseId) params.append('courseId', filters.courseId);
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);
        if (filters?.type) params.append('type', filters.type);
        if (filters?.searchTerm) params.append('search', filters.searchTerm);
        // is_active filter removed - all questions are active by default
        if (filters?.tags && filters.tags.length > 0) {
            filters.tags.forEach(tag => params.append('tags', tag));
        }

        const queryString = params.toString();
        const endpoint = queryString ? `/Question?${queryString}` : '/Question';

        const response = await apiService.get<Question[]>(endpoint);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch Questions');
        }
        return response.data || [];
    }

    async getQuestionById(QuestionId: string): Promise<Question | null> {
        const response = await apiService.get<Question>(`/Question/${QuestionId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch Question');
        }
        return response.data || null;
    }

    async getQuestionsByCourse(courseId: string): Promise<Question[]> {
        const response = await apiService.get<Question[]>(`/Question/course/${courseId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch Questions by course');
        }
        return response.data || [];
    }

    async createQuestion(QuestionData: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
        const response = await apiService.post<Question>('/Question', QuestionData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to create Question');
        }
        return response.data!;
    }

    async updateQuestion(QuestionId: string, QuestionData: Partial<Question>): Promise<Question> {
        const response = await apiService.put<Question>(`/Question/${QuestionId}`, QuestionData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to update Question');
        }
        return response.data!;
    }

    async deleteQuestion(QuestionId: string): Promise<void> {
        const response = await apiService.delete(`/Question/${QuestionId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete Question');
        }
    }

    async duplicateQuestion(QuestionId: string): Promise<Question> {
        const response = await apiService.post<Question>(`/Question/${QuestionId}/duplicate`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to duplicate Question');
        }
        return response.data!;
    }

    async bulkUpdateQuestions(QuestionIds: string[], updates: Partial<Question>): Promise<void> {
        const response = await apiService.put('/Question/bulk', {
            QuestionIds,
            updates
        });
        if (!response.success) {
            throw new Error(response.error || 'Failed to bulk update Questions');
        }
    }

    async bulkDeleteQuestions(QuestionIds: string[]): Promise<void> {
        const response = await apiService.post('/Question/bulk-delete', {
            QuestionIds
        });
        if (!response.success) {
            throw new Error(response.error || 'Failed to bulk delete Questions');
        }
    }

    async getAvailableTags(courseId?: string): Promise<string[]> {
        const params = courseId ? `?courseId=${courseId}` : '';
        const response = await apiService.get<string[]>(`/Question/tags${params}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch available tags');
        }
        return response.data || [];
    }

    async getQuestionStatistics(courseId?: string): Promise<{
        total: number;
        byDifficulty: Record<string, number>;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
    }> {
        const params = courseId ? `?courseId=${courseId}` : '';
        const response = await apiService.get(`/Question/statistics${params}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch Question statistics');
        }
        const defaultStats = {
            total: 0,
            byDifficulty: {},
            byType: {},
            byStatus: {}
        };
        return (response.data && Object.keys(response.data).length > 0 ? response.data : defaultStats) as { total: number; byDifficulty: Record<string, number>; byType: Record<string, number>; byStatus: Record<string, number>; };
    }
}

export const questionService = new QuestionService();
