import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { flashcardService } from '../../../services/flashcardService';
import {
    setupFirebaseEmulators,
    createTestUser,
    cleanupTestData,
    addToCleanup,
    testDb
} from '../setup';
import { doc, setDoc } from 'firebase/firestore';
import { authService } from '../../../services/authService';

// flashcardService is imported as singleton
// authService is imported as singleton

describe('FlashcardService Integration Tests', () => {
    let testUser: any;

    beforeEach(async () => {
        setupFirebaseEmulators();
        testUser = await createTestUser('teacher');
        await authService.signIn(testUser.email, testUser.password);
    });

    afterEach(async () => {
        await cleanupTestData();
        await authService.signOut();
    });

    describe('Flashcard Set Operations', () => {
        it('should create a new flashcard set successfully', async () => {
            // Arrange
            const setData = {
                title: 'Integration Test Set',
                description: 'Test set for integration testing',
                courseId: 'test-course'
            };

            // Act
            const result = await flashcardService.createFlashcardSet(setData);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.title).toBe(setData.title);
            expect(result.course_id).toBe(setData.courseId);

            // Cleanup
            addToCleanup('flashcard_sets', result.id);
        });

        it('should get flashcard sets by course', async () => {
            // Arrange
            const courseId = 'test-course-sets';
            const sets = [
                {
                    id: 'set1',
                    title: 'Set 1',
                    course_id: courseId,
                    description: 'Test set 1',
                    created_by: testUser.user.uid,
                    created_at: new Date(),
                    assigned_class_ids: [],
                    set_id: 'set1',
                    is_active: true
                },
                {
                    id: 'set2',
                    title: 'Set 2',
                    course_id: courseId,
                    description: 'Test set 2',
                    created_by: testUser.user.uid,
                    created_at: new Date(),
                    assigned_class_ids: [],
                    set_id: 'set2',
                    is_active: true
                }
            ];

            for (const set of sets) {
                await setDoc(doc(testDb, 'flashcard_sets', set.id), set);
                addToCleanup('flashcard_sets', set.id);
            }

            // Act
            const result = await flashcardService.getFlashcardSetsByCourse(courseId);

            // Assert
            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(result.every(set => set.course_id === courseId)).toBe(true);
        });

        it('should update flashcard set', async () => {
            // Arrange
            const setData = {
                id: 'update-test-set',
                title: 'Original Title',
                description: 'Original Description',
                course_id: 'test-course',
                created_at: new Date(),
                created_by: testUser.user.uid,
                assigned_class_ids: [],
                set_id: 'update-test-set',
                is_active: true
            };

            await setDoc(doc(testDb, 'flashcard_sets', setData.id), setData);
            addToCleanup('flashcard_sets', setData.id);

            const updates = {
                title: 'Updated Title',
                description: 'Updated Description',
                courseId: 'test-course'
            };

            // Act
            const result = await flashcardService.updateFlashcardSet(setData.id, updates);

            // Assert
            expect(result).toBeDefined();
            expect(result.title).toBe(updates.title);
            expect(result.description).toBe(updates.description);
        });
    });

    describe('Flashcard Operations', () => {
        it('should create flashcards in a set', async () => {
            // Arrange
            const setId = 'test-flashcard-set';
            const setData = {
                id: setId,
                title: 'Test Set',
                description: 'Test set for flashcards',
                course_id: 'test-course',
                created_at: new Date(),
                created_by: testUser.user.uid,
                assigned_class_ids: [],
                set_id: setId,
                is_active: true
            };

            await setDoc(doc(testDb, 'flashcard_sets', setId), setData);
            addToCleanup('flashcard_sets', setId);

            const cardData = {
                frontText: 'Hello',
                backText: 'Xin chào',
                order: 1
            };

            // Act
            const result = await flashcardService.createFlashcard(setId, cardData);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.front_text).toBe(cardData.frontText);
            expect(result.back_text).toBe(cardData.backText);

            // Cleanup
            addToCleanup('flashcards', result.id);
        });

        it('should get flashcards by set', async () => {
            // Arrange
            const setId = 'test-get-flashcards';
            const flashcards = [
                {
                    id: 'card1',
                    flashcard_set_id: setId,
                    front_text: 'Card 1',
                    back_text: 'Thẻ 1',
                    order: 1
                },
                {
                    id: 'card2',
                    flashcard_set_id: setId,
                    front_text: 'Card 2',
                    back_text: 'Thẻ 2',
                    order: 2
                }
            ];

            for (const card of flashcards) {
                await setDoc(doc(testDb, 'flashcards', card.id), card);
                addToCleanup('flashcards', card.id);
            }

            // Act
            const result = await flashcardService.getFlashcardsBySet(setId);

            // Assert
            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(result.every(card => card.flashcard_set_id === setId)).toBe(true);
        });

        it('should update flashcard', async () => {
            // Arrange
            const cardData = {
                id: 'update-card',
                flashcard_set_id: 'test-set',
                front_text: 'Original Front',
                back_text: 'Original Back',
                order: 1
            };

            await setDoc(doc(testDb, 'flashcards', cardData.id), cardData);
            addToCleanup('flashcards', cardData.id);

            const updates = {
                frontText: 'Updated Front',
                backText: 'Updated Back',
                order: 1
            };

            // Act
            const result = await flashcardService.updateFlashcard(cardData.id, updates);

            // Assert
            expect(result).toBeDefined();
            expect(result.front_text).toBe(updates.frontText);
            expect(result.back_text).toBe(updates.backText);
        });

        it('should delete flashcard', async () => {
            // Arrange
            const cardData = {
                id: 'delete-card',
                flashcard_set_id: 'test-set',
                front_text: 'To Delete',
                back_text: 'Sẽ xóa',
                order: 1
            };

            await setDoc(doc(testDb, 'flashcards', cardData.id), cardData);

            // Act
            await flashcardService.deleteFlashcard(cardData.id);

            // Assert - Verify deletion by trying to get the card
            const result = await flashcardService.getFlashcardsBySet('test-set');
            expect(result.find(card => card.id === cardData.id)).toBeUndefined();
        });
    });

    describe('Learning Progress', () => {
        it('should track learning progress', async () => {
            // Arrange
            const setId = 'progress-test-set';
            const progressData = {
                userId: testUser.user.uid,
                setId: setId,
                courseId: 'test-course',
                completionPercentage: 75,
                learnedCardIds: ['card1', 'card2', 'card3'],
                timeSpent: 300
            };

            // Act
            await flashcardService.updateProgress(progressData);

            // Assert - Verify by getting the progress back
            const result = await flashcardService.getProgress(testUser.user.uid, setId);
            expect(result).toBeDefined();
            expect(result?.userId).toBe(testUser.user.uid);
            expect(result?.completionPercentage).toBe(75);

            // Cleanup
            addToCleanup('flashcard_progress', `${testUser.user.uid}_${setId}`);
        });

        it('should get user progress', async () => {
            // Arrange
            const setId = 'get-progress-set';
            const progressData = {
                userId: testUser.user.uid,
                setId: setId,
                courseId: 'test-course',
                completionPercentage: 50,
                learnedCardIds: ['card1', 'card2'],
                timeSpent: 200
            };

            await flashcardService.updateProgress(progressData);
            addToCleanup('flashcard_progress', `${testUser.user.uid}_${setId}`);

            // Act
            const result = await flashcardService.getProgress(testUser.user.uid, setId);

            // Assert
            expect(result).toBeDefined();
            expect(result?.completionPercentage).toBe(50);
            expect(result?.learnedCardIds).toEqual(['card1', 'card2']);
        });
    });

    describe('Error Handling', () => {
        it('should handle unauthorized access', async () => {
            // Arrange
            await authService.signOut();

            // Act & Assert
            await expect(
                flashcardService.createFlashcardSet({
                    title: 'Test Set',
                    description: 'Test Description',
                    courseId: 'test-course'
                })
            ).rejects.toThrow();
        });

        it('should handle invalid data', async () => {
            // Act & Assert
            await expect(
                flashcardService.createFlashcardSet({
                    title: '', // Empty title should be invalid
                    description: '',
                    courseId: ''
                })
            ).rejects.toThrow();
        });

        it('should handle non-existent resources', async () => {
            // Act
            const result = await flashcardService.getFlashcardsBySet('non-existent-set');

            // Assert
            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });
    });
});