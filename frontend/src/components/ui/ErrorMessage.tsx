import React from 'react';
import ChildFriendlyButton from './ChildFriendlyButton';
import './ErrorMessage.css';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  icon?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissText?: string;
  fullScreen?: boolean;
  className?: string;
  showDetails?: boolean;
  details?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  type = 'error',
  icon,
  onRetry,
  onDismiss,
  retryText = 'Try Again',
  dismissText = 'Dismiss',
  fullScreen = false,
  className = '',
  showDetails = false,
  details,
}) => {
  const [showDetailedInfo, setShowDetailedInfo] = React.useState(false);

  const getDefaultIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'error':
        return 'Oops! Something went wrong';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Error';
    }
  };

  const containerClasses = [
    'error-message-container',
    `error-${type}`,
    fullScreen ? 'error-fullscreen' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      role="alert"
      aria-live="assertive"
      aria-labelledby="error-title"
      aria-describedby="error-description"
    >
      <div className="error-content">
        {/* Error Icon */}
        <div className="error-icon-container">
          <span className="error-icon" role="img" aria-hidden="true">
            {icon || getDefaultIcon()}
          </span>
        </div>

        {/* Error Text */}
        <div className="error-text">
          <h3 id="error-title" className="error-title">
            {title || getDefaultTitle()}
          </h3>
          <p id="error-description" className="error-description">
            {message}
          </p>

          {/* Details Section */}
          {(showDetails || details) && (
            <div className="error-details-section">
              <button
                className="details-toggle"
                onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                aria-expanded={showDetailedInfo}
                aria-controls="error-details"
              >
                <span>{showDetailedInfo ? '▼' : '▶'}</span>
                {showDetailedInfo ? 'Hide Details' : 'Show Details'}
              </button>

              {showDetailedInfo && details && (
                <div id="error-details" className="error-details">
                  <pre>{details}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="error-actions">
          {onRetry && (
            <ChildFriendlyButton
              variant="primary"
              icon="🔄"
              onClick={onRetry}
              className="retry-button"
            >
              {retryText}
            </ChildFriendlyButton>
          )}

          {onDismiss && (
            <ChildFriendlyButton
              variant="secondary"
              icon="✕"
              onClick={onDismiss}
              className="dismiss-button"
            >
              {dismissText}
            </ChildFriendlyButton>
          )}
        </div>
      </div>

      {/* Decorative Elements for Children */}
      {type === 'error' && (
        <div className="error-decoration">
          <div className="sad-face">😔</div>
          <div className="comfort-message">
            Don't worry! We can fix this together! 💪
          </div>
        </div>
      )}

      {type === 'warning' && (
        <div className="error-decoration">
          <div className="warning-face">🤔</div>
          <div className="comfort-message">
            Let's be careful and try again! 🌟
          </div>
        </div>
      )}

      {type === 'info' && (
        <div className="error-decoration">
          <div className="info-face">🤓</div>
          <div className="comfort-message">
            Here's something you should know! 📚
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;


