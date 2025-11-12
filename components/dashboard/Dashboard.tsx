
// Fix: Added Dashboard component implementation.
import React, { useState } from 'react';
import { useAppData } from '../../context/AppContext.tsx';
import { StatCard } from '../shared/StatCard.tsx';
import { TradesTable } from '../trades/TradesTable.tsx';
import { TRADING_PAIRS } from '../../constants.ts';
import { SentimentIndicator } from './SentimentIndicator.tsx';
import { TradingViewChart } from './TradingViewChart.tsx';
import { MarketNews as MarketNewsComponent } from './MarketNews.tsx';
import { ChartIcon, WalletIcon, BoltIcon, ArrowTrendingUpIcon } from '../Icons.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';

export const Dashboard: React.FC = () => {
    const { stats, trades } = useAppData();
    const { t } = useTranslation();
    const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);

    const { totalPnl, winRate, activeBots, totalTrades } = stats;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('stat_total_pnl')}
                    value={`$${totalPnl.toFixed(2)}`}
                    changeType={totalPnl >= 0 ? 'positive' : 'negative'}
                    icon={<WalletIcon className="w-6 h-6" />}
                />
                <StatCard
                    title={t('stat_win_rate')}
                    value={`${winRate.toFixed(2)}%`}
                    icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
                />
                <StatCard
                    title={t('stat_active_bots')}
                    value={`${activeBots}`}
                    icon={<BoltIcon className="w-6 h-6" />}
                />
                <StatCard
                    title={t('stat_total_trades')}
                    value={totalTrades.toLocaleString()}
                    icon={<ChartIcon className="w-6 h-6" />}
                />
            </div>

            {/* Trading View Chart - now takes full width */}
            <TradingViewChart pair={selectedPair} setPair={setSelectedPair} />

            {/* Sentiment and News below the chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SentimentIndicator pair={selectedPair} />
                <MarketNewsComponent pair={selectedPair} />
            </div>

            {/* Recent Trades Table */}
            <TradesTable trades={trades} title={t('recent_trades')} maxRows={10} />
        </div>
    );
};
