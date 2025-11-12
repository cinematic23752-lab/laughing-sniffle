// Fix: Implemented the AppContext to provide global state management.
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Bot, Trade, Notification, NotificationType, AccountBalance, LogEntry, LogLevel, BotStrategy } from '../types.ts';
import * as simulatedApi from '../services/exchangeApi.ts';
import { useTranslation } from './LanguageContext.tsx';
import { SUPPORTED_EXCHANGES } from '../constants.ts';
import { useMockTradingData } from '../hooks/useMockTradingData.ts';

interface AppStats {
    totalPnl: number;
    winRate: number;
    activeBots: number;
    totalTrades: number;
}

interface AppContextType {
    bots: Bot[];
    trades: Trade[];
    stats: AppStats;
    notifications: Notification[];
    logs: LogEntry[];
    isConnected: boolean;
    connectedExchange: string | null;
    accountBalance: AccountBalance | null;
    addBot: (botData: Omit<Bot, 'id' | 'createdAt' | 'pnl' | 'status'>) => void;
    updateBot: (bot: Bot) => void;
    deleteBot: (botId: string) => void;
    toggleBotStatus: (botId: string) => void;
    addNotification: (titleKey: string, messageData: Record<string, any>, type?: NotificationType, messageKey?: string) => void;
    dismissNotification: (id: string) => void;
    addLog: (level: LogLevel, message: string) => void;
    clearLogs: () => void;
    connectToExchange: (exchangeId: string, apiKey: string, apiSecret: string, isReal: boolean) => Promise<void>;
    disconnectFromExchange: () => void;
    updateAccountBalance: (newBalance: AccountBalance) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const calculateStats = (bots: Bot[], trades: Trade[]): AppStats => {
    const totalPnl = bots.reduce((acc, bot) => acc + bot.pnl, 0);
    const successfulTrades = trades.filter(t => t.type === 'sell').length; // Simplified win condition
    const winRate = trades.length > 0 ? (successfulTrades / trades.length) * 100 : 0;
    const activeBots = bots.filter(b => b.status === 'running').length;
    return {
        totalPnl,
        winRate,
        activeBots,
        totalTrades: trades.length,
    };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { bots: initialBots, trades: initialTrades } = useMockTradingData();

    const [bots, setBots] = useState<Bot[]>(initialBots);
    const [trades, setTrades] = useState<Trade[]>(initialTrades);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectedExchange, setConnectedExchange] = useState<string | null>(null);
    const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(null);
    const [apiKeys, setApiKeys] = useState<{key: string; secret: string} | null>(null);

    const dataRefreshInterval = useRef<number | null>(null);

