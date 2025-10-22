/**
 * Security headers and Content Security Policy utilities
 * Implements XSS protection and secure headers for the application
 */

/**
 * Content Security Policy configuration
 */
export const ContentSecurityPolicy = {
    // Base CSP directives
    directives: {
        'default-src': ["'self'"],
        'script-src': [
            "'self'",
            "'unsafe-inline'", // Required for React development
            "'unsafe-eval'", // Required for React development
            'https://www.youtube.com',
            'https://www.google.com',
            'https://apis.google.com',
            'https://www.gstatic.com'
        ],
        'style-src': [
            "'self'",
            "'unsafe-inline'", // Required for styled-components
            'https://fonts.googleapis.com'
        ],
        'font-src': [
            "'self'",
            'https://fonts.gstatic.com',
            'data:'
        ],
        'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https:',
            'https://firebasestorage.googleapis.com',
            'https://i.postimg.cc', // For badge images
            'https://img.youtube.com' // For video thumbnails
        ],
        'media-src': [
            "'self'",
            'https:',
            'https://firebasestorage.googleapis.com'
        ],
        'connect-src': [
            "'self'",
            'https://api.binggo-english.com', // API endpoint
            'https://firestore.googleapis.com',
            'https://firebase.googleapis.com',
            'https://identitytoolkit.googleapis.com',
            'https://securetoken.googleapis.com',
            'https://www.googleapis.com',
            'wss://firestore.googleapis.com' // WebSocket for real-time updates
        ],
        'frame-src': [
            "'self'",
            'https://www.youtube.com',
            'https://youtube.com'
        ],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': []
    },

    // Generate CSP header string
    generateHeader(): string {
        return Object.entries(this.directives)
            .map(([directive, sources]) => {
                const sourceArray = sources as string[];
                if (sourceArray.length === 0) {
                    return directive;
                }
                return `${directive} ${sourceArray.join(' ')}`;
            })
            .join('; ');
    },

    // Production CSP (stricter)
    getProductionCSP(): string {
        const productionDirectives = { ...this.directives };

        // Remove unsafe-inline and unsafe-eval for production
        productionDirectives['script-src'] = productionDirectives['script-src'].filter(
            src => src !== "'unsafe-inline'" && src !== "'unsafe-eval'"
        );

        return Object.entries(productionDirectives)
            .map(([directive, sources]) => {
                const sourceArray = sources as string[];
                if (sourceArray.length === 0) {
                    return directive;
                }
                return `${directive} ${sourceArray.join(' ')}`;
            })
            .join('; ');
    }
};

/**
 * Security headers configuration
 */
export const SecurityHeaders = {
    // Strict Transport Security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Content Type Options
    'X-Content-Type-Options': 'nosniff',

    // Frame Options
    'X-Frame-Options': 'DENY',

    // XSS Protection
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy
    'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'accelerometer=()',
        'gyroscope=()'
    ].join(', '),

    // Content Security Policy
    'Content-Security-Policy': ContentSecurityPolicy.generateHeader(),

    // Cross-Origin Embedder Policy
    'Cross-Origin-Embedder-Policy': 'require-corp',

    // Cross-Origin Opener Policy
    'Cross-Origin-Opener-Policy': 'same-origin',

    // Cross-Origin Resource Policy
    'Cross-Origin-Resource-Policy': 'same-origin'
};

/**
 * Apply security headers to HTML document
 */
