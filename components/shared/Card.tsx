
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg ${className}`}>
            {children}
        </div>
    );
};