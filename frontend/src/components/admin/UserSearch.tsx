import React, { useState, useEffect } from 'react';
import { UserFilters } from '../../services/userService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  Filter,
  X,
  Users,
  Shield,
  GraduationCap,
  User as UserIcon,
  UserCheck,
  UserX,
} from 'lucide-react';

interface UserSearchProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  totalUsers: number;
  filteredUsers: number;
}

const UserSearch: React.FC<UserSearchProps> = ({
  filters,
  onFiltersChange,
  totalUsers,
  filteredUsers,
}) => {
  const { getAuthToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedRole, setSelectedRole] = useState(filters.role || '');
  const [selectedStatus, setSelectedStatus] = useState(
    filters.isActive === undefined ? '' : filters.isActive.toString()
  );
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    loadAvailableRoles();
  }, []);

  useEffect(() => {
    // Debounce search input
    const timeoutId = setTimeout(() => {
      const newFilters: UserFilters = {
        search: searchTerm || undefined,
        role: selectedRole || undefined,
        isActive: selectedStatus === '' ? undefined : selectedStatus === 'true',
      };
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        onFiltersChange(newFilters);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedRole, selectedStatus, onFiltersChange, filters]);

  const loadAvailableRoles = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const roles = await userService.getAvailableRoles();
        setAvailableRoles(roles);
      } else {
        setAvailableRoles(['student', 'teacher', 'admin']);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setAvailableRoles(['student', 'teacher', 'admin']);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedStatus('');
    onFiltersChange({});
  };

  const hasActiveFilters = searchTerm || selectedRole || selectedStatus;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield size={14} />;
      case 'teacher':
        return <GraduationCap size={14} />;
      case 'student':
        return <UserIcon size={14} />;
      default:
        return <UserIcon size={14} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          text: '#92400e',
          border: '#fcd34d',
        };
      case 'teacher':
        return {
          bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          text: '#065f46',
          border: '#6ee7b7',
        };
      case 'student':
        return {
          bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          text: '#1e40af',
          border: '#93c5fd',
        };
      default:
        return {
          bg: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
          text: '#4b5563',
          border: '#9ca3af',
        };
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          borderRadius: '50%',
          opacity: '0.08',
          zIndex: 0,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Search Input */}
        <div style={{ flex: 1 }}>
          <label
            htmlFor="search"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            Search Users
          </label>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              <Search size={18} style={{ color: '#6b7280' }} />
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'white',
                color: '#1f2937',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow =
                  '0 2px 4px rgba(0, 0, 0, 0.02)';
              }}
              placeholder="Search by name or email..."
            />
          </div>
        </div>

        {/* Filters Row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'end',
          }}
        >
          {/* Role Filter */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label
              htmlFor="role"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Filter by Role
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '12px',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                <Filter size={16} style={{ color: '#6b7280' }} />
              </div>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'white',
                  color: '#1f2937',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow =
                    '0 2px 4px rgba(0, 0, 0, 0.02)';
                }}
              >
                <option value="">All Roles</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label
              htmlFor="status"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Filter by Status
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '12px',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                {selectedStatus === 'true' ? (
                  <UserCheck size={16} style={{ color: '#10b981' }} />
                ) : selectedStatus === 'false' ? (
                  <UserX size={16} style={{ color: '#ef4444' }} />
                ) : (
                  <Users size={16} style={{ color: '#6b7280' }} />
                )}
              </div>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'white',
                  color: '#1f2937',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow =
                    '0 2px 4px rgba(0, 0, 0, 0.02)';
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button
                onClick={handleClearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #dc2626, #b91c1c)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(220, 38, 38, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #fef2f2, #fee2e2)';
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 4px rgba(0, 0, 0, 0.02)';
                }}
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div
        style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500',
            }}
          >
            <Users size={16} style={{ color: '#3b82f6' }} />
            Showing{' '}
            <span
              style={{
                fontWeight: '700',
                color: '#1f2937',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {filteredUsers}
            </span>{' '}
            of{' '}
            <span
              style={{
                fontWeight: '700',
                color: '#1f2937',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {totalUsers}
            </span>{' '}
            users
          </div>

          {hasActiveFilters && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3b82f6',
                }}
              >
                Active filters:
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {searchTerm && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                      color: '#1e40af',
                      border: '1px solid #93c5fd',
                    }}
                  >
                    <Search size={12} />"{searchTerm}"
                  </span>
                )}
                {selectedRole && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      ...getRoleColor(selectedRole),
                    }}
                  >
                    {getRoleIcon(selectedRole)}
                    {selectedRole.charAt(0).toUpperCase() +
                      selectedRole.slice(1)}
                  </span>
                )}
                {selectedStatus && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background:
                        selectedStatus === 'true'
                          ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                          : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                      color: selectedStatus === 'true' ? '#065f46' : '#dc2626',
                      border:
                        selectedStatus === 'true'
                          ? '1px solid #6ee7b7'
                          : '1px solid #fecaca',
                    }}
                  >
                    {selectedStatus === 'true' ? (
                      <UserCheck size={12} />
                    ) : (
                      <UserX size={12} />
                    )}
                    {selectedStatus === 'true' ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
