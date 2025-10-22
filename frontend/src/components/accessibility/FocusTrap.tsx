import React, { useEffect, useRef, ReactNode } from 'react';
import { useFocusManagement } from '../../contexts/AccessibilityContext';

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  restoreFocus = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const { trapFocus } = useFocusManagement();

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Store the previously focused element
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    // Set up focus trap
    const cleanup = trapFocus(containerRef.current);

    return () => {
      cleanup();

      // Restore focus to the previously focused element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, restoreFocus, trapFocus]);

  return (
    <div
      ref={containerRef}
      className={`focus-trap ${className}`}
      data-focus-trap={active ? 'true' : 'false'}
    >
      {/* Focus trap sentinels */}
      <div className="focus-trap-start" tabIndex={0} aria-hidden="true" />

      {children}

      <div className="focus-trap-end" tabIndex={0} aria-hidden="true" />
    </div>
  );
};

export default FocusTrap;


