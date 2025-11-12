import React, { useState, useEffect } from 'react';
// Fix: Added .ts extension to fix module resolution error.
// Fix: Import AIStrategySuggestion from types.ts to resolve module export error.
import { Bot, BotStrategy, AIStrategySuggestion } from '../../types.ts';
// Fix: Added .tsx extension to fix module resolution error.
import { Modal } from '../shared/Modal.tsx';
// Fix: Added .ts extension to fix module resolution error.
import { TRADING_PAIRS, getBotStrategies } from '../../constants.ts';
// Fix: Added .ts extension to fix module resolution error.
import { getAIStrategySuggestion } from '../../services/api.ts';
// Fix: Added .tsx extension to fix module resolution error.
import { useAppData } from '../../context/AppContext.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';
import { Tooltip } from '../shared/Tooltip.tsx';
import { InformationCircleIcon, BoltIcon } from '../Icons.tsx';


interface BotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bot: Omit<Bot, 'id' | 'createdAt' | 'pnl' | 'status'> & { id?: string }) => void;
    bot?: Bot | null;
}

const AIReasoningDisplay: React.FC<{ reasoning: string }> = ({ reasoning }) => {
    const { t } = useTranslation();
    return (
        <div className="mt-4 p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 flex items-start space-x-3 rtl:space-x-reverse">
            <div className="flex-shrink-0">
                <BoltIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
                    {t('ai_suggestion')}
                </p>
                <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">
                    {reasoning}
                </p>
            </div>
        </div>
    );
};


