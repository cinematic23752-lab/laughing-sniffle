// Fix: Added placeholder component for the backtesting page.
import React from 'react';
import { useTranslation } from '../../context/LanguageContext.tsx';

export const Backtesting: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('backtesting_title')}</h2>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <p className="text-gray-500 dark:text-gray-400">
                    {t('backtesting_placeholder')}
                </p>
            </div>
        </div>
    );
};