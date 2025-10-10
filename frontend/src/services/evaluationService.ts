import { apiService } from './api';
import {
    Evaluation,
    CreateEvaluationDto,
    UpdateEvaluationDto,
    EvaluationSummaryDto,
    EvaluationAnalyticsDto,
    ApiResponse
} from '../types';

export class EvaluationService {
    private static readonly BASE_URL = '/api/evaluations';

    /**
     * Get all evaluations for a teacher
     */
    static async getEvaluationsByTeacher(teacherId: string): Promise<Evaluation[]> {
        try {
            const response = await apiService.get<ApiResponse<Evaluation[]>>(
                `${this.BASE_URL}/teacher/${teacherId}`
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching evaluations by teacher:', error);
            throw error;
        }
    }

    /**
     * Get all evaluations for a student
     */
    static async getEvaluationsByStudent(studentId: string): Promise<Evaluation[]> {
        try {
            const response = await apiService.get<ApiResponse<Evaluation[]>>(
                `${this.BASE_URL}/student/${studentId}`
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching evaluations by student:', error);
            throw error;
        }
    }

    /**
     * Get evaluations for a specific class
     */
    static async getEvaluationsByClass(classId: string): Promise<Evaluation[]> {
        try {
            const response = await apiService.get<ApiResponse<Evaluation[]>>(
                `${this.BASE_URL}/class/${classId}`
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching evaluations by class:', error);
            throw error;
        }
    }

    /**
     * Get a specific evaluation by ID
     */
    static async getEvaluationById(evaluationId: string): Promise<Evaluation> {
        try {
            const response = await apiService.get<ApiResponse<Evaluation>>(
                `${this.BASE_URL}/${evaluationId}`
            );
            return response.data.data!;
        } catch (error) {
            console.error('Error fetching evaluation by ID:', error);
            throw error;
        }
    }

    /**
     * Create a new evaluation
     */
    static async createEvaluation(evaluationData: CreateEvaluationDto): Promise<Evaluation> {
        try {
            const response = await apiService.post<ApiResponse<Evaluation>>(
                this.BASE_URL,
                evaluationData
            );
            return response.data.data!;
        } catch (error) {
            console.error('Error creating evaluation:', error);
            throw error;
        }
    }

    /**
     * Update an existing evaluation
     */
    static async updateEvaluation(
        evaluationId: string,
        evaluationData: UpdateEvaluationDto
    ): Promise<Evaluation> {
        try {
            const response = await apiService.put<ApiResponse<Evaluation>>(
                `${this.BASE_URL}/${evaluationId}`,
                evaluationData
            );
            return response.data.data!;
        } catch (error) {
            console.error('Error updating evaluation:', error);
            throw error;
        }
    }

    /**
     * Delete an evaluation
     */
    static async deleteEvaluation(evaluationId: string): Promise<void> {
        try {
            await apiService.delete<ApiResponse<void>>(`${this.BASE_URL}/${evaluationId}`);
        } catch (error) {
            console.error('Error deleting evaluation:', error);
            throw error;
        }
    }

    /**
     * Get evaluation summaries for a teacher
     */
    static async getEvaluationSummaries(teacherId: string): Promise<EvaluationSummaryDto[]> {
        try {
            const response = await apiService.get<ApiResponse<EvaluationSummaryDto[]>>(
                `${this.BASE_URL}/summaries/teacher/${teacherId}`
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching evaluation summaries:', error);
            throw error;
        }
    }

    /**
     * Get evaluation analytics for a teacher
     */
    static async getEvaluationAnalytics(teacherId: string): Promise<EvaluationAnalyticsDto> {
        try {
            const response = await apiService.get<ApiResponse<EvaluationAnalyticsDto>>(
                `${this.BASE_URL}/analytics/teacher/${teacherId}`
            );
            return response.data.data!;
        } catch (error) {
            console.error('Error fetching evaluation analytics:', error);
            throw error;
        }
    }

    /**
     * Get evaluation analytics for a class
     */
    static async getClassEvaluationAnalytics(classId: string): Promise<EvaluationAnalyticsDto> {
        try {
            const response = await apiService.get<ApiResponse<EvaluationAnalyticsDto>>(
                `${this.BASE_URL}/analytics/class/${classId}`
            );
            return response.data.data!;
        } catch (error) {
            console.error('Error fetching class evaluation analytics:', error);
            throw error;
        }
    }

    /**
     * Get students who need evaluation for a teacher
     */
    static async getStudentsNeedingEvaluation(teacherId: string): Promise<any[]> {
        try {
            const response = await apiService.get<ApiResponse<any[]>>(
                `${this.BASE_URL}/students/needing-evaluation/${teacherId}`
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching students needing evaluation:', error);
            throw error;
        }
    }
}