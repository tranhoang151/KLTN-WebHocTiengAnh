import React, { useState, useEffect, useCallback } from 'react';
import {
  Flashcard,
  FlashcardProgress,
  flashcardService,
} from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';
import { FlashcardProgressTracker, FlashcardSessionSummary } from '../progress';
import './FlashcardLearning.css';

interface FlashcardLearningProps {
  setId: string;
  courseId: string;
  setTitle?: string;
  onComplete?: (progress: FlashcardProgress) => void;
  onExit?: () => void;
}

const FlashcardLearning: React.FC<FlashcardLearningProps> = ({
  setId,
  courseId,
  setTitle = 'Flashcard Set',
  onComplete,
  onExit,
}) => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipAnimation, setFlipAnimation] = useState('');
  const [sessionStartTime] = useState(Date.now());
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [initialProgress, setInitialProgress] = useState(0);
  const [sessionStudiedCards, setSessionStudiedCards] = useState<Set<string>>(
    new Set()
  );
  const [initialLearnedCards, setInitialLearnedCards] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadFlashcards();
    loadProgress();
  }, [setId]);

  useEffect(() => {
    const cardId = flashcards[currentCard]?.id;
    if (cardId) {
      setSessionStudiedCards((prev) => new Set(prev).add(cardId));
    }
  }, [currentCard, flashcards]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const cards = await flashcardService.getFlashcardsBySetId(setId);
      setFlashcards(cards.sort((a, b) => a.order - b.order));
    } catch (err: any) {
      setError(err.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user) return;

    try {
      const progress = await flashcardService.getProgress(user.id, setId);
      if (progress) {
        const initialLearned = new Set(progress.learnedCardIds as string[]);
        setLearnedCards(initialLearned);
        setInitialLearnedCards(initialLearned);
        setInitialProgress(progress.completionPercentage);
      } else {
        setInitialLearnedCards(new Set());
        setInitialProgress(0);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  const flipCard = useCallback(() => {
    setFlipAnimation('flip-start');
    setTimeout(() => {
      setIsFlipped(!isFlipped);
      setFlipAnimation('flip-end');
    }, 150);
  }, [isFlipped]);

  const markAsLearned = useCallback(
    (learned: boolean) => {
      const currentCardId = flashcards[currentCard]?.id;
      if (!currentCardId) return;

      const newLearnedCards = new Set(learnedCards);
      if (learned) {
        newLearnedCards.add(currentCardId);
      } else {
        newLearnedCards.delete(currentCardId);
      }
      setLearnedCards(newLearnedCards);
      updateProgress(newLearnedCards);
    },
    [currentCard, flashcards, learnedCards]
  );

  const updateProgress = async (learned: Set<string>) => {
    if (!user) return;

    const progress: FlashcardProgress = {
      userId: user.id,
      flashcardSetId: setId,
      courseId,
      completionPercentage: Math.round(
        (learned.size / flashcards.length) * 100
      ),
      learnedCardIds: Array.from(learned),
      timeSpent: Math.floor((Date.now() - sessionStartTime) / 1000),
      totalSessions: 1,
      totalCardsStudied: learned.size,
      averageScore: Math.round((learned.size / flashcards.length) * 100),
      bestScore: Math.round((learned.size / flashcards.length) * 100),
      lastStudied: new Date(),
      streakCount: 1,
      masteredCards: Array.from(learned),
      needsReviewCards: [],
    };

    try {
      await flashcardService.updateProgress(progress);

      // Check if completed or significant progress made
      if (
        progress.completionPercentage === 100 ||
        progress.completionPercentage - initialProgress >= 20
      ) {
        // Show session summary
        const sessionEndTime = Date.now();
        const newlyLearnedCount = Array.from(learned).filter(
          (id) => !initialLearnedCards.has(id)
        ).length;
        const sessionSummary = {
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          cardsStudied: sessionStudiedCards.size,
          cardsLearned: newlyLearnedCount,
          previousProgress: initialProgress,
          currentProgress: progress.completionPercentage,
          timeSpent: Math.floor((sessionEndTime - sessionStartTime) / 1000),
        };

        setSessionData(sessionSummary);
        setShowSessionSummary(true);
      }

      onComplete?.(progress);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const navigateCard = (direction: 'prev' | 'next') => {
    setIsFlipped(false);
    setFlipAnimation('');

    if (direction === 'prev' && currentCard > 0) {
      setCurrentCard(currentCard - 1);
    } else if (direction === 'next' && currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const jumpToCard = (index: number) => {
    if (index >= 0 && index < flashcards.length) {
      setCurrentCard(index);
      setIsFlipped(false);
      setFlipAnimation('');
      setShowProgressTracker(false);
    }
  };

  const handleShowProgress = () => {
    setShowProgressTracker(!showProgressTracker);
  };

  const handleSessionSummaryClose = () => {
    setShowSessionSummary(false);
    onExit?.();
  };

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          flipCard();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigateCard('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateCard('next');
          break;
        case 'Escape':
          event.preventDefault();
          onExit?.();
          break;
      }
    },
    [flipCard, navigateCard, onExit]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (loading) {
    return (
      <div className="flashcard-loading">
        <div className="loading-spinner"></div>
        <p>Loading flashcards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Flashcards</h3>
        <p>{error}</p>
        <button onClick={onExit} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flashcard-empty">
        <div className="empty-icon">📚</div>
        <h3>No Flashcards Found</h3>
        <p>This set doesn't contain any flashcards yet.</p>
        <button onClick={onExit} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentCard];
  const isCurrentCardLearned = learnedCards.has(currentFlashcard?.id || '');
  const progressPercentage = Math.round(
    (learnedCards.size / flashcards.length) * 100
  );

  // Show session summary if available
  if (showSessionSummary && sessionData) {
    return (
      <div className="flashcard-learning">
        <FlashcardSessionSummary
          sessionData={sessionData}
          flashcardSetTitle={setTitle}
          totalCards={flashcards.length}
          onContinue={() => setShowSessionSummary(false)}
          onExit={handleSessionSummaryClose}
        />
      </div>
    );
  }

  return (
    <div className="flashcard-learning">
      {/* Header */}
      <div className="flashcard-header">
        <button onClick={onExit} className="btn-back">
          ← Back
        </button>
        <div className="progress-info">
          <span className="card-counter">
            {currentCard + 1} / {flashcards.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="progress-text">{progressPercentage}% learned</span>
        </div>
        <button onClick={handleShowProgress} className="btn-progress">
          📊 Progress
        </button>
      </div>

      {/* Progress Tracker */}
      {showProgressTracker && (
        <div className="progress-tracker-container">
          <FlashcardProgressTracker
            flashcards={flashcards}
            learnedCards={learnedCards}
            currentCardIndex={currentCard}
            onCardClick={jumpToCard}
            showDetails={true}
          />
        </div>
      )}

      {/* Main Flashcard */}
      <div className="flashcard-container">
        <div
          className={`flashcard ${flipAnimation} ${isFlipped ? 'flipped' : ''}`}
          onClick={flipCard}
        >
          <div className="flashcard-face flashcard-front">
            <div className="card-content">
              {currentFlashcard?.imageUrl && (
                <div className="card-image">
                  <img
                    src={currentFlashcard.imageUrl}
                    alt="flashcard visual"
                    onError={(e) => {
                      // Fallback to base64 if URL fails
                      if (currentFlashcard.imageBase64) {
                        (e.target as HTMLImageElement).src =
                          `data:image/jpeg;base64,${currentFlashcard.imageBase64}`;
                      }
                    }}
                  />
                </div>
              )}
              {currentFlashcard?.imageBase64 &&
                !currentFlashcard?.imageUrl && (
                  <div className="card-image">
                    <img
                      src={`data:image/jpeg;base64,${currentFlashcard.imageBase64}`}
                      alt="flashcard visual"
                    />
                  </div>
                )}
              <div className="card-text">{currentFlashcard?.frontText}</div>
              <div className="flip-hint">Click to flip</div>
            </div>
          </div>

          <div className="flashcard-face flashcard-back">
            <div className="card-content">
              <div className="card-text main-text">
                {currentFlashcard?.backText}
              </div>
              {currentFlashcard?.exampleSentence && (
                <div className="example-sentence">
                  <em>"{currentFlashcard.exampleSentence}"</em>
                </div>
              )}
              <div className="flip-hint">Click to flip back</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flashcard-controls">
        {/* Navigation */}
        <div className="navigation-controls">
          <button
            onClick={() => navigateCard('prev')}
            disabled={currentCard === 0}
            className="btn-nav"
          >
            ← Previous
          </button>

          <button
            onClick={() => navigateCard('next')}
            disabled={currentCard === flashcards.length - 1}
            className="btn-nav"
          >
            Next →
          </button>
        </div>

        {/* Learning Controls */}
        <div className="learning-controls">
          <button
            onClick={() => markAsLearned(false)}
            className={`btn-learning ${!isCurrentCardLearned ? 'active' : ''}`}
          >
            😕 Need Practice
          </button>

          <button
            onClick={() => markAsLearned(true)}
            className={`btn-learning ${isCurrentCardLearned ? 'active' : ''}`}
          >
            😊 Got It!
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="keyboard-shortcuts">
        <small>
          <strong>Shortcuts:</strong> Space/Enter = Flip | ← → = Navigate | Esc
          = Exit
        </small>
      </div>
    </div>
  );
};

export default FlashcardLearning;
