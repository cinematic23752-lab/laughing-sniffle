
import React from 'react';
import { Card } from '../shared/Card.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';


export const StrategyPerformanceTable: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports_strategy_performance_title')}</h3>
             <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <p className="text-gray-500 dark:text-gray-400">{t('reports_table_placeholder')}</p>
            </div>
        </Card>
    );
};