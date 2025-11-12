import React from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    return (
        <div className="group relative inline-block">
            {children}
            <div
                className="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-normal rounded-md bg-gray-900 px-3 py-2 text-center text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700 w-60"
            >
                {text}
                <div className="absolute -bottom-1 left-1/2 -z-10 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900 dark:bg-gray-700"></div>
            </div>
        </div>
    );
};
