import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { X, Cookie, Settings, Shield } from 'lucide-react';
import { privacyService, CookieConsentRequest } from '../../services/privacyService';
import './CookieConsentBanner.css';

interface CookieConsentBannerProps {
    onAcceptAll?: () => void;
    onRejectAll?: () => void;
    onCustomize?: (consent: CookieConsentRequest) => void;
    onClose?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
    onAcceptAll,
    onRejectAll,
    onCustomize,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [cookieConsent, setCookieConsent] = useState<CookieConsentRequest>({
        functional: false,
        analytics: false,
        marketing: false,
        personalization: false
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkConsentStatus();

        // Listen for consent banner events
        const handleShowBanner = () => setIsVisible(true);
        window.addEventListener('showConsentBanner', handleShowBanner);

        return () => {
            window.removeEventListener('showConsentBanner', handleShowBanner);
        };
    }, []);

    const checkConsentStatus = async () => {
        try {
            // Check if user has already given consent
            const existingConsent = privacyService.getCookieConsentFromStorage();

            if (!existingConsent) {
                // Show banner if no consent has been given
                setIsVisible(true);
            } else {
                setCookieConsent(existingConsent);
            }
        } catch (error) {
            console.error('Error checking consent status:', error);
            setIsVisible(true); // Show banner on error to be safe
        }
    };

