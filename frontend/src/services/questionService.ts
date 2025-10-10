import { apiService } from './api';
import { Question } from '../types';

export interface QuestionFilters {
    courseId?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    type?: 'multiple_choice' | 'fill_blank';
    tags?: string[];
    searchTerm?: string;
    isActive?: boolean;
}

class QuestionService {
    async getAllQuestions(filters?: QuestionFilters): Promise<Question[]> {
        const params = new URLSearchParams();

        if (filters?.courseId) params.append('courseId', filters.courseId);
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);
        if (filters?.type) params.append('type', filters.type);
        if (filters?.searchTerm) params.append('search', filters.searchTerm);
        if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters?.tags && filters.tags.length > 0) {
            filters.tags.forEach(tag => params.append('tags', tag));
        }

        const queryString = params.toString();
        const endpoint = queryString ? `/questions?${queryString}` : '/questions';

        const response = await apiService.get<Question[]>(endpoint);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch questions');
        }
        return response.data || [];
    }

    async getQuestionById(questionId: string): Promise<Question | null> {
        const response = await apiService.get<Question>(`/questions/${questionId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch question');
        }
        return response.data || null;
    }

    async getQuestionsByCourse(courseId: string): Promise<Question[]> {
        const response = await apiService.get<Question[]>(`/questions/course/${courseId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch questions by course');
        }
        return response.data || [];
    }

    async createQuestion(questionData: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
        const response = await apiService.post<Question>('/questions', questionData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to create question');
        }
        return response.data!;
    }

    async updateQuestion(questionId: string, questionData: Partial<Question>): Promise<Question> {
        const response = await apiService.put<Question>(`/questions/${questionId}`, questionData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to update question');
        }
        return response.data!;
    }

    async deleteQuestion(questionId: string): Promise<void> {
        const response = await apiService.delete(`/questions/${questionId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete question');
        }
    }

    async duplicateQuestion(questionId: string): Promise<Question> {
        const response = await apiService.post<Question>(`/questions/${questionId}/duplicate`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to duplicate question');
        }
        return response.data!;
    }

    async bulkUpdateQuestions(questionIds: string[], updates: Partial<Question>): Promise<void> {
        const response = await apiService.put('/questions/bulk', {
            questionIds,
            updates
        });
        if (!response.success) {
            throw new Error(response.error || 'Failed to bulk update questions');
        }
    }

    async bulkDeleteQuestions(questionIds: string[]): Promise<void> {
        const response = await apiService.post('/questions/bulk-delete', {
            questionIds
        });
        if (!response.success) {
            throw new Error(response.error || 'Failed to bulk delete questions');
        }
    }

    async getAvailableTags(courseId?: string): Promise<string[]> {
        const params = courseId ? `?courseId=${courseId}` : '';
        const response = await apiService.get<string[]>(`/questions/tags${params}`);
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
        const response = await apiService.get(`/questions/statistics${params}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch question statistics');
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