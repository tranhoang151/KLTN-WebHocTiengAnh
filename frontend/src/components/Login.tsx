import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { roleService } from '../services/roleService';
import { UserRole } from '../types';
import DemoLoginInfo from './DemoLoginInfo';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Get the intended destination or default based on role
  const from = location.state?.from?.pathname || '/';

  const getRoleBasedPath = (role: string): string => {
    return roleService.getDashboardPath(role as UserRole);
  };

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    // Redirect to role-specific dashboard
    const defaultPath = getRoleBasedPath(user.role);
    return <Navigate to={from !== '/login' ? from : defaultPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled by the redirect logic above
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: any): string => {
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'No account found with this email address.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/user-disabled':
          return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        default:
          return 'Login failed. Please check your credentials and try again.';
      }
    }
    return error.message || 'An unexpected error occurred. Please try again.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <DemoLoginInfo />
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to BingGo
          </h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <p>🚀 Demo Mode Active</p>
          <p className="text-xs mt-1 text-blue-600">
            Check the demo accounts panel on the right →
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
