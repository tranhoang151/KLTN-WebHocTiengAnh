import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../hooks/usePermissions';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
}) => {
  const { logout } = useAuth();
  const { user, displayName, color } = useUserRole();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.3)',
        borderBottom: 'none'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/logo_BingGo.png" 
                alt="BingGo Logo"
                style={{
                  height: '40px',
                  width: 'auto',
                  marginRight: '1rem'
                }}
              />
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: 'white',
                margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                BingGo
              </h1>
              <span style={{
                marginLeft: '1rem',
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500'
              }}>
                {title}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  {displayName}
                </span>
                <span style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '500'
                }}>
                  {user?.full_name}
                </span>
              </div>

              <a
                href="/profile"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLAnchorElement;
                  target.style.background = 'rgba(255, 255, 255, 0.3)';
                  target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLAnchorElement;
                  target.style.background = 'rgba(255, 255, 255, 0.2)';
                  target.style.transform = 'translateY(0)';
                }}
              >
                Profile
              </a>

              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLAnchorElement;
                  target.style.background = 'rgba(255, 255, 255, 0.3)';
                  target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLAnchorElement;
                  target.style.background = 'rgba(255, 255, 255, 0.2)';
                  target.style.transform = 'translateY(0)';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1rem',
        width: '100%'
      }}>
        <div style={{
          padding: '0',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minHeight: 'calc(100vh - 140px)'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