    const handleAcceptAll = async () => {
        setIsLoading(true);

        const allAcceptedConsent: CookieConsentRequest = {
            functional: true,
            analytics: true,
            marketing: true,
            personalization: true
        };

        try {
            await privacyService.updateCookieConsent(allAcceptedConsent);
            setCookieConsent(allAcceptedConsent);
            setIsVisible(false);
            onAcceptAll?.();
        } catch (error) {
            console.error('Error accepting all cookies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectAll = async () => {
        setIsLoading(true);

        const rejectedConsent: CookieConsentRequest = {
            functional: false,
            analytics: false,
            marketing: false,
            personalization: false
        };

        try {
            await privacyService.updateCookieConsent(rejectedConsent);
            setCookieConsent(rejectedConsent);
            setIsVisible(false);
            onRejectAll?.();
        } catch (error) {
            console.error('Error rejecting cookies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomConsent = async () => {
        setIsLoading(true);

        try {
            await privacyService.updateCookieConsent(cookieConsent);
            setIsVisible(false);
            onCustomize?.(cookieConsent);
        } catch (error) {
            console.error('Error saving custom consent:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConsentChange = (cookieType: keyof CookieConsentRequest, value: boolean) => {
        setCookieConsent(prev => ({
            ...prev,
            [cookieType]: value
        }));
    };

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent-overlay">
            <Card className="cookie-consent-banner">
                <CardContent className="cookie-consent-content">
                    <div className="cookie-consent-header">
                        <div className="cookie-consent-title">
                            <Cookie className="cookie-icon" />
                            <h3>Cookie Preferences</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="close-button"
                        >
                            <X className="close-icon" />
                        </Button>
                    </div>

                    <div className="cookie-consent-body">
                        <p className="cookie-description">
                            We use cookies to enhance your learning experience, provide personalized content,
                            and analyze our traffic. You can choose which cookies to accept below.
                        </p>

                        {!showDetails ? (
                            <div className="cookie-quick-actions">
                                <div className="cookie-actions">
                                    <Button
                                        onClick={handleAcceptAll}
                                        disabled={isLoading}
                                        className="accept-all-button"
                                    >
                                        {isLoading ? 'Saving...' : 'Accept All'}
                                    </Button>
                                    <Button
                                        onClick={handleRejectAll}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="reject-all-button"
                                    >
                                        {isLoading ? 'Saving...' : 'Reject All'}
                                    </Button>
                                    <Button
                                        onClick={() => setShowDetails(true)}
                                        variant="ghost"
                                        className="customize-button"
                                    >
                                        <Settings className="settings-icon" />
                                        Customize
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="cookie-details">
                                <div className="cookie-categories">
                                    <div className="cookie-category">
                                        <div className="cookie-category-header">
                                            <div className="cookie-category-info">
                                                <h4>Essential Cookies</h4>
                                                <p>Required for basic site functionality. Cannot be disabled.</p>
                                            </div>
                                            <Switch checked={true} disabled onCheckedChange={() => { }} />
                                        </div>
                                    </div>

                                    <div className="cookie-category">
                                        <div className="cookie-category-header">
                                            <div className="cookie-category-info">
                                                <h4>Functional Cookies</h4>
                                                <p>Enable enhanced features like remembering your preferences and settings.</p>
                                            </div>
                                            <Switch
                                                checked={cookieConsent.functional}
                                                onCheckedChange={(checked) => handleConsentChange('functional', checked)}
                                            />
                                        </div>
                                    </div>

                                    <div className="cookie-category">
                                        <div className="cookie-category-header">
                                            <div className="cookie-category-info">
                                                <h4>Analytics Cookies</h4>
                                                <p>Help us understand how you use our site to improve performance and user experience.</p>
                                            </div>
                                            <Switch
                                                checked={cookieConsent.analytics}
                                                onCheckedChange={(checked) => handleConsentChange('analytics', checked)}
                                            />
                                        </div>
                                    </div>

                                    <div className="cookie-category">
                                        <div className="cookie-category-header">
                                            <div className="cookie-category-info">
                                                <h4>Marketing Cookies</h4>
                                                <p>Used to deliver relevant advertisements and track campaign performance.</p>
                                            </div>
                                            <Switch
                                                checked={cookieConsent.marketing}
                                                onCheckedChange={(checked) => handleConsentChange('marketing', checked)}
                                            />
                                        </div>
                                    </div>

                                    <div className="cookie-category">
                                        <div className="cookie-category-header">
                                            <div className="cookie-category-info">
                                                <h4>Personalization Cookies</h4>
                                                <p>Remember your preferences to provide a customized learning experience.</p>
                                            </div>
                                            <Switch
                                                checked={cookieConsent.personalization}
                                                onCheckedChange={(checked) => handleConsentChange('personalization', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="cookie-detailed-actions">
                                    <Button
                                        onClick={handleCustomConsent}
                                        disabled={isLoading}
                                        className="save-preferences-button"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                    <Button
                                        onClick={() => setShowDetails(false)}
                                        variant="ghost"
                                        className="back-button"
                                    >
                                        Back
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="cookie-footer">
                            <div className="privacy-links">
                                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                                    <Shield className="shield-icon" />
                                    Privacy Policy
                                </a>
                                <a href="/cookie-policy" target="_blank" rel="noopener noreferrer">
                                    <Cookie className="cookie-icon" />
                                    Cookie Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Hook for managing cookie consent
export const useCookieConsent = () => {
    const [hasConsent, setHasConsent] = useState<boolean | null>(null);
    const [consentDetails, setConsentDetails] = useState<CookieConsentRequest | null>(null);

    useEffect(() => {
        checkConsent();
    }, []);

    const checkConsent = () => {
        const consent = privacyService.getCookieConsentFromStorage();
        setHasConsent(consent !== null);
        setConsentDetails(consent);
    };

    const updateConsent = async (consent: CookieConsentRequest) => {
        try {
            await privacyService.updateCookieConsent(consent);
            setHasConsent(true);
            setConsentDetails(consent);
        } catch (error) {
            console.error('Error updating consent:', error);
            throw error;
        }
    };

    const revokeConsent = () => {
        localStorage.removeItem('cookieConsent');
        setHasConsent(false);
        setConsentDetails(null);
    };

    const isAllowed = (cookieType: 'essential' | 'functional' | 'analytics' | 'marketing' | 'personalization'): boolean => {
        return privacyService.isCookieAllowed(cookieType);
    };

    return {
        hasConsent,
        consentDetails,
        updateConsent,
        revokeConsent,
        isAllowed,
        checkConsent
    };
};

export default CookieConsentBanner;


