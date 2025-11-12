
// Fix: Implemented the Avatar component to resolve module and rendering errors.
import React from 'react';

export const Avatar: React.FC = () => {
    return (
        <div className="relative">
            <img
                className="h-10 w-10 rounded-full"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"
                alt="User avatar"
            />
            <span className="absolute bottom-0 end-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>
        </div>
    );
};
