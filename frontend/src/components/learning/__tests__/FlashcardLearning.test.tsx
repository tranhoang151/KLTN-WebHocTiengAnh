import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlashcardLearning from '../FlashcardLearning';
import { flashcardService } from '../../../services/flashcardService';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the services and contexts
jest.mock('../../../services/flashcardService', () => ({
    flashcardService: {
        getFlashcardsBySetId: jest.fn(),
        getFlashcardProgress: jest.fn(),
        updateFlashcardProgress: jest.fn(),
        createFlashcardSet: jest.fn(),
        updateFlashcardSet: jest.fn(),
        deleteFlashcardSet: jest.fn(),
        getFlashcardSets: jest.fn(),
    }
}));
jest.mock('../../../contexts/AuthContext');

const mockFlashcardService = require('../../../services/flashcardService').flashcardService;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockFlashcards = [
    {
        id: '1',
        front: 'Hello',
        back: 'Xin chào',
        setId: 'set1',
        order: 0,
        difficulty: 'easy' as const,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        front: 'Goodbye',
        back: 'Tạm biệt',
        setId: 'set1',
        order: 1,
        difficulty: 'medium' as const,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const mockUser = {
    id: 'user1',
    full_name: 'Test User',
    email: 'test@example.com',
    role: 'student' as const,
    gender: 'other',
    streak_count: 0,
    last_login_date: new Date().toISOString(),
    badges: {},
};

describe('FlashcardLearning', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
            login: jest.fn(),
            logout: jest.fn(),
            isAuthenticated: true,
            getAuthToken: jest.fn(),
        });

        mockFlashcardService.getFlashcardsBySetId.mockResolvedValue(mockFlashcards);
        mockFlashcardService.getFlashcardProgress.mockResolvedValue({
            userId: 'user1',
            setId: 'set1',
            learnedCards: [],
            totalCards: 2,
            completionPercentage: 0,
            lastStudied: new Date(),
            studyStreak: 0,
        });
    });

    it('renders loading state initially', () => {
        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
            />
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('loads and displays flashcards', async () => {
        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        expect(mockFlashcardService.getFlashcardsBySetId).toHaveBeenCalledWith('set1');
        expect(screen.getByText('Test Set')).toBeInTheDocument();
    });

    it('flips card when clicked', async () => {
        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        const card = screen.getByText('Hello').closest('.flashcard');
        expect(card).toBeInTheDocument();

        fireEvent.click(card!);

        await waitFor(() => {
            expect(screen.getByText('Xin chào')).toBeInTheDocument();
        });
    });

    it('navigates to next card', async () => {
        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Goodbye')).toBeInTheDocument();
        });
    });

    it('navigates to previous card', async () => {
        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        // Go to next card first
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Goodbye')).toBeInTheDocument();
        });

        // Go back to previous card
        const prevButton = screen.getByRole('button', { name: /previous/i });
        fireEvent.click(prevButton);

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });
    });

    it('marks card as learned', async () => {
        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        const learnedButton = screen.getByRole('button', { name: /learned/i });
        fireEvent.click(learnedButton);

        // Should update progress
        expect(mockFlashcardService.updateFlashcardProgress).toHaveBeenCalled();
    });

    it('handles error state', async () => {
        mockFlashcardService.getFlashcardsBySetId.mockRejectedValue(
            new Error('Failed to load flashcards')
        );

        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });

    it('calls onComplete when session is finished', async () => {
        const onComplete = jest.fn();

        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
                onComplete={onComplete}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        // Mark all cards as learned
        const learnedButton = screen.getByRole('button', { name: /learned/i });
        fireEvent.click(learnedButton);

        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Goodbye')).toBeInTheDocument();
        });

        fireEvent.click(learnedButton);

        // Should call onComplete
        await waitFor(() => {
            expect(onComplete).toHaveBeenCalled();
        });
    });

    it('calls onExit when exit button is clicked', async () => {
        const onExit = jest.fn();

        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
                onExit={onExit}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        const exitButton = screen.getByRole('button', { name: /exit/i });
        fireEvent.click(exitButton);

        expect(onExit).toHaveBeenCalled();
    });

    it('displays progress information', async () => {
        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        // Should show card counter
        expect(screen.getByText(/1.*of.*2/)).toBeInTheDocument();
    });

    it('handles keyboard navigation', async () => {
        render(
            <FlashcardLearning
                setId="set1"
                courseId="course1"
                setTitle="Test Set"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        // Test space key for flipping
        fireEvent.keyDown(document, { key: ' ', code: 'Space' });

        await waitFor(() => {
            expect(screen.getByText('Xin chào')).toBeInTheDocument();
        });

        // Test arrow keys for navigation
        fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });

        await waitFor(() => {
            expect(screen.getByText('Goodbye')).toBeInTheDocument();
        });
    });
});