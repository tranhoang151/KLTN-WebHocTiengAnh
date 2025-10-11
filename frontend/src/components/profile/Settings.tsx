import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRole } from '../../hooks/usePermissions';
import { profileService, UpdateProfileData } from '../../services/profileService';
import { authService } from '../../services/authService';
import AvatarUpload from './AvatarUpload';
import ChangePassword from './ChangePassword';
import { Card } from '../ui';
import { ChildFriendlyCard, ChildFriendlyButton } from '../ui';
import { User, Lock, Bell, Shield, Settings as SettingsIcon } from 'lucide-react';
import { apiService } from '../../services/api';

interface UserProfile {
    fullName: string;
    email: string;
    gender: string;
    avatarUrl?: string;
    avatarBase64?: string;
    streakCount: number;
    lastLoginDate: string;
    classIds: string[];
}

interface UserPreferences {
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    learning: {
        dailyGoal: number;
        reminderTime: string;
        difficulty: string;
    };
    privacy: {
        profileVisibility: string;
        showProgress: boolean;
        allowAnalytics: boolean;
    };
}

const Settings: React.FC = () => {
    const { user, loading: authLoading, updateUser } = useAuth();
    const { displayName, color } = useUserRole();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile');

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        gender: '',
        email: '',
    });

    // Preferences state
    const [preferences, setPreferences] = useState<UserPreferences>({
        notifications: {
            email: true,
            push: true,
            sms: false,
        },
        learning: {
            dailyGoal: 30,
            reminderTime: '19:00',
            difficulty: 'medium',
        },
        privacy: {
            profileVisibility: 'friends',
            showProgress: true,
            allowAnalytics: true,
        },
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.full_name || '',
                gender: user.gender || '',
                email: user.email || '',
            });
        }
        fetchUserPreferences();
    }, [user]);

    const fetchUserPreferences = async () => {
        try {
            const response = await apiService.get('/settings/preferences');
            if (response.success && response.data) {
                setPreferences(response.data as UserPreferences);
            }
        } catch (error) {
            console.error('Failed to load user preferences');
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setMessage(null);

        try {
            const updateData: UpdateProfileData = {
                fullName: formData.fullName.trim(),
                gender: formData.gender,
                email: formData.email,
            };

            const token = await authService.getCurrentUserToken();
            if (!token) {
                setMessage({
                    type: 'error',
                    text: 'Authentication token not found',
                });
                return;
            }
            const result = await profileService.updateProfile(updateData);

            if ((result as any).profile) {
                setMessage({
                    type: 'success',
                    text: (result as any).message || 'Profile updated successfully',
                });
                // Update local user data
                const { fullName, gender } = (result as any).profile;
                updateUser({ full_name: fullName, gender: gender });

            } else {
                setMessage({
                    type: 'error',
                    text: (result as any).message || 'Failed to update profile',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'An error occurred while updating profile',
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async (preferenceType: string, values: any) => {
        try {
            setSaving(true);
            await apiService.put('/settings/preferences', { [preferenceType]: values });
            setMessage({
                type: 'success',
                text: 'Preferences updated successfully',
            });
            fetchUserPreferences();
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to update preferences',
            });
        } finally {
            setSaving(false);
        }
    };

    const clearMessage = () => {
        setMessage(null);
    };

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <SettingsIcon className="mr-3 h-8 w-8 text-blue-500" />
                            Settings
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="px-6">
                        <nav className="flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'password'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Lock className="mr-2 h-4 w-4" />
                                Password
                            </button>
                            <button
                                onClick={() => setActiveTab('preferences')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'preferences'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Bell className="mr-2 h-4 w-4" />
                                Preferences
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white shadow rounded-lg">
                    {activeTab === 'profile' && (
                        <div className="px-6 py-6">
                            {/* User Info Header */}
                            <div className="flex items-center space-x-6 mb-8">
                                <div className="flex-shrink-0">
                                    <AvatarUpload
                                        currentAvatar={user.avatar_base64 || user.avatar_url}
                                        onAvatarChange={clearMessage}
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {user.full_name}
                                    </h2>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 mt-2`}
                                    >
                                        {displayName}
                                    </span>
                                </div>
                            </div>

                            {/* Message */}
                            {message && (
                                <div
                                    className={`mb-6 p-4 rounded-md ${message.type === 'success'
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                        }`}
                                >
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            {message.type === 'success' ? (
                                                <span className="text-green-400">✓</span>
                                            ) : (
                                                <span className="text-red-400">✗</span>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm">{message.text}</p>
                                        </div>
                                        <div className="ml-auto pl-3">
                                            <button
                                                onClick={clearMessage}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Profile Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div>
                                        <label
                                            htmlFor="fullName"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label
                                            htmlFor="gender"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Gender
                                        </label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Email (Read-only) */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={user.email}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    {/* Role (Read-only) */}
                                    <div>
                                        <label
                                            htmlFor="role"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            id="role"
                                            value={displayName}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Role is assigned by administrators
                                        </p>
                                    </div>
                                </div>

                                {/* Learning Stats (Read-only) */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Learning Statistics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {user.streak_count}
                                            </div>
                                            <div className="text-sm text-blue-800">
                                                Current Streak
                                            </div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {
                                                    Object.values(user.badges).filter(
                                                        (badge) => badge.earned
                                                    ).length
                                                }
                                            </div>
                                            <div className="text-sm text-green-800">
                                                Badges Earned
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {user.class_ids?.length || 0}
                                            </div>
                                            <div className="text-sm text-purple-800">
                                                Classes Enrolled
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Saving...
                                            </div>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="px-6 py-6">
                            <ChangePassword onMessage={setMessage} />
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="px-6 py-6">
                            {/* Notification Preferences */}
                            <ChildFriendlyCard
                                title="Notification Preferences"
                                icon="🔔"
                                color="blue"
                                className="mb-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.notifications.email}
                                                onChange={(e) => handlePreferencesUpdate('notifications', {
                                                    ...preferences.notifications,
                                                    email: e.target.checked
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.notifications.push}
                                                onChange={(e) => handlePreferencesUpdate('notifications', {
                                                    ...preferences.notifications,
                                                    push: e.target.checked
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.notifications.sms}
                                                onChange={(e) => handlePreferencesUpdate('notifications', {
                                                    ...preferences.notifications,
                                                    sms: e.target.checked
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </ChildFriendlyCard>

                            {/* Learning Preferences */}
                            <ChildFriendlyCard
                                title="Learning Preferences"
                                icon="🎓"
                                color="green"
                                className="mb-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Daily Learning Goal (minutes)
                                        </label>
                                        <select
                                            value={preferences.learning.dailyGoal}
                                            onChange={(e) => handlePreferencesUpdate('learning', {
                                                ...preferences.learning,
                                                dailyGoal: parseInt(e.target.value)
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={45}>45 minutes</option>
                                            <option value={60}>1 hour</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred Difficulty
                                        </label>
                                        <select
                                            value={preferences.learning.difficulty}
                                            onChange={(e) => handlePreferencesUpdate('learning', {
                                                ...preferences.learning,
                                                difficulty: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>
                            </ChildFriendlyCard>

                            {/* Privacy Settings */}
                            <ChildFriendlyCard
                                title="Privacy Settings"
                                icon="🔒"
                                color="purple"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Profile Visibility
                                        </label>
                                        <select
                                            value={preferences.privacy.profileVisibility}
                                            onChange={(e) => handlePreferencesUpdate('privacy', {
                                                ...preferences.privacy,
                                                profileVisibility: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="public">Public</option>
                                            <option value="friends">Friends Only</option>
                                            <option value="private">Private</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Show Learning Progress</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.privacy.showProgress}
                                                onChange={(e) => handlePreferencesUpdate('privacy', {
                                                    ...preferences.privacy,
                                                    showProgress: e.target.checked
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Allow Analytics</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.privacy.allowAnalytics}
                                                onChange={(e) => handlePreferencesUpdate('privacy', {
                                                    ...preferences.privacy,
                                                    allowAnalytics: e.target.checked
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </ChildFriendlyCard>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;