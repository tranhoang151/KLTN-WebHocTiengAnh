import React from 'react';
import './Alert.css';

interface AlertProps {
    children: React.ReactNode;
    variant?: 'default' | 'destructive' | 'warning' | 'success';
    className?: string;
}

interface AlertDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export const Alert: React.FC<AlertProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    return (
        <div className={`alert alert-${variant} ${className}`} role="alert">
            {children}
        </div>
    );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`alert-description ${className}`}>
            {children}
        </div>
    );
};


