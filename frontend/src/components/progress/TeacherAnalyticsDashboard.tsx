import React, { useState, useEffect } from 'react';
import {
  FlashcardProgress,
  flashcardService,
  TeacherAnalytics,
  ClassAnalytics,
  StudentAnalytics,
} from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherAnalyticsDashboard.css';

interface TeacherAnalyticsDashboardProps {
  courseId?: string;
  setId?: string;
  onBack?: () => void;
}

const TeacherAnalyticsDashboard: React.FC<TeacherAnalyticsDashboardProps> = ({
  courseId,
  setId,
  onBack,
}) => {
  const { user } = useAuth();
  const [teacherAnalytics, setTeacherAnalytics] =
    useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [courseId, setId]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const analytics = await flashcardService.getTeacherAnalytics(
        user.id,
        courseId,
        setId
      );

      // Transform dates
      const transformedAnalytics: TeacherAnalytics = {
        ...analytics,
        classes: analytics.classes.map((cls) => ({
          ...cls,
          studentsProgress: cls.studentsProgress.map((student) => ({
            ...student,
            lastActivity: student.lastActivity
              ? new Date(student.lastActivity)
              : null,
          })),
        })),
      };

      setTeacherAnalytics(transformedAnalytics);
    } catch (err: any) {
      console.error('Error loading teacher analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return '#27ae60';
    if (percentage >= 60) return '#f39c12';
    if (percentage >= 40) return '#e67e22';
    return '#e74c3c';
  };

  const getActivityStatus = (
    lastActivity: Date | null
  ): { status: string; color: string } => {
    if (!lastActivity) return { status: 'Never', color: '#95a5a6' };

    const now = new Date();
    const diffHours =
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) return { status: 'Today', color: '#27ae60' };
    if (diffHours < 48) return { status: 'Yesterday', color: '#f39c12' };
    if (diffHours < 168) return { status: 'This week', color: '#e67e22' };
    return { status: 'Inactive', color: '#e74c3c' };
  };

  if (loading) {
    return (
      <div className="teacher-analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-analytics-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Analytics</h3>
        <p>{error}</p>
        <button onClick={loadAnalytics} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const selectedClassData =
    selectedClass && teacherAnalytics
      ? teacherAnalytics.classes.find((c) => c.classId === selectedClass)
      : null;

  return (
    <div className="teacher-analytics-dashboard">
      <div className="dashboard-header">
        {onBack && (
          <button onClick={onBack} className="btn-back">
            ← Back
          </button>
        )}
        <div className="header-content">
          <h2>📊 Student Progress Analytics</h2>
          <p>Monitor your students' learning progress and performance</p>
        </div>
        <div className="view-controls">
          <button
            onClick={() => setViewMode('overview')}
            className={`btn-view ${viewMode === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`btn-view ${viewMode === 'detailed' ? 'active' : ''}`}
          >
            Detailed
          </button>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="overview-section">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <div className="card-value">
                  {teacherAnalytics?.summary.totalStudents || 0}
                </div>
                <div className="card-label">Total Students</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <div className="card-value">
                  {teacherAnalytics?.summary.activeStudents || 0}
                </div>
                <div className="card-label">Active Students</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <div className="card-value">
                  {Math.round(teacherAnalytics?.summary.averageCompletion || 0)}
                  %
                </div>
                <div className="card-label">Avg. Completion</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⏱️</div>
              <div className="card-content">
                <div className="card-value">
                  {formatTime(teacherAnalytics?.summary.totalTimeSpent || 0)}
                </div>
                <div className="card-label">Total Study Time</div>
              </div>
            </div>
          </div>

          <div className="classes-grid">
            {teacherAnalytics?.classes.map((classData) => (
              <div
                key={classData.classId}
                className="class-card"
                onClick={() => {
                  setSelectedClass(classData.classId);
                  setViewMode('detailed');
                }}
              >
                <div className="class-header">
                  <h3>{classData.className}</h3>
                  <div className="class-stats">
                    {classData.activeStudents}/{classData.totalStudents} active
                  </div>
                </div>

                <div className="class-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${classData.averageCompletion}%`,
                        backgroundColor: getProgressColor(
                          classData.averageCompletion
                        ),
                      }}
                    />
                  </div>
                  <div className="progress-text">
                    {classData.averageCompletion}% average completion
                  </div>
                </div>

                <div className="class-metrics">
                  <div className="metric">
                    <span className="metric-icon">⏱️</span>
                    <span className="metric-value">
                      {formatTime(classData.totalTimeSpent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="detailed-section">
          <div className="class-selector">
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select a class</option>
              {teacherAnalytics?.classes.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          {selectedClassData && (
            <div className="class-details">
              <div className="class-info">
                <h3>{selectedClassData.className}</h3>
                <div className="class-summary">
                  <span>{selectedClassData.totalStudents} students</span>
                  <span>•</span>
                  <span>
                    {selectedClassData.averageCompletion}% avg. completion
                  </span>
                  <span>•</span>
                  <span>
                    {formatTime(selectedClassData.totalTimeSpent)} total time
                  </span>
                </div>
              </div>

              <div className="students-table">
                <div className="table-header">
                  <div className="header-cell">Student</div>
                  <div className="header-cell">Progress</div>
                  <div className="header-cell">Time Spent</div>
                  <div className="header-cell">Streak</div>
                  <div className="header-cell">Last Activity</div>
                </div>

                <div className="table-body">
                  {selectedClassData.studentsProgress.map((student) => {
                    const activityStatus = getActivityStatus(
                      student.lastActivity
                    );

                    return (
                      <div key={student.userId} className="table-row">
                        <div className="cell student-info">
                          <div className="student-name">{student.userName}</div>
                          <div className="student-email">{student.email}</div>
                        </div>

                        <div className="cell progress-cell">
                          <div className="progress-bar small">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${student.completionPercentage}%`,
                                backgroundColor: getProgressColor(
                                  student.completionPercentage
                                ),
                              }}
                            />
                          </div>
                          <span className="progress-text">
                            {student.completionPercentage}%
                          </span>
                        </div>

                        <div className="cell">
                          {formatTime(student.totalTimeSpent)}
                        </div>

                        <div className="cell streak-cell">
                          <span className="streak-icon">🔥</span>
                          <span className="streak-value">{student.streak}</span>
                        </div>

                        <div className="cell activity-cell">
                          <span
                            className="activity-status"
                            style={{ color: activityStatus.color }}
                          >
                            {activityStatus.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherAnalyticsDashboard;
