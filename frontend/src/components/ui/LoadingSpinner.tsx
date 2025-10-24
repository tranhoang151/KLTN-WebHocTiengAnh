import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  message,
  fullScreen = false,
  className = '',
}) => {
  const spinnerClasses = [
    'loading-spinner',
    `spinner-${size}`,
    `spinner-${color}`,
    fullScreen ? 'spinner-fullscreen' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClasses = [
    'loading-container',
    fullScreen ? 'container-fullscreen' : '',
    size === 'large' ? 'container-large' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading content'}
    >
      <div className={spinnerClasses}>
        <div className="spinner-circle">
          <div className="spinner-dot spinner-dot-1"></div>
          <div className="spinner-dot spinner-dot-2"></div>
          <div className="spinner-dot spinner-dot-3"></div>
          <div className="spinner-dot spinner-dot-4"></div>
          <div className="spinner-dot spinner-dot-5"></div>
          <div className="spinner-dot spinner-dot-6"></div>
          <div className="spinner-dot spinner-dot-7"></div>
          <div className="spinner-dot spinner-dot-8"></div>
        </div>
      </div>

      {message && (
        <div className="loading-message">
          <span className="message-text">{message}</span>
          <div className="message-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        </div>
      )}

      {/* Screen reader only content */}
      <span className="sr-only">{message || 'Loading, please wait...'}</span>
    </div>
  );
};

export default LoadingSpinner;
