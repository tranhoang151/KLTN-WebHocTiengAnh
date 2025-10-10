import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  progressService,
  StudentProgressSummaryDto,
  StudentDashboardDto,
} from '../../services/progressService';
import { flashcardService } from '../../services/flashcardService';
import ParentProgressOverview from './ParentProgressOverview';
import ParentStreakCalendar from './ParentStreakCalendar';
import ParentBadgeCollection from './ParentBadgeCollection';
import ParentWeeklyReport from './ParentWeeklyReport';
import './ParentProgressInterface.css';

interface ChildDetailedProgress extends StudentProgressSummaryDto {
  dashboardData?: StudentDashboardDto;
  badges?: any[];
  streakData?: {
    currentStreak: number;
    longestStreak: number;
    streakCalendar: { [date: string]: boolean };
  };
}

const ParentProgressInterface: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildDetailedProgress[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'streaks' | 'badges' | 'reports'
  >('overview');

  useEffect(() => {
    if (user?.role === 'parent') {
      loadChildrenProgress();
    }
  }, [user]);

  const loadChildrenProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get basic children summaries
      const summariesResponse =
        await progressService.getChildrenProgressSummaries(user.id);

      if (!summariesResponse.success || !summariesResponse.data) {
        throw new Error(
          summariesResponse.error || 'Failed to load children progress'
        );
      }

      // Load detailed data for each child
      const childrenWithDetails = await Promise.all(
        summariesResponse.data.map(async (child) => {
          try {
            // Get detailed dashboard data
            const dashboardResponse =
              await progressService.getStudentDashboardData(child.studentId);

            // Get badge data (if available)
            let badges = [];
            try {
              const badgeResponse = await flashcardService.getUserBadges(
                child.studentId
              );
              badges = badgeResponse || [];
            } catch (badgeError) {
              console.warn(
                'Could not load badges for child:',
                child.studentId,
                badgeError
              );
            }

            // Get streak data (if available)
            let streakData = {
              currentStreak: 0,
              longestStreak: 0,
              streakCalendar: {},
            };
            try {
              const streakResponse = await flashcardService.getStreakData(
                child.studentId
              );
              streakData = streakResponse || streakData;
            } catch (streakError) {
              console.warn(
                'Could not load streak data for child:',
                child.studentId,
                streakError
              );
            }

            return {
              ...child,
              dashboardData: dashboardResponse.success
                ? dashboardResponse.data
                : undefined,
              badges,
              streakData,
            };
          } catch (childError) {
            console.error(
              'Error loading detailed data for child:',
              child.studentId,
              childError
            );
            return child;
          }
        })
      );

      setChildren(childrenWithDetails);

      // Select first child by default
      if (childrenWithDetails.length > 0) {
        setSelectedChild(childrenWithDetails[0].studentId);
      }
    } catch (err: any) {
      console.error('Error loading children progress:', err);
      setError(err.message || 'Failed to load children progress');
    } finally {
      setLoading(false);
    }
  };

  const selectedChildData = selectedChild
    ? children.find((child) => child.studentId === selectedChild)
    : null;

  if (loading) {
    return (
      <div className="parent-progress-loading">
        <div className="loading-spinner"></div>
        <p>Loading your children's progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parent-progress-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Progress</h3>
        <p>{error}</p>
        <button onClick={loadChildrenProgress} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="parent-progress-empty">
        <div className="empty-icon">👨‍👩‍👧‍👦</div>
        <h3>No Children Found</h3>
        <p>No children are currently linked to your parent account.</p>
        <p>
          Please contact your child's teacher or administrator to link your
          accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="parent-progress-interface">
      <div className="progress-header">
        <h2>👨‍👩‍👧‍👦 My Children's Learning Progress</h2>
        <p>
          Monitor your children's learning journey, achievements, and growth
        </p>
      </div>

      {/* Child Selector */}
      <div className="child-selector">
        <h3>Select Child:</h3>
        <div className="child-tabs">
          {children.map((child) => (
            <button
              key={child.studentId}
              onClick={() => setSelectedChild(child.studentId)}
              className={`child-tab ${selectedChild === child.studentId ? 'active' : ''}`}
            >
              <div className="child-info">
                <span className="child-name">{child.studentName}</span>
                <span className="child-score">
                  {child.overallScore.toFixed(1)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedChildData && (
        <>
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              onClick={() => setActiveTab('overview')}
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('streaks')}
              className={`tab-btn ${activeTab === 'streaks' ? 'active' : ''}`}
            >
              🔥 Learning Streaks
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
            >
              🏆 Badges & Achievements
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            >
              📈 Progress Reports
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <ParentProgressOverview
                child={selectedChildData}
                dashboardData={selectedChildData.dashboardData}
              />
            )}

            {activeTab === 'streaks' && (
              <ParentStreakCalendar
                childName={selectedChildData.studentName}
                streakData={selectedChildData.streakData}
                dashboardData={selectedChildData.dashboardData}
              />
            )}

            {activeTab === 'badges' && (
              <ParentBadgeCollection
                childName={selectedChildData.studentName}
                badges={selectedChildData.badges || []}
              />
            )}

            {activeTab === 'reports' && (
              <ParentWeeklyReport
                child={selectedChildData}
                dashboardData={selectedChildData.dashboardData}
              />
            )}
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => window.print()}>
            🖨️ Print Progress Report
          </button>
          <button className="action-btn" onClick={loadChildrenProgress}>
            🔄 Refresh Data
          </button>
          <button
            className="action-btn"
            onClick={() => setActiveTab('reports')}
          >
            📧 View Weekly Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentProgressInterface;
