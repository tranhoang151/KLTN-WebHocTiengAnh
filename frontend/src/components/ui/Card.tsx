import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`card ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
    return (
        <div className={`card-header ${className}`}>
            {children}
        </div>
    );
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
    return (
        <h3 className={`card-title ${className}`}>
            {children}
        </h3>
    );
};

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
    return (
        <div className={`card-content ${className}`}>
            {children}
        </div>
    );
};