import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService, ChangePasswordData } from '../../services/profileService';

interface ChangePasswordProps {
  onMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onMessage }) => {
  const { getAuthToken } = useAuth();

  const getToken = async () => {
    return await getAuthToken();
  };
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onMessage(null); // Clear previous messages

    if (formData.newPassword !== formData.confirmPassword) {
      onMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (formData.newPassword.length < 6) {
      onMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setSaving(true);

    try {
      const token = await getToken();
      const result = await profileService.changePassword(formData);
      onMessage({ type: 'success', text: (result as any).message || 'Password changed successfully!' });
      // Clear form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      onMessage({ type: 'error', text: error.message || 'An error occurred while changing password.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Change Your Password</h3>
      {/* Current Password */}
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* New Password */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Confirm New Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end border-t border-gray-200 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;