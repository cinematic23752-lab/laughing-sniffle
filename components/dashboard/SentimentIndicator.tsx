

import React, { useState, useEffect } from 'react';
// Fix: Added .tsx extension to fix module resolution error.
import { Card } from '../shared/Card.tsx';
// Fix: Added .ts extension to fix module resolution error.
import { MarketSentiment } from '../../types.ts';
import { useTranslation } from '../../context/LanguageContext.tsx';
import { getMarketSentiment } from '../../services/api.ts';
import { ArrowTrendingUpIcon } from '../Icons.tsx';


interface SentimentIndicatorProps {
    pair: string;
}

const getSentimentDetails = (score: number, t: (key: string) => string) => {
    if (score < -0.6) return { label: t('sentiment_very_bearish'), color: 'bg-red-600', textColor: 'text-red-400' };
    if (score < -0.2) return { label: t('sentiment_bearish'), color: 'bg-red-500', textColor: 'text-red-400' };
    if (score <= 0.2) return { label: t('sentiment_neutral'), color: 'bg-gray-500', textColor: 'text-gray-400' };
    if (score <= 0.6) return { label: t('sentiment_bullish'), color: 'bg-green-500', textColor: 'text-green-400' };
    return { label: t('sentiment_very_bullish'), color: 'bg-green-600', textColor: 'text-green-400' };
};

export const SentimentIndicator: React.FC<SentimentIndicatorProps> = ({ pair }) => {
    const { t } = useTranslation();
    const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitial, setIsInitial] = useState(true);

    useEffect(() => {
        setSentiment(null);
        setIsLoading(false);
        setError(null);
        setIsInitial(true);
    }, [pair]);

    const handleFetchSentiment = async () => {
        setIsLoading(true);
        setIsInitial(false);
        setError(null);
        setSentiment(null);
        try {
            const sentimentData = await getMarketSentiment(pair);
            setSentiment(sentimentData);
        } catch (err) {
            if ((err as Error).message === 'API_KEY_NOT_CONFIGURED') {
                setError(t('gemini_api_key_required_message'));
            } else {
                console.error("Failed to fetch sentiment:", err);
                setError(t('sentiment_load_error'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitial) {
        return (
            <Card className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('market_sentiment_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs">{t('fetch_sentiment_description')}</p>
                <button
                    onClick={handleFetchSentiment}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
                >
                    {isLoading ? t('analyzing_sentiment') : t('fetch_sentiment_button')}
                </button>
            </Card>
        );
    }
    
    if (isLoading) {
        return (
            <Card className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('analyzing_sentiment')}</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
             <Card className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-red-500 dark:text-red-400 font-medium mb-4">{error}</p>
                 <button
                    onClick={handleFetchSentiment}
                    className="px-4 py-2 text-sm font-medium text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                    {t('try_again_button')}
                </button>
            </Card>
        )
    }
    
    if (!sentiment) return null;
    
    const { score, summary } = sentiment;
    const { label, color, textColor } = getSentimentDetails(score, t);
    // Convert score from [-1, 1] to [0, 100] for the meter
    const meterPercent = (score + 1) * 50;

    return (
        <Card className="min-h-[200px]">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">{t('market_sentiment_title')}</p>
            <div className="flex items-baseline justify-between mb-3">
                <p className={`text-2xl font-semibold ${textColor}`}>{label}</p>
                 <span className="text-xs font-mono px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {t('sentiment_score')}: {score.toFixed(2)}
                </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
                <div 
                    className={`h-2.5 rounded-full ${color} transition-all duration-500`} 
                    style={{ width: `${meterPercent}%` }}
                ></div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
               "{summary}"
            </p>
        </Card>
    );
};