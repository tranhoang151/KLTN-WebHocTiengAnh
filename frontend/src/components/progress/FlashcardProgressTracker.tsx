import React, { useState, useEffect } from 'react';
import { Flashcard } from '../../services/flashcardService';
import { CheckCircle, Eye, XCircle, Circle, Trophy } from 'lucide-react';

interface FlashcardProgressTrackerProps {
  flashcards: Flashcard[];
  learnedCards: Set<string>;
  currentCardIndex: number;
  onCardClick?: (index: number) => void;
  showDetails?: boolean;
}

interface CardStatus {
  id: string;
  index: number;
  status: 'not-started' | 'current' | 'learned' | 'not-learned';
  frontText: string;
}

const FlashcardProgressTracker: React.FC<FlashcardProgressTrackerProps> = ({
  flashcards,
  learnedCards,
  currentCardIndex,
  onCardClick,
  showDetails = false,
}) => {
  const [cardStatuses, setCardStatuses] = useState<CardStatus[]>([]);

  useEffect(() => {
    const statuses: CardStatus[] = flashcards.map((card, index) => {
      let status: CardStatus['status'] = 'not-started';

      if (index === currentCardIndex) {
        status = 'current';
      } else if (learnedCards.has(card.id)) {
        status = 'learned';
      } else if (index < currentCardIndex) {
        status = 'not-learned';
      }

      return {
        id: card.id,
        index,
        status,
        frontText: card.frontText,
      };
    });

    setCardStatuses(statuses);
  }, [flashcards, learnedCards, currentCardIndex]);

  const getStatusIcon = (status: CardStatus['status']) => {
    switch (status) {
      case 'current':
        return <Eye size={16} />;
      case 'learned':
        return <CheckCircle size={16} />;
      case 'not-learned':
        return <XCircle size={16} />;
      default:
        return <Circle size={16} />;
    }
  };

  const getStatusColor = (status: CardStatus['status']): string => {
    switch (status) {
      case 'current':
        return '#3498db';
      case 'learned':
        return '#27ae60';
      case 'not-learned':
        return '#e74c3c';
      default:
        return '#bdc3c7';
    }
  };

  const getStatusLabel = (status: CardStatus['status']): string => {
    switch (status) {
      case 'current':
        return 'Current';
      case 'learned':
        return 'Learned';
      case 'not-learned':
        return 'Need Practice';
      default:
        return 'Not Started';
    }
  };

  const learnedCount = learnedCards.size;
  const totalCards = flashcards.length;
  const completionPercentage =
    totalCards > 0 ? Math.round((learnedCount / totalCards) * 100) : 0;

  return (
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
      {/* Progress Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        {/* Progress Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Circular Progress */}
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
            }}
          >
            <svg
              viewBox="0 0 36 36"
              style={{
                width: '100%',
                height: '100%',
                transform: 'rotate(-90deg)',
              }}
            >
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(107, 114, 128, 0.2)"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${completionPercentage}, 100`}
                style={{
                  transition: 'stroke-dasharray 0.3s ease',
                }}
              />
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '16px',
                fontWeight: '700',
                color: '#1f2937',
              }}
            >
              {completionPercentage}%
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
            }}
          >
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#10b981',
                  marginBottom: '4px',
                }}
              >
                {learnedCount}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Learned
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ef4444',
                  marginBottom: '4px',
                }}
              >
                {totalCards - learnedCount}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Remaining
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <CheckCircle size={12} />
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
              }}
            >
              Learned
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Eye size={12} />
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
              }}
            >
              Current
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <XCircle size={12} />
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
              }}
            >
              Need Practice
            </span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {cardStatuses.map((cardStatus) => (
          <div
            key={cardStatus.id}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
              cursor: onCardClick ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              border: `2px solid ${getStatusColor(cardStatus.status)}`,
              position: 'relative',
              minHeight: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => onCardClick?.(cardStatus.index)}
            onMouseEnter={(e) => {
              if (onCardClick) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (onCardClick) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            title={
              showDetails
                ? `${cardStatus.frontText} - ${getStatusLabel(cardStatus.status)}`
                : undefined
            }
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '8px',
              }}
            >
              {cardStatus.index + 1}
            </div>
            <div
              style={{
                color: getStatusColor(cardStatus.status),
                marginBottom: showDetails ? '8px' : '0',
              }}
            >
              {getStatusIcon(cardStatus.status)}
            </div>
            {showDetails && (
              <div
                style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}
              >
                <div
                  style={{
                    fontWeight: '500',
                    marginBottom: '2px',
                  }}
                >
                  {cardStatus.frontText.length > 15
                    ? `${cardStatus.frontText.substring(0, 15)}...`
                    : cardStatus.frontText}
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: getStatusColor(cardStatus.status),
                    fontWeight: '600',
                  }}
                >
                  {getStatusLabel(cardStatus.status)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {totalCards > 0 && (
        <div
          style={{
            marginBottom: completionPercentage === 100 ? '16px' : '0',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'rgba(107, 114, 128, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: `${completionPercentage}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500',
            }}
          >
            {learnedCount} of {totalCards} cards learned ({completionPercentage}
            %)
          </div>
        </div>
      )}

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            color: 'white',
          }}
        >
          <Trophy size={24} />
          <span
            style={{
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            All cards learned! Great job!
          </span>
        </div>
      )}
    </div>
  );
};

export default FlashcardProgressTracker;
