import React from 'react';
import './Switch.css';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
    checked,
    onCheckedChange,
    disabled = false,
    className = '',
    id
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange(event.target.checked);
    };

    return (
        <label className={`switch ${className} ${disabled ? 'switch-disabled' : ''}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                id={id}
                className="switch-input"
            />
            <span className="switch-slider"></span>
        </label>
    );
};