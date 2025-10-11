import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { flashcardService } from '../../services/flashcardService';
import './StreakStatistics.css';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakCalendar: { [date: string]: boolean };
}

interface StreakStatisticsProps {
  userId?: string;
  compact?: boolean;
  showCalendar?: boolean;
  className?: string;
}

const StreakStatistics: React.FC<StreakStatisticsProps> = ({
  userId,
  compact = false,
  showCalendar = false,
  className = '',
}) => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadStreakData();
    }
  }, [targetUserId]);

  const loadStreakData = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await flashcardService.getStreakData(targetUserId) || {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        streakHistory: {},
        streakCalendar: {}
      };
      setStreakData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load streak data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStreakStats = () => {
    if (!streakData) return null;

    const today = new Date();
    const activeDays = Object.values(streakData.streakCalendar).filter(
      Boolean
    ).length;

    // Calculate this week's activity
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    let thisWeekCount = 0;
    Object.entries(streakData.streakCalendar).forEach(
      ([dateString, hasActivity]) => {
        if (!hasActivity) return;
        const date = new Date(dateString);
        if (date >= thisWeekStart && date <= today) {
          thisWeekCount++;
        }
      }
    );

    // Calculate this month's activity
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    let thisMonthCount = 0;
    Object.entries(streakData.streakCalendar).forEach(
      ([dateString, hasActivity]) => {
        if (!hasActivity) return;
        const date = new Date(dateString);
        if (date >= thisMonthStart && date <= today) {
          thisMonthCount++;
        }
      }
    );

    // Calculate average weekly activity (last 4 weeks)
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(today.getDate() - 28);

    let recentActivityCount = 0;
    Object.entries(streakData.streakCalendar).forEach(
      ([dateString, hasActivity]) => {
        if (!hasActivity) return;
        const date = new Date(dateString);
        if (date >= fourWeeksAgo && date <= today) {
          recentActivityCount++;
        }
      }
    );

    const averageWeeklyActivity = Math.round(recentActivityCount / 4);

    return {
      activeDays,
      thisWeekCount,
      thisMonthCount,
      averageWeeklyActivity,
    };
  };

  const getStreakLevel = () => {
    const currentStreak = streakData?.currentStreak || 0;

    if (currentStreak === 0)
      return { level: 'Beginner', color: '#94a3b8', icon: '🌱', progress: 0 };
    if (currentStreak < 7)
      return {
        level: 'Getting Started',
        color: '#3b82f6',
        icon: '🔥',
        progress: (currentStreak / 7) * 100,
      };
    if (currentStreak < 30)
      return {
        level: 'Consistent Learner',
        color: '#10b981',
        icon: '⭐',
        progress: (currentStreak / 30) * 100,
      };
    if (currentStreak < 100)
      return {
        level: 'Dedicated Student',
        color: '#f59e0b',
        icon: '🏆',
        progress: (currentStreak / 100) * 100,
      };
    return {
      level: 'Learning Master',
      color: '#8b5cf6',
      icon: '👑',
      progress: 100,
    };
  };

  const renderMiniCalendar = () => {
    if (!streakData || !showCalendar) return null;

    const today = new Date();
    const days = [];

    // Show last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const hasActivity = streakData.streakCalendar[dateString] || false;
      const isToday = i === 0;

      days.push({
        date,
        hasActivity,
        isToday,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }).charAt(0),
      });
    }

    return (
      <div className="mini-calendar">
        <div className="mini-calendar-days">
          {days.map((day, index) => (
            <div
              key={index}
              className={`mini-day ${day.hasActivity ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
              title={`${day.date.toLocaleDateString()}: ${day.hasActivity ? 'Active' : 'No activity'}`}
            >
              <div className="day-letter">{day.dayName}</div>
              <div className="day-indicator"></div>
            </div>
          ))}
        </div>
        <div className="mini-calendar-label">Last 14 days</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`streak-statistics loading ${compact ? 'compact' : ''} ${className}`}
      >
        <div className="loading-spinner"></div>
        {!compact && <p>Loading streak data...</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`streak-statistics error ${compact ? 'compact' : ''} ${className}`}
      >
        <div className="error-icon">⚠️</div>
        {!compact && (
          <>
            <h4>Error Loading Streak Data</h4>
            <p>{error}</p>
            <button onClick={loadStreakData} className="btn-retry">
              Try Again
            </button>
          </>
        )}
      </div>
    );
  }

  if (!streakData) {
    return (
      <div
        className={`streak-statistics no-data ${compact ? 'compact' : ''} ${className}`}
      >
        <p>No streak data available</p>
      </div>
    );
  }

  const stats = calculateStreakStats();
  const streakLevel = getStreakLevel();

  if (compact) {
    return (
      <div className={`streak-statistics compact ${className}`}>
        <div className="compact-streak-display">
          <div
            className="streak-icon"
            style={{ backgroundColor: streakLevel.color }}
          >
            {streakLevel.icon}
          </div>
          <div className="streak-info">
            <div className="streak-number">{streakData.currentStreak}</div>
            <div className="streak-label">Day Streak</div>
          </div>
          {streakData.currentStreak > 0 && (
            <div className="streak-fire">🔥</div>
          )}
        </div>
        {showCalendar && renderMiniCalendar()}
      </div>
    );
  }

  return (
    <div className={`streak-statistics ${className}`}>
      <div className="streak-header">
        <h3>🔥 Learning Streak Statistics</h3>
      </div>

      {/* Streak Level */}
      <div className="streak-level" style={{ borderColor: streakLevel.color }}>
        <div
          className="level-badge"
          style={{ backgroundColor: streakLevel.color }}
        >
          <span className="level-icon">{streakLevel.icon}</span>
          <span className="level-text">{streakLevel.level}</span>
        </div>
        <div className="level-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${streakLevel.progress}%`,
                backgroundColor: streakLevel.color,
              }}
            ></div>
          </div>
          <div className="progress-text">{streakData.currentStreak} days</div>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{streakData.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{streakData.longestStreak}</div>
            <div className="stat-label">Longest Streak</div>
          </div>
        </div>

        <div className="stat-card tertiary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.activeDays || 0}</div>
            <div className="stat-label">Total Active Days</div>
          </div>
        </div>

        <div className="stat-card quaternary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats?.averageWeeklyActivity || 0}
            </div>
            <div className="stat-label">Avg. Weekly Days</div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="detailed-stats">
        <h4>📈 Detailed Statistics</h4>
        <div className="detailed-stats-grid">
          <div className="detailed-stat">
            <span className="stat-name">This Week:</span>
            <span className="stat-value">
              {stats?.thisWeekCount || 0}/7 days
            </span>
          </div>
          <div className="detailed-stat">
            <span className="stat-name">This Month:</span>
            <span className="stat-value">
              {stats?.thisMonthCount || 0} days
            </span>
          </div>
          <div className="detailed-stat">
            <span className="stat-name">Streak Percentage:</span>
            <span className="stat-value">
              {streakData.longestStreak > 0
                ? Math.round(
                  (streakData.currentStreak / streakData.longestStreak) * 100
                )
                : 0}
              %
            </span>
          </div>
          <div className="detailed-stat">
            <span className="stat-name">Consistency Score:</span>
            <span className="stat-value">
              {stats?.activeDays && stats.activeDays > 0
                ? Math.min(
                  100,
                  Math.round((stats.averageWeeklyActivity / 7) * 100)
                )
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Mini Calendar */}
      {showCalendar && renderMiniCalendar()}

      {/* Streak Insights */}
      <div className="streak-insights">
        <h4>💡 Streak Insights</h4>
        <div className="insights-list">
          {streakData.currentStreak === 0 && (
            <div className="insight">
              <span className="insight-icon">🚀</span>
              <span>Start your learning journey today!</span>
            </div>
          )}
          {streakData.currentStreak > 0 && streakData.currentStreak < 7 && (
            <div className="insight">
              <span className="insight-icon">💪</span>
              <span>You're building momentum! Keep going!</span>
            </div>
          )}
          {streakData.currentStreak >= 7 && streakData.currentStreak < 30 && (
            <div className="insight">
              <span className="insight-icon">⭐</span>
              <span>Great consistency! You're forming a habit!</span>
            </div>
          )}
          {streakData.currentStreak >= 30 && (
            <div className="insight">
              <span className="insight-icon">🏆</span>
              <span>Amazing dedication! You're a learning champion!</span>
            </div>
          )}
          {streakData.longestStreak > streakData.currentStreak &&
            streakData.currentStreak > 0 && (
              <div className="insight">
                <span className="insight-icon">🎯</span>
                <span>
                  {streakData.longestStreak - streakData.currentStreak} more
                  days to beat your record!
                </span>
              </div>
            )}
          {stats && stats.averageWeeklyActivity >= 5 && (
            <div className="insight">
              <span className="insight-icon">🌟</span>
              <span>Excellent weekly consistency!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreakStatistics;
