import React from 'react';
import './ChildFriendlyCard.css';

interface ChildFriendlyCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'default';
  interactive?: boolean;
  className?: string;
  title?: string;
  icon?: string;
  badge?: string | number;
}

const ChildFriendlyCard: React.FC<ChildFriendlyCardProps> = ({
  children,
  onClick,
  color = 'default',
  interactive = false,
  className = '',
  title,
  icon,
  badge,
}) => {
  const cardClasses = [
    'card-child',
    color !== 'default' ? `card-${color}` : '',
    interactive ? 'interactive hover-bounce' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (interactive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      if (onClick) {
        onClick();
      }
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={title}
    >
      {(title || icon || badge) && (
        <div className="card-header">
          <div className="card-title-section">
            {icon && (
              <span className="card-icon" role="img" aria-hidden="true">
                {icon}
              </span>
            )}
            {title && <h3 className="card-title">{title}</h3>}
          </div>
          {badge && (
            <div className="card-badge">
              <span className="badge-child">{badge}</span>
            </div>
          )}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default ChildFriendlyCard;