export const applySecurityHeaders = (): void => {
    // Set CSP via meta tag (fallback if server headers not available)
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = ContentSecurityPolicy.generateHeader();
    document.head.appendChild(cspMeta);

    // Set other security meta tags
    const securityMetas = [
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'X-Frame-Options', content: 'DENY' },
        { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
        { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    securityMetas.forEach(meta => {
        const metaElement = document.createElement('meta');
        metaElement.httpEquiv = meta.httpEquiv;
        metaElement.content = meta.content;
        document.head.appendChild(metaElement);
    });
};

/**
 * XSS Protection utilities
 */
export class XSSProtection {
    /**
     * Sanitize user input for display
     */
    static sanitizeForDisplay(input: string): string {
        if (typeof input !== 'string') return '';

        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Sanitize URL to prevent javascript: and data: protocols
     */
    static sanitizeUrl(url: string): string {
        if (typeof url !== 'string') return '';

        const trimmedUrl = url.trim().toLowerCase();

        // Block dangerous protocols
        const dangerousProtocols = [
            'javascript:',
            'data:',
            'vbscript:',
            'file:',
            'ftp:'
        ];

        for (const protocol of dangerousProtocols) {
            if (trimmedUrl.startsWith(protocol)) {
                return '';
            }
        }

        // Only allow http and https
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
            return '';
        }

        return url;
    }

    /**
     * Validate and sanitize HTML attributes
     */
    static sanitizeAttributes(attributes: Record<string, string>): Record<string, string> {
        const sanitized: Record<string, string> = {};
        const allowedAttributes = [
            'id', 'class', 'style', 'title', 'alt', 'src', 'href', 'target',
            'width', 'height', 'data-testid'
        ];

        Object.keys(attributes).forEach(key => {
            const lowerKey = key.toLowerCase();

            // Skip event handlers and dangerous attributes
            if (lowerKey.startsWith('on') || lowerKey.includes('script')) {
                return;
            }

            // Only allow whitelisted attributes
            if (allowedAttributes.includes(lowerKey)) {
                let value = attributes[key];

                // Sanitize URLs in href and src attributes
                if (lowerKey === 'href' || lowerKey === 'src') {
                    value = this.sanitizeUrl(value);
                }

                // Sanitize other attribute values
                sanitized[key] = this.sanitizeForDisplay(value);
            }
        });

        return sanitized;
    }

    /**
     * Check if content contains potential XSS
     */
    static containsXSS(content: string): boolean {
        if (typeof content !== 'string') return false;

        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^>]*>/gi,
            /<object\b[^>]*>/gi,
            /<embed\b[^>]*>/gi,
            /<form\b[^>]*>/gi,
            /expression\s*\(/gi,
            /vbscript:/gi,
            /data:text\/html/gi
        ];

        return xssPatterns.some(pattern => pattern.test(content));
    }

    /**
     * Remove potentially dangerous HTML tags and attributes
     */
    static stripDangerousHTML(html: string): string {
        if (typeof html !== 'string') return '';

        // Remove script tags and their content
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove dangerous tags
        const dangerousTags = [
            'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
            'link', 'meta', 'style', 'base', 'applet'
        ];

        dangerousTags.forEach(tag => {
            const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>`, 'gi');
            html = html.replace(regex, '');

            // Also remove self-closing tags
            const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi');
            html = html.replace(selfClosingRegex, '');
        });

        // Remove event handlers
        html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
        html = html.replace(/\son\w+\s*=\s*[^>\s]+/gi, '');

        // Remove javascript: and data: protocols
        html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
        html = html.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
        html = html.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"');
        html = html.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');

        return html;
    }
}

/**
 * Secure cookie utilities
 */
export class SecureCookies {
    /**
     * Set secure cookie with proper flags
     */
    static set(name: string, value: string, options: {
        maxAge?: number;
        path?: string;
        domain?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    } = {}): void {
        const {
            maxAge = 86400, // 24 hours default
            path = '/',
            secure = window.location.protocol === 'https:',
            sameSite = 'strict'
        } = options;

        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        cookieString += `; Max-Age=${maxAge}`;
        cookieString += `; Path=${path}`;

        if (options.domain) {
            cookieString += `; Domain=${options.domain}`;
        }

        if (secure) {
            cookieString += '; Secure';
        }

        cookieString += `; SameSite=${sameSite}`;

        document.cookie = cookieString;
    }

    /**
     * Get cookie value
     */
    static get(name: string): string | null {
        const nameEQ = encodeURIComponent(name) + '=';
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }

        return null;
    }

    /**
     * Delete cookie
     */
    static delete(name: string, path: string = '/'): void {
        this.set(name, '', { maxAge: -1, path });
    }

    /**
     * Clear all cookies
     */
    static clearAll(): void {
        const cookies = document.cookie.split(';');

        cookies.forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            this.delete(name);
        });
    }
}

/**
 * Initialize security measures
 */
export const initializeSecurity = (): void => {
    // Apply security headers
    applySecurityHeaders();

    // Disable right-click context menu in production
    if (process.env.NODE_ENV === 'production') {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Disable F12, Ctrl+Shift+I, Ctrl+U
        document.addEventListener('keydown', (e) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault();
            }
        });
    }

    // Monitor for XSS attempts
    window.addEventListener('error', (event) => {
        if (event.message && XSSProtection.containsXSS(event.message)) {
            console.warn('Potential XSS attempt detected:', event.message);
            // Log to security monitoring system
        }
    });

    console.log('Security measures initialized');
};
