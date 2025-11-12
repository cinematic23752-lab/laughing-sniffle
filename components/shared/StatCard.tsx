import React from 'react';
import { Card } from './Card.tsx';
import { useValueFlash } from '../../hooks/useValueFlash.ts';

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative';
    icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon }) => {
    const changeColor = changeType === 'positive' ? 'text-green-500' : 'text-red-500';
    const flashClass = useValueFlash(value);

    return (
        <Card className={`${flashClass} transition-shadow duration-300 hover:shadow-xl`}>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-cyan-500 dark:text-cyan-400 ms-4">
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                    <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                        {change && <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>}
                    </div>
                </div>
            </div>
        </Card>
    );
};
