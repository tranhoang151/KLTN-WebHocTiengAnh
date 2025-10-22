import { apiService } from './api';

export interface UserConsent {
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

export interface CookieConsent {
    userId: string;
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
    created_at: string;
    updatedAt: string;
}

export interface PrivacySettings {
    dataRetention: number;
    shareDataWithPartners: boolean;
    personalizedAds: boolean;
    emailNotifications: boolean;
    profileVisibility: 'public' | 'private' | 'friends';
    dataExportFormat: 'json' | 'csv' | 'xml';
}

export interface ConsentUpdateRequest {
    policyVersion: string;
    acceptedTerms: boolean;
    acceptedPrivacyPolicy: boolean;
    acceptedDataProcessing: boolean;
    acceptedCookies: boolean;
    acceptedMarketing: boolean;
    specificConsents: Record<string, boolean>;
}

export interface CookieConsentRequest {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
}

export interface DataDeletionRequest {
    deletionScope: 'complete' | 'personalDataOnly' | 'learningDataOnly' | 'anonymize';
    reason: string;
    confirmDeletion: boolean;
}

export interface GDPRDataExportResult {
    userId: string;
    exportDate: string;
    requestId: string;
    userProfile?: any;
    learningProgress: any[];
    flashcardData: any[];
    exerciseData: any[];
    achievementData: any[];
    enrollmentData: any[];
    systemLogs: any[];
    privacySettings?: any;
}

export interface GDPRDeletionResult {
    userId: string;
    deletionDate: string;
    requestId: string;
    deletionScope: string;
    deletedDataTypes: string[];
    success: boolean;
}

export interface PrivacyPolicy {
    version: string;
    title: string;
    content: string;
    effectiveDate: string;
    lastUpdated: string;
}

export interface ConsentHistory {
    id: string;
    userId: string;
    action: string;
    policyVersion: string;
    consentData: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
}

class PrivacyService {
    private baseUrl = '/gdpr';

    /**
     * Get current user consent status
     */
    async getUserConsent(): Promise<UserConsent> {
        try {
            const response = await apiService.get(`${this.baseUrl}/privacy-settings`);
            return (response.data as UserConsent) || {
                userId: '',
                policyVersion: '',
                acceptedTerms: false,
                acceptedPrivacyPolicy: false,
                acceptedDataProcessing: false,
                acceptedCookies: false,
                acceptedMarketing: false,
                specificConsents: {},
                created_at: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                requiresUpdate: false
            };
        } catch (error) {
            console.error('Error getting user consent:', error);
            throw new Error('Failed to get user consent');
        }
    }

    /**
     * Update user consent preferences
     */
    async updateConsent(request: ConsentUpdateRequest): Promise<void> {
        try {
            await apiService.post(`${this.baseUrl}/consent`, request);
        } catch (error) {
            console.error('Error updating consent:', error);
            throw new Error('Failed to update consent');
        }
    }

