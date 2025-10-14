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
    <div style={{ padding: '2rem' }}>
      {/* Welcome Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Welcome to Admin Dashboard
        </h1>
        <p style={{
          fontSize: '1.1rem',
          margin: 0,
          opacity: 0.9
        }}>
          Manage your BingGo platform with powerful tools and insights
        </p>
      </div>

      {/* Dashboard Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Analytics Dashboard */}
        {hasPermission('reports', 'read') && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 25px rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(220, 38, 38, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0'
                }}>
                  Analytics
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Platform Statistics
                </p>
              </div>
            </div>
            <Link
              to="/admin/analytics"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#dc2626',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = '#dc2626';
              }}
            >
              View Analytics
              <span style={{ fontSize: '0.8rem' }}>→</span>
            </Link>
          </div>
        )}

        {/* Users Management */}
        {hasPermission('users', 'read') && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 25px rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(220, 38, 38, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0'
                }}>
                  Users
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  margin: 0
                }}>
                  User Management
                </p>
              </div>
            </div>
            <Link
              to="/admin/users"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#dc2626',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = '#dc2626';
              }}
            >
              Manage Users
              <span style={{ fontSize: '0.8rem' }}>→</span>
            </Link>
          </div>
        )}

        {/* Courses Management */}
        {hasPermission('courses', 'read') && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 25px rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(220, 38, 38, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📚</span>
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0'
                }}>
                  Courses
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Course Management
                </p>
              </div>
            </div>
            <Link
              to="/admin/courses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#dc2626',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = '#dc2626';
              }}
            >
              Manage Courses
              <span style={{ fontSize: '0.8rem' }}>→</span>
            </Link>
          </div>
        )}

        {/* Classes Management */}
        {hasPermission('classes', 'read') && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 25px rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(220, 38, 38, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🏫</span>
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0'
                }}>
                  Classes
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Class Management
                </p>
              </div>
            </div>
            <Link
              to="/admin/classes"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#dc2626',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = '#dc2626';
              }}
            >
              Manage Classes
              <span style={{ fontSize: '0.8rem' }}>→</span>
            </Link>
          </div>
        )}

        {/* Content Management */}
        {hasPermission('content', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📝</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Content
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Manage content
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/content"
                  className="font-medium text-purple-700 hover:text-purple-900"
                >
                  Manage content
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Flashcards */}
        {hasPermission('flashcards', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🃏</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Flashcards
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Manage flashcards
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/flashcards"
                  className="font-medium text-indigo-700 hover:text-indigo-900"
                >
                  Manage flashcards
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Exercises */}
        {hasPermission('exercises', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">✏️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Exercises
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Manage exercises
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/exercises"
                  className="font-medium text-pink-700 hover:text-pink-900"
                >
                  Manage exercises
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Questions Bank */}
        {hasPermission('questions', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">❓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Questions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Question bank
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/questions"
                  className="font-medium text-red-700 hover:text-red-900"
                >
                  Manage questions
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Videos Management */}
        {hasPermission('videos', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🎥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Videos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Manage video lessons
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/videos"
                  className="font-medium text-orange-700 hover:text-orange-900"
                >
                  Manage videos
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* System Configuration */}
        {hasPermission('admin', 'write') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">⚙️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      System Config
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      System settings & maintenance
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/system-config"
                  className="font-medium text-purple-700 hover:text-purple-900"
                >
                  Manage system
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* System Reports */}
        {hasPermission('reports', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Reports
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      System reports
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/reports"
                  className="font-medium text-gray-700 hover:text-gray-900"
                >
                  View reports
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Overview */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-400 text-xl">⚙️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              System Administration
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Full system access for managing users, courses, classes, and all
                learning content. Monitor system performance, generate reports,
                and maintain the learning platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 1.5rem 0',
          textAlign: 'center'
        }}>
          Quick Overview
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Analytics</div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Active Users</div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>📚</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Courses</div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>🏫</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Active Classes</div>
          </div>
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
