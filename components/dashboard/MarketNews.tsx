


import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card.tsx';
// Fix: Aliased imported 'MarketNews' type to avoid name collision with the component.
import { MarketNews as MarketNewsType } from '../../types.ts';
import { NewspaperIcon } from '../Icons.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';
import { getMarketNews } from '../../services/api.ts';


interface MarketNewsProps {
    pair: string;
}

export const MarketNews: React.FC<MarketNewsProps> = ({ pair }) => {
    const { t } = useTranslation();
    const [news, setNews] = useState<MarketNewsType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitial, setIsInitial] = useState(true);

    useEffect(() => {
        setNews(null);
        setIsLoading(false);
        setError(null);
        setIsInitial(true);
    }, [pair]);

    const handleFetchNews = async () => {
        setIsLoading(true);
        setIsInitial(false);
        setError(null);
        setNews(null);
        try {
            const newsData = await getMarketNews(pair);
            setNews(newsData);
        } catch (err) {
             if ((err as Error).message === 'API_KEY_NOT_CONFIGURED') {
                setError(t('gemini_api_key_required_message'));
            } else {
                console.error("Failed to fetch news:", err);
                setError(t('news_load_error'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitial) {
        return (
            <Card className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <NewspaperIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('fundamental_analysis_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs">{t('fetch_news_description')}</p>
                <button
                    onClick={handleFetchNews}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
                >
                    {isLoading ? t('fetching_market_news') : t('fetch_latest_news_button')}
                </button>
            </Card>
        );
    }
    
    if (isLoading) {
        return (
            <Card className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('fetching_market_news')}</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <NewspaperIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-red-500 dark:text-red-400 font-medium mb-4">{error}</p>
                 <button
                    onClick={handleFetchNews}
                    className="px-4 py-2 text-sm font-medium text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                    {t('try_again_button')}
                </button>
            </Card>
        );
    }
    
    if (!news) return null;

    return (
        <Card className="min-h-[200px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('fundamental_analysis_title')}</h3>
            <div className="space-y-4">
                {news.summary && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{news.summary}</p>
                    </div>
                )}
                {news.articles.length > 0 && (
                    <div className="space-y-3">
                         <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('sources_label')}:</h4>
                         <ul className="max-h-48 overflow-y-auto space-y-1 ps-2">
                            {news.articles.map((article, index) => (
                                <li key={index}>
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors"
                                    >
                                        <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 group-hover:underline truncate" title={article.title}>{article.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">{article.source}</p>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
};