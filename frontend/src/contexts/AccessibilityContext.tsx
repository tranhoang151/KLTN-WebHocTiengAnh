import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  textSize: 'small' | 'normal' | 'large' | 'extra-large';
  reducedMotion: boolean;
  largeTouchTargets: boolean;
  simplifiedInterface: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  announceToScreenReader: (
    message: string,
    priority?: 'polite' | 'assertive'
  ) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  textSize: 'normal',
  reducedMotion: false,
  largeTouchTargets: false,
  simplifiedInterface: false,
  keyboardNavigation: false,
  screenReaderMode: false,
};

export const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }

    // Detect system preferences
    const systemPreferences: Partial<AccessibilitySettings> = {};

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      systemPreferences.reducedMotion = true;
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      systemPreferences.highContrast = true;
    }

    return { ...defaultSettings, ...systemPreferences };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply CSS classes to document body based on settings
  useEffect(() => {
    const body = document.body;

    // Remove all accessibility classes
    body.classList.remove(
      'high-contrast',
      'text-size-small',
      'text-size-normal',
      'text-size-large',
      'text-size-extra-large',
      'large-touch-targets',
      'simplified-interface',
      'keyboard-user',
      'screen-reader-mode'
    );

    // Apply current settings
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    }

    body.classList.add(`text-size-${settings.textSize}`);

    if (settings.largeTouchTargets) {
      body.classList.add('large-touch-targets');
    }

    if (settings.simplifiedInterface) {
      body.classList.add('simplified-interface');
    }

    if (settings.keyboardNavigation) {
      body.classList.add('keyboard-user');
    }

    if (settings.screenReaderMode) {
      body.classList.add('screen-reader-mode');
    }
  }, [settings]);

  // Listen for keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setSettings((prev) => ({ ...prev, keyboardNavigation: true }));
        document.body.classList.add('keyboard-user');
        document.body.classList.remove('mouse-user');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.add('mouse-user');
      document.body.classList.remove('keyboard-user');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Create live regions for screen reader announcements
  useEffect(() => {
    const createLiveRegion = (id: string, ariaLive: 'polite' | 'assertive') => {
      if (!document.getElementById(id)) {
        const liveRegion = document.createElement('div');
        liveRegion.id = id;
        liveRegion.setAttribute('aria-live', ariaLive);
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'live-region';
        document.body.appendChild(liveRegion);
      }
    };

    createLiveRegion('live-region-polite', 'polite');
    createLiveRegion('live-region-assertive', 'assertive');

    return () => {
      const politeRegion = document.getElementById('live-region-polite');
      const assertiveRegion = document.getElementById('live-region-assertive');
      if (politeRegion) politeRegion.remove();
      if (assertiveRegion) assertiveRegion.remove();
    };
  }, []);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Announce setting changes to screen readers
    const settingNames: Record<keyof AccessibilitySettings, string> = {
      highContrast: 'High contrast mode',
      textSize: 'Text size',
      reducedMotion: 'Reduced motion',
      largeTouchTargets: 'Large touch targets',
      simplifiedInterface: 'Simplified interface',
      keyboardNavigation: 'Keyboard navigation',
      screenReaderMode: 'Screen reader mode',
    };

    const settingName = settingNames[key];
    const statusText =
      typeof value === 'boolean'
        ? value
          ? 'enabled'
          : 'disabled'
        : `set to ${value}`;

    announceToScreenReader(`${settingName} ${statusText}`, 'polite');
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    announceToScreenReader('Accessibility settings reset to default', 'polite');
  };

  const announceToScreenReader = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const regionId =
      priority === 'assertive' ? 'live-region-assertive' : 'live-region-polite';
    const liveRegion = document.getElementById(regionId);

    if (liveRegion) {
      // Clear the region first
      liveRegion.textContent = '';

      // Add the message after a brief delay to ensure it's announced
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 100);

      // Clear the message after it's been announced
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 3000);
    }
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    resetSettings,
    announceToScreenReader,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }
  return context;
};

// Hook for keyboard navigation detection
export const useKeyboardNavigation = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
};

// Hook for focus management
export const useFocusManagement = () => {
  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  const focusFirstFocusableElement = (container?: HTMLElement) => {
    const focusableElements = (container || document).querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (event.key === 'Escape') {
        // Allow escape to close modals
        const closeButton = container.querySelector(
          '[aria-label*="close"], [aria-label*="Close"]'
        ) as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  return {
    focusElement,
    focusFirstFocusableElement,
    trapFocus,
  };
};
