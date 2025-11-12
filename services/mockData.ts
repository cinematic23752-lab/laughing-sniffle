import { Bot, Trade } from '../types.ts';
import { TRADING_PAIRS, getBotStrategies } from '../constants.ts';

// Helper to generate random data
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number, decimals: number = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Dummy t function for initialization
const t = (key: string) => key;
const INITIAL_STRATEGIES = getBotStrategies(t);

const generateMockBot = (id: number): Bot => {
    const strategyConfig = getRandomElement(INITIAL_STRATEGIES);
    let parameters: Record<string, any> = {};
    let summary = '';

    switch(strategyConfig.id) {
        case 'grid':
            const lower = getRandomNumber(58000, 62000, 0);
            const upper = getRandomNumber(63000, 68000, 0);
            const grids = getRandomNumber(5, 20, 0);
            parameters = { lowerPrice: lower, upperPrice: upper, grids: grids };
            summary = `Range: $${lower.toLocaleString()}-${upper.toLocaleString()}, ${grids} grids`;
            break;
        case 'dca':
            const amount = getRandomElement([50, 100, 200]);
            const freq = getRandomElement(["12 hours", "1 day", "1 week"]);
            parameters = { amount: amount, frequency: freq };
            summary = `$${amount} every ${freq}`;
            break;
        case 'momentum':
             const takeProfit = getRandomElement([3, 5, 8]);
             const stopLoss = getRandomElement([1.5, 2, 2.5]);
             parameters = { takeProfit, stopLoss };
             summary = `TP: ${takeProfit}% / SL: ${stopLoss}%`
             break;
    }

    return {
        id: `bot-${id}`,
        name: `Alpha Bot ${id}`,
        pair: getRandomElement(TRADING_PAIRS),
        strategy: {
            id: strategyConfig.id,
            name: strategyConfig.name,
            parameters: parameters,
            summary: summary,
        },
        status: getRandomElement(['running', 'paused', 'stopped', 'error']),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        pnl: getRandomNumber(-500, 1500, 2),
    };
};


const DEFAULT_BOT: Bot = {
    id: 'bot-0',
    name: 'default_bot_name', // Translation key
    pair: 'BTC/USDT',
    strategy: {
        id: 'dca',
        name: 'strategy_dca_name', // Translation key
        parameters: { amount: 50, frequency: "1 day" },
        summary: 'default_bot_strategy_summary', // Translation key
    },
    status: 'running',
    createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // ~1 month ago
    pnl: 786.54,
    isDefault: true,
};

// Initial Data Setup
export const INITIAL_BOTS = [
    DEFAULT_BOT,
    ...Array.from({ length: 7 }, (_, i) => generateMockBot(i + 1))
];

export const INITIAL_TRADES = INITIAL_BOTS.flatMap(bot => 
    Array.from({ length: 5 }, (_, i) => ({
        id: `trade-init-${bot.id}-${i}`,
        botId: bot.id,
        pair: bot.pair,
        type: getRandomElement(['buy', 'sell'] as const),
        amount: getRandomNumber(0.01, 1.5, 4),
        price: getRandomNumber(58000, 68000, 2),
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    }))
).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
