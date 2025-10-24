import React, { useState, useEffect } from 'react';
import {
  FlashcardProgress,
  flashcardService,
} from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';
import StreakStatistics from './StreakStatistics';
import './FlashcardProgressStats.css';

interface FlashcardProgressStatsProps {
  setId: string;
  courseId: string;
  totalCards: number;
  onClose?: () => void;
}

interface ProgressStats {
  totalCards: number;
  learnedCards: number;
  completionPercentage: number;
  timeSpent: number;
  lastStudied?: Date;
  studySessions: number;
  averageTimePerCard: number;
  streak: number;
}

const FlashcardProgressStats: React.FC<FlashcardProgressStatsProps> = ({
  setId,
  courseId,
  totalCards,
  onClose,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgressStats();
  }, [setId, user]);

  const loadProgressStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const detailedProgress = await flashcardService.getDetailedProgress(
        user.id,
        setId
      ) || {
        completionPercentage: 0,
        learnedCardIds: [],
        timeSpent: 0,
        totalSessions: 0,
        totalCardsStudied: 0,
        averageScore: 0,
        bestScore: 0,
        lastStudied: new Date(),
        streakCount: 0,
        masteredCards: [],
        needsReviewCards: []
      };

      const stats: ProgressStats = {
        totalCards,
        learnedCards: detailedProgress.learnedCardIds.length,
        completionPercentage: detailedProgress.completionPercentage,
        timeSpent: detailedProgress.timeSpent,
        lastStudied: detailedProgress.lastStudied,
        studySessions: detailedProgress.totalSessions,
        averageTimePerCard: detailedProgress.averageScore,
        streak: detailedProgress.streakCount,
      };
      setStats(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load progress statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return '#27ae60';
    if (percentage >= 60) return '#f39c12';
    if (percentage >= 40) return '#e67e22';
    return '#e74c3c';
  };

  const getProgressMessage = (percentage: number): string => {
    if (percentage === 100) return "Excellent! You've mastered this set! 🎉";
    if (percentage >= 80) return 'Great progress! Almost there! 🌟';
    if (percentage >= 60) return 'Good work! Keep it up! 👍';
    if (percentage >= 40) return "Making progress! Don't give up! 💪";
    if (percentage > 0) return 'Just getting started! You can do it! 🚀';
    return 'Ready to begin your learning journey? 📚';
  };

  if (loading) {
    return (
      <div className="progress-stats-loading">
        <div className="loading-spinner"></div>
        <p>Loading progress statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-stats-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Statistics</h3>
        <p>{error}</p>
        <button onClick={loadProgressStats} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="flashcard-progress-stats">
      <div className="stats-header">
        <h2>📊 Your Progress</h2>
        {onClose && (
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        )}
      </div>

      <div className="progress-overview">
        <div className="progress-circle">
          <svg viewBox="0 0 100 100" className="circular-progress">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ecf0f1"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getProgressColor(stats.completionPercentage)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${stats.completionPercentage * 2.827} 282.7`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="progress-text">
            <span className="percentage">{stats.completionPercentage}%</span>
            <span className="label">Complete</span>
          </div>
        </div>

        <div className="progress-message">
          <p>{getProgressMessage(stats.completionPercentage)}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats.learnedCards} / {stats.totalCards}
            </div>
            <div className="stat-label">Cards Learned</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{formatTime(stats.timeSpent)}</div>
            <div className="stat-label">Time Spent</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats.studySessions}</div>
            <div className="stat-label">Study Sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">
              {formatTime(stats.averageTimePerCard)}
            </div>
            <div className="stat-label">Avg. per Card</div>
          </div>
        </div>

        {stats.lastStudied && (
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">
                {stats.lastStudied.toLocaleDateString()}
              </div>
              <div className="stat-label">Last Studied</div>
            </div>
          </div>
        )}

        <div className="stat-card streak-card">
          <StreakStatistics compact={true} showCalendar={false} />
        </div>
      </div>

      <div className="progress-breakdown">
        <h3>Progress Breakdown</h3>
        <div className="progress-bar-detailed">
          <div
            className="progress-segment learned"
            style={{ width: `${stats.completionPercentage}%` }}
          >
            <span className="segment-label">
              Learned ({stats.learnedCards})
            </span>
          </div>
          <div
            className="progress-segment remaining"
            style={{ width: `${100 - stats.completionPercentage}%` }}
          >
            <span className="segment-label">
              Remaining ({stats.totalCards - stats.learnedCards})
            </span>
          </div>
        </div>
      </div>

      {stats.completionPercentage < 100 && (
        <div className="next-steps">
          <h3>💡 Next Steps</h3>
          <ul>
            <li>Review cards you haven't learned yet</li>
            <li>Practice regularly to improve retention</li>
            <li>Try to maintain a daily learning streak</li>
            {stats.completionPercentage >= 50 && (
              <li>You're halfway there! Keep up the great work!</li>
            )}
          </ul>
        </div>
      )}

      {stats.completionPercentage === 100 && (
        <div className="completion-celebration">
          <h3>🎉 Congratulations!</h3>
          <p>You've completed this flashcard set! Consider:</p>
          <ul>
            <li>Reviewing periodically to maintain retention</li>
            <li>Moving on to the next level or set</li>
            <li>Helping others learn these cards</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FlashcardProgressStats;
