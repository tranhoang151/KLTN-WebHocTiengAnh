import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { usePermissions } from '../../hooks/usePermissions';
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Analytics Dashboard */}
        {hasPermission('reports', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-cyan-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📈</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Analytics
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Platform Stats
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/analytics"
                  className="font-medium text-cyan-700 hover:text-cyan-900"
                >
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Users Management */}
        {hasPermission('users', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Manage users
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/users"
                  className="font-medium text-blue-700 hover:text-blue-900"
                >
                  Manage users
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Courses Management */}
        {hasPermission('courses', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📚</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Manage courses
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/courses"
                  className="font-medium text-green-700 hover:text-green-900"
                >
                  Manage courses
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Classes Management */}
        {hasPermission('classes', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🏫</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Classes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Manage classes
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/admin/classes"
                  className="font-medium text-yellow-700 hover:text-yellow-900"
                >
                  Manage classes
                </Link>
              </div>
            </div>
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
