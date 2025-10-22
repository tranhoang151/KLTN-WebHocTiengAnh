import React, { useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import AccessibilityPanel from './AccessibilityPanel';
import './AccessibilityButton.css';

interface AccessibilityButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

const AccessibilityButton: React.FC<AccessibilityButtonProps> = ({
  position = 'bottom-right',
  className = '',
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  const handleOpenPanel = () => {
    setIsPanelOpen(true);
    announceToScreenReader('Accessibility settings panel opened', 'polite');
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    announceToScreenReader('Accessibility settings panel closed', 'polite');
  };

  const buttonClasses = [
    'accessibility-button',
    `position-${position}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <button
        className={buttonClasses}
        onClick={handleOpenPanel}
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
        type="button"
      >
        <span className="accessibility-icon" role="img" aria-hidden="true">
          ♿
        </span>
        <span className="accessibility-text">Accessibility</span>
      </button>

      <AccessibilityPanel isOpen={isPanelOpen} onClose={handleClosePanel} />
    </>
  );
};

export default AccessibilityButton;


