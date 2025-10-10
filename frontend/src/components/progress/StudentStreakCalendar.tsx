import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { flashcardService } from '../../services/flashcardService';
import './StudentStreakCalendar.css';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakCalendar: { [date: string]: boolean };
}

interface StudentStreakCalendarProps {
  className?: string;
}

const StudentStreakCalendar: React.FC<StudentStreakCalendarProps> = ({
  className = '',
}) => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadStreakData();
    }
  }, [user]);

  const loadStreakData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await flashcardService.getStreakData(user.id);
      setStreakData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load streak data');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarData = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Saturday

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isFuture = currentDate > new Date();
      const hasActivity = streakData?.streakCalendar[dateString] || false;

      days.push({
        date: new Date(currentDate),
        dateString,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isFuture,
        hasActivity,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarData();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  const getStreakMessage = () => {
    const currentStreak = streakData?.currentStreak || 0;

    if (currentStreak === 0) {
      return "Ready to start your learning streak? Let's go! 🚀";
    } else if (currentStreak === 1) {
      return 'Great start! Keep it going tomorrow! 💪';
    } else if (currentStreak < 7) {
      return `Awesome! ${currentStreak} days in a row! 🔥`;
    } else if (currentStreak < 30) {
      return `Incredible dedication! ${currentStreak} days strong! 🌟`;
    } else {
      return `Amazing commitment! ${currentStreak} days of learning! 🏆`;
    }
  };

  const getStreakTips = () => {
    const currentStreak = streakData?.currentStreak || 0;

    if (currentStreak === 0) {
      return [
        'Start with just 10-15 minutes of daily practice',
        'Set a consistent time each day for learning',
        'Use reminders to build the habit',
        'Begin with easier flashcard sets to build confidence',
      ];
    } else if (currentStreak < 7) {
      return [
        "You're building momentum! Keep going!",
        'Try to study at the same time each day',
        'Celebrate small wins along the way',
        'Mix different types of activities to stay engaged',
      ];
    } else if (currentStreak < 30) {
      return [
        "You've built an amazing habit!",
        'Focus on quality over quantity',
        'Challenge yourself with harder content',
        'Share your progress with friends and family',
      ];
    } else {
      return [
        "You're a learning champion!",
        'Maintain consistency even on busy days',
        'Help other students with their learning',
        'Set new learning goals to stay motivated',
      ];
    }
  };

  const getStreakLevel = () => {
    const currentStreak = streakData?.currentStreak || 0;

    if (currentStreak === 0)
      return { level: 'Beginner', color: '#94a3b8', icon: '🌱' };
    if (currentStreak < 7)
      return { level: 'Getting Started', color: '#3b82f6', icon: '🔥' };
    if (currentStreak < 30)
      return { level: 'Consistent Learner', color: '#10b981', icon: '⭐' };
    if (currentStreak < 100)
      return { level: 'Dedicated Student', color: '#f59e0b', icon: '🏆' };
    return { level: 'Learning Master', color: '#8b5cf6', icon: '👑' };
  };

  const calculateWeeklyStats = () => {
    if (!streakData) return { thisWeek: 0, lastWeek: 0 };

    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of this week (Sunday)

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

    let thisWeekCount = 0;
    let lastWeekCount = 0;

    Object.entries(streakData.streakCalendar).forEach(
      ([dateString, hasActivity]) => {
        if (!hasActivity) return;

        const date = new Date(dateString);
        if (date >= thisWeekStart && date <= today) {
          thisWeekCount++;
        } else if (date >= lastWeekStart && date <= lastWeekEnd) {
          lastWeekCount++;
        }
      }
    );

    return { thisWeek: thisWeekCount, lastWeek: lastWeekCount };
  };

  if (loading) {
    return (
      <div className={`student-streak-calendar loading ${className}`}>
        <div className="loading-spinner"></div>
        <p>Loading your streak data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`student-streak-calendar error ${className}`}>
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Streak Data</h3>
        <p>{error}</p>
        <button onClick={loadStreakData} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className={`student-streak-calendar no-data ${className}`}>
        <p>No streak data available</p>
      </div>
    );
  }

  const streakLevel = getStreakLevel();
  const weeklyStats = calculateWeeklyStats();

  return (
    <div className={`student-streak-calendar ${className}`}>
      <div className="streak-header">
        <h2>🔥 Your Learning Streak</h2>
        <p>Keep learning every day to build and maintain your streak!</p>
      </div>

      {/* Streak Level Badge */}
      <div
        className="streak-level-badge"
        style={{ borderColor: streakLevel.color }}
      >
        <div
          className="level-icon"
          style={{ backgroundColor: streakLevel.color }}
        >
          {streakLevel.icon}
        </div>
        <div className="level-info">
          <h3 style={{ color: streakLevel.color }}>{streakLevel.level}</h3>
          <p>{streakData.currentStreak} day streak</p>
        </div>
      </div>

      {/* Streak Statistics */}
      <div className="streak-stats-grid">
        <div className="streak-stat-card current">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{streakData.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
        </div>

        <div className="streak-stat-card longest">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{streakData.longestStreak}</div>
            <div className="stat-label">Longest Streak</div>
          </div>
        </div>

        <div className="streak-stat-card total">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">
              {Object.values(streakData.streakCalendar).filter(Boolean).length}
            </div>
            <div className="stat-label">Total Active Days</div>
          </div>
        </div>

        <div className="streak-stat-card weekly">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{weeklyStats.thisWeek}/7</div>
            <div className="stat-label">This Week</div>
            {weeklyStats.lastWeek > 0 && (
              <div className="stat-comparison">
                {weeklyStats.thisWeek > weeklyStats.lastWeek
                  ? '📈'
                  : weeklyStats.thisWeek < weeklyStats.lastWeek
                    ? '📉'
                    : '➡️'}
                vs {weeklyStats.lastWeek} last week
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streak Message */}
      <div className="streak-message">
        <div className="message-content">
          <span className="message-icon">💬</span>
          <p>{getStreakMessage()}</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-container">
        <div className="calendar-header">
          <button
            onClick={() => navigateMonth('prev')}
            className="nav-btn"
            disabled={
              selectedMonth.getFullYear() < new Date().getFullYear() - 1
            }
          >
            ←
          </button>
          <h3>
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="nav-btn"
            disabled={selectedMonth > new Date()}
          >
            →
          </button>
        </div>

        <div className="calendar-grid">
          <div className="weekday-headers">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-days">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${
                  !day.isCurrentMonth ? 'other-month' : ''
                } ${day.isToday ? 'today' : ''} ${
                  day.hasActivity ? 'has-activity' : ''
                } ${day.isFuture ? 'future' : ''}`}
                title={
                  day.hasActivity
                    ? `Learning activity on ${day.date.toLocaleDateString()}`
                    : day.isFuture
                      ? 'Future date'
                      : `No activity on ${day.date.toLocaleDateString()}`
                }
              >
                <span className="day-number">{day.day}</span>
                {day.hasActivity && (
                  <div className="activity-indicator">🔥</div>
                )}
                {day.isToday && <div className="today-indicator">Today</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color no-activity"></div>
            <span>No Activity</span>
          </div>
          <div className="legend-item">
            <div className="legend-color has-activity">🔥</div>
            <span>Learning Day</span>
          </div>
          <div className="legend-item">
            <div className="legend-color today"></div>
            <span>Today</span>
          </div>
          <div className="legend-item">
            <div className="legend-color future"></div>
            <span>Future</span>
          </div>
        </div>
      </div>

      {/* Streak Tips */}
      <div className="streak-tips">
        <h4>💡 Tips for Building Your Streak</h4>
        <ul>
          {getStreakTips().map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Motivation Section */}
      <div className="motivation-section">
        <h4>🎯 Stay Motivated</h4>
        <div className="motivation-cards">
          <div className="motivation-card">
            <div className="card-icon">⏰</div>
            <div className="card-content">
              <h5>Set a Daily Time</h5>
              <p>Choose a consistent time each day for learning</p>
            </div>
          </div>

          <div className="motivation-card">
            <div className="card-icon">🎉</div>
            <div className="card-content">
              <h5>Celebrate Milestones</h5>
              <p>Reward yourself for reaching streak goals</p>
            </div>
          </div>

          <div className="motivation-card">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h5>Share Progress</h5>
              <p>Tell friends and family about your achievements</p>
            </div>
          </div>

          <div className="motivation-card">
            <div className="card-icon">📱</div>
            <div className="card-content">
              <h5>Use Reminders</h5>
              <p>Set daily notifications to maintain your habit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {streakData.currentStreak > 0 && (
        <div className="next-milestone">
          <h4>🎯 Next Milestone</h4>
          <div className="milestone-progress">
            {streakData.currentStreak < 7 && (
              <div className="milestone-card">
                <div className="milestone-icon">⭐</div>
                <div className="milestone-content">
                  <h5>7-Day Streak</h5>
                  <p>{7 - streakData.currentStreak} more days to go!</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(streakData.currentStreak / 7) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {streakData.currentStreak >= 7 && streakData.currentStreak < 30 && (
              <div className="milestone-card">
                <div className="milestone-icon">🏆</div>
                <div className="milestone-content">
                  <h5>30-Day Streak</h5>
                  <p>{30 - streakData.currentStreak} more days to go!</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(streakData.currentStreak / 30) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {streakData.currentStreak >= 30 &&
              streakData.currentStreak < 100 && (
                <div className="milestone-card">
                  <div className="milestone-icon">👑</div>
                  <div className="milestone-content">
                    <h5>100-Day Streak</h5>
                    <p>{100 - streakData.currentStreak} more days to go!</p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(streakData.currentStreak / 100) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStreakCalendar;
