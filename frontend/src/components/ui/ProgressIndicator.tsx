import React from 'react';
import './ProgressIndicator.css';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep?: string;
  title?: string;
  showStepNumbers?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onCancel?: () => void;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  title,
  showStepNumbers = true,
  orientation = 'horizontal',
  className = '',
  onCancel,
}) => {
  const containerClasses = [
    'progress-indicator',
    `orientation-${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getStepIcon = (step: ProgressStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      case 'active':
        return '🔄';
      default:
        return showStepNumbers ? (index + 1).toString() : '⏳';
    }
  };

  const getStepAriaLabel = (step: ProgressStep, index: number) => {
    const stepNumber = index + 1;
    const statusText = {
      pending: 'pending',
      active: 'in progress',
      completed: 'completed',
      error: 'failed',
    }[step.status];

    return `Step ${stepNumber}: ${step.label}, ${statusText}`;
  };

  return (
    <div
      className={containerClasses}
      role="progressbar"
      aria-label={title || 'Progress indicator'}
    >
      {title && (
        <div className="progress-header">
          <h3 className="progress-title">{title}</h3>
          {onCancel && (
            <button
              className="cancel-button"
              onClick={onCancel}
              aria-label="Cancel operation"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="progress-steps">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep || step.status === 'active';
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';

          return (
            <React.Fragment key={step.id}>
              <div
                className={`progress-step ${step.status}`}
                aria-label={getStepAriaLabel(step, index)}
                role="listitem"
              >
                {/* Step Icon/Number */}
                <div className="step-icon-container">
                  <div className="step-icon">
                    {step.status === 'active' ? (
                      <div className="step-spinner">
                        <div className="spinner-dot"></div>
                        <div className="spinner-dot"></div>
                        <div className="spinner-dot"></div>
                      </div>
                    ) : (
                      <span role="img" aria-hidden="true">
                        {getStepIcon(step, index)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step Content */}
                <div className="step-content">
                  <div className="step-label">{step.label}</div>
                  {step.description && (
                    <div className="step-description">{step.description}</div>
                  )}

                  {/* Status indicator for screen readers */}
                  <span className="sr-only">Status: {step.status}</span>
                </div>

                {/* Active step indicator */}
                {isActive && (
                  <div className="active-indicator" aria-hidden="true">
                    <div className="pulse-ring"></div>
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`step-connector ${isCompleted ? 'completed' : ''}`}
                  aria-hidden="true"
                >
                  <div className="connector-line"></div>
                  {isCompleted && <div className="connector-progress"></div>}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Overall Progress Bar */}
      <div className="overall-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(steps.filter((s) => s.status === 'completed').length / steps.length) * 100}%`,
            }}
          ></div>
        </div>
        <div className="progress-text">
          {steps.filter((s) => s.status === 'completed').length} of{' '}
          {steps.length} completed
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
