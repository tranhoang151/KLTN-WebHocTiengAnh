import React from 'react';
import {
  StudentProgressSummaryDto,
  StudentDashboardDto,
} from '../../services/progressService';
import ProgressOverview from './ProgressOverview';
import ActivityTimeline from './ActivityTimeline';
import PerformanceChart from './PerformanceChart';
import './ParentProgressOverview.css';

interface ParentProgressOverviewProps {
  child: StudentProgressSummaryDto;
  dashboardData?: StudentDashboardDto;
}

const ParentProgressOverview: React.FC<ParentProgressOverviewProps> = ({
  child,
  dashboardData,
}) => {
  const formatStudyTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours.toFixed(1)} hours`;
  };

  const getProgressLevel = (
    score: number
  ): { level: string; color: string; message: string } => {
    if (score >= 90) {
      return {
        level: 'Excellent',
        color: '#27ae60',
        message: 'Your child is excelling! Keep up the fantastic work! 🌟',
      };
    } else if (score >= 80) {
      return {
        level: 'Very Good',
        color: '#2ecc71',
        message: 'Great progress! Your child is doing very well! 👍',
      };
    } else if (score >= 70) {
      return {
        level: 'Good',
        color: '#f39c12',
        message:
          "Good work! There's room for improvement with more practice. 💪",
      };
    } else if (score >= 60) {
      return {
        level: 'Fair',
        color: '#e67e22',
        message:
          'Your child is making progress. Consider additional practice time. 📚',
      };
    } else {
      return {
        level: 'Needs Improvement',
        color: '#e74c3c',
        message: 'Your child may benefit from extra support and practice. 🤝',
      };
    }
  };

  const progressLevel = getProgressLevel(child.overallScore);

  return (
    <div className="parent-progress-overview">
      {/* Child Summary Card */}
      <div className="child-summary-card">
        <div className="summary-header">
          <h3>{child.studentName}'s Learning Journey</h3>
          <div className="overall-score">
            <span
              className="score-value"
              style={{ color: progressLevel.color }}
            >
              {child.overallScore.toFixed(1)}%
            </span>
            <span className="score-label">Overall Score</span>
          </div>
        </div>

        <div className="progress-level">
          <div
            className="level-badge"
            style={{ backgroundColor: progressLevel.color }}
          >
            {progressLevel.level}
          </div>
          <p className="level-message">{progressLevel.message}</p>
        </div>

        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-value">{child.completedActivities}</div>
              <div className="stat-label">Activities Completed</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-value">
                {formatStudyTime(child.totalStudyTimeHours)}
              </div>
              <div className="stat-label">Total Study Time</div>
            </div>
          </div>

          {dashboardData && (
            <>
              <div className="stat-item">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <div className="stat-value">{dashboardData.streakCount}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">📇</div>
                <div className="stat-content">
                  <div className="stat-value">
                    {dashboardData.completedFlashcardSets}
                  </div>
                  <div className="stat-label">Flashcard Sets</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detailed Progress Components */}
      {dashboardData && (
        <div className="detailed-progress">
          <ProgressOverview
            streakCount={dashboardData.streakCount}
            totalStudyTimeHours={dashboardData.totalStudyTimeHours}
            completedExercises={dashboardData.completedExercises}
          />

          <div className="progress-charts">
            <div className="chart-section">
              <PerformanceChart
                performanceData={dashboardData.exercisePerformance}
              />
            </div>

            <div className="activity-section">
              <ActivityTimeline activities={dashboardData.recentActivities} />
            </div>
          </div>
        </div>
      )}

      {/* Learning Insights */}
      <div className="learning-insights">
        <h3>📊 Learning Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>Study Consistency</h4>
              <p>
                {dashboardData?.streakCount && dashboardData.streakCount > 0
                  ? `Great! Your child has been studying consistently for ${dashboardData.streakCount} days.`
                  : 'Encourage daily study habits to build a learning streak.'}
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Progress Trend</h4>
              <p>
                {child.overallScore >= 75
                  ? 'Your child is showing excellent progress and understanding.'
                  : 'Consider reviewing challenging topics together for better understanding.'}
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">⏱️</div>
            <div className="insight-content">
              <h4>Study Time</h4>
              <p>
                {child.totalStudyTimeHours >= 10
                  ? 'Excellent dedication to learning! Your child is putting in great effort.'
                  : 'Consider setting aside more regular study time for better results.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="parent-recommendations">
        <h3>💡 Recommendations for Parents</h3>
        <div className="recommendations-list">
          <div className="recommendation">
            <span className="rec-icon">🏆</span>
            <div className="rec-content">
              <h4>Celebrate Achievements</h4>
              <p>
                Acknowledge your child's progress and completed activities to
                maintain motivation.
              </p>
            </div>
          </div>

          <div className="recommendation">
            <span className="rec-icon">📅</span>
            <div className="rec-content">
              <h4>Establish Routine</h4>
              <p>
                Help your child maintain a consistent daily study schedule for
                better learning outcomes.
              </p>
            </div>
          </div>

          <div className="recommendation">
            <span className="rec-icon">🤝</span>
            <div className="rec-content">
              <h4>Stay Involved</h4>
              <p>
                Ask about what they learned today and show interest in their
                English learning journey.
              </p>
            </div>
          </div>

          {child.overallScore < 70 && (
            <div className="recommendation priority">
              <span className="rec-icon">📞</span>
              <div className="rec-content">
                <h4>Consider Extra Support</h4>
                <p>
                  Contact your child's teacher to discuss additional support or
                  practice opportunities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentProgressOverview;
