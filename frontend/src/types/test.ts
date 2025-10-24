export interface Test {
    id: string;
    title: string;
    description?: string;
    courseId: string;
    duration: number; // in minutes
    maxScore: number;
    passingScore: number;
    difficulty: 'easy' | 'medium' | 'hard';
    questionIds: string[];
    totalQuestions: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    isPublished: boolean;
    isActive: boolean;
    instructions?: string;
}

export interface TestQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    type: 'multiple_choice' | 'fill_blank';
    points: number;
    explanation?: string;
}

export interface TestSession {
    id: string;
    testId: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    answers: { [questionId: string]: number };
    flaggedQuestions: string[];
    timeRemaining: number; // in seconds
    submitted: boolean;
    score?: number;
    passed?: boolean;
}

export interface TestResult {
    sessionId: string;
    testId: string;
    userId: string;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredQuestions: number;
    timeSpent: number; // in seconds
    completedAt: Date;
    questionResults: QuestionResult[];
}

export interface QuestionResult {
    questionId: string;
    question: TestQuestion;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    points: number;
    timeSpent: number;
}

export interface TestStatistics {
    testId: string;
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
    mostDifficultQuestions: string[];
    mostCommonMistakes: { [questionId: string]: number };
}

export interface TestAttempt {
    id: string;
    testId: string;
    userId: string;
    score: number;
    passed: boolean;
    timeSpent: number;
    completedAt: Date;
    answers: { [questionId: string]: number };
}