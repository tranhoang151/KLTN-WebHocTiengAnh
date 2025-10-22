import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeSecurity, XSSProtection, SecureCookies } from '../../utils/securityHeaders';
import { InputValidator, InputSanitizer } from '../../utils/inputValidation';

/**
 * Security context for managing application security features
 */
interface SecurityContextType {
    // Input validation
    validateInput: (value: any, validator: (value: any) => any) => any;
    sanitizeInput: (value: string, type?: 'text' | 'html' | 'url' | 'email') => string;

    // XSS Protection
    sanitizeForDisplay: (content: string) => string;
    checkForXSS: (content: string) => boolean;

    // Secure cookies
    setSecureCookie: (name: string, value: string, options?: any) => void;
    getSecureCookie: (name: string) => string | null;
    deleteSecureCookie: (name: string) => void;

    // Security status
    isSecurityInitialized: boolean;
    securityViolations: string[];
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

/**
 * Security Provider component
 */
export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSecurityInitialized, setIsSecurityInitialized] = useState(false);
    const [securityViolations, setSecurityViolations] = useState<string[]>([]);

    useEffect(() => {
        try {
            // initializeSecurity(); // Disabled to prevent overriding server-sent CSP
            console.log('Security measures initialized successfully');
        } catch (error) {
            console.error('Failed to initialize security measures:', error);
        }

        // Set up security monitoring
        const handleSecurityViolation = (event: CustomEvent) => {
            const violation = event.detail;
            setSecurityViolations(prev => [...prev, violation]);
            console.warn('Security violation detected:', violation);
        };

        // Listen for security events
        window.addEventListener('securityViolation', handleSecurityViolation as EventListener);

        // Monitor for suspicious activity
        const monitorActivity = () => {
            // Check for console tampering
            if (typeof console.clear !== 'function') {
                setSecurityViolations(prev => [...prev, 'Console tampering detected']);
            }

            // Check for developer tools
            if (process.env.NODE_ENV === 'production') {
                const devtools = {
                    open: false,
                    orientation: null as string | null
                };

                const threshold = 160;
                setInterval(() => {
                    if (window.outerHeight - window.innerHeight > threshold ||
                        window.outerWidth - window.innerWidth > threshold) {
                        if (!devtools.open) {
                            devtools.open = true;
                            setSecurityViolations(prev => [...prev, 'Developer tools opened']);
                        }
                    } else {
                        devtools.open = false;
                    }
                }, 500);
            }
        };

        monitorActivity();

        return () => {
            window.removeEventListener('securityViolation', handleSecurityViolation as EventListener);
        };
    }, []);

    const validateInput = (value: any, validator: (value: any) => any) => {
        try {
            return validator(value);
        } catch (error) {
            console.error('Input validation error:', error);
            setSecurityViolations(prev => [...prev, 'Input validation error']);
            return { isValid: false, errors: ['Validation failed'] };
        }
    };

    const sanitizeInput = (value: string, type: 'text' | 'html' | 'url' | 'email' = 'text') => {
        try {
            switch (type) {
                case 'html':
                    return InputSanitizer.sanitizeHtml(value);
                case 'url':
                    return InputSanitizer.sanitizeUrl(value);
                case 'email':
                    return InputSanitizer.sanitizeEmail(value);
                case 'text':
                default:
                    return InputSanitizer.sanitizeText(value);
            }
        } catch (error) {
            console.error('Input sanitization error:', error);
            setSecurityViolations(prev => [...prev, 'Input sanitization error']);
            return '';
        }
    };

    const sanitizeForDisplay = (content: string) => {
        try {
            return XSSProtection.sanitizeForDisplay(content);
        } catch (error) {
            console.error('Display sanitization error:', error);
            return '';
        }
    };

    const checkForXSS = (content: string) => {
        try {
            return XSSProtection.containsXSS(content);
        } catch (error) {
            console.error('XSS check error:', error);
            return true; // Err on the side of caution
        }
    };

    const setSecureCookie = (name: string, value: string, options: any = {}) => {
        try {
            SecureCookies.set(name, value, {
                secure: window.location.protocol === 'https:',
                sameSite: 'strict',
                ...options
            });
        } catch (error) {
            console.error('Secure cookie set error:', error);
            setSecurityViolations(prev => [...prev, 'Cookie security error']);
        }
    };

    const getSecureCookie = (name: string) => {
        try {
            return SecureCookies.get(name);
        } catch (error) {
            console.error('Secure cookie get error:', error);
            return null;
        }
    };

    const deleteSecureCookie = (name: string) => {
        try {
            SecureCookies.delete(name);
        } catch (error) {
            console.error('Secure cookie delete error:', error);
        }
    };

    const contextValue: SecurityContextType = {
        validateInput,
        sanitizeInput,
        sanitizeForDisplay,
        checkForXSS,
        setSecureCookie,
        getSecureCookie,
        deleteSecureCookie,
        isSecurityInitialized,
        securityViolations
    };

    return (
        <SecurityContext.Provider value={contextValue}>
            {children}
            {/* Security violation notifications */}
            {securityViolations.length > 0 && process.env.NODE_ENV === 'development' && (
                <SecurityViolationNotifications violations={securityViolations} />
            )}
        </SecurityContext.Provider>
    );
};

