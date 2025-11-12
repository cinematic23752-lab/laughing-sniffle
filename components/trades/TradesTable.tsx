
import React from 'react';
// Fix: Added .ts extension to fix module resolution error.
import { Trade, TradeType } from '../../types.ts';
// Fix: Added .tsx extension to fix module resolution error.
import { Card } from '../shared/Card.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';

// Fix: Defined the missing TradesTableProps interface.
interface TradesTableProps {
    trades: Trade[];
    title?: string;
    maxRows?: number;
}

const TradeTypeBadge: React.FC<{ type: TradeType }> = ({ type }) => {
    const { t } = useTranslation();
    const isBuy = type === 'buy';
    const classes = isBuy
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes}`}>{isBuy ? t('trade_type_buy') : t('trade_type_sell')}</span>;
};


export const TradesTable: React.FC<TradesTableProps> = ({ trades, title = "Recent Trades", maxRows }) => {
    const { t } = useTranslation();
    const displayTrades = maxRows ? trades.slice(0, maxRows) : trades;
    
    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">{t('trades_header_pair')}</th>
                            <th scope="col" className="px-4 py-3">{t('trades_header_type')}</th>
                            <th scope="col" className="px-4 py-3">{t('trades_header_price')}</th>
                            <th scope="col" className="px-4 py-3">{t('trades_header_amount')}</th>
                            <th scope="col" className="px-4 py-3">{t('trades_header_date')}</th>
                            <th scope="col" className="px-4 py-3">{t('trades_header_bot_id')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayTrades.map((trade) => (
                            <tr key={trade.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{trade.pair}</td>
                                <td className="px-4 py-3"><TradeTypeBadge type={trade.type} /></td>
                                <td className="px-4 py-3">${trade.price.toLocaleString()}</td>
                                <td className="px-4 py-3">{trade.amount.toFixed(4)}</td>
                                <td className="px-4 py-3">{new Date(trade.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-3 font-mono text-xs">{trade.botId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};