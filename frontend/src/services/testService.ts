import { apiService } from './apiService';
import { Test, Question } from '../types';

export class TestService {
    private static readonly BASE_URL = '/Test';

    static async getAllTests(): Promise<Test[]> {
        const response = await apiService.get<Test[]>(this.BASE_URL);
        return response || [];
    }

    static async getTestById(id: string): Promise<Test | null> {
        const response = await apiService.get<Test>(`${this.BASE_URL}/${id}`);
        return response || null;
    }

    static async getTestsByCourse(courseId: string): Promise<Test[]> {
        const response = await apiService.get<Test[]>(`${this.BASE_URL}/course/${courseId}`);
        return response || [];
    }

    static async createTest(test: Omit<Test, 'id' | 'created_at'>): Promise<Test> {
        const response = await apiService.post<Test>(this.BASE_URL, test);
        return response!;
    }

    static async updateTest(id: string, test: Partial<Test>): Promise<Test> {
        const response = await apiService.put<Test>(`${this.BASE_URL}/${id}`, test);
        return response!;
    }

    static async deleteTest(id: string): Promise<void> {
        await apiService.delete(`${this.BASE_URL}/${id}`);
    }

    static async getTestQuestions(testId: string): Promise<any[]> {
        const response = await apiService.get<any[]>(`${this.BASE_URL}/${testId}/questions`);
        return response || [];
    }

    static async submitTestSession(sessionId: string): Promise<void> {
        await apiService.post(`${this.BASE_URL}/sessions/${sessionId}/submit`, {});
    }

    static async addQuestionToTest(testId: string, question: Omit<Question, 'id'>): Promise<Question> {
        const response = await apiService.post<Question>(`${this.BASE_URL}/${testId}/questions`, question);
        return response!;
    }

    static async removeQuestionFromTest(testId: string, questionId: string): Promise<void> {
        await apiService.delete(`${this.BASE_URL}/${testId}/questions/${questionId}`);
    }
}

export const testService = TestService;
