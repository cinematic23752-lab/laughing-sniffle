// This file simulates a real exchange API.
import { Bot, Trade, AccountBalance } from '../types.ts';

const REAL_BOTS: Bot[] = [
  { id: 'real-bot-1', name: 'Binance Bot A', pair: 'ETH/USDT', strategy: { id: 'grid', name: 'Grid Trading', parameters: { lowerPrice: 2800, upperPrice: 3500, grids: 15 }, summary: 'Range: $2,800-$3,500, 15 grids' }, status: 'running', createdAt: new Date('2023-10-01'), pnl: 1250.75 },
  { id: 'real-bot-2', name: 'Binance Bot B', pair: 'SOL/USDT', strategy: { id: 'momentum', name: 'Momentum Trading', parameters: { takeProfit: 6, stopLoss: 2.5 }, summary: 'TP: 6% / SL: 2.5%' }, status: 'running', createdAt: new Date('2023-11-15'), pnl: 834.12 },
  { id: 'real-bot-3', name: 'Binance Bot C', pair: 'BTC/USDT', strategy: { id: 'dca', name: 'Dollar-Cost Averaging (DCA)', parameters: { amount: 250, frequency: '1 week' }, summary: '$250 every 1 week' }, status: 'paused', createdAt: new Date('2023-09-20'), pnl: 2105.33 },
];

const REAL_TRADES: Trade[] = [
  { id: 'real-trade-1', botId: 'real-bot-1', pair: 'ETH/USDT', type: 'buy', amount: 0.5, price: 2850.11, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 'real-trade-2', botId: 'real-bot-1', pair: 'ETH/USDT', type: 'sell', amount: 0.2, price: 3450.90, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
  { id: 'real-trade-3', botId: 'real-bot-2', pair: 'SOL/USDT', type: 'buy', amount: 10, price: 140.25, timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) },
];

// This variable will hold the state of trades for the current live session
let liveTrades: Trade[] = [];

const checkCredentials = (apiKey: string, apiSecret: string) => {
    if (!apiKey || !apiSecret) {
        throw new Error("API Key and Secret are required.");
    }
    // Simulate invalid key error for demonstration
    if (apiKey.toLowerCase().includes('invalid')) {
        throw new Error("Invalid API Key provided.");
    }
    // Simulate a quick network delay and validation
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
}

const getRandomNumber = (min: number, max: number, decimals: number = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];


export const getAccountBalance = async (apiKey: string, apiSecret: string): Promise<AccountBalance> => {
    await checkCredentials(apiKey, apiSecret);
    // Simulate network delay and return dynamic, randomized balance
    return new Promise(resolve => setTimeout(() => resolve({
        usdt: getRandomNumber(5000, 25000, 2),
        btc: getRandomNumber(0.1, 2, 6),
    }), 1000));
};

export const getBots = async (apiKey: string, apiSecret: string): Promise<Bot[]> => {
    await checkCredentials(apiKey, apiSecret);
    // Deep copy to avoid mutation issues when simulating PnL updates
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(REAL_BOTS))), 800)); 
};

export const getTrades = async (apiKey: string, apiSecret: string): Promise<Trade[]> => {
    await checkCredentials(apiKey, apiSecret);
    // Reset the live trades array on a new connection and return a deep copy
    liveTrades = JSON.parse(JSON.stringify(REAL_TRADES));
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(liveTrades))), 800));
};

// --- Functions for real-time polling ---

/**
 * Fetches a slightly updated account balance to simulate live changes.
 */
export const getLiveAccountBalance = async (apiKey: string, apiSecret: string): Promise<AccountBalance> => {
    if (!apiKey || !apiSecret) throw new Error("API keys not provided for live update.");
    return new Promise(resolve => setTimeout(() => resolve({
        usdt: getRandomNumber(5000, 25000, 2),
        btc: getRandomNumber(0.1, 2, 6),
    }), 300));
};

/**
 * Simulates fetching recent trades. Has a chance to generate a new trade
 * to make the trade history dynamic.
 */
export const getLiveTrades = async (apiKey: string, apiSecret: string): Promise<Trade[]> => {
    if (!apiKey || !apiSecret) throw new Error("API keys not provided for live update.");

    // ~20% chance to generate a new trade
    if (Math.random() < 0.2 && REAL_BOTS.length > 0) {
        const randomBot = getRandomElement(REAL_BOTS.filter(b => b.status === 'running'));
        if (randomBot) {
            const newTrade: Trade = {
                id: `real-trade-${Date.now()}`,
                botId: randomBot.id,
                pair: randomBot.pair,
                type: getRandomElement(['buy', 'sell']),
                amount: getRandomNumber(0.01, randomBot.pair.startsWith('BTC') ? 0.1 : 5, 4),
                price: getRandomNumber(2800, 68000, 2), // Simplified price range for any pair
                timestamp: new Date(),
            };
            liveTrades.unshift(newTrade); // Add to the beginning of the list
        }
    }
    
    // Return a copy to avoid direct mutation issues
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(liveTrades))), 400));
};