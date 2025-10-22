import React, { useState } from 'react';
import { User } from '../../types/index';
import {
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
  User as UserIcon,
  Users,
} from 'lucide-react';
import DeleteConfirmationPopup from './DeleteConfirmationPopup';

interface UserListProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onToggleStatus: (userId: string, is_active: boolean) => void;
  onDelete: (userId: string) => void;
  currentUser?: User | null;
}

const UserList: React.FC<UserListProps> = ({
  users,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
  currentUser,
}) => {
  const [deletePopup, setDeletePopup] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  const handleDeleteClick = (user: User) => {
    setDeletePopup({
      isOpen: true,
      user: user,
    });
  };

  const handleDeleteConfirm = () => {
    if (deletePopup.user) {
      onDelete(deletePopup.user.id);
      setDeletePopup({
        isOpen: false,
        user: null,
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeletePopup({
      isOpen: false,
      user: null,
    });
  };
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} style={{ color: '#dc2626' }} />;
      case 'teacher':
        return <GraduationCap size={16} style={{ color: '#2563eb' }} />;
      case 'student':
        return <UserIcon size={16} style={{ color: '#16a34a' }} />;
      default:
        return <UserIcon size={16} style={{ color: '#6b7280' }} />;
    }
  };

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';

    try {
      // Handle Firestore timestamp
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      // Handle regular date string
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '16px',
            color: '#6b7280',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          Loading users...
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
          }}
        >
          <Users size={40} style={{ color: '#9ca3af' }} />
        </div>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px 0',
          }}
        >
          No users found
        </h3>
        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0',
          }}
        >
          Try adjusting your search filters or create a new user.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '24px',
        padding: '8px',
      }}
    >
      {users.map((user) => (
        <div
          key={user.id}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          />

          {/* User Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              {user.avatar_url || user.avatar_base64 ? (
                <img
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                  src={
                    user.avatar_url ||
                    (user.avatar_base64?.startsWith('data:')
                      ? user.avatar_base64
                      : `data:image/jpeg;base64,${user.avatar_base64}`)
                  }
                  alt={user.full_name}
                />
              ) : (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
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
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'white',
                    }}
                  >
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Status indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: user.is_active ? '#10b981' : '#ef4444',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              />
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 4px 0',
                  lineHeight: '1.2',
                }}
              >
                {user.full_name}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                }}
              >
                {user.email}
              </p>

              {/* Role Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '20px',
                  ...getRoleColor(user.role),
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                {getRoleIcon(user.role)}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Created date hidden as requested */}
            <div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Last Login
              </p>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0',
                }}
              >
                {user.last_login_date || 'Never'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '25px',
                background: user.is_active
                  ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                  : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                color: user.is_active ? '#065f46' : '#991b1b',
                border: user.is_active
                  ? '1px solid #10b981'
                  : '1px solid #ef4444',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              {user.is_active ? <UserCheck size={16} /> : <UserX size={16} />}
              {user.is_active ? 'Active User' : 'Inactive User'}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <button
              onClick={() => onEdit(user)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(59, 130, 246, 0.4)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #1d4ed8, #1e40af)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #3b82f6, #1d4ed8)';
              }}
              title="Edit user"
            >
              <Edit size={16} />
              Edit
            </button>

            <button
              onClick={() => onToggleStatus(user.id, !user.is_active)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: user.is_active
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: user.is_active
                  ? '0 2px 8px rgba(239, 68, 68, 0.3)'
                  : '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                if (user.is_active) {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #dc2626, #b91c1c)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 16px rgba(239, 68, 68, 0.4)';
                } else {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #059669, #047857)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 16px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                if (user.is_active) {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #ef4444, #dc2626)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 8px rgba(239, 68, 68, 0.3)';
                } else {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #10b981, #059669)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 8px rgba(16, 185, 129, 0.3)';
                }
              }}
              title={user.is_active ? 'Deactivate user' : 'Activate user'}
            >
              {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
              {user.is_active ? 'Deactivate' : 'Activate'}
            </button>

            <button
              onClick={() => handleDeleteClick(user)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #ef4444, #dc2626)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(0, 0, 0, 0.05)';
              }}
              title="Delete user"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        isOpen={deletePopup.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        userName={deletePopup.user?.full_name || ''}
        userRole={deletePopup.user?.role || ''}
        userAvatar={
          deletePopup.user?.avatar_url || deletePopup.user?.avatar_base64
            ? deletePopup.user?.avatar_url ||
            (deletePopup.user?.avatar_base64?.startsWith('data:')
              ? deletePopup.user?.avatar_base64
              : `data:image/jpeg;base64,${deletePopup.user?.avatar_base64}`)
            : undefined
        }
      />
    </div>
  );
};

export default UserList;