    const addLog = useCallback((level: LogLevel, message: string) => {
        const newLog: LogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            level,
            message,
        };
        setLogs(prev => [newLog, ...prev]);
    }, []);

    // Effect for simulating live data updates (PNL changes, new trades)
    useEffect(() => {
        addLog('info', t('log_session_started'));
        const interval = setInterval(() => {
            setBots(prevBots =>
                prevBots.map(bot => {
                    if (bot.status === 'running') {
                        const pnlChange = (Math.random() - 0.45) * 5;
                        return { ...bot, pnl: bot.pnl + pnlChange };
                    }
                    return bot;
                })
            );
        }, 3000); // Update PNL every 3 seconds

        return () => {
            clearInterval(interval);
            addLog('info', t('log_session_ended'));
        };
    }, [t, addLog]);


    const [stats, setStats] = useState<AppStats>(() => calculateStats(bots, trades));
    useEffect(() => {
        setStats(calculateStats(bots, trades));
    }, [bots, trades]);


    const addNotification = useCallback((titleKey: string, messageData: Record<string, any>, type: NotificationType = 'success', messageKey?: string) => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            title: titleKey,
            message: messageData,
            messageKey,
            type: type
        };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const addBot = (botData: Omit<Bot, 'id' | 'createdAt' | 'pnl' | 'status'>) => {
        const newBot: Bot = {
            ...botData,
            id: `bot-${Date.now()}`,
            createdAt: new Date(),
            pnl: 0,
            status: 'running',
            exchange: connectedExchange || undefined,
        };
        setBots(prev => [newBot, ...prev]);
        addLog('info', t('log_bot_created', { botName: newBot.name, pair: newBot.pair }));
        addNotification('notification_bot_created_title', { botName: newBot.name });
    };

    const updateBot = (updatedBot: Bot) => {
        setBots(prev => prev.map(b => b.id === updatedBot.id ? updatedBot : b));
        addLog('info', t('log_bot_updated', { botName: updatedBot.name }));
        addNotification('notification_bot_updated_title', { botName: updatedBot.name });
    };

    const deleteBot = (botId: string) => {
        const botToDelete = bots.find(b => b.id === botId);
        setBots(prev => prev.filter(b => b.id !== botId));
        if (botToDelete) {
            addLog('warn', t('log_bot_deleted', { botName: botToDelete.name }));
            addNotification('notification_bot_deleted_title', { botName: botToDelete.name }, 'info');
        }
    };

    const toggleBotStatus = (botId: string) => {
        setBots(prev => prev.map(b => {
            if (b.id === botId) {
                const newStatus = b.status === 'running' ? 'paused' : 'running';
                addLog('info', t(newStatus === 'running' ? 'log_bot_resumed' : 'log_bot_paused', { botName: b.name }));
                return { ...b, status: newStatus };
            }
            return b;
        }));
    };

    const clearLogs = () => {
        setLogs([]);
        addLog('warn', t('log_cleared'));
    };
    
    const connectToExchange = async (exchangeId: string, apiKey: string, apiSecret: string, isReal: boolean) => {
        if (dataRefreshInterval.current) {
            clearInterval(dataRefreshInterval.current);
        }

        try {
            let balance, exchangeTrades, exchangeBots;

            if (isReal) {
                const realApi = await import('../services/realExchangeApi.ts');
                [balance, exchangeTrades] = await Promise.all([
                    realApi.getAccountBalance(exchangeId, apiKey, apiSecret),
                    realApi.getTrades(exchangeId, apiKey, apiSecret),
                ]);
                exchangeBots = [];
            } else {
                [balance, exchangeBots, exchangeTrades] = await Promise.all([
                    simulatedApi.getAccountBalance(apiKey, apiSecret),
                    simulatedApi.getBots(apiKey, apiSecret),
                    simulatedApi.getTrades(apiKey, apiSecret),
                ]);
            }
            
            setAccountBalance(balance);
            setBots(exchangeBots.map(b => ({ ...b, exchange: exchangeId })));
            setTrades(exchangeTrades);
            setIsConnected(true);
            setConnectedExchange(exchangeId);
            setApiKeys({ key: apiKey, secret: apiSecret });

            dataRefreshInterval.current = window.setInterval(async () => {
                try {
                    let liveBalance, liveTrades;
                    if (isReal) {
                        const realApi = await import('../services/realExchangeApi.ts');
                        [liveBalance, liveTrades] = await Promise.all([
                            realApi.getAccountBalance(exchangeId, apiKey, apiSecret),
                            realApi.getTrades(exchangeId, apiKey, apiSecret)
                        ]);
                    } else {
                        [liveBalance, liveTrades] = await Promise.all([
                            simulatedApi.getLiveAccountBalance(apiKey, apiSecret),
                            simulatedApi.getLiveTrades(apiKey, apiSecret)
                        ]);
                    }
                    setAccountBalance(liveBalance);
                    setTrades(liveTrades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
                    addLog('debug', t('log_data_refreshed', { exchangeName: t(SUPPORTED_EXCHANGES.find(e => e.id === exchangeId)?.nameKey || '') }));
                } catch (error) {
                    addLog('error', t('log_data_refresh_failed', { 
                        exchangeName: t(SUPPORTED_EXCHANGES.find(e => e.id === exchangeId)?.nameKey || ''),
                        error: (error as Error).message
                    }));
                }
            }, 5000);

        } catch (error) {
            throw error;
        }
    };
    
    const disconnectFromExchange = () => {
        if (dataRefreshInterval.current) {
            clearInterval(dataRefreshInterval.current);
            dataRefreshInterval.current = null;
        }

        const exchangeId = connectedExchange;
        setIsConnected(false);
        setConnectedExchange(null);
        setAccountBalance(null);
        setBots(initialBots);
        setTrades(initialTrades);
        setApiKeys(null);
        
        if (exchangeId) {
            const exchangeName = t(SUPPORTED_EXCHANGES.find(e => e.id === exchangeId)?.nameKey || '');
            addLog('warn', t('log_disconnected_exchange', { exchangeName }));
            addNotification('notification_disconnection_success_title', { exchangeName }, 'info');
        }
    };
    
    const updateAccountBalance = (newBalance: AccountBalance) => {
        setAccountBalance(newBalance);
    };

    const contextValue: AppContextType = {
        bots,
        trades,
        stats,
        notifications,
        logs,
        isConnected,
        connectedExchange,
        accountBalance,
        addBot,
        updateBot,
        deleteBot,
        toggleBotStatus,
        addNotification,
        dismissNotification,
        addLog,
        clearLogs,
        connectToExchange,
        disconnectFromExchange,
        updateAccountBalance,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppData must be used within an AppProvider');
    }
    return context;
};