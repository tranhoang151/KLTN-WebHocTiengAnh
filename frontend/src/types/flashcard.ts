export interface Flashcard {
    id: string;
    frontText: string;
    backText: string;
    exampleSentence?: string;
    imageUrl?: string;
    imageBase64?: string;
    order: number;
    flashcardSetId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FlashcardSet {
    id: string;
    title: string;
    description: string;
    courseId: string;
    setId: string;
    createdBy: string;
    createdAt: Date;
    assignedClassIds: string[];
    isActive: boolean;
    totalCards: number;
}

export interface FlashcardSession {
    id: string;
    flashcardSetId: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    currentIndex: number;
    totalCards: number;
    correctAnswers: number;
    responses: FlashcardResponse[];
    completed: boolean;
}

export interface FlashcardResponse {
    cardId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number; // in seconds
    timestamp: Date;
}

export interface FlashcardProgress {
    userId: string;
    flashcardSetId: string;
    courseId: string;
    completionPercentage: number;
    learnedCardIds: string[];
    timeSpent: number;
    totalSessions: number;
    totalCardsStudied: number;
    averageScore: number;
    bestScore: number;
    lastStudied: Date;
    streakCount: number;
    masteredCards: string[];
    needsReviewCards: string[];
}

export interface FlashcardStatistics {
    totalCards: number;
    masteredCards: number;
    needsReviewCards: number;
    averageTimePerCard: number;
    longestStreak: number;
    currentStreak: number;
    totalStudyTime: number; // in minutes
}

export interface TeacherAnalytics {
    totalStudents: number;
    totalSets: number;
    averageProgress: number;
    topPerformingStudents: StudentAnalytics[];
    classProgress: ClassAnalytics[];
}

export interface ClassAnalytics {
    classId: string;
    className: string;
    totalStudents: number;
    averageProgress: number;
    completedStudents: number;
}

export interface StudentAnalytics {
    studentId: string;
    studentName: string;
    progress: number;
    cardsLearned: number;
    timeSpent: number;
    streak: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    earned: boolean;
    earnedDate?: Date;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
    streakHistory: { [date: string]: boolean };
    streakCalendar: { [date: string]: boolean };
}