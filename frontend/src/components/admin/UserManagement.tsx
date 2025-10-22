import React, { useState, useEffect, useCallback } from 'react';
import {
  userService,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../services/userService';
import { User } from '../../types/index';
import UserList from './UserList';
import UserForm from './UserForm';
import UserSearch from './UserSearch';
import { useAuth } from '../../contexts/AuthContext';
import { AdminHeader } from '../AdminHeader';
import { BackButton } from '../BackButton';
import {
  Users,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface UserManagementProps { }

const UserManagement: React.FC<UserManagementProps> = () => {
  const { user: currentUser, getAuthToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  // No longer need filteredUsers, as filtering is done by the backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});

  const loadUsers = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const userData = await userService.getAllUsers(token, filters);
      setUsers(userData);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (
    userData: CreateUserRequest | UpdateUserRequest
  ) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      await userService.createUser(userData as CreateUserRequest);
      await loadUsers();
      setShowCreateForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      throw err;
    }
  };

  const handleUpdateUser = async (
    id: string,
    userData: CreateUserRequest | UpdateUserRequest
  ) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      await userService.updateUser(id, userData as UpdateUserRequest);
      await loadUsers();
      setEditingUser(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    }
  };

  const handleToggleUserStatus = async (userId: string, is_active: boolean) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      await userService.updateUserStatus(userId, {
        is_active: is_active,
      });
      await loadUsers();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      // Find user to get name for confirmation
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      if (
        !window.confirm(
          `Are you sure you want to delete user "${user.full_name}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      await userService.deleteUser(userId);
      await loadUsers();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowCreateForm(false);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleFiltersChange = useCallback((newFilters: UserFilters) => {
    setFilters(newFilters);
  }, []);

  if (loading) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '256px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          // padding: '30px',
        }}
      >
        {/* Back Button */}
        <div style={{ marginBottom: '24px' }}>
          <BackButton />
        </div>
        {/* Header Section - Function Description */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decorations */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          ></div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                }}
              >
                <Users size={28} color="white" />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 8px 0',
                  }}
                >
                  User Management
                </h1>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: '0',
                    fontWeight: '500',
                  }}
                >
                  Manage user accounts and permissions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              <Plus size={18} />
              Add New User
            </button>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
              border: '1px solid #ef4444',
              color: '#991b1b',
            }}
          >
            <AlertCircle size={20} />
            <span style={{ fontWeight: '500', flex: 1 }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                opacity: '0.7',
                padding: '4px',
              }}
            >
              ×
            </button>
          </div>
        )}
        {/* Search and Filters */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              opacity: '0.05',
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
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }}
              >
                <Search size={20} style={{ color: 'white' }} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 4px 0',
                  }}
                >
                  Search & Filter Users
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0',
                    fontWeight: '500',
                  }}
                >
                  Find and manage user accounts
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                position: 'relative',
                zIndex: 1,
              }}
            ></div>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <UserSearch
              filters={filters}
              onFiltersChange={handleFiltersChange}
              totalUsers={users.length}
              filteredUsers={users.length}
            />
          </div>
        </div>
        {/* Create/Edit Form Popup */}image.png
        {(showCreateForm || editingUser) && (
          <UserForm
            user={editingUser}
            onSubmit={
              editingUser
                ? (userData) => handleUpdateUser(editingUser.id, userData)
                : handleCreateUser
            }
            onCancel={
              editingUser ? handleCancelEdit : () => setShowCreateForm(false)
            }
            isEditing={!!editingUser}
          />
        )}
        {/* User List */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <Filter size={20} style={{ color: '#6b7280' }} />
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0',
              }}
            >
              Users List
            </h3>
            <div
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                background: '#f3f4f6',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
              }}
            >
              {users.length} user{users.length !== 1 ? 's' : ''}
            </div>
          </div>

          <UserList
            users={users}
            loading={loading}
            onEdit={setEditingUser}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
            currentUser={currentUser as any}
          />
        </div>
        {/* Summary */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginTop: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Users size={20} style={{ color: '#6b7280' }} />
            User Statistics
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#1e40af',
                  marginBottom: '8px',
                }}
              >
                {users.length}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e40af',
                }}
              >
                Total Users
              </div>
            </div>
            <div
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#065f46',
                  marginBottom: '8px',
                }}
              >
                {users.filter((u) => u.is_active).length}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#065f46',
                }}
              >
                Active Users
              </div>
            </div>
            <div
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#92400e',
                  marginBottom: '8px',
                }}
              >
                {users.filter((u) => u.role === 'student').length}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400e',
                }}
              >
                Students
              </div>
            </div>
            <div
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #e9d5ff, #d8b4fe)',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#7c3aed',
                  marginBottom: '8px',
                }}
              >
                {users.filter((u) => u.role === 'teacher').length}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#7c3aed',
                }}
              >
                Teachers
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default UserManagement;


