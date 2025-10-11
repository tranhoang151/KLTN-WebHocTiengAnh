import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import { Flashcard, FlashcardSession } from '../../types/flashcard';
import './FlashcardLearningPage.css';

const FlashcardLearningPage: React.FC = () => {
    const { setId } = useParams<{ setId: string }>();
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [session, setSession] = useState<FlashcardSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState<Date>(new Date());

    useEffect(() => {
        loadFlashcards();
        initializeSession();
    }, [setId]);

    const loadFlashcards = async () => {
        try {
            const response = await flashcardService.getFlashcardsBySetId(setId || 'animals');
            setFlashcards(response);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load flashcards:', error);
            setLoading(false);
        }
    };

    const initializeSession = () => {
        if (!setId) return;

        const newSession: FlashcardSession = {
            id: `session_${Date.now()}`,
            flashcardSetId: setId,
            userId: 'current-user',
            startTime: new Date(),
            currentIndex: 0,
            totalCards: 0,
            correctAnswers: 0,
            responses: [],
            completed: false
        };
        setSession(newSession);
        setStartTime(new Date());
    };

    const handleCardFlip = () => {
        setIsFlipped(!isFlipped);
        setShowAnswer(!showAnswer);
    };

    const handleNextCard = () => {
        if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setIsFlipped(false);
            setShowAnswer(false);
        }
    };

    const handlePreviousCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setIsFlipped(false);
            setShowAnswer(false);
        }
    };

    const handleKnowCard = () => {
        const currentCard = flashcards[currentCardIndex];
        const timeSpent = (new Date().getTime() - startTime.getTime()) / 1000;

        if (session) {
            setSession({
                ...session,
                correctAnswers: session.correctAnswers + 1,
                responses: [...session.responses, {
                    cardId: currentCard.id,
                    userAnswer: 'known',
                    isCorrect: true,
                    timeSpent,
                    timestamp: new Date()
                }]
            });
        }

        alert('Great! Card marked as known.');
        handleNextCard();
    };

    const handleDontKnowCard = () => {
        const currentCard = flashcards[currentCardIndex];
        const timeSpent = (new Date().getTime() - startTime.getTime()) / 1000;

        if (session) {
            setSession({
                ...session,
                responses: [...session.responses, {
                    cardId: currentCard.id,
                    userAnswer: 'unknown',
                    isCorrect: false,
                    timeSpent,
                    timestamp: new Date()
                }]
            });
        }

        alert('Card marked for review later.');
        handleNextCard();
    };

    const handleRestartSession = () => {
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowAnswer(false);
        setStartTime(new Date());
        initializeSession();
        alert('Session restarted!');
    };

    const handleEndSession = async () => {
        if (!session) return;

        try {
            await flashcardService.endSession(session.id);
            alert(`Session completed! Score: ${session.correctAnswers}/${flashcards.length}`);
            navigate('/student/progress');
        } catch (error) {
            alert('Failed to save session results');
        }
    };

    const getProgressPercentage = () => {
        if (flashcards.length === 0) return 0;
        return ((currentCardIndex + 1) / flashcards.length) * 100;
    };

    const getScorePercentage = () => {
        if (session && flashcards.length > 0) {
            return (session.correctAnswers / flashcards.length) * 100;
        }
        return 0;
    };

    if (loading) {
        return (
            <div className="flashcard-learning-container">
                <div className="loading-container">
                    <p>Loading flashcards...</p>
                </div>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="flashcard-learning-container">
                <div className="no-cards-card">
                    <h3>No Flashcards Available</h3>
                    <p>There are no flashcards in this set yet.</p>
                </div>
            </div>
        );
    }

    const currentCard = flashcards[currentCardIndex];
    const isLastCard = currentCardIndex === flashcards.length - 1;
    const isFirstCard = currentCardIndex === 0;

    return (
        <div className="flashcard-learning-container">
            {/* Header with progress */}
            <div className="session-header">
                <div className="session-info">
                    <h4>Flashcard Practice</h4>
                    <div className="progress-info">
                        <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="session-stats">
                    <span>Score: {session?.correctAnswers || 0}/{flashcards.length}</span>
                    <div className="score-circle">
                        <span>{Math.round(getScorePercentage())}%</span>
                    </div>
                </div>
            </div>

            {/* Main flashcard */}
            <div className="flashcard-area">
                <div
                    className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                    onClick={handleCardFlip}
                >
                    <div className="flashcard-inner">
                        <div className="flashcard-front">
                            <div className="card-content">
                                <p className="card-text">{currentCard.frontText}</p>
                                <p className="tap-hint">Tap to reveal answer</p>
                            </div>
                        </div>
                        <div className="flashcard-back">
                            <div className="card-content">
                                <p className="card-text answer">{currentCard.backText}</p>
                                <p className="difficulty">
                                    Order: {currentCard.order}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card navigation */}
                <div className="card-navigation">
                    <button
                        className="nav-button"
                        onClick={handlePreviousCard}
                        disabled={isFirstCard}
                    >
                        ← Previous
                    </button>

                    <div className="action-buttons">
                        <button
                            className="action-button know-button"
                            onClick={handleKnowCard}
                        >
                            ✓ I Know This
                        </button>
                        <button
                            className="action-button review-button"
                            onClick={handleDontKnowCard}
                        >
                            ✗ Need Review
                        </button>
                    </div>

                    <button
                        className="nav-button"
                        onClick={handleNextCard}
                        disabled={isLastCard}
                    >
                        Next →
                    </button>
                </div>
            </div>

            {/* Session controls */}
            <div className="session-controls">
                <button
                    className="control-button"
                    onClick={handleRestartSession}
                >
                    🔄 Restart Session
                </button>
                <button
                    className="control-button primary"
                    onClick={handleEndSession}
                >
                    🏁 End Session
                </button>
            </div>
        </div>
    );
};

export default FlashcardLearningPage;