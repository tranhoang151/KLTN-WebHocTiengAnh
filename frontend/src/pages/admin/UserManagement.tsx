import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/user';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.token) {
        try {
          setLoading(true);
          const data = await userService.getAllUsers(user.token);
          setUsers(data);
          setError(null);
        } catch (err) {
          setError('Failed to fetch users. You may not have permission.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [user]);

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h2>User Management</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{u.fullName}</td>
                <td style={{ padding: '8px' }}>{u.email}</td>
                <td style={{ padding: '8px' }}>{u.role}</td>
                <td style={{ padding: '8px' }}>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;
