

import React, { useEffect, useRef, memo } from 'react';
import { Card } from '../shared/Card.tsx';
import { TRADING_PAIRS } from '../../constants.ts';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useLanguage, useTranslation } from '../../context/LanguageContext.tsx';

// The TradingView library is loaded in index.html, so we can declare its presence on the window object
declare global {
    interface Window {
        TradingView: any;
    }
}

interface TradingViewChartProps {
    pair: string;
    setPair: (pair: string) => void;
}

// TradingView widget can be slow to initialize, so we memoize the component
// to prevent re-renders unless its props (pair, setPair) change.
// Theme changes are handled internally via the hook and useEffect.
const TradingViewChartComponent: React.FC<TradingViewChartProps> = ({ pair, setPair }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const { language } = useLanguage();
    const { t } = useTranslation();
    // Use a stable ID for the container
    const containerId = 'tradingview_chart_container';

    useEffect(() => {
        // Ensure the container is ready and the TradingView script is loaded
        if (!chartContainerRef.current || typeof window.TradingView === 'undefined' || !window.TradingView.widget) {
            return;
        }

        // The symbol format for TradingView is typically EXCHANGE:TICKER, e.g., BINANCE:BTCUSDT
        // We will assume Binance as the default exchange for this integration.
        const symbol = `BINANCE:${pair.replace('/', '')}`;
        
        // Clear any existing widget before creating a new one to prevent conflicts
        chartContainerRef.current.innerHTML = '';

        const widgetOptions = {
            autosize: true,
            symbol: symbol,
            interval: "D", // Daily interval
            timezone: "Etc/UTC",
            theme: theme,
            style: "1", // Bar chart style
            locale: language,
            toolbar_bg: theme === 'dark' ? '#1A2233' : '#f3f4f6',
            enable_publishing: false,
            allow_symbol_change: false, // We use our own dropdown for symbol changes
            container_id: containerId,
            withdateranges: true,
            hide_side_toolbar: false,
        };
        
        // This creates the widget and injects it into the container
        new window.TradingView.widget(widgetOptions);

        // No specific cleanup function is needed for the widget itself,
        // as clearing the container's HTML effectively removes it.
    }, [pair, theme, language]);

    return (
        <Card className="flex flex-col h-[650px]">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('market_chart_title')}</h3>
                <select 
                    value={pair} 
                    onChange={(e) => setPair(e.target.value)}
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-white"
                >
                    {TRADING_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            {/* The container needs a specific ID for the widget to target */}
            <div id={containerId} ref={chartContainerRef} className="flex-grow w-full h-full rounded-md overflow-hidden">
               {/* TradingView Widget will be injected here */}
            </div>
        </Card>
    );
};

export const TradingViewChart = memo(TradingViewChartComponent);