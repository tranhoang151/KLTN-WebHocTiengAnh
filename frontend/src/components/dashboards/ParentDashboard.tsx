import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { usePermissions } from '../../hooks/usePermissions';
import ParentProgressPage from '../../pages/parent/ParentProgressPage';
import ChildProgressDetailPage from '../../pages/parent/ChildProgressDetailPage';
import ParentProgressInterface from '../progress/ParentProgressInterface';

const ParentDashboard: React.FC = () => {
  const { hasPermission } = usePermissions();

  return (
    <DashboardLayout title="Parent Dashboard">
      <Routes>
        <Route path="/" element={<ParentDashboardHome />} />
        <Route path="/progress" element={<ParentProgressInterface />} />
        <Route path="/progress-old" element={<ParentProgressPage />} />
        <Route
          path="/progress/child/:childId"
          element={<ChildProgressDetailPage />}
        />
        {/* Add more routes as needed */}
      </Routes>
    </DashboardLayout>
  );
};

export default ParentDashboard;

const ParentDashboardHome: React.FC = () => {
  const { hasPermission } = usePermissions();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Children */}
        {hasPermission('children', 'read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">👶</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      My Children
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      View children
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/parent/children"
                  className="font-medium text-blue-700 hover:text-blue-900"
                >
                  View children
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
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Progress
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Learning progress
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/parent/progress"
                  className="font-medium text-green-700 hover:text-green-900"
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
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📈</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Reports
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Learning reports
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/parent/reports"
                  className="font-medium text-purple-700 hover:text-purple-900"
                >
                  View reports
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parent Information */}
      <div className="mt-8 bg-purple-50 border border-purple-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-purple-400 text-xl">👨‍👩‍👧‍👦</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">
              Parent Portal
            </h3>
            <div className="mt-2 text-sm text-purple-700">
              <p>
                Monitor your child's learning progress, view detailed reports,
                and stay informed about their achievements. Track their learning
                streaks, badges earned, and overall performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-500">Children Enrolled</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-500">Total Lessons Completed</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500">Badges Earned</div>
          </div>
        </div>
      </div>
    </>
  );
};
