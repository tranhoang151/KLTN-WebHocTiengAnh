import React, { useState, useEffect } from 'react';
import { UserFilters } from '../../services/userService';
import { userService } from '../../services/userService';

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
      onFiltersChange(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedRole, selectedStatus, onFiltersChange]);

  const loadAvailableRoles = async () => {
    try {
      const roles = await userService.getAvailableRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
      setAvailableRoles(['student', 'teacher', 'admin', 'parent']);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedStatus('');
    onFiltersChange({});
  };

  const hasActiveFilters = searchTerm || selectedRole || selectedStatus;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Search Users
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name or email..."
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="min-w-0 flex-1 max-w-xs">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter by Role
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-0 flex-1 max-w-xs">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter by Status
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing{' '}
            <span className="font-medium text-gray-900">{filteredUsers}</span>{' '}
            of <span className="font-medium text-gray-900">{totalUsers}</span>{' '}
            users
          </div>

          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">Filters applied:</span>
              <div className="flex space-x-1">
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{searchTerm}"
                  </span>
                )}
                {selectedRole && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Role:{' '}
                    {selectedRole.charAt(0).toUpperCase() +
                      selectedRole.slice(1)}
                  </span>
                )}
                {selectedStatus && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Status: {selectedStatus === 'true' ? 'Active' : 'Inactive'}
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
