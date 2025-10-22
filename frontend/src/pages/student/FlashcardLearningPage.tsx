import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import { Flashcard, FlashcardSession } from '../../types';
import { BackButton } from '../../components/BackButton';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Flag,
  Home,
  BarChart3,
  Clock,
  Target,
} from 'lucide-react';
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
      const response = await flashcardService.getFlashcardsBySetId(
        setId || 'animals'
      );
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
      completed: false,
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
        responses: [
          ...session.responses,
          {
            cardId: currentCard.id,
            userAnswer: 'known',
            isCorrect: true,
            timeSpent,
            timestamp: new Date(),
          },
        ],
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
        responses: [
          ...session.responses,
          {
            cardId: currentCard.id,
            userAnswer: 'unknown',
            isCorrect: false,
            timeSpent,
            timestamp: new Date(),
          },
        ],
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
      alert(
        `Session completed! Score: ${session.correctAnswers}/${flashcards.length}`
      );
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
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}
          />
          <h3
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0',
            }}
          >
            Loading Flashcards
          </h3>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
            }}
          >
            Preparing your learning session...
          </p>
        </div>

        <style>
          {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
        </style>
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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            maxWidth: '400px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
            }}
          >
            <XCircle size={32} color="white" />
          </div>
          <h3
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            No Flashcards Available
          </h3>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 24px 0',
              lineHeight: '1.6',
            }}
          >
            There are no flashcards in this set yet. Please try another set or
            contact your teacher.
          </p>
          <button
            onClick={() => navigate('/student')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 8px 20px rgba(59, 130, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
          >
            <Home size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];
  const isLastCard = currentCardIndex === flashcards.length - 1;
  const isFirstCard = currentCardIndex === 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      {/* Header with progress */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Back Button */}
        <div
          style={{
            marginBottom: '20px',
          }}
        >
          <BackButton to="/student" label="Back to Dashboard" />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Target size={24} color="white" />
            </div>
            <div>
              <h4
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 4px 0',
                }}
              >
                Flashcard Practice
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0',
                }}
              >
                Card {currentCardIndex + 1} of {flashcards.length}
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
              }}
            >
              <BarChart3 size={16} color="#6b7280" />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                {session?.correctAnswers || 0}/{flashcards.length}
              </span>
            </div>

            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'white',
                }}
              >
                {Math.round(getScorePercentage())}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              width: `${getProgressPercentage()}%`,
              transition: 'width 0.3s ease',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      {/* Main flashcard */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '400px',
            height: '300px',
            perspective: '1000px',
            cursor: 'pointer',
          }}
          onClick={handleCardFlip}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s ease',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front of card */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
                }}
              >
                <Target size={32} color="white" />
              </div>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 16px 0',
                  lineHeight: '1.4',
                }}
              >
                {currentCard.front_text}
              </h3>
              <p
                style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0',
                  fontStyle: 'italic',
                }}
              >
                Tap to reveal answer
              </p>
            </div>

            {/* Back of card */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CheckCircle size={32} color="white" />
              </div>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0 0 16px 0',
                  lineHeight: '1.4',
                }}
              >
                {currentCard.back_text}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '0',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                Order: {currentCard.order}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card navigation and actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Navigation buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <button
            onClick={handlePreviousCard}
            disabled={isFirstCard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: isFirstCard
                ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
                : 'linear-gradient(135deg, #ffffff, #f8fafc)',
              color: isFirstCard ? '#9ca3af' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: isFirstCard ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              opacity: isFirstCard ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isFirstCard) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 20px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isFirstCard) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            <ArrowLeft size={18} />
            Previous
          </button>

          <button
            onClick={handleNextCard}
            disabled={isLastCard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: isLastCard
                ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
                : 'linear-gradient(135deg, #ffffff, #f8fafc)',
              color: isLastCard ? '#9ca3af' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: isLastCard ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              opacity: isLastCard ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLastCard) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 20px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLastCard) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            Next
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <button
            onClick={handleKnowCard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '700',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 12px 30px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 8px 20px rgba(16, 185, 129, 0.3)';
            }}
          >
            <CheckCircle size={20} />I Know This
          </button>

          <button
            onClick={handleDontKnowCard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '700',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 12px 30px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 8px 20px rgba(245, 158, 11, 0.3)';
            }}
          >
            <XCircle size={20} />
            Need Review
          </button>
        </div>
      </div>

      {/* Session controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <button
          onClick={handleRestartSession}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            color: '#374151',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.background =
              'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.background =
              'linear-gradient(135deg, #f8fafc, #e2e8f0)';
          }}
        >
          <RotateCcw size={18} />
          Restart Session
        </button>

        <button
          onClick={handleEndSession}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow =
              '0 8px 20px rgba(239, 68, 68, 0.4)';
            e.currentTarget.style.background =
              'linear-gradient(135deg, #dc2626, #b91c1c)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow =
              '0 4px 12px rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.background =
              'linear-gradient(135deg, #ef4444, #dc2626)';
          }}
        >
          <Flag size={18} />
          End Session
        </button>
      </div>
    </div>
  );
};

export default FlashcardLearningPage;


