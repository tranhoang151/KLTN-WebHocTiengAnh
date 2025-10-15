import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { usePermissions } from '../../hooks/usePermissions';
import { apiService } from '../../services/apiService';
import UserManagement from '../admin/UserManagement';
import SystemConfigManagement from '../admin/SystemConfigManagement';
import VideoManagementPage from '../../pages/admin/videos/VideoManagementPage';
import AnalyticsPage from '../../pages/admin/AnalyticsPage';
import { ContentManagement } from '../content';
import CourseManagement from '../course/CourseManagement';
import ClassManagement from '../class/ClassManagement';
import ExerciseManagement from '../exercise/ExerciseManagement';
import QuestionManagement from '../question/QuestionManagement';
import FlashcardManagement from '../flashcard/FlashcardManagement';

const AdminDashboardHome: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalTeachers: 0,
    totalContent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardData = await apiService.getDashboardStats();
        setStats({
          totalUsers: dashboardData.stats.totalUsers,
          totalClasses: dashboardData.stats.totalClasses,
          totalTeachers: dashboardData.stats.totalTeachers,
          totalContent: dashboardData.stats.totalContent,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Keep default values (0) on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* System Overview */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 16px 0',
          }}
        >
          System Overview
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              padding: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    👥
                  </span>
                </div>
              </div>
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#111827',
                  }}
                >
                  {loading ? '...' : stats.totalUsers}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                  }}
                >
                  Total users
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              padding: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#eab308',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    🏫
                  </span>
                </div>
              </div>
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#111827',
                  }}
                >
                  {loading ? '...' : stats.totalClasses}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                  }}
                >
                  Classes
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              padding: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#10b981',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    👨‍🏫
                  </span>
                </div>
              </div>
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#111827',
                  }}
                >
                  {loading ? '...' : stats.totalTeachers}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                  }}
                >
                  Teachers
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              padding: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#8b5cf6',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    📚
                  </span>
                </div>
              </div>
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#111827',
                  }}
                >
                  {loading ? '...' : stats.totalContent}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                  }}
                >
                  Content
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Manage Users */}
        {hasPermission('users', 'read') && (
          <div
            style={{
              backgroundColor: 'white',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      👥
                    </span>
                  </div>
                </div>
                <div style={{ marginLeft: '20px', flex: 1 }}>
                  <dl>
                    <dt
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Manage Users
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      User management
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '14px' }}>
                <Link
                  to="/admin/users"
                  style={{
                    fontWeight: '500',
                    color: '#1d4ed8',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1e40af';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#1d4ed8';
                  }}
                >
                  Manage users
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Manage classes */}
        {hasPermission('classes', 'read') && (
          <div
            style={{
              backgroundColor: 'white',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#eab308',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      🏫
                    </span>
                  </div>
                </div>
                <div style={{ marginLeft: '20px', flex: 1 }}>
                  <dl>
                    <dt
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Manage classes
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Class management
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '14px' }}>
                <Link
                  to="/admin/classes"
                  style={{
                    fontWeight: '500',
                    color: '#a16207',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#854d0e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#a16207';
                  }}
                >
                  Manage classes
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Manage courses */}
        {hasPermission('courses', 'read') && (
          <div
            style={{
              backgroundColor: 'white',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#10b981',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      📚
                    </span>
                  </div>
                </div>
                <div style={{ marginLeft: '20px', flex: 1 }}>
                  <dl>
                    <dt
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Manage courses
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Course management
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '14px' }}>
                <Link
                  to="/admin/courses"
                  style={{
                    fontWeight: '500',
                    color: '#047857',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#065f46';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#047857';
                  }}
                >
                  Manage courses
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Manage content */}
        {hasPermission('content', 'read') && (
          <div
            style={{
              backgroundColor: 'white',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      📝
                    </span>
                  </div>
                </div>
                <div style={{ marginLeft: '20px', flex: 1 }}>
                  <dl>
                    <dt
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Manage content
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Content management
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link
                    to="/admin/content?tab=flashcards"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    Manage Flashcards
                  </Link>
                  <Link
                    to="/admin/content?tab=exercises"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    Manage Exercises
                  </Link>
                  <Link
                    to="/admin/content?tab=tests"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    Manage Tests
                  </Link>
                  <Link
                    to="/admin/videos"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    Manage Video
                  </Link>
                  <Link
                    to="/admin/questions"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    Question bank
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Admin Dashboard">
      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/exercises" element={<ExerciseManagement />} />
        <Route path="/questions" element={<QuestionManagement />} />
        <Route path="/flashcards" element={<FlashcardManagement />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/system-config" element={<SystemConfigManagement />} />
        <Route path="/videos" element={<VideoManagementPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
