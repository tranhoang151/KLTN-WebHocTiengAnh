import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { Alert, AlertDescription } from '../ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Shield, Download, Trash2, Eye, Settings, Cookie, FileText } from 'lucide-react';
import { privacyService } from '../../services/privacyService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import './PrivacyDashboard.css';

interface UserConsent {
    userId: string;
    policyVersion: string;
    acceptedTerms: boolean;
    acceptedPrivacyPolicy: boolean;
    acceptedDataProcessing: boolean;
    acceptedCookies: boolean;
    acceptedMarketing: boolean;
    specificConsents: Record<string, boolean>;
    created_at: string;
    updatedAt: string;
    requiresUpdate: boolean;
}

interface CookieConsent {
    userId: string;
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
    created_at: string;
    updatedAt: string;
}

interface PrivacySettings {
    dataRetention: number;
    shareDataWithPartners: boolean;
    personalizedAds: boolean;
    emailNotifications: boolean;
    profileVisibility: 'public' | 'private' | 'friends';
    dataExportFormat: 'json' | 'csv' | 'xml';
}

export const PrivacyDashboard: React.FC = () => {
    const [userConsent, setUserConsent] = useState<UserConsent | null>(null);
    const [cookieConsent, setCookieConsent] = useState<CookieConsent | null>(null);
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isExporting, setIsExporting] = useState(false);
    const [isDeletingData, setIsDeletingData] = useState(false);

    useEffect(() => {
        loadPrivacyData();
    }, []);

    const loadPrivacyData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [consentData, cookieData, settingsData] = await Promise.all([
                privacyService.getUserConsent(),
                privacyService.getCookieConsent(),
                privacyService.getPrivacySettings()
            ]);

            setUserConsent(consentData);
            setCookieConsent(cookieData);
            setPrivacySettings(settingsData);
        } catch (err) {
            setError('Failed to load privacy data. Please try again.');
            console.error('Error loading privacy data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConsentUpdate = async (consentType: string, value: boolean) => {
        try {
            if (!userConsent) return;

            const updatedConsent = {
                ...userConsent,
                [consentType]: value,
                updatedAt: new Date().toISOString()
            };

            await privacyService.updateConsent({
                policyVersion: userConsent.policyVersion,
                acceptedTerms: updatedConsent.acceptedTerms,
                acceptedPrivacyPolicy: updatedConsent.acceptedPrivacyPolicy,
                acceptedDataProcessing: updatedConsent.acceptedDataProcessing,
                acceptedCookies: updatedConsent.acceptedCookies,
                acceptedMarketing: updatedConsent.acceptedMarketing,
                specificConsents: updatedConsent.specificConsents
            });

            setUserConsent(updatedConsent);
        } catch (err) {
            setError('Failed to update consent. Please try again.');
            console.error('Error updating consent:', err);
        }
    };

    const handleCookieConsentUpdate = async (cookieType: string, value: boolean) => {
        try {
            if (!cookieConsent) return;

            const updatedConsent = {
                ...cookieConsent,
                [cookieType]: value,
                updatedAt: new Date().toISOString()
            };

            await privacyService.updateCookieConsent({
                functional: updatedConsent.functional,
                analytics: updatedConsent.analytics,
                marketing: updatedConsent.marketing,
                personalization: updatedConsent.personalization
            });

            setCookieConsent(updatedConsent);
        } catch (err) {
            setError('Failed to update cookie consent. Please try again.');
            console.error('Error updating cookie consent:', err);
        }
    };

    const handlePrivacySettingsUpdate = async (setting: string, value: any) => {
        try {
            if (!privacySettings) return;

            const updatedSettings = {
                ...privacySettings,
                [setting]: value
            };

            await privacyService.updatePrivacySettings(updatedSettings);
            setPrivacySettings(updatedSettings);
        } catch (err) {
            setError('Failed to update privacy settings. Please try again.');
            console.error('Error updating privacy settings:', err);
        }
    };

    const handleDataExport = async () => {
        try {
            setIsExporting(true);
            setError(null);

            const exportData = await privacyService.exportUserData();

            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert('Your data has been exported successfully!');
        } catch (err) {
            setError('Failed to export data. Please try again.');
            console.error('Error exporting data:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDataDeletion = async (deletionType: "complete" | "personalDataOnly" | "learningDataOnly" | "anonymize") => {
        const confirmMessage = deletionType === 'complete'
            ? 'Are you sure you want to permanently delete ALL your data? This action cannot be undone.'
            : 'Are you sure you want to delete your personal data? Learning progress will be anonymized.';

        if (!confirm(confirmMessage)) return;

        try {
            setIsDeletingData(true);
            setError(null);

            await privacyService.deleteUserData({
                deletionScope: deletionType,
                reason: 'User requested deletion',
                confirmDeletion: true
            });

            alert('Your data deletion request has been processed successfully.');

            if (deletionType === 'complete') {
                // Redirect to logout or home page
                window.location.href = '/';
            } else {
                // Reload privacy data
                await loadPrivacyData();
            }
        } catch (err) {
            setError('Failed to delete data. Please try again.');
            console.error('Error deleting data:', err);
        } finally {
            setIsDeletingData(false);
        }
    };

    if (loading) {
        return (
            <div className="privacy-dashboard">
                <LoadingSpinner />
                <p>Loading your privacy settings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="privacy-dashboard">
                <ErrorMessage message={error} onRetry={loadPrivacyData} />
            </div>
        );
    }

    return (
        <div className="privacy-dashboard">
            <div className="privacy-header">
                <Shield className="privacy-icon" />
                <div>
                    <h1>Privacy & Data Protection</h1>
                    <p>Manage your privacy settings and data preferences</p>
                </div>
            </div>

            {userConsent?.requiresUpdate && (
                <Alert className="consent-update-alert">
                    <AlertDescription>
                        Our privacy policy has been updated. Please review and update your consent preferences.
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue={activeTab} className="privacy-tabs">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="consent">Consent Management</TabsTrigger>
                    <TabsTrigger value="cookies">Cookie Preferences</TabsTrigger>
                    <TabsTrigger value="settings">Privacy Settings</TabsTrigger>
                    <TabsTrigger value="data">Data Management</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="privacy-overview">
                    <div className="overview-grid">
                        <Card className="consent-status-card">
                            <CardHeader>
                                <CardTitle>Consent Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="consent-items">
                                    <div className="consent-item">
                                        <span>Terms of Service</span>
                                        <span className={`status ${userConsent?.acceptedTerms ? 'accepted' : 'declined'}`}>
                                            {userConsent?.acceptedTerms ? 'Accepted' : 'Declined'}
                                        </span>
                                    </div>
                                    <div className="consent-item">
                                        <span>Privacy Policy</span>
                                        <span className={`status ${userConsent?.acceptedPrivacyPolicy ? 'accepted' : 'declined'}`}>
                                            {userConsent?.acceptedPrivacyPolicy ? 'Accepted' : 'Declined'}
                                        </span>
                                    </div>
                                    <div className="consent-item">
                                        <span>Data Processing</span>
                                        <span className={`status ${userConsent?.acceptedDataProcessing ? 'accepted' : 'declined'}`}>
                                            {userConsent?.acceptedDataProcessing ? 'Accepted' : 'Declined'}
                                        </span>
                                    </div>
                                    <div className="consent-item">
                                        <span>Marketing Communications</span>
                                        <span className={`status ${userConsent?.acceptedMarketing ? 'accepted' : 'declined'}`}>
                                            {userConsent?.acceptedMarketing ? 'Accepted' : 'Declined'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="data-summary-card">
                            <CardHeader>
                                <CardTitle>Your Data</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="data-actions">
                                    <Button
                                        onClick={handleDataExport}
                                        disabled={isExporting}
                                        className="export-button"
                                    >
                                        <Download className="button-icon" />
                                        {isExporting ? 'Exporting...' : 'Export My Data'}
                                    </Button>
                                    <p className="data-description">
                                        Download a copy of all your personal data in JSON format.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="consent" className="consent-management">
                    <Card>
                        <CardHeader>
                            <CardTitle>Consent Management</CardTitle>
                            <p>Control how your data is used and processed</p>
                        </CardHeader>
                        <CardContent>
                            <div className="consent-controls">
                                <div className="consent-control">
                                    <div className="consent-info">
                                        <h3>Data Processing</h3>
                                        <p>Allow us to process your learning data to provide personalized recommendations</p>
                                    </div>
                                    <Switch
                                        checked={userConsent?.acceptedDataProcessing || false}
                                        onCheckedChange={(checked) => handleConsentUpdate('acceptedDataProcessing', checked)}
                                    />
                                </div>

                                <div className="consent-control">
                                    <div className="consent-info">
                                        <h3>Marketing Communications</h3>
                                        <p>Receive emails about new features, courses, and educational content</p>
                                    </div>
                                    <Switch
                                        checked={userConsent?.acceptedMarketing || false}
                                        onCheckedChange={(checked) => handleConsentUpdate('acceptedMarketing', checked)}
                                    />
                                </div>

                                <div className="consent-control">
                                    <div className="consent-info">
                                        <h3>Cookies</h3>
                                        <p>Allow cookies for enhanced functionality and analytics</p>
                                    </div>
                                    <Switch
                                        checked={userConsent?.acceptedCookies || false}
                                        onCheckedChange={(checked) => handleConsentUpdate('acceptedCookies', checked)}
                                    />
                                </div>
                            </div>

                            <div className="consent-info-section">
                                <h3>Your Rights</h3>
                                <ul className="rights-list">
                                    <li>Right to access your personal data</li>
                                    <li>Right to rectify inaccurate data</li>
                                    <li>Right to erase your data</li>
                                    <li>Right to restrict processing</li>
                                    <li>Right to data portability</li>
                                    <li>Right to object to processing</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cookies" className="cookie-preferences">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cookie Preferences</CardTitle>
                            <p>Customize your cookie settings for a better experience</p>
                        </CardHeader>
                        <CardContent>
                            <div className="cookie-controls">
                                <div className="cookie-control">
                                    <div className="cookie-info">
                                        <Cookie className="cookie-icon" />
                                        <div>
                                            <h3>Essential Cookies</h3>
                                            <p>Required for basic site functionality. Cannot be disabled.</p>
                                        </div>
                                    </div>
                                    <Switch checked={true} disabled onCheckedChange={() => { }} />
                                </div>

                                <div className="cookie-control">
                                    <div className="cookie-info">
                                        <Cookie className="cookie-icon" />
                                        <div>
                                            <h3>Functional Cookies</h3>
                                            <p>Enable enhanced features and personalization</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={cookieConsent?.functional || false}
                                        onCheckedChange={(checked) => handleCookieConsentUpdate('functional', checked)}
                                    />
                                </div>

                                <div className="cookie-control">
                                    <div className="cookie-info">
                                        <Cookie className="cookie-icon" />
                                        <div>
                                            <h3>Analytics Cookies</h3>
                                            <p>Help us understand how you use our site to improve performance</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={cookieConsent?.analytics || false}
                                        onCheckedChange={(checked) => handleCookieConsentUpdate('analytics', checked)}
                                    />
                                </div>

                                <div className="cookie-control">
                                    <div className="cookie-info">
                                        <Cookie className="cookie-icon" />
                                        <div>
                                            <h3>Marketing Cookies</h3>
                                            <p>Used to deliver relevant advertisements and track campaign performance</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={cookieConsent?.marketing || false}
                                        onCheckedChange={(checked) => handleCookieConsentUpdate('marketing', checked)}
                                    />
                                </div>

                                <div className="cookie-control">
                                    <div className="cookie-info">
                                        <Cookie className="cookie-icon" />
                                        <div>
                                            <h3>Personalization Cookies</h3>
                                            <p>Remember your preferences and customize your experience</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={cookieConsent?.personalization || false}
                                        onCheckedChange={(checked) => handleCookieConsentUpdate('personalization', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="privacy-settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy Settings</CardTitle>
                            <p>Configure your privacy preferences</p>
                        </CardHeader>
                        <CardContent>
                            <div className="settings-controls">
                                <div className="setting-control">
                                    <div className="setting-info">
                                        <h3>Profile Visibility</h3>
                                        <p>Control who can see your profile information</p>
                                    </div>
                                    <select
                                        value={privacySettings?.profileVisibility || 'private'}
                                        onChange={(e) => handlePrivacySettingsUpdate('profileVisibility', e.target.value)}
                                        className="setting-select"
                                    >
                                        <option value="public">Public</option>
                                        <option value="friends">Friends Only</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>

                                <div className="setting-control">
                                    <div className="setting-info">
                                        <h3>Share Data with Partners</h3>
                                        <p>Allow sharing anonymized data with educational partners</p>
                                    </div>
                                    <Switch
                                        checked={privacySettings?.shareDataWithPartners || false}
                                        onCheckedChange={(checked) => handlePrivacySettingsUpdate('shareDataWithPartners', checked)}
                                    />
                                </div>

                                <div className="setting-control">
                                    <div className="setting-info">
                                        <h3>Personalized Ads</h3>
                                        <p>Show ads based on your learning interests and activity</p>
                                    </div>
                                    <Switch
                                        checked={privacySettings?.personalizedAds || false}
                                        onCheckedChange={(checked) => handlePrivacySettingsUpdate('personalizedAds', checked)}
                                    />
                                </div>

                                <div className="setting-control">
                                    <div className="setting-info">
                                        <h3>Email Notifications</h3>
                                        <p>Receive email notifications about your learning progress</p>
                                    </div>
                                    <Switch
                                        checked={privacySettings?.emailNotifications || false}
                                        onCheckedChange={(checked) => handlePrivacySettingsUpdate('emailNotifications', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data" className="data-management">
                    <div className="data-management-grid">
                        <Card className="data-export-card">
                            <CardHeader>
                                <CardTitle>Data Export</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Download a complete copy of your personal data</p>
                                <Button
                                    onClick={handleDataExport}
                                    disabled={isExporting}
                                    className="export-button"
                                >
                                    <Download className="button-icon" />
                                    {isExporting ? 'Exporting...' : 'Export My Data'}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="data-deletion-card">
                            <CardHeader>
                                <CardTitle>Data Deletion</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Permanently delete your data from our systems</p>
                                <div className="deletion-options">
                                    <Button
                                        onClick={() => handleDataDeletion('personalDataOnly')}
                                        disabled={isDeletingData}
                                        variant="outline"
                                        className="delete-button"
                                    >
                                        <Trash2 className="button-icon" />
                                        Delete Personal Data Only
                                    </Button>
                                    <Button
                                        onClick={() => handleDataDeletion('complete')}
                                        disabled={isDeletingData}
                                        variant="destructive"
                                        className="delete-button"
                                    >
                                        <Trash2 className="button-icon" />
                                        {isDeletingData ? 'Deleting...' : 'Delete All Data'}
                                    </Button>
                                </div>
                                <p className="deletion-warning">
                                    ⚠️ Data deletion is permanent and cannot be undone
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};


