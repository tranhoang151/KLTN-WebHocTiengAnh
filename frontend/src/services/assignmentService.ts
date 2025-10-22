import { apiService } from './api';
import { User, Course, Exercise, Class } from '../types';

export interface Assignment {
    id: string;
    title: string;
    description: string;
    type: 'exercise' | 'flashcard_set' | 'video' | 'mixed';
    course_id: string;
    class_ids: string[];
    content_ids: string[]; // IDs of exercises, flashcard sets, videos, etc.
    assigned_by: string; // teacher ID
    assigned_to: string[]; // student IDs
    due_date: Date;
    start_date: Date;
    is_active: boolean;
    allow_late_submission: boolean;
    max_attempts: number;
    time_limit?: number; // in minutes
    instructions: string;
    created_at: Date;
    updated_at: Date;
}

export interface AssignmentSubmission {
    id: string;
    assignment_id: string;
    student_id: string;
    submitted_at: Date;
    score?: number;
    max_score: number;
    completion_percentage: number;
    time_spent: number; // in minutes
    attempt_number: number;
    status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'late';
    feedback?: string;
    graded_by?: string;
    graded_at?: Date;
    content_results: ContentResult[];
}

export interface ContentResult {
    content_id: string;
    content_type: 'exercise' | 'flashcard_set' | 'video';
    score: number;
    max_score: number;
    completion_percentage: number;
    time_spent: number;
    details: any; // Specific result data for each content type
}

export interface TeacherEvaluation {
    id: string;
    assignment_id: string;
    student_id: string;
    teacher_id: string;
    participation_score: number; // 1-5 scale
    understanding_score: number; // 1-5 scale
    progress_score: number; // 1-5 scale
    overall_rating: number; // 1-5 scale
    comments: string;
    strengths: string[];
    areas_for_improvement: string[];
    recommendations: string[];
    created_at: Date;
    updated_at: Date;
}

export interface AssignmentFilters {
    courseId?: string;
    classId?: string;
    type?: Assignment['type'];
    status?: 'active' | 'completed' | 'overdue' | 'draft';
    assignedBy?: string;
    assignedTo?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
}

export interface AssignmentAnalytics {
    total_assignments: number;
    completed_assignments: number;
    overdue_assignments: number;
    average_score: number;
    completion_rate: number;
    submission_rate: number;
    average_time_spent: number;
    performance_by_content: {
        content_id: string;
        content_type: string;
        average_score: number;
        completion_rate: number;
    }[];
    student_performance: {
        student_id: string;
        student_name: string;
        assignments_completed: number;
        average_score: number;
        total_time_spent: number;
    }[];
}

class AssignmentService {
    // Assignment CRUD operations
    async getAllAssignments(filters?: AssignmentFilters): Promise<Assignment[]> {
        const params = new URLSearchParams();

        if (filters?.courseId) params.append('courseId', filters.courseId);
        if (filters?.classId) params.append('classId', filters.classId);
        if (filters?.type) params.append('type', filters.type);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.assignedBy) params.append('assignedBy', filters.assignedBy);
        if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
        if (filters?.dateRange) {
            params.append('startDate', filters.dateRange.start.toISOString());
            params.append('endDate', filters.dateRange.end.toISOString());
        }

        const queryString = params.toString();
        const endpoint = queryString ? `/assignment?${queryString}` : '/assignment';

