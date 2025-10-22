import React, { useState, useEffect, useCallback } from 'react';
import {
  Flashcard,
  FlashcardProgress,
  flashcardService,
} from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';
import { FlashcardProgressTracker, FlashcardSessionSummary } from '../progress';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  AlertTriangle,
  Loader2,
  Frown,
  Smile,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
      setFlipAnimation('');
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
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '400px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Loader2
              size={40}
              color="white"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            Loading Flashcards
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
              lineHeight: '1.6',
            }}
          >
            Please wait while we load your flashcards...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle size={40} color="white" />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            Error Loading Flashcards
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6',
            }}
          >
            {error}
          </p>
          <button
            onClick={onExit}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              color: '#374151',
              padding: '14px 24px',
              borderRadius: '12px',
              border: '1px solid #d1d5db',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #e5e7eb, #d1d5db)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
            }}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
            }}
          >
            <BookOpen size={40} color="white" />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            No Flashcards Found
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6',
            }}
          >
            This set doesn't contain any flashcards yet.
          </p>
          <button
            onClick={onExit}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              color: '#374151',
              padding: '14px 24px',
              borderRadius: '12px',
              border: '1px solid #d1d5db',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #e5e7eb, #d1d5db)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
            }}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
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
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes flip {
            0% { transform: rotateY(0deg); }
            50% { transform: rotateY(90deg); }
            100% { transform: rotateY(0deg); }
          }
          .flip-animation {
            animation: flip 0.6s ease-in-out;
          }
        `}
      </style>
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '20px 32px',
              marginBottom: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              onClick={onExit}
              style={{
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                color: '#374151',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #e5e7eb, #d1d5db)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
              }}
            >
              <ArrowLeft size={20} />
              Back
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {currentCard + 1} / {flashcards.length}
              </span>
              <div
                style={{
                  width: '200px',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progressPercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#6b7280',
                }}
              >
                {progressPercentage}% learned
              </span>
            </div>

            <button
              onClick={handleShowProgress}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(124, 58, 237, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 15px rgba(124, 58, 237, 0.3)';
              }}
            >
              <BarChart3 size={20} />
              Progress
            </button>
          </div>

          {/* Progress Tracker */}
          {showProgressTracker && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '600px',
                height: '400px',
                perspective: '1000px',
                cursor: 'pointer',
              }}
              onClick={flipCard}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.6s ease-in-out',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front Face */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  {currentFlashcard?.imageUrl && (
                    <div
                      style={{
                        width: '320px',
                        height: '320px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        marginBottom: '15px',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <img
                        src={currentFlashcard.imageUrl}
                        alt="flashcard visual"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
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
                      <div
                        style={{
                          width: '320px',
                          height: '240px',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          marginBottom: '24px',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <img
                          src={`data:image/jpeg;base64,${currentFlashcard.imageBase64}`}
                          alt="flashcard visual"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    )}
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '16px',
                    }}
                  >
                    {currentFlashcard?.frontText}
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#6b7280',
                      fontStyle: 'italic',
                    }}
                  >
                    Click to flip
                  </div>
                </div>

                {/* Back Face */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '36px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '20px',
                    }}
                  >
                    {currentFlashcard?.backText}
                  </div>
                  {currentFlashcard?.exampleSentence && (
                    <div
                      style={{
                        fontSize: '20px',
                        color: '#6b7280',
                        fontStyle: 'italic',
                        marginBottom: '20px',
                        padding: '16px 24px',
                        background: 'rgba(107, 114, 128, 0.1)',
                        borderRadius: '12px',
                        lineHeight: '1.4',
                      }}
                    >
                      "{currentFlashcard.exampleSentence}"
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#6b7280',
                      fontStyle: 'italic',
                    }}
                  >
                    Click to flip back
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Navigation */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <button
                onClick={() => navigateCard('prev')}
                disabled={currentCard === 0}
                style={{
                  background:
                    currentCard === 0
                      ? 'rgba(107, 114, 128, 0.2)'
                      : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  color: currentCard === 0 ? '#9ca3af' : '#374151',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: currentCard === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: currentCard === 0 ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (currentCard !== 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentCard !== 0) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                  }
                }}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <button
                onClick={() => navigateCard('next')}
                disabled={currentCard === flashcards.length - 1}
                style={{
                  background:
                    currentCard === flashcards.length - 1
                      ? 'rgba(107, 114, 128, 0.2)'
                      : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color:
                    currentCard === flashcards.length - 1 ? '#9ca3af' : 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor:
                    currentCard === flashcards.length - 1
                      ? 'not-allowed'
                      : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: currentCard === flashcards.length - 1 ? 0.5 : 1,
                  boxShadow:
                    currentCard === flashcards.length - 1
                      ? 'none'
                      : '0 4px 15px rgba(59, 130, 246, 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (currentCard !== flashcards.length - 1) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentCard !== flashcards.length - 1) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Learning Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <button
                onClick={() => markAsLearned(false)}
                style={{
                  background: !isCurrentCardLearned
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  color: !isCurrentCardLearned ? 'white' : '#374151',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: !isCurrentCardLearned
                    ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  if (!isCurrentCardLearned) {
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(239, 68, 68, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (!isCurrentCardLearned) {
                    e.currentTarget.style.boxShadow =
                      '0 4px 15px rgba(239, 68, 68, 0.3)';
                  }
                }}
              >
                <Frown size={20} />
                Need Practice
              </button>

              <button
                onClick={() => markAsLearned(true)}
                style={{
                  background: isCurrentCardLearned
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  color: isCurrentCardLearned ? 'white' : '#374151',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isCurrentCardLearned
                    ? '0 4px 15px rgba(16, 185, 129, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  if (isCurrentCardLearned) {
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (isCurrentCardLearned) {
                    e.currentTarget.style.boxShadow =
                      '0 4px 15px rgba(16, 185, 129, 0.3)';
                  }
                }}
              >
                <Smile size={20} />
                Got It!
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            <small
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
              }}
            >
              <strong>Shortcuts:</strong> Space/Enter = Flip | ← → = Navigate |
              Esc = Exit
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlashcardLearning;
