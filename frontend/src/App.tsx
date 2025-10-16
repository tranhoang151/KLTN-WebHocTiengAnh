import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
// import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { SecurityProvider } from './components/security/SecurityProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Unauthorized from './components/Unauthorized';
import StudentDashboard from './components/dashboards/StudentDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
// import { AdminDashboard } from './utils/routeLazyLoading';
import Profile from './components/Profile';
import CourseDetailPage from './pages/learning/CourseDetailPage';
import { AchievementManager } from './components/achievement';
import { useAuth } from './contexts/AuthContext';
import { roleService } from './services/roleService';
// import SkipLinks from './components/accessibility/SkipLinks';
// import AccessibilityButton from './components/accessibility/AccessibilityButton';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Redirect authenticated users to their dashboard
  const getDefaultRedirect = () => {
    if (isAuthenticated && user) {
      return roleService.getDashboardPath(user.role);
    }
    return '/login';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Profile Route - Available to all authenticated users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={<Navigate to={getDefaultRedirect()} replace />}
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <SecurityProvider>
      <Router>
        <AuthProvider>
          {/* <AccessibilityProvider> */}
          <div className="App">
            {/* <SkipLinks /> */}
            <main id="main-content">
              <AppRoutes />
            </main>
            <AchievementManager />
            {/* <AccessibilityButton /> */}
          </div>
          {/* </AccessibilityProvider> */}
        </AuthProvider>
      </Router>
    </SecurityProvider>
  );
};

export default App;
