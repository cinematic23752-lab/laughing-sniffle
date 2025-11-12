import { useMemo } from 'react';
import { INITIAL_BOTS, INITIAL_TRADES } from '../services/mockData.ts';
import { Bot, Trade } from '../types.ts';

interface MockTradingData {
    bots: Bot[];
    trades: Trade[];
}

/**
 * This hook provides the initial mock data for the application, making it
 * interactive and populated from the start.
 * @returns A memoized object containing the initial bots and trades.
 */
export const useMockTradingData = (): MockTradingData => {
    const data = useMemo(() => ({
        bots: INITIAL_BOTS,
        trades: INITIAL_TRADES,
    }), []);

    return data;
};
