import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { roleService } from '../services/roleService';
import { UserRole } from '../types';
import {
  GraduationCap,
  Mail,
  Lock,
  AlertTriangle,
  Rocket,
  Eye,
  EyeOff,
} from 'lucide-react';
// import DemoLoginInfo from './DemoLoginInfo';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="login-page" style={{ display: 'flex' }}>
      {/* Left Column: Image (50%) */}
      <div
        style={{
          display: isMobile ? 'none' : 'flex',
          width: '50%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <img
          src="/illustrator_website.png"
          alt="BingGo Learning Platform"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Right Column: Login Form (50%) */}
      <div
        style={{
          width: isMobile ? '100%' : '50%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
          }}
        >
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <GraduationCap size={28} />
            </div>
            <h2
              style={{
                fontSize: 'var(--font-size-xxl)',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0',
              }}
            >
              Welcome to BingGo
            </h2>
            <p
              style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '0',
                fontWeight: '500',
              }}
            >
              Fun English Starts Here!
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  fontSize: '14px',
                }}
              >
                <AlertTriangle size={18} color="#dc2626" />
                <span style={{ fontWeight: '500' }}>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa',
                  }}
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#3b82f6';
                    target.style.backgroundColor = 'white';
                    target.style.boxShadow =
                      '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#e5e7eb';
                    target.style.backgroundColor = '#fafafa';
                    target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                  }}
                >
                  <Mail size={18} color="#9ca3af" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 50px 16px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa',
                  }}
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#3b82f6';
                    target.style.backgroundColor = 'white';
                    target.style.boxShadow =
                      '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#e5e7eb';
                    target.style.backgroundColor = '#fafafa';
                    target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    transition: 'color 0.2s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = '#6b7280';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = '#9ca3af';
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '16px 24px',
                backgroundColor: 'var(--primary-blue)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                opacity: isLoading ? 0.7 : 1,
                transform: isLoading ? 'none' : 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#2563eb';
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#3b82f6';
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px',
                    }}
                  ></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;


