import React, { useState, useEffect, useCallback } from 'react';
import {
  userService,
  User,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../services/userService';
import UserList from './UserList';
import UserForm from './UserForm';
import UserSearch from './UserSearch';
import { useAuth } from '../../contexts/AuthContext';

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

  const handleToggleUserStatus = async (user: User) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      await userService.updateUserStatus(
        user.id,
        {
          isActive: !user.is_active,
        }
      );
      await loadUsers();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      if (
        !window.confirm(
          `Are you sure you want to delete user "${user.full_name}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      await userService.deleteUser(user.id);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingUser(null);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create New User
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <UserSearch
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalUsers={users.length} // This might need adjustment if backend paginates
        filteredUsers={users.length} // Now reflects the count from backend
      />

      {/* Create/Edit Form */}
      {(showCreateForm || editingUser) && (
        <div className="bg-white rounded-lg shadow-md p-6">
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
        </div>
      )}

      {/* User List */}
      <div className="bg-white rounded-lg shadow-md">
        <UserList
          users={users} // Use users directly
          onEdit={handleEditUser}
          onToggleStatus={handleToggleUserStatus}
          onDelete={handleDeleteUser}
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {users.length}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter((u) => u.role === 'student').length}
            </div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === 'teacher').length}
            </div>
            <div className="text-sm text-gray-600">Teachers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
