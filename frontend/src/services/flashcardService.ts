import { apiService } from './apiService';

const API_URL = '/api/Flashcard';

// ============================================================================
// Type Definitions
// ============================================================================

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  courseId: string;
  cardCount?: number; // Optional, might be added from backend
  progress?: number; // Optional, user's progress percentage
}

export interface Flashcard {
  id: string;
  flashcardSetId: string;
  frontText: string;
  backText: string;
  exampleSentence?: string;
  imageUrl?: string;
  imageBase64?: string;
  order: number;
}

export interface FlashcardProgress {
  userId: string;
  setId: string;
  knownCardIds: string[];
  unknownCardIds: string[];
  completionPercentage: number;
  lastStudied: string;
  timeSpent: number; // in seconds
}

// ============================================================================
// Service Functions
// ============================================================================

const createAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
});

/**
 * Fetches all flashcard sets for a given course.
 */
const getFlashcardSets = async (courseId: string, token: string): Promise<FlashcardSet[]> => {
  return apiService.get(`${API_URL}/sets/${courseId}`, {
    headers: createAuthHeaders(token),
  });
};

/**
 * Fetches all flashcards for a specific set.
 */
const getFlashcards = async (setId: string, token: string): Promise<Flashcard[]> => {
  return apiService.get(`${API_URL}/set/${setId}/cards`, {
    headers: createAuthHeaders(token),
  });
};

/**
 * Retrieves a user's progress for a specific flashcard set.
 */
const getFlashcardProgress = async (userId: string, setId: string, token: string): Promise<FlashcardProgress> => {
  return apiService.get(`${API_URL}/progress/${userId}/${setId}`, {
    headers: createAuthHeaders(token),
  });
};

/**
 * Updates a user's progress on a flashcard set.
 */
const updateFlashcardProgress = async (progress: Partial<FlashcardProgress>, token: string) => {
  return apiService.post(`${API_URL}/progress`, progress, {
    headers: createAuthHeaders(token),
  });
};

// ============================================================================
// Export Service
// ============================================================================

export const flashcardService = {
  getFlashcardSets,
  getFlashcards,
  getFlashcardProgress,
  updateFlashcardProgress,
};