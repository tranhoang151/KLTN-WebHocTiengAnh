import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { User, Camera, Trash2, Upload } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: () => void; // Used to clear messages in parent
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
}) => {
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
          const result = await profileService.uploadAvatar({
            avatarBase64: base64String,
          });
          // Update user context
          if ((result as any).avatarBase64) {
            updateUser({
              avatar_base64: (result as any).avatarBase64,
              avatar_url: null,
            });
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

  const avatarSrc =
    user?.avatar_base64 ||
    user?.avatar_url ||
    'https://via.placeholder.com/150';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      {/* Avatar Container */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #e5e7eb',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatarSrc && avatarSrc !== 'https://via.placeholder.com/150' ? (
            <img
              src={avatarSrc}
              alt="User Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <User size={48} style={{ color: '#9ca3af' }} />
          )}
        </div>

        {/* Camera Icon Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={triggerFileSelect}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow =
              '0 6px 20px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow =
              '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          <Camera size={16} style={{ color: 'white' }} />
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/gif"
        style={{ display: 'none' }}
      />

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '200px',
        }}
      >
        <button
          onClick={triggerFileSelect}
          disabled={uploading || removing}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: uploading
              ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: uploading || removing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
          }}
          onMouseEnter={(e) => {
            if (!uploading && !removing) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(59, 130, 246, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading && !removing) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 2px 8px rgba(59, 130, 246, 0.2)';
            }
          }}
        >
          {uploading ? (
            <>
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              ></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Change Avatar
            </>
          )}
        </button>

        {(user?.avatar_base64 || user?.avatar_url) && (
          <button
            onClick={handleRemoveAvatar}
            disabled={uploading || removing}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: removing
                ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: uploading || removing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!uploading && !removing) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(239, 68, 68, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading && !removing) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(239, 68, 68, 0.2)';
              }
            }}
          >
            {removing ? (
              <>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                ></div>
                Removing...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Remove Avatar
              </>
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            maxWidth: '200px',
          }}
        >
          {error}
        </div>
      )}

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

export default AvatarUpload;
