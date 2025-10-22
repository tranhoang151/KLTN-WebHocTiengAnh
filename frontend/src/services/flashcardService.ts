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
} from '../types/index';

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
  async getAllFlashcardSets(): Promise<FlashcardSet[]> {
    try {
      const response = await apiService.get<FlashcardSet[]>('/flashcard/sets');
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching all flashcard sets:', response.error);
        return this.getMockFlashcardSets();
      }
    } catch (error) {
      console.error('Error fetching all flashcard sets:', error);
      return this.getMockFlashcardSets();
    }
  }

  async getFlashcardSetsByCourse(courseId: string): Promise<FlashcardSet[]> {
    try {
      const response = await apiService.get<FlashcardSet[]>(`/flashcard/sets/${courseId}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching flashcard sets by course:', response.error);
        return this.getMockFlashcardSets().filter(set => set.course_id === courseId);
      }
    } catch (error) {
      console.error('Error fetching flashcard sets by course:', error);
      return this.getMockFlashcardSets().filter(set => set.course_id === courseId);
    }
  }

  async getFlashcardSetById(setId: string): Promise<FlashcardSet | null> {
    try {
      const response = await apiService.get<FlashcardSet>(`/flashcard/set/${setId}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching flashcard set:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching flashcard set:', error);
      return null;
    }
  }

  async createFlashcardSet(setData: Partial<FlashcardSet>): Promise<FlashcardSet> {
    try {
      const response = await apiService.post<FlashcardSet>('/flashcard/set', setData);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create flashcard set');
      }
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      throw error;
    }
  }

  async updateFlashcardSet(setId: string, setData: Partial<FlashcardSet>): Promise<FlashcardSet> {
    try {
      const response = await apiService.put<FlashcardSet>(`/flashcard/set/${setId}`, setData);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update flashcard set');
      }
    } catch (error) {
      console.error('Error updating flashcard set:', error);
      throw error;
    }
  }

  async deleteFlashcardSet(setId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/flashcard/set/${setId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete flashcard set');
      }
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      throw error;
    }
  }

  // Flashcard operations
  async getFlashcardsBySetId(setId: string): Promise<Flashcard[]> {
    try {
      const response = await apiService.get<Flashcard[]>(`/flashcard/set/${setId}/cards`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching flashcards:', response.error);
        // Return mock data for now
        return this.getMockFlashcards(setId);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      // Return mock data for now
      return this.getMockFlashcards(setId);
    }
  }

  async createFlashcard(setId: string, cardData: Partial<Flashcard>): Promise<Flashcard> {
    try {
      const response = await apiService.post<Flashcard>(`/flashcard/set/${setId}/card`, cardData);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create flashcard');
      }
    } catch (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  }

  async updateFlashcard(cardId: string, cardData: Partial<Flashcard>): Promise<Flashcard> {
    try {
      const response = await apiService.put<Flashcard>(`/flashcard/card/${cardId}`, cardData);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update flashcard');
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
      throw error;
    }
  }

  async deleteFlashcard(cardId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/flashcard/card/${cardId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete flashcard');
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }
  }

  // Session operations
  async startSession(setId: string): Promise<FlashcardSession> {
    try {
      const response = await apiService.post<FlashcardSession>('/flashcard-sessions/start', { setId });
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error starting session:', response.error);
        // Return mock session for now
        return this.createMockSession(setId);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      // Return mock session for now
      return this.createMockSession(setId);
    }
  }

  async saveSessionResponse(sessionId: string, response: FlashcardResponse): Promise<void> {
    try {
      const apiResponse = await apiService.post(`/flashcard-sessions/${sessionId}/response`, response);
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to save session response');
      }
    } catch (error) {
      console.error('Error saving session response:', error);
      throw error;
    }
  }

  async endSession(sessionId: string): Promise<FlashcardSession> {
    try {
      const response = await apiService.post<FlashcardSession>(`/flashcard-sessions/${sessionId}/end`);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to end session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  async getSessionProgress(sessionId: string): Promise<FlashcardSession> {
    try {
      const response = await apiService.get<FlashcardSession>(`/flashcard-sessions/${sessionId}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get session progress');
      }
    } catch (error) {
      console.error('Error fetching session progress:', error);
      throw error;
    }
  }

  // Progress and statistics
  async getUserProgress(userId: string): Promise<FlashcardProgress[]> {
    try {
      const response = await apiService.get<FlashcardProgress[]>(`/flashcard/progress/${userId}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching user progress:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }
  }

  async getFlashcardStatistics(setId: string): Promise<FlashcardStatistics> {
    try {
      const response = await apiService.get<FlashcardStatistics>(`/flashcard/statistics/${setId}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching flashcard statistics:', response.error);
        // Return mock statistics for now
        return this.getMockStatistics();
      }
    } catch (error) {
      console.error('Error fetching flashcard statistics:', error);
      // Return mock statistics for now
      return this.getMockStatistics();
    }
  }

  async updateCardMastery(cardId: string, mastered: boolean): Promise<void> {
    try {
      const response = await apiService.patch(`/flashcard/card/${cardId}/mastery`, { mastered });
      if (!response.success) {
        throw new Error(response.error || 'Failed to update card mastery');
      }
    } catch (error) {
      console.error('Error updating card mastery:', error);
      throw error;
    }
  }

  async assignFlashcardSet(setId: string, classIds: string[]): Promise<void> {
    try {
      const response = await apiService.put(`/flashcard/set/${setId}/assign`, classIds);
      if (!response.success) {
        throw new Error(response.error || 'Failed to assign flashcard set');
      }
    } catch (error) {
      console.error('Error assigning flashcard set:', error);
      throw error;
    }
  }

  async reorderFlashcards(setId: string, cards: Flashcard[]): Promise<void> {
    try {
      const response = await apiService.put(`/flashcard/set/${setId}/reorder`, { cards });
      if (!response.success) {
        throw new Error(response.error || 'Failed to reorder flashcards');
      }
    } catch (error) {
      console.error('Error reordering flashcards:', error);
      throw error;
    }
  }

  // Additional methods for progress tracking
  async getProgress(userId: string, setId: string): Promise<FlashcardProgress | null> {
    try {
      const response = await apiService.get<FlashcardProgress>(`/flashcard/progress/${userId}/${setId}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching progress:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  }

  async updateProgress(progress: FlashcardProgress): Promise<void> {
    try {
      const response = await apiService.post('/flashcard/progress', progress);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  async getDetailedProgress(userId: string, setId: string): Promise<FlashcardProgress | null> {
    try {
      const response = await apiService.get<FlashcardProgress>(`/flashcard/progress/${userId}/${setId}/detailed`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching detailed progress:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching detailed progress:', error);
      return null;
    }
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const response = await apiService.get<Badge[]>(`/flashcard/badges/${userId}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching user badges:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  }

  async getStreakData(userId: string): Promise<StreakData> {
    try {
      const response = await apiService.get<StreakData>(`/flashcard/streak/${userId}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching streak data:', response.error);
        // Return mock streak data
        return this.getMockStreakData();
      }
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

      const response = await apiService.get<TeacherAnalytics>(`/flashcard/analytics/teacher/${userId}?${params}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Error fetching teacher analytics:', response.error);
        // Return mock analytics data
        return this.getMockTeacherAnalytics();
      }
    } catch (error) {
      console.error('Error fetching teacher analytics:', error);
      // Return mock analytics data
      return this.getMockTeacherAnalytics();
    }
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
        course_id: 'LABTsID1zvPRsVjPjhLd',
        set_id: 'animals',
        created_by: 'teacher_123',
        created_at: new Date('2025-01-01'),
      },
      {
        id: 'colors',
        title: 'Colors',
        description: 'Learn basic colors',
        course_id: 'LABTsID1zvPRsVjPjhLd',
        set_id: 'colors',
        created_by: 'teacher_123',
        created_at: new Date('2025-01-01'),
      },
      {
        id: 'numbers',
        title: 'Numbers',
        description: 'Learn basic numbers',
        course_id: 'LABTsID1zvPRsVjPjhLd',
        set_id: 'numbers',
        created_by: 'teacher_123',
        created_at: new Date('2025-01-01'),
      },
      {
        id: 'shool_things',
        title: 'Shool Things',
        description: 'Learning about school things',
        course_id: '1Tj7Zug9y2PtKCj3mR1X',
        set_id: 'shool_things',
        created_by: 'admin',
        created_at: new Date('2025-01-01'),
      }
    ];
  }

  private getMockFlashcards(setId: string): Flashcard[] {
    const mockData: { [key: string]: Flashcard[] } = {
      animals: [
        { id: '1', front_text: 'A _____ says "meow".', back_text: 'cat', order: 1, flashcard_set_id: setId },
        { id: '2', front_text: 'A _____ says "woof".', back_text: 'dog', order: 2, flashcard_set_id: setId },
        { id: '3', front_text: 'A _____ can fly.', back_text: 'bird', order: 3, flashcard_set_id: setId },
        { id: '4', front_text: 'A _____ lives in water.', back_text: 'fish', order: 4, flashcard_set_id: setId },
        { id: '5', front_text: 'A _____ has four legs.', back_text: 'dog', order: 5, flashcard_set_id: setId }
      ],
      colors: [
        { id: '6', front_text: 'The sky is _____ on a clear day.', back_text: 'blue', order: 6, flashcard_set_id: setId },
        { id: '7', front_text: 'Grass is _____.', back_text: 'green', order: 7, flashcard_set_id: setId },
        { id: '8', front_text: 'The sun is _____.', back_text: 'yellow', order: 8, flashcard_set_id: setId },
        { id: '9', front_text: 'Blood is _____.', back_text: 'red', order: 9, flashcard_set_id: setId },
        { id: '10', front_text: 'Snow is _____.', back_text: 'white', order: 10, flashcard_set_id: setId }
      ],
      numbers: [
        { id: '11', front_text: 'You have _____ fingers on one hand.', back_text: 'five', order: 11, flashcard_set_id: setId },
        { id: '12', front_text: 'There are _____ days in a week.', back_text: 'seven', order: 12, flashcard_set_id: setId },
        { id: '13', front_text: 'You have _____ eyes.', back_text: 'two', order: 13, flashcard_set_id: setId },
        { id: '14', front_text: 'A cat has _____ legs.', back_text: 'four', order: 14, flashcard_set_id: setId },
        { id: '15', front_text: 'There are _____ months in a year.', back_text: 'twelve', order: 15, flashcard_set_id: setId }
      ],
      shool_things: [
        { id: '16', front_text: 'We write with a _____.', back_text: 'pencil', order: 1, flashcard_set_id: setId },
        { id: '17', front_text: 'We sit on a _____.', back_text: 'chair', order: 2, flashcard_set_id: setId },
        { id: '18', front_text: 'We read _____.', back_text: 'books', order: 3, flashcard_set_id: setId },
        { id: '19', front_text: 'The teacher writes on the _____.', back_text: 'board', order: 4, flashcard_set_id: setId },
        { id: '20', front_text: 'We carry our books in a _____.', back_text: 'bag', order: 5, flashcard_set_id: setId }
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
