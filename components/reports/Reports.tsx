
import React from 'react';
import { StrategyPnlChart } from './StrategyPnlChart.tsx';
import { StrategyPerformanceTable } from './StrategyPerformanceTable.tsx';
import { BestWorstTrades } from './BestWorstTrades.tsx';

export const Reports: React.FC = () => {
    return (
        <div className="space-y-6">
            <StrategyPnlChart />
            <StrategyPerformanceTable />
            <BestWorstTrades />
        </div>
    );
};