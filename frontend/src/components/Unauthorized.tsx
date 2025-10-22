import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Home, ArrowLeft, LogOut } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'teacher':
          navigate('/teacher');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '500px',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertTriangle size={40} color="white" />
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #1f2937, #374151)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Access Denied
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0 0 32px 0',
            lineHeight: '1.6',
          }}
        >
          You don't have permission to access this page.
          {user && (
            <span
              style={{
                display: 'block',
                marginTop: '12px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
              }}
            >
              Current role:{' '}
              <span style={{ fontWeight: '600' }}>{user.role}</span>
            </span>
          )}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleGoHome}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 8px 25px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            <Home size={20} />
            Go to Dashboard
          </button>

          <button
            onClick={handleGoBack}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              color: '#374151',
              padding: '14px 24px',
              borderRadius: '12px',
              border: '1px solid #d1d5db',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #e5e7eb, #d1d5db)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
            }}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 8px 25px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 15px rgba(239, 68, 68, 0.3)';
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
