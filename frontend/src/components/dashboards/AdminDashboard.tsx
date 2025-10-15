import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { usePermissions } from '../../hooks/usePermissions';
import UserManagement from '../admin/UserManagement';
import SystemConfigManagement from '../admin/SystemConfigManagement';
import VideoManagementPage from '../../pages/admin/videos/VideoManagementPage';
import AnalyticsPage from '../../pages/admin/AnalyticsPage';
import { ContentManagement } from '../content';
import CourseList from '../course/CourseList';
import ClassManagement from '../class/ClassManagement';
import ExerciseList from '../exercise/ExerciseList';
import QuestionManagement from '../question/QuestionManagement';
import FlashcardManagement from '../flashcard/FlashcardManagement';

const AdminDashboardHome: React.FC = () => {
  const { hasPermission } = usePermissions();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Analytics Dashboard */}
        {hasPermission('reports', 'read') && (
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
                      backgroundColor: '#06b6d4',
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
                      📈
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
                      Analytics
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Platform Stats
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
                  to="/admin/analytics"
                  style={{
                    fontWeight: '500',
                    color: '#0891b2',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0e7490';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#0891b2';
                  }}
                >
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Users Management */}
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
                      Users
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Manage users
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

        {/* Courses Management */}
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
                      Courses
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Manage courses
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

        {/* Classes Management */}
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
                      Classes
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Manage classes
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

        {/* Content Management */}
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
                      Content
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Manage content
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
                  to="/admin/content"
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
                  Manage content
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Flashcards */}
        {hasPermission('flashcards', 'read') && (
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
                      backgroundColor: '#6366f1',
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
                      🃏
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
                      Flashcards
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Manage flashcards
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
                  to="/admin/flashcards"
                  style={{
                    fontWeight: '500',
                    color: '#4338ca',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#3730a3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#4338ca';
                  }}
                >
                  Manage flashcards
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Exercises */}
        {hasPermission('exercises', 'read') && (
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
                      backgroundColor: '#ec4899',
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
                      ✏️
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
                      Exercises
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Manage exercises
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
                  to="/admin/exercises"
                  style={{
                    fontWeight: '500',
                    color: '#be185d',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#9d174d';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#be185d';
                  }}
                >
                  Manage exercises
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Questions Bank */}
        {hasPermission('questions', 'read') && (
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
                      Questions
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Question bank
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
                  Manage questions
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Videos Management */}
        {hasPermission('videos', 'read') && (
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
                      backgroundColor: '#f97316',
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
                      🎥
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
                      Videos
                    </dt>
                    <dd
                      style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Manage video lessons
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
                  to="/admin/videos"
                  style={{
                    fontWeight: '500',
                    color: '#ea580c',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#c2410c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#ea580c';
                  }}
                >
                  Manage videos
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* System Configuration */}
        {hasPermission('admin', 'write') && (
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
                  Manage system
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* System Reports */}
        {hasPermission('reports', 'read') && (
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
        )}
      </div>

      {/* System Overview */}
      <div
        style={{
          marginTop: '32px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex' }}>
          <div style={{ flexShrink: 0 }}>
            <span style={{ color: '#f87171', fontSize: '20px' }}>⚙️</span>
          </div>
          <div style={{ marginLeft: '12px' }}>
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#991b1b',
                margin: '0 0 8px 0',
              }}
            >
              System Administration
            </h3>
            <div style={{ fontSize: '14px', color: '#b91c1c' }}>
              <p style={{ margin: '0' }}>
                Full system access for managing users, courses, classes, and all
                learning content. Monitor system performance, generate reports,
                and maintain the learning platform.
              </p>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Admin Dashboard">
      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/exercises" element={<ExerciseList />} />
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
