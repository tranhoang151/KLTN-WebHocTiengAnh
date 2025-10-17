import React, { useState, useEffect } from 'react';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../services/userService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  User as UserIcon,
  Mail,
  Shield,
  GraduationCap,
  UserCheck,
  Info,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import AvatarUpload from '../profile/AvatarUpload';

interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isEditing,
}) => {
  const { getAuthToken } = useAuth(); // Get authenticated user
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
    gender: '',
    classIds: [] as string[],
    avatarBase64: '',
  });
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          const roles = await userService.getAvailableRoles();
          setAvailableRoles(roles);
        } else {
          // Fallback roles if no token
          setAvailableRoles(['student', 'teacher', 'admin']);
        }
      } catch (error) {
        console.error('Error loading roles:', error);
        // Fallback roles if API fails
        setAvailableRoles(['student', 'teacher', 'admin']);
      }
    };

    loadRoles();
  }, [getAuthToken]);

  useEffect(() => {
    if (user && isEditing) {
      setFormData({
        fullName: user.full_name,
        email: user.email,
        password: '', // Don't populate password for security
        role: user.role,
        gender: user.gender || '',
        classIds: user.class_ids || [],
        avatarBase64: user.avatar_base64 || '',
      });
    }
  }, [user, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation - required for new users, optional for editing
    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'Password is required for new users';
    } else if (formData.password.trim() && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Only include password if it's provided (for new users or password updates)
        password: formData.password.trim() || undefined,
        // Only include avatar if it's provided
        avatarBase64: formData.avatarBase64 || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAvatarChange = (avatarBase64?: string | null) => {
    setFormData((prev) => ({
      ...prev,
      avatarBase64: avatarBase64 || '',
    }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          padding: '0',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            padding: '24px',
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
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <UserIcon size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'white',
                    margin: '0 0 4px 0',
                  }}
                >
                  {isEditing ? 'Edit User' : 'Create New User'}
                </h2>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    margin: '0',
                    fontWeight: '500',
                  }}
                >
                  {isEditing
                    ? 'Update user information and role'
                    : 'Add a new user to the system'}
                </p>
              </div>
            </div>

            <button
              onClick={onCancel}
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={20} style={{ color: 'white' }} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div
          style={{
            padding: '32px',
            maxHeight: 'calc(90vh - 120px)',
            overflowY: 'auto',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  Full Name *
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
                    <UserIcon size={18} style={{ color: '#6b7280' }} />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: `2px solid ${errors.fullName ? '#ef4444' : '#e5e7eb'}`,
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
                      e.currentTarget.style.borderColor = errors.fullName
                        ? '#ef4444'
                        : '#e5e7eb';
                      e.currentTarget.style.boxShadow =
                        '0 2px 4px rgba(0, 0, 0, 0.02)';
                    }}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.fullName && (
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#ef4444',
                      fontWeight: '500',
                    }}
                  >
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
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
                  Email Address *
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
                    <Mail size={18} style={{ color: '#6b7280' }} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
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
                      e.currentTarget.style.borderColor = errors.email
                        ? '#ef4444'
                        : '#e5e7eb';
                      e.currentTarget.style.boxShadow =
                        '0 2px 4px rgba(0, 0, 0, 0.02)';
                    }}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#ef4444',
                      fontWeight: '500',
                    }}
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  Password {!isEditing ? '*' : ''}
                  {isEditing && (
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400' }}>
                      {' '}(leave blank to keep current)
                    </span>
                  )}
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
                    <Lock size={18} style={{ color: '#6b7280' }} />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: `2px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
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
                      e.currentTarget.style.borderColor = errors.password
                        ? '#ef4444'
                        : '#e5e7eb';
                      e.currentTarget.style.boxShadow =
                        '0 2px 4px rgba(0, 0, 0, 0.02)';
                    }}
                    placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
                  />
                </div>
                {errors.password && (
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#ef4444',
                      fontWeight: '500',
                    }}
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Role */}
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
                  Role *
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
                    {formData.role === 'admin' ? (
                      <Shield size={18} style={{ color: '#6b7280' }} />
                    ) : formData.role === 'teacher' ? (
                      <GraduationCap size={18} style={{ color: '#6b7280' }} />
                    ) : (
                      <UserCheck size={18} style={{ color: '#6b7280' }} />
                    )}
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: `2px solid ${errors.role ? '#ef4444' : '#e5e7eb'}`,
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
                      e.currentTarget.style.borderColor = errors.role
                        ? '#ef4444'
                        : '#e5e7eb';
                      e.currentTarget.style.boxShadow =
                        '0 2px 4px rgba(0, 0, 0, 0.02)';
                    }}
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role && (
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#ef4444',
                      fontWeight: '500',
                    }}
                  >
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Gender */}
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
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
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
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Avatar Upload */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  Profile Picture
                </label>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '20px',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '12px',
                  background: '#f9fafb'
                }}>
                  <AvatarUpload
                    currentAvatar={formData.avatarBase64}
                    onAvatarChange={handleAvatarChange}
                    uploadMode="form"
                  />
                </div>
              </div>
            </div>

            {/* Role-specific information */}
            {formData.role === 'student' && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                  border: '1px solid #93c5fd',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Info size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#1e40af',
                        margin: '0 0 8px 0',
                      }}
                    >
                      Student Account
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#1e40af',
                        margin: '0',
                        lineHeight: '1.5',
                      }}
                    >
                      Students will be able to access learning materials, take
                      exercises, and track their progress.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'teacher' && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                  border: '1px solid #6ee7b7',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <GraduationCap size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#065f46',
                        margin: '0 0 8px 0',
                      }}
                    >
                      Teacher Account
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#065f46',
                        margin: '0',
                        lineHeight: '1.5',
                      }}
                    >
                      Teachers can manage classes, assign content, and monitor
                      student progress.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'admin' && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  border: '1px solid #fecaca',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AlertTriangle size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#dc2626',
                        margin: '0 0 8px 0',
                      }}
                    >
                      Administrator Account
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#dc2626',
                        margin: '0',
                        lineHeight: '1.5',
                      }}
                    >
                      Administrators have full system access including user
                      management, content management, and system configuration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 8px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 4px rgba(0, 0, 0, 0.02)';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: loading
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow =
                      '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                {loading ? (
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
                    />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditing ? (
                  'Update User'
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
        </div>

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
    </div>
  );
};

export default UserForm;
