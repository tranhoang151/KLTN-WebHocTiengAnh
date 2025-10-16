import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../hooks/usePermissions';
import {
  profileService,
  UserProfile,
  UpdateProfileData,
} from '../services/profileService';
import AvatarUpload from './profile/AvatarUpload';
import ChangePassword from './profile/ChangePassword';
import { AdminHeader } from './AdminHeader';
import { BackButton } from './BackButton';
import {
  User,
  Settings,
  Shield,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateUser, getAuthToken } = useAuth();
  const { displayName, color } = useUserRole();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const clearMessage = () => setMessage(null);

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.full_name || '',
        email: user.email || '',
        gender: user.gender || 'male',
        avatarUrl: user.avatar_url,
        avatarBase64: user.avatar_base64,
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => {
      if (!prev) return null;

      // Map form field names to UserProfile property names
      const fieldMapping: { [key: string]: string } = {
        full_name: 'fullName',
        email: 'email',
        gender: 'gender',
      };

      const profileField = fieldMapping[name] || name;
      return { ...prev, [profileField]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const token = await getAuthToken();
      const updateData: UpdateProfileData = {
        fullName: profile.fullName,
        email: profile.email, // Keep email for API compatibility
        gender: profile.gender,
      };

      const result = await profileService.updateProfile(updateData);
      updateUser({
        full_name: profile.fullName,
        gender: profile.gender,
      });

      setMessage({
        type: 'success',
        text: (result as any).message || 'Profile updated successfully!',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred while updating profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <AdminHeader title="Profile Settings" />
        <main
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '18px',
              color: '#6b7280',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
            Loading profile...
          </div>
        </main>
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
  }

  if (!user || !profile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <AdminHeader title="Profile Settings" />
        <main
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <XCircle
              size={48}
              style={{ color: '#ef4444', margin: '0 auto 16px' }}
            />
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>
              Profile Not Found
            </h2>
            <p style={{ color: '#6b7280' }}>
              Unable to load your profile information.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Admin Header Component */}
      <AdminHeader title="Profile Settings" />

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px',
        }}
      >
        {/* Back Button */}
        <div style={{ marginBottom: '24px' }}>
          <BackButton />
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '24px',
            background: 'white',
            padding: '4px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: activeTab === 'profile' ? '#3b82f6' : 'transparent',
              color: activeTab === 'profile' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: activeTab === 'password' ? '#3b82f6' : 'transparent',
              color: activeTab === 'password' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Change Password
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          {activeTab === 'profile' && (
            <div style={{ padding: '32px' }}>
              {/* Profile Information Header */}
              <div style={{ marginBottom: '32px' }}>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 20px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <User size={20} style={{ color: '#111827' }} />
                  Profile Information
                </h2>
              </div>

              {/* User Info Section */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '32px',
                  marginBottom: '32px',
                  padding: '32px',
                  background: '#f9fafb',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <AvatarUpload
                    currentAvatar={user.avatar_base64 || user.avatar_url}
                    onAvatarChange={clearMessage}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {profile.fullName}
                  </h3>
                  <p
                    style={{
                      fontSize: '18px',
                      color: '#6b7280',
                      margin: '0 0 16px 0',
                      fontWeight: '500',
                    }}
                  >
                    {profile.email}
                  </p>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      borderRadius: '24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <Shield size={18} />
                    {displayName}
                  </div>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background:
                      message.type === 'success'
                        ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                        : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                    border:
                      message.type === 'success'
                        ? '1px solid #10b981'
                        : '1px solid #ef4444',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                  }}
                >
                  {message.type === 'success' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                  <span style={{ fontWeight: '500' }}>{message.text}</span>
                  <button
                    onClick={clearMessage}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                      opacity: '0.7',
                    }}
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px',
                  }}
                >
                  <div>
                    <label
                      htmlFor="full_name"
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={profile.fullName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#1f2937',
                        background: 'white',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.boxShadow =
                          '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={profile.gender}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#1f2937',
                        background: 'white',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.boxShadow =
                          '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#6b7280',
                        background: '#f9fafb',
                        cursor: 'not-allowed',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
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
                      Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={displayName}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#6b7280',
                        background: '#f9fafb',
                        cursor: 'not-allowed',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Role is assigned by administrators
                    </p>
                  </div>
                </div>

                {/* Learning Statistics */}
                <div
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '32px',
                    marginBottom: '32px',
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
                      gap: '8px',
                    }}
                  >
                    <BookOpen size={18} style={{ color: '#3b82f6' }} />
                    Learning Statistics
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(200px, 1fr))',
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
                        7
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1e40af',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <BookOpen size={16} />
                        Current Streak
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
                        12
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#92400e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Award size={16} />
                        Badges Earned
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
                        3
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#065f46',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <User size={16} />
                        Classes Enrolled
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: saving
                      ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                      : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        '0 6px 20px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                >
                  {saving ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      ></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div style={{ padding: '32px' }}>
              <ChangePassword onMessage={setMessage} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
