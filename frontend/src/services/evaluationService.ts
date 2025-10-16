import { apiService } from './api';

// --- TYPE DEFINITIONS ---

export interface Evaluation {
    id: string;
    studentId: string;
    teacherId: string;
    classId: string;
    score: number;
    comment: string;
    evaluationDate: string;
    category: 'academic' | 'behavior' | 'participation' | 'overall';
    isActive: boolean;
}

export interface CreateEvaluationRequest {
    studentId: string;
    classId: string;
    score: number;
    comment: string;
    category: 'academic' | 'behavior' | 'participation' | 'overall';
}

export interface UpdateEvaluationRequest {
    score?: number;
    comment?: string;
    category?: 'academic' | 'behavior' | 'participation' | 'overall';
}

export interface StudentEvaluationSummary {
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    averageScore: number;
    totalEvaluations: number;
    latestEvaluation?: Evaluation;
    evaluations: Evaluation[];
}

// --- SERVICE FUNCTIONS ---

const API_URL = '/evaluation';

export const evaluationService = {
    // Get all evaluations for teacher
    getTeacherEvaluations: async (): Promise<Evaluation[]> => {
        const response = await apiService.get<Evaluation[]>(`${API_URL}/teacher`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch evaluations');
        }
        return response.data || [];
    },

    // Get evaluations for a specific student
    getStudentEvaluations: async (studentId: string): Promise<Evaluation[]> => {
        const response = await apiService.get<Evaluation[]>(`${API_URL}/student/${studentId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch student evaluations');
        }
        return response.data || [];
    },

    // Get evaluation by ID
    getEvaluationById: async (evaluationId: string): Promise<Evaluation> => {
        const response = await apiService.get<Evaluation>(`${API_URL}/${evaluationId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch evaluation');
        }
        return response.data as Evaluation;
    },

    // Create new evaluation
    createEvaluation: async (evaluationData: CreateEvaluationRequest): Promise<Evaluation> => {
        const response = await apiService.post<Evaluation>(API_URL, evaluationData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to create evaluation');
        }
        return response.data as Evaluation;
    },

    // Update evaluation
    updateEvaluation: async (evaluationId: string, evaluationData: UpdateEvaluationRequest): Promise<Evaluation> => {
        const response = await apiService.put<Evaluation>(`${API_URL}/${evaluationId}`, evaluationData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to update evaluation');
        }
        return response.data as Evaluation;
    },

    // Delete evaluation
    deleteEvaluation: async (evaluationId: string): Promise<void> => {
        const response = await apiService.delete<void>(`${API_URL}/${evaluationId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete evaluation');
        }
    },

    // Get evaluation summary for all students in teacher's classes
    getTeacherEvaluationSummary: async (): Promise<StudentEvaluationSummary[]> => {
        const response = await apiService.get<StudentEvaluationSummary[]>(`${API_URL}/teacher/summary`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch evaluation summary');
        }
        return response.data || [];
    },

    // Get evaluation statistics for a class
    getClassEvaluationStats: async (classId: string): Promise<any> => {
        const response = await apiService.get<any>(`${API_URL}/class/${classId}/stats`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch class evaluation stats');
        }
        return response.data;
    },
};