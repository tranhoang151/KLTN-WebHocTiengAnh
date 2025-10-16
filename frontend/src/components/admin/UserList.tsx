import React from 'react';
import { User } from '../../services/userService';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
<<<<<<< Updated upstream
        return 'bg-green-100 text-green-800';
      case 'parent':
        return 'bg-purple-100 text-purple-800';
=======
        return { background: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
>>>>>>> Stashed changes
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No users found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search filters or create a new user.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.avatar_url || user.avatar_base64 ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={
                          user.avatar_url ||
                          `data:image/jpeg;base64,${user.avatar_base64}`
                        }
                        alt={user.full_name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.full_name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.last_login_date || 'Never'}
<<<<<<< Updated upstream
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded transition-colors"
                    title="Edit user"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onToggleStatus(user)}
                    className={`px-2 py-1 rounded transition-colors ${user.is_active
                        ? 'text-red-600 hover:text-red-900'
                        : 'text-green-600 hover:text-green-900'
                      }`}
                    title={user.is_active ? 'Deactivate user' : 'Activate user'}
                  >
                    {user.is_active ? '🚫' : '✅'}
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="text-red-600 hover:text-red-900 px-2 py-1 rounded transition-colors"
                    title="Delete user"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
=======
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
            `data:image/jpeg;base64,${deletePopup.user?.avatar_base64}`
            : undefined
        }
      />
>>>>>>> Stashed changes
    </div>
  );
};

export default UserList;
