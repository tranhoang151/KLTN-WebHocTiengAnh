import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: () => void; // Used to clear messages in parent
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentAvatar, onAvatarChange }) => {
  const { getAuthToken, user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = async () => {
    return await getAuthToken();
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    onAvatarChange();

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    // Read and upload file
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        setUploading(true);
        try {
          const token = await getToken();
          const result = await profileService.uploadAvatar({ avatarBase64: base64String });
          // Update user context
          if ((result as any).avatarBase64) {
            updateUser({ avatar_base64: (result as any).avatarBase64, avatar_url: null });
          }
        } catch (err: any) {
          setError(err.message || 'Failed to upload avatar.');
        } finally {
          setUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setRemoving(true);
    setError(null);
    onAvatarChange();

    try {
      const token = await getToken();
      await profileService.removeAvatar();
      // Update user context
      updateUser({ avatar_base64: null, avatar_url: null });
    } catch (err: any) {
      setError(err.message || 'Failed to remove avatar.');
    } finally {
      setRemoving(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const avatarSrc = user?.avatar_base64 || user?.avatar_url || 'https://via.placeholder.com/150';

  return (
    <div className="flex flex-col items-center space-y-4">
      <img
        src={avatarSrc}
        alt="User Avatar"
        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
      />
      <div className="flex space-x-2">
        <button
          onClick={triggerFileSelect}
          disabled={uploading || removing}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Change'}
        </button>
        {(user?.avatar_base64 || user?.avatar_url) && (
          <button
            onClick={handleRemoveAvatar}
            disabled={uploading || removing}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
          >
            {removing ? 'Removing...' : 'Remove'}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default AvatarUpload;