export const BotModal: React.FC<BotModalProps> = ({ isOpen, onClose, onSave, bot }) => {
    const { addNotification } = useAppData();
    const { t } = useTranslation();
    const BOT_STRATEGIES = getBotStrategies(t);

    const [name, setName] = useState('');
    const [pair, setPair] = useState(TRADING_PAIRS[0]);
    const [strategyName, setStrategyName] = useState(BOT_STRATEGIES[0].name);
    const [parameters, setParameters] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [aiReasoning, setAiReasoning] = useState('');

    const initializeParameters = (sName: string) => {
        const strategyConfig = BOT_STRATEGIES.find(s => s.name === sName);
        const initialParams: Record<string, any> = {};
        strategyConfig?.parameters.forEach(p => {
            initialParams[p.id] = p.defaultValue;
        });
        setParameters(initialParams);
    };

    useEffect(() => {
        if (isOpen) {
            const currentStrategies = getBotStrategies(t);
            setAiReasoning(''); 
            setErrors({});
            if (bot) {
                setName(bot.name);
                setPair(bot.pair);
                setStrategyName(bot.strategy.name);
                setParameters(bot.strategy.parameters);
            } else {
                setName('');
                setPair(TRADING_PAIRS[0]);
                const defaultStrategy = currentStrategies[0];
                setStrategyName(defaultStrategy.name);
                initializeParameters(defaultStrategy.name);
            }
        }
    }, [bot, isOpen, t]);
    
    const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStrategyName = e.target.value;
        setStrategyName(newStrategyName);
        setAiReasoning('');
        setErrors({});
        initializeParameters(newStrategyName);
    };

    const handleParameterChange = (paramId: string, value: any) => {
        setParameters(prev => ({ ...prev, [paramId]: value }));
        if (errors[paramId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[paramId];
                return newErrors;
            });
        }
    };
    
    const validateForm = (): boolean => {
        const strategyConfig = BOT_STRATEGIES.find(s => s.name === strategyName);
        if (!strategyConfig) return false;

        const newErrors: Record<string, string> = {};
        const currentParams = parameters;

        // Step 1: Generic parameter validation (required, type, valid options)
        strategyConfig.parameters.forEach(p => {
            const value = currentParams[p.id];
            
            const isMissing = value === undefined || value === null || String(value).trim() === '';
            if (isMissing) {
                newErrors[p.id] = t('validation_required_field');
                return; // Skip to next param
            }

            if (p.type === 'select') {
                if (!p.options?.includes(String(value))) {
                    newErrors[p.id] = t('validation_invalid_option');
                }
                return; // Selects are validated, skip to next param
            }

            if (p.type === 'number') {
                if (isNaN(parseFloat(value))) {
                     newErrors[p.id] = t('validation_must_be_number');
                     return; // Not a number, skip to next param
                }
            }
        });

        // Step 2: Strategy-specific validation (only runs if generic checks pass for relevant fields)
        const strategyId = strategyConfig.id;

        if (strategyId === 'dca') {
            const amount = parseFloat(currentParams.amount);
            if (!newErrors.amount && amount <= 0) {
                newErrors.amount = t('validation_positive_number');
            }
        }

        if (strategyId === 'grid') {
            const lowerPrice = parseFloat(currentParams.lowerPrice);
            const upperPrice = parseFloat(currentParams.upperPrice);
            const grids = parseFloat(currentParams.grids);

            if (!newErrors.lowerPrice && lowerPrice <= 0) {
                newErrors.lowerPrice = t('validation_positive_number');
            }
            if (!newErrors.upperPrice && upperPrice <= 0) {
                newErrors.upperPrice = t('validation_positive_number');
            }

            if (!newErrors.lowerPrice && !newErrors.upperPrice && upperPrice <= lowerPrice) {
                newErrors.upperPrice = t('validation_upper_gt_lower');
            }
            
            if (!newErrors.grids && (!Number.isInteger(grids) || grids < 2 || grids > 200)) {
                newErrors.grids = t('validation_grid_range');
            }
        }

        if (strategyId === 'momentum') {
            const takeProfit = parseFloat(currentParams.takeProfit);
            const stopLoss = parseFloat(currentParams.stopLoss);
            
            if (!newErrors.takeProfit && (takeProfit <= 0 || takeProfit > 500)) {
                newErrors.takeProfit = t('validation_percentage_range_tp');
            }
            
            if (!newErrors.stopLoss && (stopLoss <= 0 || stopLoss > 100)) {
                newErrors.stopLoss = t('validation_percentage_range_sl');
            }

            if (!newErrors.takeProfit && !newErrors.stopLoss && takeProfit <= stopLoss) {
                newErrors.takeProfit = t('validation_tp_gt_sl');
            }
        }

        if (strategyId === 'trailing_stop') {
            const trailPercentage = parseFloat(currentParams.trailPercentage);
            const initialAmount = parseFloat(currentParams.initialAmount);

            if (!newErrors.trailPercentage && (trailPercentage < 0.1 || trailPercentage > 50)) {
                newErrors.trailPercentage = t('validation_trail_percentage_range');
            }

            if (!newErrors.initialAmount && initialAmount <= 0) {
                newErrors.initialAmount = t('validation_positive_number');
            }
        }

        if (strategyId === 'scalping') {
            const profitTarget = parseFloat(currentParams.profitTarget);
            const tradeAmount = parseFloat(currentParams.tradeAmount);

            if (!newErrors.profitTarget && (profitTarget < 0.01 || profitTarget > 10)) {
                newErrors.profitTarget = t('validation_profit_target_range');
            }

            if (!newErrors.tradeAmount && tradeAmount <= 0) {
                newErrors.tradeAmount = t('validation_positive_number');
            }
        }

        if (strategyId === 'ma_crossover') {
            const shortWindow = parseFloat(currentParams.shortWindow);
            const longWindow = parseFloat(currentParams.longWindow);
            const tradeAmount = parseFloat(currentParams.tradeAmount);

            if (!newErrors.shortWindow && (!Number.isInteger(shortWindow) || shortWindow < 2 || shortWindow > 200)) {
                newErrors.shortWindow = t('validation_ma_window_range');
            }
            if (!newErrors.longWindow && (!Number.isInteger(longWindow) || longWindow < 2 || longWindow > 200)) {
                newErrors.longWindow = t('validation_ma_window_range');
            }

            if (!newErrors.shortWindow && !newErrors.longWindow && longWindow <= shortWindow) {
                newErrors.longWindow = t('validation_long_gt_short');
            }
            
            if (!newErrors.tradeAmount && tradeAmount <= 0) {
                newErrors.tradeAmount = t('validation_positive_number');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSuggestStrategy = async () => {
        setIsSuggesting(true);
        setAiReasoning('');
        setErrors({});
        try {
            const suggestion = await getAIStrategySuggestion(pair);
            const matchedStrategy = BOT_STRATEGIES.find(s => s.id === suggestion.name);

            if (matchedStrategy) {
                setStrategyName(matchedStrategy.name);
                const strategyConfig = matchedStrategy;
                const relevantParams: Record<string, any> = {};
                strategyConfig?.parameters.forEach(p => {
                        if (suggestion.parameters[p.id] !== undefined) {
                        relevantParams[p.id] = suggestion.parameters[p.id];
                    } else {
                        relevantParams[p.id] = p.defaultValue;
                    }
                });
                setParameters(relevantParams);
                setAiReasoning(suggestion.reasoning);
                addNotification('notification_ai_suggestion_success_title', { strategyName: matchedStrategy.name, pair });
            } else {
                const msg = t('notification_ai_suggestion_unsupported_message', { strategyName: suggestion.name });
                setAiReasoning(msg);
                addNotification('notification_ai_suggestion_error_title', { message: msg }, 'error');
            }
        } catch (error) {
            console.error("Failed to suggest strategy:", error);
            let msg: string;
            if ((error as Error).message === 'API_KEY_NOT_CONFIGURED') {
                msg = t('gemini_api_key_required_message');
            } else {
                msg = (error as Error).message || t('notification_ai_suggestion_api_error_message');
            }
            setAiReasoning(msg);
            addNotification('notification_api_error_title', { message: msg }, 'error');
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const strategyConfig = BOT_STRATEGIES.find(s => s.name === strategyName);
        if (!strategyConfig) {
            console.error(`Strategy config not found for: ${strategyName}`);
            addNotification('notification_api_error_title', { message: `Could not save bot. Strategy "${strategyName}" is invalid.` }, 'error');
            return;
        }

        const parsedParameters: Record<string, any> = {};
        Object.keys(parameters).forEach(key => {
            const paramConfig = strategyConfig.parameters.find(p => p.id === key);
            if (paramConfig && paramConfig.type === 'number') {
                parsedParameters[key] = parseFloat(parameters[key]);
            } else {
                parsedParameters[key] = parameters[key];
            }
        });

        const strategy: BotStrategy = { 
            id: strategyConfig.id,
            name: strategyName, 
            parameters: parsedParameters
        };
        onSave({ id: bot?.id, name, pair, strategy });
        onClose();
    };

    const currentStrategyConfig = BOT_STRATEGIES.find(s => s.name === strategyName);

    const renderParameterFields = () => {
        if (!currentStrategyConfig) return null;

        return (
            <div className="space-y-4">
                 {currentStrategyConfig.parameters.map(param => {
                    const error = errors[param.id];
                    return (
                        <div key={param.id}>
                            <label htmlFor={`param-${param.id}`} className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span>{param.label}</span>
                                {param.tooltipKey && (
                                    <Tooltip text={t(param.tooltipKey)}>
                                        <InformationCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer" />
                                    </Tooltip>
                                )}
                            </label>
                            {param.type === 'select' ? (
                                <select
                                    id={`param-${param.id}`}
                                    value={parameters[param.id] || ''}
                                    onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                    className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-white"
                                >
                                    {param.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <input
                                    type={param.type}
                                    id={`param-${param.id}`}
                                    value={parameters[param.id] || ''}
                                    onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                    className={`mt-1 block w-full bg-white dark:bg-gray-700 border rounded-md shadow-sm py-2 px-3 sm:text-sm text-gray-900 dark:text-white ${
                                        error 
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-cyan-500 focus:border-cyan-500'
                                    }`}
                                    aria-invalid={!!error}
                                    aria-describedby={error ? `error-${param.id}` : undefined}
                                    required
                                />
                            )}
                            {error && <p id={`error-${param.id}`} className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
                        </div>
                    );
                 })}
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={bot ? t('modal_edit_bot_title') : t('modal_create_bot_title')}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="bot-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('bot_name_label')}</label>
                    <input type="text" id="bot-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-white" required />
                </div>

                <div>
                    <label htmlFor="bot-pair" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('trading_pair_label')}</label>
                    <select id="bot-pair" value={pair} onChange={(e) => setPair(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-white">
                        {TRADING_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                         <label htmlFor="bot-strategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('strategy_label')}</label>
                          <button type="button" onClick={handleSuggestStrategy} disabled={isSuggesting} className="text-sm font-medium text-cyan-600 hover:text-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSuggesting ? t('analyzing_button') : `✨ ${t('suggest_with_ai_button')}`}
                        </button>
                    </div>
                    <select id="bot-strategy" value={strategyName} onChange={handleStrategyChange} className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-white">
                        {BOT_STRATEGIES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>

                    {currentStrategyConfig && (
                        <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {currentStrategyConfig.description}
                            </p>
                        </div>
                    )}

                    <hr className="border-gray-200 dark:border-gray-600"/>

                    {renderParameterFields()}
                    {aiReasoning && <AIReasoningDisplay reasoning={aiReasoning} />}
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                     <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        {t('cancel_button')}
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                        {bot ? t('save_changes_button') : t('create_bot_button')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};