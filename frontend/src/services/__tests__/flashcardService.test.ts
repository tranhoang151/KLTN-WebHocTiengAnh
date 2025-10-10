import { flashcardService } from '../flashcardService';
import { apiService } from '../api';

// Mock the API service
jest.mock('../api', () => ({
    apiService: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    }
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('FlashcardService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getFlashcardSets', () => {
        it('fetches flashcard sets successfully', async () => {
            const mockSets = [
                {
                    id: 'set1',
                    title: 'Basic Greetings',
                    description: 'Common greeting phrases',
                    flashcardCount: 10,
                    difficulty: 'easy',
                    isPublic: true,
                    createdBy: 'teacher1',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            mockApiService.get.mockResolvedValue({
                success: true,
                data: mockSets
            });

            const result = await flashcardService.getAllFlashcardSets();

            expect(mockApiService.get).toHaveBeenCalledWith('/api/flashcard-sets');
            expect(result).toEqual(mockSets);
        });

        it('handles API error', async () => {
            mockApiService.get.mockResolvedValue({
                success: false,
                error: 'Failed to fetch flashcard sets'
            });

            await expect(flashcardService.getAllFlashcardSets()).rejects.toThrow(
                'Failed to fetch flashcard sets'
            );
        });

        it('fetches sets for specific user', async () => {
            const userId = 'user123';
            const mockSets = [];

            mockApiService.get.mockResolvedValue({
                success: true,
                data: mockSets
            });

            await flashcardService.getAllFlashcardSets();

            expect(mockApiService.get).toHaveBeenCalledWith(`/api/flashcard-sets?userId=${userId}`);
        });
    });

    describe('getFlashcardSet', () => {
        it('fetches single flashcard set', async () => {
            const setId = 'set1';
            const mockSet = {
                id: setId,
                title: 'Test Set',
                flashcards: [
                    {
                        id: 'card1',
                        front: 'Hello',
                        back: 'Xin chào',
                        setId: setId
                    }
                ]
            };

            mockApiService.get.mockResolvedValue({
                success: true,
                data: mockSet
            });

            const result = await flashcardService.getFlashcardsBySet(setId);

            expect(mockApiService.get).toHaveBeenCalledWith(`/api/flashcard-sets/${setId}`);
            expect(result).toEqual(mockSet);
        });

        it('handles not found error', async () => {
            mockApiService.get.mockResolvedValue({
                success: false,
                error: 'Flashcard set not found'
            });

            await expect(flashcardService.getFlashcardsBySet('nonexistent')).rejects.toThrow(
                'Flashcard set not found'
            );
        });
    });

    describe('createFlashcardSet', () => {
        it('creates new flashcard set', async () => {
            const newSet = {
                title: 'New Set',
                description: 'A new flashcard set',
                courseId: 'course123',
                assignedClassIds: ['class1', 'class2']
            };

            const createdSet = {
                id: 'new-set-id',
                ...newSet,
                created_by: 'teacher1',
                created_at: new Date(),
                set_id: 'new-set-id',
                is_active: true
            };

            mockApiService.post.mockResolvedValue({
                success: true,
                data: createdSet
            });

            const result = await flashcardService.createFlashcardSet(newSet);

            expect(mockApiService.post).toHaveBeenCalledWith('/flashcard/set', newSet);
            expect(result).toEqual(createdSet);
        });

        it('validates required fields', async () => {
            const invalidSet = {
                description: 'Missing title'
            };

            await expect(
                flashcardService.createFlashcardSet(invalidSet as any)
            ).rejects.toThrow('Title is required');
        });
    });

    describe('updateFlashcardSet', () => {
        it('updates existing flashcard set', async () => {
            const setId = 'set1';
            const updates = {
                title: 'Updated Title',
                description: 'Updated description',
                courseId: 'course123',
                assignedClassIds: ['class1']
            };

            const updatedSet = {
                id: setId,
                ...updates,
                created_by: 'teacher1',
                created_at: new Date(),
                set_id: setId,
                is_active: true
            };

            mockApiService.put.mockResolvedValue({
                success: true,
                data: updatedSet
            });

            const result = await flashcardService.updateFlashcardSet(setId, updates);

            expect(mockApiService.put).toHaveBeenCalledWith(`/flashcard/set/${setId}`, updates);
            expect(result).toEqual(updatedSet);
        });
    });

    describe('deleteFlashcardSet', () => {
        it('deletes flashcard set', async () => {
            const setId = 'set1';

            mockApiService.delete.mockResolvedValue({
                success: true
            });

            await flashcardService.deleteFlashcardSet(setId);

            expect(mockApiService.delete).toHaveBeenCalledWith(`/api/flashcard-sets/${setId}`);
        });

        it('handles delete error', async () => {
            mockApiService.delete.mockResolvedValue({
                success: false,
                error: 'Cannot delete set with flashcards'
            });

            await expect(flashcardService.deleteFlashcardSet('set1')).rejects.toThrow(
                'Cannot delete set with flashcards'
            );
        });
    });

    describe('getFlashcards', () => {
        it('fetches flashcards for a set', async () => {
            const setId = 'set1';
            const mockFlashcards = [
                {
                    id: 'card1',
                    front: 'Hello',
                    back: 'Xin chào',
                    setId: setId,
                    order: 0
                },
                {
                    id: 'card2',
                    front: 'Goodbye',
                    back: 'Tạm biệt',
                    setId: setId,
                    order: 1
                }
            ];

            mockApiService.get.mockResolvedValue({
                success: true,
                data: mockFlashcards
            });

            const result = await flashcardService.getFlashcardsBySet(setId);

            expect(mockApiService.get).toHaveBeenCalledWith(`/api/flashcard-sets/${setId}/flashcards`);
            expect(result).toEqual(mockFlashcards);
        });
    });

    describe('createFlashcard', () => {
        it('creates new flashcard', async () => {
            const setId = 'set1';
            const newCard = {
                frontText: 'New Card',
                backText: 'Thẻ mới',
                order: 0
            };

            const createdCard = {
                id: 'new-card-id',
                ...newCard,
                flashcard_set_id: setId,
                created_at: new Date(),
                updated_at: new Date()
            };

            mockApiService.post.mockResolvedValue({
                success: true,
                data: createdCard
            });

            const result = await flashcardService.createFlashcard(setId, newCard);

            expect(mockApiService.post).toHaveBeenCalledWith(
                `/flashcard/set/${setId}/card`,
                newCard
            );
            expect(result).toEqual(createdCard);
        });

        it('validates required fields', async () => {
            const invalidCard = {
                back: 'Missing front'
            };

            await expect(
                flashcardService.createFlashcard('set1', invalidCard as any)
            ).rejects.toThrow('Front text is required');
        });
    });

    describe('updateFlashcard', () => {
        it('updates existing flashcard', async () => {
            const cardId = 'card1';
            const updates = {
                frontText: "Updated Front", backText: "Updated Back", order: 0
            };

            const updatedCard = {
                id: cardId,
                ...updates,
                updatedAt: new Date()
            };

            mockApiService.put.mockResolvedValue({
                success: true,
                data: updatedCard
            });

            const result = await flashcardService.updateFlashcard(cardId, updates);

            expect(mockApiService.put).toHaveBeenCalledWith(`/api/flashcards/${cardId}`, updates);
            expect(result).toEqual(updatedCard);
        });
    });

    describe('deleteFlashcard', () => {
        it('deletes flashcard', async () => {
            const cardId = 'card1';

            mockApiService.delete.mockResolvedValue({
                success: true
            });

            await flashcardService.deleteFlashcard(cardId);

            expect(mockApiService.delete).toHaveBeenCalledWith(`/api/flashcards/${cardId}`);
        });
    });

    describe('assignFlashcardSet', () => {
        it('assigns flashcard set to classes', async () => {
            const setId = 'set1';
            const classIds = ['class1', 'class2'];

            mockApiService.put.mockResolvedValue({
                success: true
            });

            await flashcardService.assignFlashcardSet(setId, classIds);

            expect(mockApiService.put).toHaveBeenCalledWith(
                `/flashcard/set/${setId}/assign`,
                classIds
            );
        });
    });

    describe('getStudentProgress', () => {
        it('fetches student progress for flashcard set', async () => {
            const setId = 'set1';
            const studentId = 'student1';
            const mockProgress = {
                setId,
                studentId,
                completedCards: 5,
                totalCards: 10,
                accuracy: 0.8,
                timeSpent: 300,
                lastStudied: new Date()
            };

            mockApiService.get.mockResolvedValue({
                success: true,
                data: mockProgress
            });

            const result = await flashcardService.getProgress(setId, studentId);

            expect(mockApiService.get).toHaveBeenCalledWith(
                `/api/flashcard-sets/${setId}/progress/${studentId}`
            );
            expect(result).toEqual(mockProgress);
        });
    });

    describe('updateProgress', () => {
        it('updates student progress', async () => {
            const progressData = {
                userId: 'student1',
                setId: 'set1',
                courseId: 'course123',
                completionPercentage: 75,
                learnedCardIds: ['card1', 'card2'],
                timeSpent: 300
            };

            mockApiService.post.mockResolvedValue({
                success: true
            });

            await flashcardService.updateProgress(progressData);

            expect(mockApiService.post).toHaveBeenCalledWith(
                '/flashcard/progress',
                progressData
            );
        });
    });

    describe('getFlashcardSetsByCourse', () => {
        it('gets flashcard sets by course', async () => {
            const courseId = 'course123';
            const mockSets = [
                {
                    id: 'set1',
                    title: 'Basic Greetings',
                    description: 'Common greeting phrases',
                    course_id: courseId,
                    created_by: 'teacher1',
                    created_at: new Date(),
                    assigned_class_ids: ['class1'],
                    set_id: 'set1',
                    is_active: true
                }
            ];

            mockApiService.get.mockResolvedValue({
                success: true,
                data: mockSets
            });

            const result = await flashcardService.getFlashcardSetsByCourse(courseId);

            expect(mockApiService.get).toHaveBeenCalledWith(`/flashcard/sets/${courseId}`);
            expect(result).toEqual(mockSets);
        });
    });
});