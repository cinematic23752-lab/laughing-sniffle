// Fix: Implemented the BotsManager and BotCard components to resolve module and rendering errors.
import React, { useState } from 'react';
import { useAppData } from '../../context/AppContext.tsx';
import { BotModal } from './BotModal.tsx';
import { Bot } from '../../types.ts';
import { Card } from '../shared/Card.tsx';
import { useValueFlash } from '../../hooks/useValueFlash.ts';
import { useLanguage, useTranslation } from '../../context/LanguageContext.tsx';
import { PlusIcon, PlayIcon, PauseIcon, EditIcon, TrashIcon, BoltIcon, WalletIcon } from '../Icons.tsx';
import { SUPPORTED_EXCHANGES } from '../../constants.ts';

// BotCard sub-component to display individual bot information
const BotCard: React.FC<{
    bot: Bot;
    onToggle: (botId: string) => void;
    onEdit: (bot: Bot) => void;
    onDelete: (botId: string) => void;
}> = ({ bot, onToggle, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const isRunning = bot.status === 'running';
    const pnlColor = bot.pnl >= 0 ? 'text-green-500' : 'text-red-500';
    const pnlFlash = useValueFlash(bot.pnl);
    
    const statusMap = {
        running: { text: t('bot_status_running'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        paused: { text: t('bot_status_paused'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
        stopped: { text: t('bot_status_stopped'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        error: { text: t('bot_status_error'), color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    };
    const currentStatus = statusMap[bot.status];

    const botName = bot.isDefault ? t(bot.name) : bot.name;
    const strategyName = bot.isDefault ? t(bot.strategy.name) : bot.strategy.name;
    const strategySummary = bot.isDefault ? t(bot.strategy.summary || '', bot.strategy.parameters) : bot.strategy.summary;
    
    const formattedPnl = bot.pnl.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: 'USD'
    });

    const exchangeInfo = bot.exchange ? SUPPORTED_EXCHANGES.find(e => e.id === bot.exchange) : null;
    const exchangeName = exchangeInfo ? t(exchangeInfo.nameKey) : t('local_profile');
    const exchangeColor = bot.exchange ? 'text-cyan-500' : 'text-gray-400';

    return (
        <Card className="flex flex-col justify-between space-y-4">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{botName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${currentStatus.color}`}>{currentStatus.text}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{bot.pair}</p>
                    <div className={`flex items-center space-x-1 rtl:space-x-reverse text-xs font-medium ${exchangeColor}`}>
                        <WalletIcon className="w-4 h-4" />
                        <span>{exchangeName}</span>
                    </div>
                </div>
            </div>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('bot_card_strategy')}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{strategyName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('bot_card_summary')}</span>
                    <span className="text-gray-800 dark:text-gray-200">{strategySummary}</span>
                </div>
                <div className={`flex justify-between items-center rounded px-2 -mx-2 transition-colors duration-300 ${pnlFlash}`}>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-gray-500 dark:text-gray-400">{t('bot_card_pnl')}</span>
                        {isRunning && (
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </div>
                        )}
                    </div>
                    <span className={`font-semibold ${pnlColor}`}>{formattedPnl}</span>
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => onToggle(bot.id)} className="p-2 text-gray-500 hover:text-cyan-500 dark:text-gray-400 dark:hover:text-cyan-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={isRunning ? t('pause_bot_tooltip') : t('start_bot_tooltip')}>
                    {isRunning ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>
                <button onClick={() => onEdit(bot)} className="p-2 text-gray-500 hover:text-cyan-500 dark:text-gray-400 dark:hover:text-cyan-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={t('edit_bot_tooltip')}>
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(bot.id)} className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={t('delete_bot_tooltip')}>
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </Card>
    );
};

export const BotsManager: React.FC = () => {
    const { t } = useTranslation();
    const { bots, addBot, updateBot, deleteBot, toggleBotStatus } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

    const handleOpenModal = (bot: Bot | null = null) => {
        setSelectedBot(bot);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBot(null);
    };

    const handleSaveBot = (botData: Omit<Bot, 'id' | 'createdAt' | 'pnl' | 'status'> & { id?: string }) => {
        if (botData.id) {
            const existingBot = bots.find(b => b.id === botData.id);
            if (existingBot) {
                // Combine existing bot data with new data from the form,
                // ensuring properties not edited in the modal (like isDefault) are preserved.
                const updatedBot: Bot = {
                    ...existingBot,
                    name: botData.name,
                    pair: botData.pair,
                    strategy: botData.strategy,
                };
                updateBot(updatedBot);
            }
        } else {
            addBot(botData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('bots_manager_title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{t('bots_manager_subtitle', { botCount: bots.length })}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                    <PlusIcon className="w-5 h-5 me-2" />
                    {t('create_bot_button')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bots.length > 0 ? (
                    bots.map(bot => (
                        <BotCard
                            key={bot.id}
                            bot={bot}
                            onToggle={toggleBotStatus}
                            onEdit={handleOpenModal}
                            onDelete={deleteBot}
                        />
                    ))
                ) : (
                    <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-12">
                         <BoltIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('no_bots_created_title')}</h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('no_bots_created_message')}</p>
                    </Card>
                )}
            </div>

            <BotModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveBot}
                bot={selectedBot}
            />
        </div>
    );
};