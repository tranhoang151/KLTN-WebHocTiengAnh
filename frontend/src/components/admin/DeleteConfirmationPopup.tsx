import React from 'react';
import { X, Trash2, AlertTriangle, User } from 'lucide-react';

interface DeleteConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userRole: string;
  userAvatar?: string;
}

const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userRole,
  userAvatar,
}) => {
  if (!isOpen) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return { background: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'teacher':
        return { background: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'student':
        return { background: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      default:
        return { background: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <User size={14} style={{ color: '#dc2626' }} />;
      case 'teacher':
        return <User size={14} style={{ color: '#2563eb' }} />;
      case 'student':
        return <User size={14} style={{ color: '#16a34a' }} />;
      default:
        return <User size={14} style={{ color: '#6b7280' }} />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={onClose}
      >
        {/* Popup Content */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'slideIn 0.3s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '50%',
              opacity: '0.1',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '50%',
              opacity: '0.1',
              zIndex: 0,
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '24px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '3px solid #fecaca',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.2)',
              }}
            >
              <AlertTriangle size={40} style={{ color: '#ef4444' }} />
            </div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 8px 0',
              }}
            >
              Delete User Account
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.5',
              }}
            >
              This action cannot be undone. Are you sure you want to delete this
              user?
            </p>
          </div>

          {/* User Info Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                {userAvatar ? (
                  <img
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                    src={userAvatar}
                    alt={userName}
                  />
                ) : (
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'white',
                      }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* User Details */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0',
                  }}
                >
                  {userName}
                </h3>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '20px',
                    ...getRoleColor(userRole),
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {getRoleIcon(userRole)}
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '1px solid #f59e0b',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <AlertTriangle
                size={20}
                style={{ color: '#d97706', marginTop: '2px' }}
              />
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#92400e',
                    margin: '0 0 4px 0',
                  }}
                >
                  Warning
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#92400e',
                    margin: '0',
                    lineHeight: '1.4',
                  }}
                >
                  Deleting this user will permanently remove their account,
                  data, and all associated information from the system.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(0, 0, 0, 0.05)';
              }}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #dc2626, #b91c1c)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow =
                  '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #ef4444, #dc2626)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(239, 68, 68, 0.3)';
              }}
            >
              <Trash2 size={16} />
              Delete User
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes slideIn {
            0% {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </>
  );
};

export default DeleteConfirmationPopup;


