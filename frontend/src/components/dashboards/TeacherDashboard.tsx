import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import FlashcardSetManager from '../flashcard/FlashcardSetManager';
import VideoManagementPage from '../../pages/admin/videos/VideoManagementPage'; // Re-using for teachers to manage their own videos
import TeacherProgressPage from '../../pages/teacher/TeacherProgressPage';
import ClassProgressPage from '../../pages/teacher/ClassProgressPage';
import StudentProgressDetailPage from '../../pages/teacher/StudentProgressDetailPage';
import TeacherAnalyticsDashboard from '../progress/TeacherAnalyticsDashboard';
import TeacherStudentManagement from '../../pages/teacher/TeacherStudentManagement';
import TeacherEvaluationPage from '../../pages/teacher/TeacherEvaluationPage';
import AssignmentManagement from '../assignment/AssignmentManagement';
import DashboardLayout from '../DashboardLayout';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherDashboard: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/analytics" element={<TeacherAnalyticsDashboard />} />
      <Route path="/flashcards" element={<FlashcardSetManager />} />
      <Route path="/students" element={<TeacherStudentManagement />} />
      <Route path="/evaluations" element={<TeacherEvaluationPage />} />
      <Route path="/assignments" element={<AssignmentManagement />} />
      <Route path="/progress" element={<TeacherProgressPage />} />
      <Route path="/progress/class/:classId" element={<ClassProgressPage />} />
      <Route path="/progress/student/:studentId" element={<StudentProgressDetailPage />} />
      <Route
        path="/"
        element={
          <DashboardLayout title="Teacher Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Classes */}
              {hasPermission('classes', 'read') && (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            🏫
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            My Classes
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
                      <a
                        href="/teacher/classes"
                        className="font-medium text-blue-700 hover:text-blue-900"
                      >
                        View classes
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Students */}
              {hasPermission('students', 'read') && (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            👥
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Students
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            View student list
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link
                        to="/teacher/students"
                        className="font-medium text-green-700 hover:text-green-900"
                      >
                        Manage students
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignments */}
              {hasPermission('assignments', 'read') && (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            📋
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Assignments
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Create & manage
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link
                        to="/teacher/assignments"
                        className="font-medium text-yellow-700 hover:text-yellow-900"
                      >
                        Manage assignments
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Tracking */}
              {hasPermission('progress', 'read') && (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            📊
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Progress
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Student progress
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link
                        to="/teacher/progress"
                        className="font-medium text-purple-700 hover:text-purple-900"
                      >
                        View progress
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Reports */}
              {hasPermission('reports', 'read') && (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            📈
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Reports
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Generate reports
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <a
                        href="/teacher/reports"
                        className="font-medium text-indigo-700 hover:text-indigo-900"
                      >
                        View reports
                      </a>
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
                        <div className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            📚
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Content
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Assign content
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <a
                        href="/teacher/content"
                        className="font-medium text-pink-700 hover:text-pink-900"
                      >
                        Manage content
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Flashcard Management */}
              {hasPermission('content', 'write') && (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            🃏
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Flashcards
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Create & manage
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <a
                        href="/teacher/flashcards"
                        className="font-medium text-orange-700 hover:text-orange-900"
                      >
                        Manage flashcards
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Evaluations */}
              {hasPermission('evaluations', 'read') && (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            📝
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Evaluations
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Student assessments
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link
                        to="/teacher/evaluations"
                        className="font-medium text-purple-700 hover:text-purple-900"
                      >
                        Manage evaluations
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400 text-xl">🎯</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Teacher Tools
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Manage your classes, track student progress, create
                      assignments, and generate reports. Use the content
                      management tools to assign learning materials to your
                      students.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DashboardLayout>
        }
      />
    </Routes>
  );
};

export default TeacherDashboard;
