import React, { useState } from 'react';
import { StudentDashboardDto } from '../../services/progressService';
import './ParentStreakCalendar.css';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakCalendar: { [date: string]: boolean };
}

interface ParentStreakCalendarProps {
  childName: string;
  streakData?: StreakData;
  dashboardData?: StudentDashboardDto;
}

const ParentStreakCalendar: React.FC<ParentStreakCalendarProps> = ({
  childName,
  streakData,
  dashboardData,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Generate calendar data for the selected month
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
      const hasActivity = streakData?.streakCalendar[dateString] || false;

      days.push({
        date: new Date(currentDate),
        dateString,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
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
    const currentStreak =
      streakData?.currentStreak || dashboardData?.streakCount || 0;

    if (currentStreak === 0) {
      return "Let's start building a learning streak! 🚀";
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
    const currentStreak =
      streakData?.currentStreak || dashboardData?.streakCount || 0;

    if (currentStreak === 0) {
      return [
        'Start with just 10-15 minutes of daily practice',
        'Set a consistent time each day for learning',
        'Use reminders to build the habit',
      ];
    } else if (currentStreak < 7) {
      return [
        "You're building momentum! Keep going!",
        'Try to study at the same time each day',
        'Celebrate small wins along the way',
      ];
    } else {
      return [
        "You've built an amazing habit!",
        'Focus on quality over quantity',
        'Keep challenging yourself with new content',
      ];
    }
  };

  return (
    <div className="parent-streak-calendar">
      <div className="streak-header">
        <h3>🔥 {childName}'s Learning Streak</h3>
        <p>Track daily learning activities and build consistent study habits</p>
      </div>

      {/* Streak Statistics */}
      <div className="streak-stats">
        <div className="streak-stat-card current">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">
              {streakData?.currentStreak || dashboardData?.streakCount || 0}
            </div>
            <div className="stat-label">Current Streak</div>
          </div>
        </div>

        <div className="streak-stat-card longest">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">
              {streakData?.longestStreak ||
                Math.max(dashboardData?.streakCount || 0, 0)}
            </div>
            <div className="stat-label">Longest Streak</div>
          </div>
        </div>

        <div className="streak-stat-card total">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">
              {
                Object.values(streakData?.streakCalendar || {}).filter(Boolean)
                  .length
              }
            </div>
            <div className="stat-label">Total Active Days</div>
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
          <button onClick={() => navigateMonth('prev')} className="nav-btn">
            ←
          </button>
          <h4>
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </h4>
          <button onClick={() => navigateMonth('next')} className="nav-btn">
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
                }`}
              >
                <span className="day-number">{day.day}</span>
                {day.hasActivity && (
                  <div className="activity-indicator">🔥</div>
                )}
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
        </div>
      </div>

      {/* Streak Tips */}
      <div className="streak-tips">
        <h4>💡 Tips for Building Learning Streaks</h4>
        <ul>
          {getStreakTips().map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Motivation Section */}
      <div className="motivation-section">
        <h4>🌟 Keep Your Child Motivated</h4>
        <div className="motivation-cards">
          <div className="motivation-card">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h5>Set Daily Goals</h5>
              <p>Help your child set small, achievable daily learning goals</p>
            </div>
          </div>

          <div className="motivation-card">
            <div className="card-icon">🎉</div>
            <div className="card-content">
              <h5>Celebrate Milestones</h5>
              <p>Acknowledge streak milestones with small rewards or praise</p>
            </div>
          </div>

          <div className="motivation-card">
            <div className="card-icon">👨‍👩‍👧‍👦</div>
            <div className="card-content">
              <h5>Learn Together</h5>
              <p>
                Occasionally join your child's learning sessions to show support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentStreakCalendar;
