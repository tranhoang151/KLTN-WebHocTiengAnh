import React, { useState } from 'react';
import './ChildFriendlyInput.css';

interface ChildFriendlyInputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  icon?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  maxLength?: number;
  ariaLabel?: string;
}

const ChildFriendlyInput: React.FC<ChildFriendlyInputProps> = ({
  type = 'text',
  placeholder,
  value = '',
  onChange,
  label,
  icon,
  error,
  success,
  disabled = false,
  required = false,
  className = '',
  maxLength,
  ariaLabel,
}) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const inputClasses = [
    'input-child',
    focused ? 'input-focused' : '',
    error ? 'input-error' : '',
    success ? 'input-success' : '',
    disabled ? 'input-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClasses = [
    'input-container',
    focused ? 'container-focused' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="input-label">
          {icon && (
            <span className="label-icon" role="img" aria-hidden="true">
              {icon}
            </span>
          )}
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        <input
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          aria-label={ariaLabel || label}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? 'error-message' : success ? 'success-message' : undefined
          }
        />

        {focused && (
          <div className="input-focus-indicator">
            <div className="focus-sparkle sparkle-1">✨</div>
            <div className="focus-sparkle sparkle-2">⭐</div>
            <div className="focus-sparkle sparkle-3">✨</div>
          </div>
        )}
      </div>

      {error && (
        <div id="error-message" className="message-child message-error">
          <span role="img" aria-hidden="true">
            ❌
          </span>
          {error}
        </div>
      )}

      {success && !error && (
        <div id="success-message" className="message-child message-success">
          <span role="img" aria-hidden="true">
            ✅
          </span>
          {success}
        </div>
      )}

      {maxLength && (
        <div className="character-count">
          <span
            className={
              internalValue.length > maxLength * 0.8 ? 'count-warning' : ''
            }
          >
            {internalValue.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChildFriendlyInput;


