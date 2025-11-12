// Fix: Added placeholder hook for backtesting functionality.
import { useState } from 'react';

export const useBacktest = () => {
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const runBacktest = (config: any) => {
        setIsLoading(true);
        console.log("Running backtest with config:", config);
        setTimeout(() => {
            setResults({
                pnl: Math.random() * 1000 - 200,
                winRate: Math.random() * 100,
                totalTrades: Math.floor(Math.random() * 500),
            });
            setIsLoading(false);
        }, 2000);
    };

    return { results, isLoading, runBacktest };
};
