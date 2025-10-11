import React, { useState, useEffect } from 'react';
import { Flashcard } from '../../services/flashcardService';
import './FlashcardProgressTracker.css';

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

  const getStatusIcon = (status: CardStatus['status']): string => {
    switch (status) {
      case 'current':
        return '👁️';
      case 'learned':
        return '✅';
      case 'not-learned':
        return '❌';
      default:
        return '⭕';
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
    <div className="flashcard-progress-tracker">
      <div className="progress-header">
        <div className="progress-summary">
          <div className="progress-circle-mini">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${completionPercentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="percentage-text">{completionPercentage}%</div>
          </div>

          <div className="progress-stats">
            <div className="stat">
              <span className="stat-value">{learnedCount}</span>
              <span className="stat-label">Learned</span>
            </div>
            <div className="stat">
              <span className="stat-value">{totalCards - learnedCount}</span>
              <span className="stat-label">Remaining</span>
            </div>
          </div>
        </div>

        <div className="progress-legend">
          <div className="legend-item">
            <span
              className="legend-icon"
              style={{ color: getStatusColor('learned') }}
            >
              {getStatusIcon('learned')}
            </span>
            <span className="legend-label">Learned</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-icon"
              style={{ color: getStatusColor('current') }}
            >
              {getStatusIcon('current')}
            </span>
            <span className="legend-label">Current</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-icon"
              style={{ color: getStatusColor('not-learned') }}
            >
              {getStatusIcon('not-learned')}
            </span>
            <span className="legend-label">Need Practice</span>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {cardStatuses.map((cardStatus) => (
          <div
            key={cardStatus.id}
            className={`card-item ${cardStatus.status} ${onCardClick ? 'clickable' : ''}`}
            onClick={() => onCardClick?.(cardStatus.index)}
            title={
              showDetails
                ? `${cardStatus.frontText} - ${getStatusLabel(cardStatus.status)}`
                : undefined
            }
          >
            <div className="card-number">{cardStatus.index + 1}</div>
            <div
              className="card-status-icon"
              style={{ color: getStatusColor(cardStatus.status) }}
            >
              {getStatusIcon(cardStatus.status)}
            </div>
            {showDetails && (
              <div className="card-preview">
                <div className="card-text">{cardStatus.frontText}</div>
                <div className="card-status-label">
                  {getStatusLabel(cardStatus.status)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalCards > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="progress-text">
            {learnedCount} of {totalCards} cards learned ({completionPercentage}
            %)
          </div>
        </div>
      )}

      {completionPercentage === 100 && (
        <div className="completion-message">
          <span className="completion-icon">🎉</span>
          <span className="completion-text">All cards learned! Great job!</span>
        </div>
      )}
    </div>
  );
};

export default FlashcardProgressTracker;
