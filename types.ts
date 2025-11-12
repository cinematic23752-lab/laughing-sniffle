// Fix: Added type definitions to resolve module and type errors across the application.
export type BotStatus = 'running' | 'paused' | 'stopped' | 'error';
export type TradeType = 'buy' | 'sell';

export interface BotStrategy {
    id: string;
    name: string;
    parameters: Record<string, any>;
    summary?: string;
}

export interface Bot {
    id: string;
    name: string;
    pair: string;
    strategy: BotStrategy;
    status: BotStatus;
    createdAt: Date;
    pnl: number;
    isDefault?: boolean;
    exchange?: string;
}

export interface Trade {
    id:string;
    botId: string;
    pair: string;
    type: TradeType;
    amount: number;
    price: number;
    timestamp: Date;
}

export interface MarketSentiment {
    score: number;
    summary: string;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: string;
    title: string; // This will be the translation key for the title
    message: Record<string, any>; // This will be the data for interpolation
    messageKey?: string; // Optional key for the message string itself
    type: NotificationType;
}

export interface AIStrategySuggestion extends BotStrategy {
    reasoning: string;
}

export interface NewsArticle {
    title: string;
    url: string;
    source: string;
}

export interface MarketNews {
    summary: string;
    articles: NewsArticle[];
}

export interface AccountBalance {
    usdt: number;
    btc: number;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    message: string;
}