import React from 'react';
import { FlashcardProgress } from '../../services/flashcardService';
import './FlashcardSessionSummary.css';

interface SessionData {
  startTime: number;
  endTime: number;
  cardsStudied: number;
  cardsLearned: number;
  previousProgress: number;
  currentProgress: number;
  timeSpent: number;
}

interface FlashcardSessionSummaryProps {
  sessionData: SessionData;
  flashcardSetTitle: string;
  totalCards: number;
  onContinue?: () => void;
  onReview?: () => void;
  onExit?: () => void;
}

const FlashcardSessionSummary: React.FC<FlashcardSessionSummaryProps> = ({
  sessionData,
  flashcardSetTitle,
  totalCards,
  onContinue,
  onReview,
  onExit,
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  const getSessionRating = (): {
    emoji: string;
    message: string;
    color: string;
  } => {
    const progressGain =
      sessionData.currentProgress - sessionData.previousProgress;

    if (progressGain >= 20) {
      return {
        emoji: '🌟',
        message: 'Excellent session!',
        color: '#27ae60',
      };
    } else if (progressGain >= 10) {
      return {
        emoji: '👍',
        message: 'Great progress!',
        color: '#2ecc71',
      };
    } else if (progressGain >= 5) {
      return {
        emoji: '👌',
        message: 'Good work!',
        color: '#f39c12',
      };
    } else if (progressGain > 0) {
      return {
        emoji: '📚',
        message: 'Keep it up!',
        color: '#3498db',
      };
    } else {
      return {
        emoji: '💪',
        message: 'Practice makes perfect!',
        color: '#9b59b6',
      };
    }
  };

  const sessionRating = getSessionRating();
  const progressGain =
    sessionData.currentProgress - sessionData.previousProgress;
  const isCompleted = sessionData.currentProgress >= 100;

  return (
    <div className="flashcard-session-summary">
      <div className="summary-header">
        <div className="session-rating" style={{ color: sessionRating.color }}>
          <div className="rating-emoji">{sessionRating.emoji}</div>
          <h2>{sessionRating.message}</h2>
        </div>
        <div className="set-title">
          <h3>{flashcardSetTitle}</h3>
        </div>
      </div>

      <div className="progress-comparison">
        <div className="progress-item">
          <div className="progress-label">Before</div>
          <div className="progress-circle small">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#ecf0f1"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#bdc3c7"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${sessionData.previousProgress * 2.513} 251.3`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="progress-text">
              <span className="percentage">
                {sessionData.previousProgress}%
              </span>
            </div>
          </div>
        </div>

        <div className="progress-arrow">
          <div className="arrow">→</div>
          <div className="gain">+{progressGain}%</div>
        </div>

        <div className="progress-item">
          <div className="progress-label">After</div>
          <div className="progress-circle small">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#ecf0f1"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={sessionRating.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${sessionData.currentProgress * 2.513} 251.3`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="progress-text">
              <span className="percentage">{sessionData.currentProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="session-stats">
        <div className="stat-row">
          <div className="stat-item">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">
                {formatTime(sessionData.timeSpent)}
              </div>
              <div className="stat-label">Time Spent</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-value">{sessionData.cardsStudied}</div>
              <div className="stat-label">Cards Studied</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{sessionData.cardsLearned}</div>
              <div className="stat-label">Cards Learned</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">
                {Math.round(
                  (sessionData.cardsLearned /
                    Math.max(sessionData.cardsStudied, 1)) *
                    100
                )}
                %
              </div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="completion-celebration">
          <div className="celebration-icon">🎉</div>
          <h3>Congratulations!</h3>
          <p>You've completed this flashcard set!</p>
          <div className="achievement-badge">
            <span className="badge-icon">🏆</span>
            <span className="badge-text">Set Completed</span>
          </div>
        </div>
      )}

      {!isCompleted && sessionData.currentProgress >= 80 && (
        <div className="almost-done">
          <div className="almost-icon">🌟</div>
          <h3>Almost There!</h3>
          <p>
            You're {100 - sessionData.currentProgress}% away from completing
            this set!
          </p>
        </div>
      )}

      <div className="session-insights">
        <h4>📊 Session Insights</h4>
        <ul>
          {sessionData.timeSpent > 0 && (
            <li>
              Average time per card:{' '}
              {formatTime(
                Math.round(
                  sessionData.timeSpent / Math.max(sessionData.cardsStudied, 1)
                )
              )}
            </li>
          )}
          {progressGain > 0 && (
            <li>You improved your progress by {progressGain}% this session</li>
          )}
          {sessionData.cardsLearned > 0 && (
            <li>
              You successfully learned {sessionData.cardsLearned} new cards
            </li>
          )}
          {sessionData.currentProgress < 100 && (
            <li>
              {totalCards -
                Math.round(
                  (sessionData.currentProgress / 100) * totalCards
                )}{' '}
              cards remaining to complete this set
            </li>
          )}
        </ul>
      </div>

      <div className="action-buttons">
        {!isCompleted && onContinue && (
          <button onClick={onContinue} className="btn-primary">
            Continue Learning
          </button>
        )}

        {onReview && (
          <button onClick={onReview} className="btn-secondary">
            Review Progress
          </button>
        )}

        {onExit && (
          <button onClick={onExit} className="btn-tertiary">
            {isCompleted ? 'Finish' : 'Exit'}
          </button>
        )}
      </div>

      <div className="motivational-message">
        {isCompleted ? (
          <p>
            🎊 Amazing work! You've mastered this set. Consider reviewing it
            periodically to maintain your knowledge.
          </p>
        ) : progressGain >= 10 ? (
          <p>
            🚀 You're on fire! Keep up this momentum and you'll complete the set
            in no time!
          </p>
        ) : progressGain > 0 ? (
          <p>
            📈 Steady progress! Every card you learn brings you closer to
            mastery.
          </p>
        ) : (
          <p>
            💪 Remember, repetition is key to learning. Keep practicing and
            you'll see improvement!
          </p>
        )}
      </div>
    </div>
  );
};

export default FlashcardSessionSummary;
