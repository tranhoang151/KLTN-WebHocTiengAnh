import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import '../jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import App from '../../../App';
import {
    setupFirebaseEmulators,
    createTestUser,
    cleanupTestData,
    createTestFlashcard,
    createTestCourse,
    addToCleanup,
    testDb
} from '../setup';
import { doc, setDoc } from 'firebase/firestore';

// Mock components that might cause issues in testing
jest.mock('../../../components/learning/FlashcardLearning', () => {
    return function MockFlashcardLearning({ flashcards, onComplete }: any) {
        return React.createElement('div', { 'data-testid': 'flashcard-learning' }, [
            React.createElement('h2', { key: 'title' }, 'Learning Flashcards'),
            React.createElement('div', {
                key: 'count',
                'data-testid': 'flashcard-count'
            }, `${flashcards?.length || 0} flashcards`),
            React.createElement('button', {
                key: 'complete',
                onClick: () => onComplete?.({ correct: 8, total: 10 })
            }, 'Complete Learning')
        ]);
    };
});

const renderApp = () => {
    return render(
        React.createElement(BrowserRouter, null,
            React.createElement(AuthProvider, null,
                React.createElement(App)
            )
        )
    );
};

describe('Student Learning Workflow Integration Tests', () => {
    let testStudent: any;
    let testCourse: any;
    let testFlashcards: any[];

    beforeEach(async () => {
        setupFirebaseEmulators();

        // Create test student
        testStudent = await createTestUser('student');

        // Create test course
        testCourse = createTestCourse({
            name: 'Integration Test Course',
            description: 'Course for integration testing'
        });
        await setDoc(doc(testDb, 'courses', testCourse.id), testCourse);
        addToCleanup('courses', testCourse.id);

        // Create test flashcards
        testFlashcards = [
            createTestFlashcard({
                courseId: testCourse.id,
                front: 'Hello',
                back: 'Xin chào'
            }),
            createTestFlashcard({
                courseId: testCourse.id,
                front: 'Goodbye',
                back: 'Tạm biệt'
            }),
            createTestFlashcard({
                courseId: testCourse.id,
                front: 'Thank you',
                back: 'Cảm ơn'
            })
        ];

        for (const flashcard of testFlashcards) {
            await setDoc(doc(testDb, 'flashcards', flashcard.id), flashcard);
            addToCleanup('flashcards', flashcard.id);
        }
    });

    afterEach(async () => {
        await cleanupTestData();
    });

    describe('Complete Student Learning Journey', () => {
        it('should allow student to login, select course, learn flashcards, and view progress', async () => {
            renderApp();

            // Step 1: Student Login
            await waitFor(() => {
                expect(screen.getByText(/login/i)).toBeTruthy();
            });

            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/password/i);
            const loginButton = screen.getByRole('button', { name: /login/i });

            await userEvent.type(emailInput, testStudent.email);
            await userEvent.type(passwordInput, testStudent.password);
            await userEvent.click(loginButton);

            // Step 2: Navigate to Student Dashboard
            await waitFor(() => {
                expect(screen.getByText(/student dashboard/i)).toBeTruthy();
            });

            // Step 3: Select Course for Learning
            const courseCard = await screen.findByText(testCourse.name);
            expect(courseCard).toBeTruthy();

            await userEvent.click(courseCard);

            // Step 4: Start Flashcard Learning
            await waitFor(() => {
                expect(screen.getByText(/start learning/i)).toBeTruthy();
            });

            const startLearningButton = screen.getByText(/start learning/i);
            await userEvent.click(startLearningButton);

            // Step 5: Complete Flashcard Learning Session
            await waitFor(() => {
                expect(screen.getByTestId('flashcard-learning')).toBeTruthy();
            });

            expect(screen.getByTestId('flashcard-count').textContent).toContain('3 flashcards');

            const completeButton = screen.getByText(/complete learning/i);
            await userEvent.click(completeButton);

            // Step 6: View Learning Results
            await waitFor(() => {
                expect(screen.getByText(/learning complete/i)).toBeTruthy();
            });

            expect(screen.getByText(/8.*10/)).toBeTruthy(); // Score display

            // Step 7: Navigate to Progress Dashboard
            const progressButton = screen.getByText(/view progress/i);
            await userEvent.click(progressButton);

            await waitFor(() => {
                expect(screen.getByText(/learning progress/i)).toBeTruthy();
            });

            // Verify progress is displayed
            expect(screen.getByText(/recent activity/i)).toBeTruthy();
        });

        it('should handle flashcard learning with different difficulty levels', async () => {

            // Create flashcards with different difficulties
            const difficultyFlashcards = [
                createTestFlashcard({
                    courseId: testCourse.id,
                    difficulty: 'beginner',
                    front: 'Easy Card'
                }),
                createTestFlashcard({
                    courseId: testCourse.id,
                    difficulty: 'intermediate',
                    front: 'Medium Card'
                }),
                createTestFlashcard({
                    courseId: testCourse.id,
                    difficulty: 'advanced',
                    front: 'Hard Card'
                })
            ];

            for (const flashcard of difficultyFlashcards) {
                await setDoc(doc(testDb, 'flashcards', flashcard.id), flashcard);
                addToCleanup('flashcards', flashcard.id);
            }

            renderApp();

            // Login
            await waitFor(() => {
                expect(screen.getByText(/login/i)).toBeTruthy();
            });

            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/password/i);
            const loginButton = screen.getByRole('button', { name: /login/i });

            await userEvent.type(emailInput, testStudent.email);
            await userEvent.type(passwordInput, testStudent.password);
            await userEvent.click(loginButton);

            // Navigate to course
            await waitFor(() => {
                expect(screen.getByText(testCourse.name)).toBeTruthy();
            });

            await userEvent.click(screen.getByText(testCourse.name));

            // Select difficulty level
            await waitFor(() => {
                expect(screen.getByText(/select difficulty/i)).toBeTruthy();
            });

            const beginnerButton = screen.getByText(/beginner/i);
            await userEvent.click(beginnerButton);

            // Start learning
            const startButton = screen.getByText(/start learning/i);
            await userEvent.click(startButton);

            // Verify only beginner flashcards are loaded
            await waitFor(() => {
                expect(screen.getByTestId('flashcard-learning')).toBeTruthy();
            });

            // Should show only beginner flashcards (1 + original 3 = 4 total, but filtered to 1)
            expect(screen.getByTestId('flashcard-count')).toContain('1 flashcards');
        });
    });

    describe('Progress Tracking Workflow', () => {
        it('should track and display learning streaks', async () => {
            renderApp();

            // Login
            await waitFor(() => {
                expect(screen.getByText(/login/i)).toBeTruthy();
            });

            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/password/i);
            const loginButton = screen.getByRole('button', { name: /login/i });

            await userEvent.type(emailInput, testStudent.email);
            await userEvent.type(passwordInput, testStudent.password);
            await userEvent.click(loginButton);

            // Navigate to progress page
            await waitFor(() => {
                expect(screen.getByText(/progress/i)).toBeTruthy();
            });

            const progressLink = screen.getByText(/progress/i);
            await userEvent.click(progressLink);

            // Check streak display
            await waitFor(() => {
                expect(screen.getByText(/learning streak/i)).toBeTruthy();
            });

            expect(screen.getByText(/0 days/i)).toBeTruthy(); // New user, no streak yet
        });

        it('should show badge achievements', async () => {

            // Create test badge
            const testBadge = {
                id: 'first-lesson-badge',
                name: 'First Lesson',
                description: 'Complete your first lesson',
                iconUrl: 'badge-icon.png',
                userId: testStudent.user.uid,
                earnedAt: new Date(),
                category: 'learning'
            };

            await setDoc(doc(testDb, 'user_badges', testBadge.id), testBadge);
            addToCleanup('user_badges', testBadge.id);

            renderApp();

            // Login
            await waitFor(() => {
                expect(screen.getByText(/login/i)).toBeTruthy();
            });

            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/password/i);
            const loginButton = screen.getByRole('button', { name: /login/i });

            await userEvent.type(emailInput, testStudent.email);
            await userEvent.type(passwordInput, testStudent.password);
            await userEvent.click(loginButton);

            // Navigate to achievements
            await waitFor(() => {
                expect(screen.getByText(/achievements/i)).toBeTruthy();
            });

            const achievementsLink = screen.getByText(/achievements/i);
            await userEvent.click(achievementsLink);

            // Check badge display
            await waitFor(() => {
                expect(screen.getByText(testBadge.name)).toBeTruthy();
            });

            expect(screen.getByText(testBadge.description)).toBeTruthy();
        });
    });

    describe('Error Handling in Workflows', () => {
        it('should handle network errors gracefully during learning', async () => {

            // Mock network error
            const originalFetch = global.fetch;
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            renderApp();

            // Login
            await waitFor(() => {
                expect(screen.getByText(/login/i)).toBeTruthy();
            });

            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/password/i);
            const loginButton = screen.getByRole('button', { name: /login/i });

            await userEvent.type(emailInput, testStudent.email);
            await userEvent.type(passwordInput, testStudent.password);
            await userEvent.click(loginButton);

            // Try to load course (should show error)
            await waitFor(() => {
                expect(screen.getByText(/error loading/i)).toBeTruthy();
            });

            // Restore fetch
            global.fetch = originalFetch;
        });

        it('should handle offline mode during learning', async () => {

            // Mock offline mode
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            renderApp();

            // Should show offline indicator
            await waitFor(() => {
                expect(screen.getByText(/offline/i)).toBeTruthy();
            });

            // Restore online mode
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: true
            });
        });
    });

    describe('Accessibility in Workflows', () => {
        it('should support keyboard navigation through learning workflow', async () => {
            renderApp();

            // Login with keyboard
            await waitFor(() => {
                expect(screen.getByText(/login/i)).toBeTruthy();
            });

            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/password/i);

            // Tab navigation
            emailInput.focus();
            fireEvent.keyDown(emailInput, { key: 'Tab' });
            expect(passwordInput).toBeTruthy();

            // Enter to submit
            fireEvent.change(emailInput, { target: { value: testStudent.email } });
            fireEvent.change(passwordInput, { target: { value: testStudent.password } });
            fireEvent.keyDown(passwordInput, { key: 'Enter' });

            // Should navigate to dashboard
            await waitFor(() => {
                expect(screen.getByText(/student dashboard/i)).toBeTruthy();
            });
        });

        it('should provide screen reader support', async () => {
            renderApp();

            // Check for ARIA labels
            await waitFor(() => {
                expect(screen.getByLabelText(/email/i)).toBeTruthy();
            });

            const emailInput = screen.getByLabelText(/email/i);
            expect(emailInput).toContain('aria-label');
        });
    });
});
