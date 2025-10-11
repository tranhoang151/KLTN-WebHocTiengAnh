import { apiService } from './api';
import {
  Flashcard,
  FlashcardSet,
  FlashcardSession,
  FlashcardResponse,
  FlashcardProgress,
  FlashcardStatistics,
  TeacherAnalytics,
  ClassAnalytics,
  StudentAnalytics,
  Badge,
  StreakData
} from '../types/flashcard';

// Re-export types for convenience
export type {
  Flashcard,
  FlashcardSet,
  FlashcardSession,
  FlashcardResponse,
  FlashcardProgress,
  FlashcardStatistics,
  TeacherAnalytics,
  ClassAnalytics,
  StudentAnalytics,
  Badge,
  StreakData
};

export class FlashcardService {
  private static instance: FlashcardService;

  public static getInstance(): FlashcardService {
    if (!FlashcardService.instance) {
      FlashcardService.instance = new FlashcardService();
    }
    return FlashcardService.instance;
  }

  // Flashcard Set operations
  async getFlashcardSets(courseId?: string): Promise<FlashcardSet[]> {
    try {
      const response = await apiService.get<FlashcardSet[]>('/flashcard-sets');
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      // Return mock data for now
      return this.getMockFlashcardSets();
    }
  }

  async getFlashcardSetById(setId: string): Promise<FlashcardSet | null> {
    try {
      const response = await apiService.get<FlashcardSet>(`/flashcard-sets/${setId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcard set:', error);
      return null;
    }
  }

  async createFlashcardSet(setData: Partial<FlashcardSet>): Promise<FlashcardSet> {
    try {
      const response = await apiService.post<FlashcardSet>('/flashcard-sets', setData);
      return response.data;
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      throw error;
    }
  }

  async updateFlashcardSet(setId: string, setData: Partial<FlashcardSet>): Promise<FlashcardSet> {
    try {
      const response = await apiService.put<FlashcardSet>(`/flashcard-sets/${setId}`, setData);
      return response.data;
    } catch (error) {
      console.error('Error updating flashcard set:', error);
      throw error;
    }
  }

  async deleteFlashcardSet(setId: string): Promise<void> {
    try {
      await apiService.delete(`/flashcard-sets/${setId}`);
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      throw error;
    }
  }

  // Flashcard operations
  async getFlashcardsBySetId(setId: string): Promise<Flashcard[]> {
    try {
      const response = await apiService.get<Flashcard[]>(`/flashcards?setId=${setId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      // Return mock data for now
      return this.getMockFlashcards(setId);
    }
  }

  async createFlashcard(cardData: Partial<Flashcard>): Promise<Flashcard> {
    try {
      const response = await apiService.post<Flashcard>('/flashcards', cardData);
      return response.data;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  }

  async updateFlashcard(cardId: string, cardData: Partial<Flashcard>): Promise<Flashcard> {
    try {
      const response = await apiService.put<Flashcard>(`/flashcards/${cardId}`, cardData);
      return response.data;
    } catch (error) {
      console.error('Error updating flashcard:', error);
      throw error;
    }
  }

  async deleteFlashcard(cardId: string): Promise<void> {
    try {
      await apiService.delete(`/flashcards/${cardId}`);
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }
  }

  // Session operations
  async startSession(setId: string): Promise<FlashcardSession> {
    try {
      const response = await apiService.post<FlashcardSession>('/flashcard-sessions/start', { setId });
      return response.data;
    } catch (error) {
      console.error('Error starting session:', error);
      // Return mock session for now
      return this.createMockSession(setId);
    }
  }

  async saveSessionResponse(sessionId: string, response: FlashcardResponse): Promise<void> {
    try {
      await apiService.post(`/flashcard-sessions/${sessionId}/response`, response);
    } catch (error) {
      console.error('Error saving session response:', error);
      throw error;
    }
  }

  async endSession(sessionId: string): Promise<FlashcardSession> {
    try {
      const response = await apiService.post<FlashcardSession>(`/flashcard-sessions/${sessionId}/end`);
      return response.data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  async getSessionProgress(sessionId: string): Promise<FlashcardSession> {
    try {
      const response = await apiService.get<FlashcardSession>(`/flashcard-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session progress:', error);
      throw error;
    }
  }

  // Progress and statistics
  async getUserProgress(userId: string): Promise<FlashcardProgress[]> {
    try {
      const response = await apiService.get<FlashcardProgress[]>(`/flashcard-progress/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }
  }

  async getFlashcardStatistics(setId: string): Promise<FlashcardStatistics> {
    try {
      const response = await apiService.get<FlashcardStatistics>(`/flashcard-statistics/${setId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcard statistics:', error);
      // Return mock statistics for now
      return this.getMockStatistics();
    }
  }

  async updateCardMastery(cardId: string, mastered: boolean): Promise<void> {
    try {
      await apiService.patch(`/flashcards/${cardId}/mastery`, { mastered });
    } catch (error) {
      console.error('Error updating card mastery:', error);
      throw error;
    }
  }

  async assignFlashcardSet(setId: string, classIds: string[]): Promise<void> {
    try {
      await apiService.patch(`/flashcard-sets/${setId}/assign`, { classIds });
    } catch (error) {
      console.error('Error assigning flashcard set:', error);
      throw error;
    }
  }

  async reorderFlashcards(setId: string, cards: Flashcard[]): Promise<void> {
    try {
      await apiService.patch(`/flashcard-sets/${setId}/reorder`, { cards });
    } catch (error) {
      console.error('Error reordering flashcards:', error);
      throw error;
    }
  }

  // Additional methods for progress tracking
  async getProgress(userId: string, setId: string): Promise<FlashcardProgress | null> {
    try {
      const response = await apiService.get<FlashcardProgress>(`/flashcard-progress/${userId}/${setId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  }

  async updateProgress(progress: FlashcardProgress): Promise<void> {
    try {
      await apiService.post('/flashcard-progress', progress);
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  async getDetailedProgress(userId: string, setId: string): Promise<FlashcardProgress | null> {
    try {
      const response = await apiService.get<FlashcardProgress>(`/flashcard-progress/${userId}/${setId}/detailed`);
      return response.data;
    } catch (error) {
      console.error('Error fetching detailed progress:', error);
      return null;
    }
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const response = await apiService.get<Badge[]>(`/badges/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  }

  async getStreakData(userId: string): Promise<StreakData> {
    try {
      const response = await apiService.get<StreakData>(`/streak/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streak data:', error);
      // Return mock streak data
      return this.getMockStreakData();
    }
  }

  async getTeacherAnalytics(userId: string, courseId?: string, setId?: string): Promise<TeacherAnalytics> {
    try {
      const params = new URLSearchParams();
      if (courseId) params.append('courseId', courseId);
      if (setId) params.append('setId', setId);

      const response = await apiService.get<TeacherAnalytics>(`/teacher-analytics/${userId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher analytics:', error);
      // Return mock analytics data
      return this.getMockTeacherAnalytics();
    }
  }

  async getFlashcardSetsByCourse(courseId: string): Promise<FlashcardSet[]> {
    try {
      const response = await apiService.get<FlashcardSet[]>(`/flashcard-sets?courseId=${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcard sets by course:', error);
      // Return filtered mock data
      return this.getMockFlashcardSets().filter(set => set.courseId === courseId);
    }
  }

  async getAllFlashcardSets(): Promise<FlashcardSet[]> {
    return this.getFlashcardSets();
  }

  // Mock data methods for missing functionality
  private getMockStreakData(): StreakData {
    return {
      currentStreak: 5,
      longestStreak: 12,
      lastActivityDate: new Date(),
      streakHistory: {},
      streakCalendar: {}
    };
  }

  private getMockTeacherAnalytics(): TeacherAnalytics {
    return {
      totalStudents: 25,
      totalSets: 8,
      averageProgress: 75,
      topPerformingStudents: [],
      classProgress: []
    };
  }

  // Mock data methods (for development)
  private getMockFlashcardSets(): FlashcardSet[] {
    return [
      {
        id: 'animals',
        title: 'Animals',
        description: 'Learn basic animals',
        courseId: 'LABTsID1zvPRsVjPjhLd',
        setId: 'animals',
        createdBy: 'teacher_123',
        createdAt: new Date('2025-01-01'),
        assignedClassIds: ['class_1'],
        isActive: true,
        totalCards: 10
      },
      {
        id: 'colors',
        title: 'Colors',
        description: 'Learn basic colors',
        courseId: 'LABTsID1zvPRsVjPjhLd',
        setId: 'colors',
        createdBy: 'teacher_123',
        createdAt: new Date('2025-01-01'),
        assignedClassIds: ['class_1'],
        isActive: true,
        totalCards: 8
      },
      {
        id: 'numbers',
        title: 'Numbers',
        description: 'Learn basic numbers',
        courseId: 'LABTsID1zvPRsVjPjhLd',
        setId: 'numbers',
        createdBy: 'teacher_123',
        createdAt: new Date('2025-01-01'),
        assignedClassIds: ['class_1'],
        isActive: true,
        totalCards: 12
      }
    ];
  }

  private getMockFlashcards(setId: string): Flashcard[] {
    const mockData: { [key: string]: Flashcard[] } = {
      animals: [
        { id: '1', frontText: 'A _____ says "meow".', backText: 'cat', order: 1, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', frontText: 'A _____ says "woof".', backText: 'dog', order: 2, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', frontText: 'A _____ can fly.', backText: 'bird', order: 3, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '4', frontText: 'A _____ lives in water.', backText: 'fish', order: 4, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '5', frontText: 'A _____ has four legs.', backText: 'dog', order: 5, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() }
      ],
      colors: [
        { id: '6', frontText: 'The sky is _____ on a clear day.', backText: 'blue', order: 6, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '7', frontText: 'Grass is _____.', backText: 'green', order: 7, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '8', frontText: 'The sun is _____.', backText: 'yellow', order: 8, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '9', frontText: 'Blood is _____.', backText: 'red', order: 9, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '10', frontText: 'Snow is _____.', backText: 'white', order: 10, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() }
      ],
      numbers: [
        { id: '11', frontText: 'You have _____ fingers on one hand.', backText: 'five', order: 11, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '12', frontText: 'There are _____ days in a week.', backText: 'seven', order: 12, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '13', frontText: 'You have _____ eyes.', backText: 'two', order: 13, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '14', frontText: 'A cat has _____ legs.', backText: 'four', order: 14, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() },
        { id: '15', frontText: 'There are _____ months in a year.', backText: 'twelve', order: 15, flashcardSetId: setId, createdAt: new Date(), updatedAt: new Date() }
      ]
    };

    return mockData[setId] || [];
  }

  private createMockSession(setId: string): FlashcardSession {
    return {
      id: `session_${Date.now()}`,
      flashcardSetId: setId,
      userId: 'current-user',
      startTime: new Date(),
      currentIndex: 0,
      totalCards: 5,
      correctAnswers: 0,
      responses: [],
      completed: false
    };
  }

  private getMockStatistics(): FlashcardStatistics {
    return {
      totalCards: 25,
      masteredCards: 18,
      needsReviewCards: 7,
      averageTimePerCard: 45,
      longestStreak: 12,
      currentStreak: 5,
      totalStudyTime: 120
    };
  }
}

// Export singleton instance
export const flashcardService = FlashcardService.getInstance();