import React from 'react';
import './ChildFriendlyProgress.css';

interface ChildFriendlyProgressProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'rainbow';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  icon?: string;
  celebrateOnComplete?: boolean;
  className?: string;
}

const ChildFriendlyProgress: React.FC<ChildFriendlyProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'blue',
  size = 'medium',
  animated = true,
  icon,
  celebrateOnComplete = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isComplete = percentage >= 100;

  const progressClasses = [
    'progress-child',
    `progress-${size}`,
    `progress-${color}`,
    animated ? 'progress-animated' : '',
    isComplete && celebrateOnComplete ? 'progress-complete' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const fillClasses = [
    'progress-fill',
    `fill-${color}`,
    animated ? 'fill-animated' : '',
    isComplete ? 'fill-complete' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="progress-container">
      {(label || icon) && (
        <div className="progress-header">
          <div className="progress-label-section">
            {icon && (
              <span className="progress-icon" role="img" aria-hidden="true">
                {icon}
              </span>
            )}
            {label && <span className="progress-label">{label}</span>}
          </div>
          {showPercentage && (
            <span className="progress-percentage">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={progressClasses}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${Math.round(percentage)}%`}
      >
        <div className={fillClasses} style={{ width: `${percentage}%` }}>
          {animated && <div className="progress-shine"></div>}
        </div>

        {isComplete && celebrateOnComplete && (
          <div className="celebration-particles">
            <div className="particle particle-1">🎉</div>
            <div className="particle particle-2">⭐</div>
            <div className="particle particle-3">🎊</div>
            <div className="particle particle-4">✨</div>
            <div className="particle particle-5">🌟</div>
          </div>
        )}
      </div>

      {isComplete && celebrateOnComplete && (
        <div className="completion-message">
          <span role="img" aria-hidden="true">
            🎉
          </span>
          Great job! You did it!
          <span role="img" aria-hidden="true">
            🎉
          </span>
        </div>
      )}
    </div>
  );
};

export default ChildFriendlyProgress;