        const response = await apiService.get<Assignment[]>(endpoint);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch assignments');
        }
        return response.data || [];
    }

    async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
        const response = await apiService.get<Assignment>(`/assignment/${assignmentId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch assignment');
        }
        return response.data || null;
    }

    async createAssignment(assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment> {
        const response = await apiService.post<Assignment>('/assignment', assignmentData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to create assignment');
        }
        return response.data!;
    }

    async updateAssignment(assignmentId: string, assignmentData: Partial<Assignment>): Promise<Assignment> {
        const response = await apiService.put<Assignment>(`/assignment/${assignmentId}`, assignmentData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to update assignment');
        }
        return response.data!;
    }

    async deleteAssignment(assignmentId: string): Promise<void> {
        const response = await apiService.delete(`/assignment/${assignmentId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete assignment');
        }
    }

    async duplicateAssignment(assignmentId: string): Promise<Assignment> {
        const response = await apiService.post<Assignment>(`/assignment/${assignmentId}/duplicate`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to duplicate assignment');
        }
        return response.data!;
    }

    // Assignment submission operations
    async getAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
        const response = await apiService.get<AssignmentSubmission[]>(`/assignment/${assignmentId}/submissions`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch assignment submissions');
        }
        return response.data || [];
    }

    async getStudentSubmission(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> {
        const response = await apiService.get<AssignmentSubmission>(`/assignment/${assignmentId}/submissions/${studentId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch student submission');
        }
        return response.data || null;
    }

    async submitAssignment(assignmentId: string, submissionData: Omit<AssignmentSubmission, 'id' | 'submitted_at'>): Promise<AssignmentSubmission> {
        const response = await apiService.post<AssignmentSubmission>(`/assignment/${assignmentId}/submit`, submissionData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to submit assignment');
        }
        return response.data!;
    }

    // Teacher evaluation operations
    async createEvaluation(evaluationData: Omit<TeacherEvaluation, 'id' | 'created_at' | 'updated_at'>): Promise<TeacherEvaluation> {
        const response = await apiService.post<TeacherEvaluation>('/assignment/evaluation', evaluationData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to create evaluation');
        }
        return response.data!;
    }

    async updateEvaluation(evaluationId: string, evaluationData: Partial<TeacherEvaluation>): Promise<TeacherEvaluation> {
        const response = await apiService.put<TeacherEvaluation>(`/assignment/evaluation/${evaluationId}`, evaluationData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to update evaluation');
        }
        return response.data!;
    }

    async getStudentEvaluations(studentId: string, assignmentId?: string): Promise<TeacherEvaluation[]> {
        const params = assignmentId ? `?assignmentId=${assignmentId}` : '';
        const response = await apiService.get<TeacherEvaluation[]>(`/assignment/evaluation/student/${studentId}${params}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch student evaluations');
        }
        return response.data || [];
    }

    // Content access control
    async getAssignedContent(studentId: string, courseId?: string): Promise<{
        exercises: Exercise[];
        flashcard_sets: any[];
        videos: any[];
    }> {
        const params = courseId ? `?courseId=${courseId}` : '';
        const response = await apiService.get<{
            exercises: Exercise[];
            flashcard_sets: any[];
            videos: any[];
        }>(`/assignment/content/student/${studentId}${params}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch assigned content');
        }
        return response.data || { exercises: [], flashcard_sets: [], videos: [] };
    }

    async checkContentAccess(studentId: string, contentId: string, contentType: string): Promise<boolean> {
        const response = await apiService.get(`/assignment/access/${studentId}/${contentType}/${contentId}`);
        if (!response.success) {
            return false;
        }
        return (response.data as { hasAccess?: boolean })?.hasAccess || false;
    }

    // Analytics and reporting
    async getAssignmentAnalytics(assignmentId?: string, classId?: string, courseId?: string): Promise<AssignmentAnalytics> {
        const params = new URLSearchParams();
        if (assignmentId) params.append('assignmentId', assignmentId);
        if (classId) params.append('classId', classId);
        if (courseId) params.append('courseId', courseId);

        const queryString = params.toString();
        const endpoint = queryString ? `/assignment/analytics?${queryString}` : '/assignment/analytics';

        const response = await apiService.get<AssignmentAnalytics>(endpoint);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch assignment analytics');
        }
        return response.data || {
            total_assignments: 0,
            completed_assignments: 0,
            overdue_assignments: 0,
            average_score: 0,
            completion_rate: 0,
            submission_rate: 0,
            average_time_spent: 0,
            performance_by_content: [],
            student_performance: []
        };
    }

    // Bulk operations
    async bulkAssignContent(assignmentData: {
        title: string;
        description: string;
        content_ids: string[];
        content_type: Assignment['type'];
        class_ids: string[];
        due_date: Date;
        instructions: string;
    }): Promise<Assignment[]> {
        const response = await apiService.post<Assignment[]>('/assignment/bulk-assign', assignmentData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to bulk assign content');
        }
        return response.data || [];
    }

    async bulkGradeSubmissions(gradingData: {
        assignment_id: string;
        submissions: {
            student_id: string;
            score: number;
            feedback?: string;
        }[];
    }): Promise<AssignmentSubmission[]> {
        const response = await apiService.post<AssignmentSubmission[]>('/assignment/bulk-grade', gradingData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to bulk grade submissions');
        }
        return response.data || [];
    }

    // Helper methods
    async getAvailableContent(courseId: string): Promise<{
        exercises: Exercise[];
        flashcard_sets: any[];
        videos: any[];
    }> {
        const response = await apiService.get<{
            exercises: Exercise[];
            flashcard_sets: any[];
            videos: any[];
        }>(`/assignment/available-content/${courseId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch available content');
        }
        return response.data || { exercises: [], flashcard_sets: [], videos: [] };
    }

    async getStudentsForAssignment(classIds: string[]): Promise<User[]> {
        const response = await apiService.post<User[]>('/assignment/students', { classIds });
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch students for assignment');
        }
        return response.data || [];
    }
}

export const assignmentService = new AssignmentService();
