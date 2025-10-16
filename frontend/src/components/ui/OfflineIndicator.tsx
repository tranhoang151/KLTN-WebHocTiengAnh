import React, { useState, useEffect } from 'react';
import ChildFriendlyButton from './ChildFriendlyButton';
import './OfflineIndicator.css';

interface OfflineIndicatorProps {
  onRetry?: () => void;
  position?: 'top' | 'bottom';
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onRetry,
  position = 'top',
  className = '',
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show "Back online" message briefly
        setShowIndicator(true);
        setTimeout(() => {
          setShowIndicator(false);
          setWasOffline(false);
        }, 3000);
      } else {
        setShowIndicator(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - reload the page
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    if (isOnline) {
      setShowIndicator(false);
      setWasOffline(false);
    }
  };

  if (!showIndicator) return null;

  const containerClasses = [
    'offline-indicator',
    `position-${position}`,
    isOnline ? 'status-online' : 'status-offline',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      role="alert"
      aria-live="assertive"
      aria-labelledby="offline-title"
      aria-describedby="offline-description"
    >
      <div className="offline-content">
        {/* Status Icon */}
        <div className="offline-icon">
          {isOnline ? (
            <span role="img" aria-hidden="true">
              ✅
            </span>
          ) : (
            <span role="img" aria-hidden="true">
              📡
            </span>
          )}
        </div>

        {/* Status Message */}
        <div className="offline-message">
          <h4 id="offline-title" className="offline-title">
            {isOnline ? 'Back Online!' : 'No Internet Connection'}
          </h4>
          <p id="offline-description" className="offline-description">
            {isOnline
              ? 'Great! Your internet connection is back. You can continue learning!'
              : "Don't worry! You can still use some features while offline. We'll reconnect automatically when your internet is back."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="offline-actions">
          {!isOnline && (
            <ChildFriendlyButton
              variant="primary"
              icon="🔄"
              onClick={handleRetry}
              size="normal"
              className="retry-connection-button"
            >
              Try Again
            </ChildFriendlyButton>
          )}

          <ChildFriendlyButton
            variant="secondary"
            icon="✕"
            onClick={handleDismiss}
            size="normal"
            className="dismiss-offline-button"
          >
            {isOnline ? 'Great!' : 'Got it'}
          </ChildFriendlyButton>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="offline-decoration">
        {isOnline ? (
          <div className="celebration-emoji">🎉</div>
        ) : (
          <div className="offline-emoji">🌐</div>
        )}
      </div>

      {/* Connection Status Indicator */}
      <div className="connection-status">
        <div
          className={`status-dot ${isOnline ? 'dot-online' : 'dot-offline'}`}
        ></div>
        <span className="status-text">
          {isOnline ? 'Connected' : 'Offline'}
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
