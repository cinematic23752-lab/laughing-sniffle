



import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../shared/Card.tsx';
import { useAppData } from '../../context/AppContext.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, WalletIcon, InformationCircleIcon } from '../Icons.tsx';
import { useValueFlash } from '../../hooks/useValueFlash.ts';
import { SUPPORTED_EXCHANGES } from '../../constants.ts';
import { Tooltip } from '../shared/Tooltip.tsx';


type ApiKeysObject = {
    [exchangeId: string]: {
        key: string;
        secret: string;
    };
};

export const ApiKeysManager: React.FC = () => {
    const { t } = useTranslation();
    const { 
        addNotification, 
        isConnected, 
        connectedExchange, 
        accountBalance, 
        connectToExchange, 
        disconnectFromExchange, 
        addLog 
    } = useAppData();

    const [allApiKeys, setAllApiKeys] = useState<ApiKeysObject>({});
    const [selectedExchangeId, setSelectedExchangeId] = useState(SUPPORTED_EXCHANGES[0].id);
    const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');
    
    const [isConnecting, setIsConnecting] = useState(false);
    const [useRealApi, setUseRealApi] = useState(false);
    const [proxyActivationRequired, setProxyActivationRequired] = useState(false);
    const [showGemini, setShowGemini] = useState(false);
    const [showExchangeKey, setShowExchangeKey] = useState(false);
    const [showExchangeSecret, setShowExchangeSecret] = useState(false);
    
    useEffect(() => {
        const savedKeys = localStorage.getItem('exchangeApiKeys');
        if (savedKeys) {
            try {
                setAllApiKeys(JSON.parse(savedKeys));
            } catch (e) {
                console.error("Failed to parse exchange API keys from localStorage", e);
            }
        }
    }, []);

    const currentKeys = useMemo(() => {
        return allApiKeys[selectedExchangeId] || { key: '', secret: '' };
    }, [allApiKeys, selectedExchangeId]);

    const handleKeyInputChange = (field: 'key' | 'secret', value: string) => {
        setAllApiKeys(prev => ({
            ...prev,
            [selectedExchangeId]: {
                ...(prev[selectedExchangeId] || { key: '', secret: '' }),
                [field]: value
            }
        }));
    };

    const usdtFlashClass = useValueFlash(accountBalance?.usdt);
    const btcFlashClass = useValueFlash(accountBalance?.btc);

    const handleSaveApiKeys = () => {
        if (!geminiKey.trim()) {
            addNotification('notification_gemini_key_required_title', {}, 'error');
            addLog('error', t('log_gemini_key_missing_on_save'));
            return;
        }
        localStorage.setItem('geminiApiKey', geminiKey);
        localStorage.setItem('exchangeApiKeys', JSON.stringify(allApiKeys));
        addNotification('notification_api_keys_saved_title', {}, 'success');
    };

    const handleConnect = async () => {
        setProxyActivationRequired(false); // Reset on each new attempt
        const { key, secret } = currentKeys;
        if (!key || !secret) {
            addNotification('notification_api_keys_required_title', {}, 'error');
            addLog('warn', t('log_connect_attempt_missing_keys'));
            return;
        }
        setIsConnecting(true);
        const exchangeName = t(SUPPORTED_EXCHANGES.find(e => e.id === selectedExchangeId)?.nameKey || '');
        addLog('info', useRealApi ? t('log_connecting_to_exchange_real', { exchangeName }) : t('log_connecting_to_exchange', { exchangeName }));
        try {
            await connectToExchange(selectedExchangeId, key, secret, useRealApi);
            addLog('info', t('log_connection_success', { exchangeName }));
            addNotification('notification_connect_success', { exchangeName }, 'success');
        } catch (error) {
            const errorMessage = (error as Error).message;
            if (errorMessage.includes("CORS_PROXY_ACTIVATION_REQUIRED")) {
                addLog('error', t('log_connection_failed_cors_proxy', { exchangeName }));
                addNotification(
                    'notification_cors_proxy_activation_title',
                    { exchangeName },
                    'error',
                    'notification_cors_proxy_activation_message'
                );
                setProxyActivationRequired(true); // Show the persistent alert
            } else if (errorMessage.includes("GEO_RESTRICTION_ERROR")) {
                addLog('error', t('log_connection_failed_geo_restricted', { exchangeName }));
                addNotification(
                    'notification_geo_restriction_title',
                    { exchangeName },
                    'error',
                    'notification_geo_restriction_message'
                );
            } else if (useRealApi && (errorMessage.includes("module") || errorMessage.includes("ccxt") || errorMessage.includes("dynamically"))) {
                addLog('error', t('log_connection_failed_ccxt', { exchangeName }));
                addNotification(
                    'notification_ccxt_missing_title',
                    { exchangeName },
                    'error',
                    'notification_ccxt_missing_message'
                );
            } else if (errorMessage.includes("Invalid API Key")) {
                addLog('error', t('log_connection_failed_invalid_keys', { exchangeName }));
                addNotification('notification_connection_error_title', { exchangeName }, 'error', 'notification_invalid_api_keys_message');
            } else {
                addLog('error', t('log_connection_failed', { error: errorMessage, exchangeName }));
                addNotification('notification_connection_error_title', { message: errorMessage }, 'error');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        disconnectFromExchange();
    };
    
    const StatusBadge: React.FC = () => {
        const baseClasses = "inline-flex items-center gap-x-2 px-3 py-1.5 text-xs font-semibold rounded-full";

        if (isConnecting) {
            return (
                <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('settings_connection_status_connecting')}</span>
                </span>
            );
        }

        if (isConnected && connectedExchange) {
            const exchangeConfig = SUPPORTED_EXCHANGES.find(e => e.id === connectedExchange);
            // Check if the connection is a 'real' one by checking if bots array is empty, as per AppContext logic
            const isRealConnection = useRealApi;
            const exchangeNameKey = (isRealConnection ? exchangeConfig?.realNameKey : exchangeConfig?.nameKey) || '';
            const exchangeName = t(exchangeNameKey);
            
            return (
                <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>{t('settings_connection_status_connected', { exchangeName })}</span>
                </span>
            );
        }

        return (
            <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                <span>{t('settings_connection_status_disconnected')}</span>
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('api_keys_and_connection_title')}</h2>
                    <StatusBadge />
                </div>
                <div className="space-y-6">
                    {/* Gemini API Key */}
                    <div>
                        <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('gemini_api_key_label')}
                        </label>
                         <div className="mt-1 relative rounded-md shadow-sm max-w-md">
                            <input
                                type={showGemini ? 'text' : 'password'}
                                id="gemini-api-key"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder={t('gemini_api_key_placeholder')}
                                className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 sm:text-sm text-gray-900 dark:text-white focus:ring-cyan-500 focus:border-cyan-500"
                            />
                            <button type="button" onClick={() => setShowGemini(!showGemini)} className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={showGemini ? t('hide_api_key_aria') : t('show_api_key_aria')}>
                                {showGemini ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('gemini_api_key_message')}</p>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />
                    
                    {/* Exchange API Configuration */}
                    <div>
                        <label htmlFor="exchange-selector" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings_configure_exchange')}</label>
                        <select
                            id="exchange-selector"
                            value={selectedExchangeId}
                            onChange={(e) => setSelectedExchangeId(e.target.value)}
                            disabled={isConnecting || isConnected}
                            className="mt-1 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-white max-w-md disabled:opacity-50"
                         >
                            {SUPPORTED_EXCHANGES.map(ex => (
                                <option key={ex.id} value={ex.id}>
                                    {useRealApi ? t(ex.realNameKey) : t(ex.nameKey)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="exchange-api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('exchange_api_key_label')}</label>
                        <div className="mt-1 relative rounded-md shadow-sm max-w-md">
                            <input type={showExchangeKey ? 'text' : 'password'} id="exchange-api-key" value={currentKeys.key} onChange={(e) => handleKeyInputChange('key', e.target.value)} placeholder={t('exchange_api_key_placeholder')} className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 sm:text-sm text-gray-900 dark:text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                            <button type="button" onClick={() => setShowExchangeKey(!showExchangeKey)} className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={showExchangeKey ? t('hide_api_key_aria') : t('show_api_key_aria')}>
                                {showExchangeKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="exchange-api-secret" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('exchange_api_secret_label')}</label>
                        <div className="mt-1 relative rounded-md shadow-sm max-w-md">
                             <input type={showExchangeSecret ? 'text' : 'password'} id="exchange-api-secret" value={currentKeys.secret} onChange={(e) => handleKeyInputChange('secret', e.target.value)} placeholder={t('exchange_api_secret_placeholder')} className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 sm:text-sm text-gray-900 dark:text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                             <button type="button" onClick={() => setShowExchangeSecret(!showExchangeSecret)} className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={showExchangeSecret ? t('hide_api_key_aria') : t('show_api_key_aria')}>
                                {showExchangeSecret ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
                
                {isConnected && accountBalance && (
                    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                            <WalletIcon className="w-5 h-5 me-2 text-cyan-500" />
                            {t('settings_account_balance_title')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-md">
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <p className="text-gray-500 dark:text-gray-400">USDT</p>
                                <p className={`font-mono font-semibold text-gray-900 dark:text-white text-lg rounded px-1 -mx-1 ${usdtFlashClass}`}>{accountBalance.usdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <p className="text-gray-500 dark:text-gray-400">BTC</p>
                                <p className={`font-mono font-semibold text-gray-900 dark:text-white text-lg rounded px-1 -mx-1 ${btcFlashClass}`}>{accountBalance.btc.toFixed(6)}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-6 flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="flex items-center h-5">
                        <input
                            id="use-real-api"
                            aria-describedby="use-real-api-description"
                            name="use-real-api"
                            type="checkbox"
                            checked={useRealApi}
                            onChange={(e) => setUseRealApi(e.target.checked)}
                            disabled={isConnected}
                            className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                        />
                    </div>
                    <div className="text-sm">
                        <label htmlFor="use-real-api" className={`font-medium ${isConnected ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'} flex items-center`}>
                            {t('settings_use_real_api_label')}
                            <Tooltip text={t('settings_use_real_api_tooltip')}>
                                <InformationCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 ms-2 cursor-pointer" />
                            </Tooltip>
                        </label>
                    </div>
                </div>

                {proxyActivationRequired && (
                    <div className="mt-6 p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border-l-4 rtl:border-l-0 rtl:border-r-4 border-yellow-400 dark:border-yellow-500">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <InformationCircleIcon className="h-5 w-5 text-yellow-400 dark:text-yellow-500" aria-hidden="true" />
                            </div>
                            <div className="ms-3">
                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    {t('proxy_activation_required_title')}
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                    <p>
                                        {t('proxy_activation_required_p1')}{' '}
                                        <a href="https://cors-anywhere.herokuapp.com/" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-yellow-600 dark:hover:text-yellow-200">
                                            {t('proxy_activation_required_link')}
                                        </a>
                                        {' '}{t('proxy_activation_required_p2')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                     <button type="button" onClick={handleSaveApiKeys} className="px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                       {t('save_keys_button')}
                    </button>
                    {isConnected ? (
                        <button type="button" onClick={handleDisconnect} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            {t('settings_disconnect_button')}
                        </button>
                    ) : (
                         <button type="button" onClick={handleConnect} disabled={!currentKeys.key || !currentKeys.secret || isConnecting} className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            <div className="flex items-center">
                                {isConnecting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin me-2"></div>
                                ) : (
                                    <ShieldCheckIcon className="w-5 h-5 me-2" />
                                )}
                                <span>{isConnecting ? t('settings_connection_status_connecting') : t('settings_connect_button')}</span>
                            </div>
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
};