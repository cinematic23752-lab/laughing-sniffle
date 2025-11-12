import React from 'react';
import { Card } from '../shared/Card.tsx';

export const BacktestResults: React.FC = () => {
    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backtest Results</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <p className="text-gray-500 dark:text-gray-400">Backtest results will be displayed here.</p>
            </div>
        </Card>
    );
};