    /**
     * Get user cookie consent preferences
     */
    async getCookieConsent(): Promise<CookieConsent> {
        try {
            // This would typically be a separate endpoint
            const response = await apiService.get(`${this.baseUrl}/privacy-settings`);
            return (response.data as any)?.cookieConsent || {
                userId: '',
                essential: true,
                functional: false,
                analytics: false,
                marketing: false,
                personalization: false,
                created_at: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting cookie consent:', error);
            throw new Error('Failed to get cookie consent');
        }
    }

    /**
     * Update cookie consent preferences
     */
    async updateCookieConsent(request: CookieConsentRequest): Promise<void> {
        try {
            // Store cookie preferences in localStorage for immediate use
            localStorage.setItem('cookieConsent', JSON.stringify({
                ...request,
                essential: true,
                updatedAt: new Date().toISOString()
            }));

            // Also send to backend
            await apiService.post(`${this.baseUrl}/consent`, {
                cookieConsent: request
            });

            // Update cookie behavior based on consent
            this.updateCookieBehavior(request);
        } catch (error) {
            console.error('Error updating cookie consent:', error);
            throw new Error('Failed to update cookie consent');
        }
    }

    /**
     * Get user privacy settings
     */
    async getPrivacySettings(): Promise<PrivacySettings> {
        try {
            const response = await apiService.get(`${this.baseUrl}/privacy-settings`);
            return (response.data as any)?.privacySettings || {
                dataRetention: 365,
                shareDataWithPartners: false,
                personalizedAds: false,
                emailNotifications: true,
                profileVisibility: 'private',
                dataExportFormat: 'json'
            };
        } catch (error) {
            console.error('Error getting privacy settings:', error);
            throw new Error('Failed to get privacy settings');
        }
    }

    /**
     * Update privacy settings
     */
    async updatePrivacySettings(settings: PrivacySettings): Promise<void> {
        try {
            await apiService.put(`${this.baseUrl}/privacy-settings`, settings);
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            throw new Error('Failed to update privacy settings');
        }
    }

    /**
     * Export user data (GDPR Article 15 - Right of Access)
     */
    async exportUserData(): Promise<GDPRDataExportResult> {
        try {
            const response = await apiService.post(`${this.baseUrl}/export-data`);
            return response.data as GDPRDataExportResult;
        } catch (error) {
            console.error('Error exporting user data:', error);
            throw new Error('Failed to export user data');
        }
    }

    /**
     * Get portable user data (GDPR Article 20 - Right to Data Portability)
     */
    async getPortableData(): Promise<any> {
        try {
            const response = await apiService.post(`${this.baseUrl}/portable-data`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting portable data:', error);
            throw new Error('Failed to get portable data');
        }
    }

    /**
     * Delete user data (GDPR Article 17 - Right to Erasure)
     */
    async deleteUserData(request: DataDeletionRequest): Promise<GDPRDeletionResult> {
        try {
            const response = await apiService.post(`${this.baseUrl}/delete-data`, request);
            return response.data as GDPRDeletionResult;
        } catch (error) {
            console.error('Error deleting user data:', error);
            throw new Error('Failed to delete user data');
        }
    }

    /**
     * Anonymize user data
     */
    async anonymizeUserData(): Promise<void> {
        try {
            await apiService.post(`${this.baseUrl}/anonymize-data`);
        } catch (error) {
            console.error('Error anonymizing user data:', error);
            throw new Error('Failed to anonymize user data');
        }
    }

    /**
     * Get data processing activities
     */
    async getProcessingActivities(): Promise<any[]> {
        try {
            const response = await apiService.get(`${this.baseUrl}/processing-activities`);
            return response.data as any[];
        } catch (error) {
            console.error('Error getting processing activities:', error);
            throw new Error('Failed to get processing activities');
        }
    }

    /**
     * Get current privacy policy
     */
    async getPrivacyPolicy(): Promise<{ policy: PrivacyPolicy; userConsent?: UserConsent; requiresConsent: boolean }> {
        try {
            const response = await apiService.get(`${this.baseUrl}/privacy-policy`);
            return response.data as { policy: PrivacyPolicy; userConsent?: UserConsent; requiresConsent: boolean };
        } catch (error) {
            console.error('Error getting privacy policy:', error);
            throw new Error('Failed to get privacy policy');
        }
    }

    /**
     * Get consent history
     */
    async getConsentHistory(): Promise<ConsentHistory[]> {
        try {
            // This would be implemented if needed
            return [];
        } catch (error) {
            console.error('Error getting consent history:', error);
            throw new Error('Failed to get consent history');
        }
    }

    /**
     * Revoke specific consent
     */
    async revokeConsent(consentType: string): Promise<void> {
        try {
            await apiService.post(`${this.baseUrl}/revoke-consent`, { consentType });
        } catch (error) {
            console.error('Error revoking consent:', error);
            throw new Error('Failed to revoke consent');
        }
    }

    /**
     * Check if user has given consent for specific operation
     */
    async hasConsent(consentType: string): Promise<boolean> {
        try {
            const consent = await this.getUserConsent();

            switch (consentType.toLowerCase()) {
                case 'terms':
                    return consent.acceptedTerms;
                case 'privacy':
                    return consent.acceptedPrivacyPolicy;
                case 'dataprocessing':
                    return consent.acceptedDataProcessing;
                case 'cookies':
                    return consent.acceptedCookies;
                case 'marketing':
                    return consent.acceptedMarketing;
                default:
                    return false;
            }
        } catch (error) {
            console.error('Error checking consent:', error);
            return false;
        }
    }

    /**
     * Get cookie consent from localStorage (for immediate use)
     */
    getCookieConsentFromStorage(): CookieConsentRequest | null {
        try {
            const stored = localStorage.getItem('cookieConsent');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error getting cookie consent from storage:', error);
            return null;
        }
    }

    /**
     * Check if specific cookie type is allowed
     */
    isCookieAllowed(cookieType: 'essential' | 'functional' | 'analytics' | 'marketing' | 'personalization'): boolean {
        if (cookieType === 'essential') return true;

        const consent = this.getCookieConsentFromStorage();
        if (!consent) return false;

        return consent[cookieType] || false;
    }

    /**
     * Update cookie behavior based on consent
     */
    private updateCookieBehavior(consent: CookieConsentRequest): void {
        // Disable analytics if not consented
        if (!consent.analytics) {
            // Disable Google Analytics, etc.
            if (typeof (window as any).gtag !== 'undefined') {
                (window as any).gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            }
        }

        // Disable marketing cookies if not consented
        if (!consent.marketing) {
            // Disable marketing pixels, etc.
            if (typeof (window as any).gtag !== 'undefined') {
                (window as any).gtag('consent', 'update', {
                    'ad_storage': 'denied'
                });
            }
        }

        // Update other cookie behaviors as needed
        this.updateThirdPartyServices(consent);
    }

    /**
     * Update third-party services based on consent
     */
    private updateThirdPartyServices(consent: CookieConsentRequest): void {
        // Update Google Analytics
        if (consent.analytics && typeof (window as any).gtag !== 'undefined') {
            (window as any).gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }

        // Update advertising services
        if (consent.marketing && typeof (window as any).gtag !== 'undefined') {
            (window as any).gtag('consent', 'update', {
                'ad_storage': 'granted'
            });
        }

        // Update other services as needed
        // Facebook Pixel, etc.
    }

    /**
     * Initialize privacy service
     */
    async initialize(): Promise<void> {
        try {
            // Check if user has existing consent
            const consent = this.getCookieConsentFromStorage();
            if (consent) {
                this.updateCookieBehavior(consent);
            }

            // Check if privacy policy has been updated
            const policyData = await this.getPrivacyPolicy();
            if (policyData.requiresConsent) {
                // Show consent banner or redirect to consent page
                this.showConsentBanner();
            }
        } catch (error) {
            console.error('Error initializing privacy service:', error);
        }
    }

    /**
     * Show consent banner
     */
    private showConsentBanner(): void {
        // This would trigger a consent banner component
        const event = new CustomEvent('showConsentBanner');
        window.dispatchEvent(event);
    }

    /**
     * Download data as file
     */
    downloadDataAsFile(data: any, filename: string, format: 'json' | 'csv' | 'xml' = 'json'): void {
        let content: string;
        let mimeType: string;

        switch (format) {
            case 'csv':
                content = this.convertToCSV(data);
                mimeType = 'text/csv';
                break;
            case 'xml':
                content = this.convertToXML(data);
                mimeType = 'application/xml';
                break;
            default:
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Convert data to CSV format
     */
    private convertToCSV(data: any): string {
        // Simple CSV conversion - would need more sophisticated implementation
        if (Array.isArray(data)) {
            if (data.length === 0) return '';

            const headers = Object.keys(data[0]);
            const csvHeaders = headers.join(',');
            const csvRows = data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
                }).join(',')
            );

            return [csvHeaders, ...csvRows].join('\n');
        }

        return JSON.stringify(data);
    }

    /**
     * Convert data to XML format
     */
    private convertToXML(data: any): string {
        // Simple XML conversion - would need more sophisticated implementation
        const convertObject = (obj: any, indent = 0): string => {
            const spaces = '  '.repeat(indent);
            let xml = '';

            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'object' && value !== null) {
                    xml += `${spaces}<${key}>\n${convertObject(value, indent + 1)}${spaces}</${key}>\n`;
                } else {
                    xml += `${spaces}<${key}>${value}</${key}>\n`;
                }
            }

            return xml;
        };

        return `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${convertObject(data, 1)}</data>`;
    }
}

export const privacyService = new PrivacyService();
