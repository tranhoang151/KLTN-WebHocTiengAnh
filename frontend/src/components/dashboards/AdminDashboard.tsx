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
    <>
      {/* System Overview Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '32px',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 20px 0',
          }}
        >
          System Overview
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
              {loading ? '...' : stats.totalUsers}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Total Users
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#eab308', marginBottom: '8px' }}>
              {loading ? '...' : stats.totalClasses}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Classes
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              {loading ? '...' : stats.totalTeachers}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Teachers
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
              {loading ? '...' : stats.totalContent}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Content
            </div>
          </div>
        </div>
      </div>

      {/* Management Actions Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                        User Management
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
                    Manage Users
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Manage Classes */}
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
                        Manage Classes
                      </dt>
                      <dd
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '4px 0 0 0',
                        }}
                      >
                        Class Management
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
                    Manage Classes
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Manage Courses */}
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
                        Manage Courses
                      </dt>
                      <dd
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '4px 0 0 0',
                        }}
                      >
                        Course Management
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
                    Manage Courses
                  </Link>
                </div>
              </div>
            </div>
          )}


          {/* Manage Content */}
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
                        Manage Content
                      </dt>
                      <dd
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '4px 0 0 0',
                        }}
                      >
                        Content Management
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link
                    to="/admin/flashcards"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    • Manage Flashcards
                  </Link>
                  <Link
                    to="/admin/exercises"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    • Manage Exercises
                  </Link>
                  <Link
                    to="/admin/questions"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    • Manage Tests
                  </Link>
                  <Link
                    to="/admin/videos"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    • Manage Video
                  </Link>
                </div>
              </div>
            </div>
          )}


        </div>

        {/* Question Bank */}
        {
          hasPermission('questions', 'read') && (
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
                        backgroundColor: '#ef4444',
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
                        ❓
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
                        Question Bank
                      </dt>
                      <dd
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '4px 0 0 0',
                        }}
                      >
                        Question Management
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
                    to="/admin/questions"
                    style={{
                      fontWeight: '500',
                      color: '#dc2626',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#dc2626';
                    }}
                  >
                    Question Bank
                  </Link>
                </div>
              </div>
            </div>
          )
        }


        {/* System Configuration */}
        {
          hasPermission('admin', 'write') && (
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
                        ⚙️
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
                        System Config
                      </dt>
                      <dd
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '4px 0 0 0',
                        }}
                      >
                        System settings & maintenance
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
                    to="/admin/system-config"
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
                    System config
                  </Link>
                </div>
              </div>
            </div>
          )
        }

        {/* System Reports */}
        {
          hasPermission('reports', 'read') && (
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
                        backgroundColor: '#6b7280',
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
                        📊
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
                        Reports
                      </dt>
                      <dd
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '4px 0 0 0',
                        }}
                      >
                        System reports
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
                    to="/admin/reports"
                    style={{
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#4b5563';
                    }}
                  >
                    View reports
                  </Link>
                </div>
              </div>
            </div>
          )
        }
      </div>


      {/* Quick Actions Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 16px 0',
          }}
        >
          Quick Actions
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <Link
            to="/admin/users"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <span style={{ marginRight: '8px' }}>👥</span>
            <span style={{ fontWeight: '500' }}>Add New User</span>
          </Link>

          <Link
            to="/admin/courses"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <span style={{ marginRight: '8px' }}>📚</span>
            <span style={{ fontWeight: '500' }}>Create Course</span>
          </Link>

          <Link
            to="/admin/analytics"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <span style={{ marginRight: '8px' }}>📊</span>
            <span style={{ fontWeight: '500' }}>View Reports</span>
          </Link>
        </div>
      </div>
    </>
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
