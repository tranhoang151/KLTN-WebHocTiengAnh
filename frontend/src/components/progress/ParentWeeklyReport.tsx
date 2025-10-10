import React, { useState } from 'react';
import {
  StudentProgressSummaryDto,
  StudentDashboardDto,
} from '../../services/progressService';
import './ParentWeeklyReport.css';

interface ParentWeeklyReportProps {
  child: StudentProgressSummaryDto;
  dashboardData?: StudentDashboardDto;
}

const ParentWeeklyReport: React.FC<ParentWeeklyReportProps> = ({
  child,
  dashboardData,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>(
    'week'
  );

  // Generate mock weekly data (in a real app, this would come from the API)
  const generateWeeklyData = () => {
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      weekData.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        studyTime: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
        activitiesCompleted: Math.floor(Math.random() * 5),
        score: Math.floor(Math.random() * 30) + 70, // 70-100%
        hasActivity: Math.random() > 0.3, // 70% chance of activity
      });
    }

    return weekData;
  };

  const generateMonthlyData = () => {
    const today = new Date();
    const monthData = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      monthData.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        studyTime: Math.floor(Math.random() * 60) + 10,
        activitiesCompleted: Math.floor(Math.random() * 4),
        score: Math.floor(Math.random() * 25) + 75,
        hasActivity: Math.random() > 0.4,
      });
    }

    return monthData;
  };

  const weeklyData = generateWeeklyData();
  const monthlyData = generateMonthlyData();
  const currentData = selectedPeriod === 'week' ? weeklyData : monthlyData;

  const calculateSummary = () => {
    const activeDays = currentData.filter((day) => day.hasActivity).length;
    const totalStudyTime = currentData.reduce(
      (sum, day) => sum + (day.hasActivity ? day.studyTime : 0),
      0
    );
    const totalActivities = currentData.reduce(
      (sum, day) => sum + (day.hasActivity ? day.activitiesCompleted : 0),
      0
    );
    const averageScore =
      currentData.filter((day) => day.hasActivity).length > 0
        ? currentData
            .filter((day) => day.hasActivity)
            .reduce((sum, day) => sum + day.score, 0) / activeDays
        : 0;

    return {
      activeDays,
      totalStudyTime,
      totalActivities,
      averageScore: Math.round(averageScore),
      consistency: Math.round((activeDays / currentData.length) * 100),
    };
  };

  const summary = calculateSummary();

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getPerformanceLevel = (
    score: number
  ): { level: string; color: string } => {
    if (score >= 90) return { level: 'Excellent', color: '#27ae60' };
    if (score >= 80) return { level: 'Very Good', color: '#2ecc71' };
    if (score >= 70) return { level: 'Good', color: '#f39c12' };
    if (score >= 60) return { level: 'Fair', color: '#e67e22' };
    return { level: 'Needs Improvement', color: '#e74c3c' };
  };

  const getConsistencyLevel = (
    percentage: number
  ): { level: string; color: string } => {
    if (percentage >= 80) return { level: 'Excellent', color: '#27ae60' };
    if (percentage >= 60) return { level: 'Good', color: '#f39c12' };
    if (percentage >= 40) return { level: 'Fair', color: '#e67e22' };
    return { level: 'Needs Improvement', color: '#e74c3c' };
  };

  const performanceLevel = getPerformanceLevel(summary.averageScore);
  const consistencyLevel = getConsistencyLevel(summary.consistency);

  const generateRecommendations = () => {
    const recommendations = [];

    if (summary.consistency < 60) {
      recommendations.push({
        type: 'consistency',
        icon: '📅',
        title: 'Improve Study Consistency',
        message:
          'Try to establish a daily learning routine. Even 15 minutes per day can make a big difference!',
        priority: 'high',
      });
    }

    if (summary.averageScore < 75) {
      recommendations.push({
        type: 'performance',
        icon: '📚',
        title: 'Focus on Understanding',
        message:
          'Consider reviewing challenging topics together or seeking additional help from the teacher.',
        priority: 'medium',
      });
    }

    if (summary.totalStudyTime < 120 && selectedPeriod === 'week') {
      recommendations.push({
        type: 'time',
        icon: '⏰',
        title: 'Increase Study Time',
        message:
          'Aim for at least 20-30 minutes of daily practice for better learning outcomes.',
        priority: 'medium',
      });
    }

    if (summary.consistency >= 80 && summary.averageScore >= 85) {
      recommendations.push({
        type: 'praise',
        icon: '🌟',
        title: 'Excellent Progress!',
        message:
          'Your child is doing wonderfully! Keep up the great work and celebrate these achievements.',
        priority: 'positive',
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <div className="parent-weekly-report">
      <div className="report-header">
        <h3>📈 {child.studentName}'s Progress Report</h3>
        <p>Detailed learning analytics and insights for parents</p>
      </div>

      {/* Period Selector */}
      <div className="period-selector">
        <button
          onClick={() => setSelectedPeriod('week')}
          className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
        >
          📅 This Week
        </button>
        <button
          onClick={() => setSelectedPeriod('month')}
          className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
        >
          📊 Last 30 Days
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">🔥</div>
          <div className="card-content">
            <div className="card-value">{summary.activeDays}</div>
            <div className="card-label">Active Days</div>
            <div className="card-subtitle">
              out of {currentData.length} days
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <div className="card-value">
              {formatTime(summary.totalStudyTime)}
            </div>
            <div className="card-label">Total Study Time</div>
            <div className="card-subtitle">
              {Math.round(
                summary.totalStudyTime / Math.max(summary.activeDays, 1)
              )}
              m avg/day
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📚</div>
          <div className="card-content">
            <div className="card-value">{summary.totalActivities}</div>
            <div className="card-label">Activities Completed</div>
            <div className="card-subtitle">
              {Math.round(
                summary.totalActivities / Math.max(summary.activeDays, 1)
              )}{' '}
              avg/day
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <div className="card-value">{summary.averageScore}%</div>
            <div className="card-label">Average Score</div>
            <div
              className="card-subtitle"
              style={{ color: performanceLevel.color }}
            >
              {performanceLevel.level}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="activity-chart">
        <h4>📊 Daily Activity Overview</h4>
        <div className="chart-container">
          <div className="chart-grid">
            {currentData.map((day, index) => (
              <div key={index} className="day-column">
                <div className="day-header">
                  <div className="day-name">{day.dayName}</div>
                  <div className="day-date">{new Date(day.date).getDate()}</div>
                </div>

                <div className="activity-bars">
                  <div className="bar-container">
                    <div
                      className="activity-bar study-time"
                      style={{
                        height: `${day.hasActivity ? (day.studyTime / 75) * 100 : 0}%`,
                      }}
                      title={`Study time: ${day.hasActivity ? day.studyTime : 0} minutes`}
                    />
                    <div className="bar-label">Time</div>
                  </div>

                  <div className="bar-container">
                    <div
                      className="activity-bar activities"
                      style={{
                        height: `${day.hasActivity ? (day.activitiesCompleted / 5) * 100 : 0}%`,
                      }}
                      title={`Activities: ${day.hasActivity ? day.activitiesCompleted : 0}`}
                    />
                    <div className="bar-label">Activities</div>
                  </div>

                  <div className="bar-container">
                    <div
                      className="activity-bar score"
                      style={{
                        height: `${day.hasActivity ? day.score : 0}%`,
                        backgroundColor: getPerformanceLevel(day.score).color,
                      }}
                      title={`Score: ${day.hasActivity ? day.score : 0}%`}
                    />
                    <div className="bar-label">Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="performance-analysis">
        <h4>📈 Performance Analysis</h4>
        <div className="analysis-grid">
          <div className="analysis-card">
            <div className="analysis-header">
              <span className="analysis-icon">🎯</span>
              <h5>Learning Performance</h5>
            </div>
            <div className="analysis-content">
              <div
                className="performance-badge"
                style={{ backgroundColor: performanceLevel.color }}
              >
                {performanceLevel.level}
              </div>
              <p>
                Average score of {summary.averageScore}% shows{' '}
                {summary.averageScore >= 85
                  ? 'excellent'
                  : summary.averageScore >= 75
                    ? 'good'
                    : summary.averageScore >= 65
                      ? 'fair'
                      : 'concerning'}{' '}
                progress.
              </p>
            </div>
          </div>

          <div className="analysis-card">
            <div className="analysis-header">
              <span className="analysis-icon">📅</span>
              <h5>Study Consistency</h5>
            </div>
            <div className="analysis-content">
              <div
                className="performance-badge"
                style={{ backgroundColor: consistencyLevel.color }}
              >
                {consistencyLevel.level}
              </div>
              <p>
                {summary.consistency}% consistency rate.
                {summary.consistency >= 80
                  ? ' Excellent habit formation!'
                  : summary.consistency >= 60
                    ? ' Good routine, room for improvement.'
                    : ' Needs more regular study schedule.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations">
          <h4>💡 Personalized Recommendations</h4>
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`recommendation-card ${rec.priority}`}
              >
                <div className="rec-icon">{rec.icon}</div>
                <div className="rec-content">
                  <h5>{rec.title}</h5>
                  <p>{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="action-items">
        <h4>✅ Suggested Actions for Parents</h4>
        <div className="action-list">
          <div className="action-item">
            <span className="action-icon">💬</span>
            <div className="action-content">
              <h5>Daily Check-in</h5>
              <p>
                Ask your child about what they learned today and show interest
                in their progress.
              </p>
            </div>
          </div>

          <div className="action-item">
            <span className="action-icon">🏆</span>
            <div className="action-content">
              <h5>Celebrate Achievements</h5>
              <p>
                Acknowledge completed activities and improvements to maintain
                motivation.
              </p>
            </div>
          </div>

          <div className="action-item">
            <span className="action-icon">📞</span>
            <div className="action-content">
              <h5>Teacher Communication</h5>
              <p>
                Share this report with your child's teacher to align on learning
                goals.
              </p>
            </div>
          </div>

          {summary.consistency < 60 && (
            <div className="action-item priority">
              <span className="action-icon">⏰</span>
              <div className="action-content">
                <h5>Establish Routine</h5>
                <p>
                  Help create a consistent daily study schedule at the same time
                  each day.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentWeeklyReport;