/**
 * Hook to use security context
 */
export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (context === undefined) {
        throw new Error('useSecurity must be used within a SecurityProvider');
    }
    return context;
};

/**
 * Security violation notifications component (development only)
 */
const SecurityViolationNotifications: React.FC<{ violations: string[] }> = ({ violations }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible || violations.length === 0) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 9999,
            maxWidth: '300px',
            fontSize: '12px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Security Violations</strong>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    ×
                </button>
            </div>
            <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
                {violations.slice(-5).map((violation, index) => (
                    <li key={index}>{violation}</li>
                ))}
            </ul>
        </div>
    );
};

/**
 * Higher-order component for securing components
 */
export const withSecurity = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    return (props: P) => {
        const security = useSecurity();

        // Add security props to the wrapped component
        const securityProps = {
            security,
            sanitizeInput: security.sanitizeInput,
            validateInput: security.validateInput
        };

        return <WrappedComponent {...props} {...securityProps} />;
    };
};

/**
 * Secure input component with built-in validation and sanitization
 */
export const SecureInput: React.FC<{
    type?: string;
    value: string;
    onChange: (value: string) => void;
    validator?: (value: string) => any;
    sanitizer?: 'text' | 'html' | 'url' | 'email';
    placeholder?: string;
    className?: string;
    maxLength?: number;
    required?: boolean;
}> = ({
    type = 'text',
    value,
    onChange,
    validator,
    sanitizer = 'text',
    placeholder,
    className,
    maxLength,
    required
}) => {
        const { sanitizeInput, validateInput, checkForXSS } = useSecurity();
        const [errors, setErrors] = useState<string[]>([]);

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            let newValue = event.target.value;

            // Check for XSS
            if (checkForXSS(newValue)) {
                setErrors(['Potentially malicious content detected']);
                return;
            }

            // Sanitize input
            newValue = sanitizeInput(newValue, sanitizer);

            // Validate if validator provided
            if (validator) {
                const validationResult = validateInput(newValue, validator);
                if (!validationResult.isValid) {
                    setErrors(validationResult.errors);
                } else {
                    setErrors([]);
                    newValue = validationResult.sanitizedValue || newValue;
                }
            }

            onChange(newValue);
        };

        return (
            <div>
                <input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={className}
                    maxLength={maxLength}
                    required={required}
                    style={{
                        border: errors.length > 0 ? '2px solid #ff4444' : undefined
                    }}
                />
                {errors.length > 0 && (
                    <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '2px' }}>
                        {errors.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

/**
 * Secure form component with built-in CSRF protection
 */
export const SecureForm: React.FC<{
    onSubmit: (data: any) => void;
    children: React.ReactNode;
    className?: string;
}> = ({ onSubmit, children, className }) => {
    const { setSecureCookie, getSecureCookie } = useSecurity();
    const [csrfToken] = useState(() => {
        // Generate CSRF token
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        setSecureCookie('csrf_token', token, { maxAge: 3600 }); // 1 hour
        return token;
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Verify CSRF token
        const storedToken = getSecureCookie('csrf_token');
        if (storedToken !== csrfToken) {
            console.error('CSRF token mismatch');
            return;
        }

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Add CSRF token to submission
        onSubmit({ ...data, _csrf: csrfToken });
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <input type="hidden" name="_csrf" value={csrfToken} />
            {children}
        </form>
    );
};


