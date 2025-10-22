import React from 'react';
import './ChildFriendlyButton.css';

interface ChildFriendlyButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'playful';
  size?: 'normal' | 'large';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

const ChildFriendlyButton: React.FC<ChildFriendlyButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'normal',
  icon,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ariaLabel,
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const buttonClasses = [
    'btn-child',
    `btn-${variant}`,
    size === 'large' ? 'btn-large' : '',
    icon && !children ? 'btn-icon' : '',
    'hover-bounce',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={
        ariaLabel || (typeof children === 'string' ? children : undefined)
      }
      aria-busy={loading}
      aria-describedby={loading ? 'loading-description' : undefined}
    >
      {loading ? (
        <div className="loading-child">
          <div className="loading-dots" aria-hidden="true">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <span id="loading-description">Loading...</span>
        </div>
      ) : (
        <>
          {icon && (
            <span className="btn-icon-emoji" role="img" aria-hidden="true">
              {icon}
            </span>
          )}
          {children}
        </>
      )}
    </button>
  );
};

export default ChildFriendlyButton;


