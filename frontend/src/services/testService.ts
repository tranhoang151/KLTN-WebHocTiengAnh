import { apiService } from './api';
import {
    Test,
    TestQuestion,
    TestSession,
    TestResult,
    TestStatistics,
    TestAttempt
} from '../types/test';

export class TestService {
    private static instance: TestService;

    public static getInstance(): TestService {
        if (!TestService.instance) {
            TestService.instance = new TestService();
        }
        return TestService.instance;
    }

    // Test operations
    async getTests(courseId?: string): Promise<Test[]> {
        try {
            const endpoint = courseId ? `/tests?courseId=${courseId}` : '/tests';
            const response = await apiService.get<Test[]>(endpoint);
            return response.data;
        } catch (error) {
            console.error('Error fetching tests:', error);
            // Return mock data for now
            return this.getMockTests();
        }
    }

    async getTestById(testId: string): Promise<Test | null> {
        try {
            const response = await apiService.get<Test>(`/tests/${testId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test:', error);
            return null;
        }
    }

    async getTestQuestions(testId: string): Promise<TestQuestion[]> {
        try {
            const response = await apiService.get<TestQuestion[]>(`/tests/${testId}/questions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test questions:', error);
            // Return mock questions for now
            return this.getMockTestQuestions();
        }
    }

    async createTest(testData: Partial<Test>): Promise<Test> {
        try {
            const response = await apiService.post<Test>('/tests', testData);
            return response.data;
        } catch (error) {
            console.error('Error creating test:', error);
            throw error;
        }
    }

    async updateTest(testId: string, testData: Partial<Test>): Promise<Test> {
        try {
            const response = await apiService.put<Test>(`/tests/${testId}`, testData);
            return response.data;
        } catch (error) {
            console.error('Error updating test:', error);
            throw error;
        }
    }

    async deleteTest(testId: string): Promise<void> {
        try {
            await apiService.delete(`/tests/${testId}`);
        } catch (error) {
            console.error('Error deleting test:', error);
            throw error;
        }
    }

    // Test session operations
    async startTestSession(testId: string): Promise<TestSession> {
        try {
            const response = await apiService.post<TestSession>('/test-sessions/start', { testId });
            return response.data;
        } catch (error) {
            console.error('Error starting test session:', error);
            // Return mock session for now
            return this.createMockTestSession(testId);
        }
    }

    async saveTestAnswer(sessionId: string, questionId: string, answer: number): Promise<void> {
        try {
            await apiService.post(`/test-sessions/${sessionId}/answer`, {
                questionId,
                answer
            });
        } catch (error) {
            console.error('Error saving test answer:', error);
            throw error;
        }
    }

    async submitTestSession(sessionId: string): Promise<TestResult> {
        try {
            const response = await apiService.post<TestResult>(`/test-sessions/${sessionId}/submit`);
            return response.data;
        } catch (error) {
            console.error('Error submitting test session:', error);
            throw error;
        }
    }

    async getTestSession(sessionId: string): Promise<TestSession> {
        try {
            const response = await apiService.get<TestSession>(`/test-sessions/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test session:', error);
            throw error;
        }
    }

    // Test results and statistics
    async getTestResults(userId: string): Promise<TestResult[]> {
        try {
            const response = await apiService.get<TestResult[]>(`/test-results/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test results:', error);
            return [];
        }
    }

    async getTestResult(sessionId: string): Promise<TestResult> {
        try {
            const response = await apiService.get<TestResult>(`/test-results/session/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test result:', error);
            throw error;
        }
    }

    async getTestStatistics(testId: string): Promise<TestStatistics> {
        try {
            const response = await apiService.get<TestStatistics>(`/test-statistics/${testId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test statistics:', error);
            // Return mock statistics for now
            return this.getMockTestStatistics();
        }
    }

    async getUserTestAttempts(userId: string, testId?: string): Promise<TestAttempt[]> {
        try {
            const endpoint = testId ? `/test-attempts/${userId}?testId=${testId}` : `/test-attempts/${userId}`;
            const response = await apiService.get<TestAttempt[]>(endpoint);
            return response.data;
        } catch (error) {
            console.error('Error fetching test attempts:', error);
            return [];
        }
    }

    // Test management (for teachers/admins)
    async publishTest(testId: string): Promise<void> {
        try {
            await apiService.patch(`/tests/${testId}/publish`, { isPublished: true });
        } catch (error) {
            console.error('Error publishing test:', error);
            throw error;
        }
    }

    async unpublishTest(testId: string): Promise<void> {
        try {
            await apiService.patch(`/tests/${testId}/publish`, { isPublished: false });
        } catch (error) {
            console.error('Error unpublishing test:', error);
            throw error;
        }
    }

    async flagTestQuestion(sessionId: string, questionId: string): Promise<void> {
        try {
            await apiService.post(`/test-sessions/${sessionId}/flag`, { questionId });
        } catch (error) {
            console.error('Error flagging test question:', error);
            throw error;
        }
    }

    async unflagTestQuestion(sessionId: string, questionId: string): Promise<void> {
        try {
            await apiService.delete(`/test-sessions/${sessionId}/flag/${questionId}`);
        } catch (error) {
            console.error('Error unflagging test question:', error);
            throw error;
        }
    }

    // Mock data methods (for development)
    private getMockTests(): Test[] {
        return [
            {
                id: 'test1',
                title: 'Colors and Numbers Quiz',
                description: 'Test your knowledge of basic colors and numbers',
                courseId: 'LABTsID1zvPRsVjPjhLd',
                duration: 15,
                maxScore: 50,
                passingScore: 70,
                difficulty: 'easy',
                questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
                totalQuestions: 5,
                createdBy: 'teacher_123',
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublished: true,
                isActive: true,
                instructions: 'Read each question carefully. You have 15 minutes to complete this test.'
            },
            {
                id: 'test2',
                title: 'Animals Quiz',
                description: 'Test your knowledge of basic animals',
                courseId: 'LABTsID1zvPRsVjPjhLd',
                duration: 20,
                maxScore: 60,
                passingScore: 70,
                difficulty: 'medium',
                questionIds: [],
                totalQuestions: 6,
                createdBy: 'teacher_123',
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublished: true,
                isActive: true
            }
        ];
    }

    private getMockTestQuestions(): TestQuestion[] {
        return [
            {
                id: 'q1',
                question: 'What color is the sky on a clear day?',
                options: ['Blue', 'Red', 'Green', 'Yellow'],
                correctAnswer: 0,
                type: 'multiple_choice',
                points: 10
            },
            {
                id: 'q2',
                question: 'How many fingers do you have on one hand?',
                options: ['3', '4', '5', '6'],
                correctAnswer: 2,
                type: 'multiple_choice',
                points: 10
            },
            {
                id: 'q3',
                question: 'What do you use to brush your teeth?',
                options: ['Spoon', 'Toothbrush', 'Comb', 'Fork'],
                correctAnswer: 1,
                type: 'multiple_choice',
                points: 10
            },
            {
                id: 'q4',
                question: 'The sun rises in the ____.',
                options: ['west', 'east', 'north', 'south'],
                correctAnswer: 1,
                type: 'multiple_choice',
                points: 10
            },
            {
                id: 'q5',
                question: 'How many days are in a week?',
                options: ['5', '6', '7', '8'],
                correctAnswer: 2,
                type: 'multiple_choice',
                points: 10
            }
        ];
    }

    private createMockTestSession(testId: string): TestSession {
        return {
            id: `session_${Date.now()}`,
            testId,
            userId: 'current-user',
            startTime: new Date(),
            answers: {},
            flaggedQuestions: [],
            timeRemaining: 15 * 60, // 15 minutes in seconds
            submitted: false
        };
    }

    private getMockTestStatistics(): TestStatistics {
        return {
            testId: 'test1',
            totalAttempts: 25,
            averageScore: 75,
            passRate: 80,
            averageTimeSpent: 12 * 60, // 12 minutes in seconds
            mostDifficultQuestions: ['q3', 'q5'],
            mostCommonMistakes: {
                'q3': 15,
                'q5': 10
            }
        };
    }
}

// Export singleton instance
export const testService = TestService.getInstance();