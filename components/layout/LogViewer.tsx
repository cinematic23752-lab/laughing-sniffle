import React, { useState } from 'react';
import { useAppData } from '../../context/AppContext.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';
import { LogEntry, LogLevel } from '../../types.ts';
import { TerminalIcon, TrashIcon, CloseIcon } from '../Icons.tsx';

const LogLevelBadge: React.FC<{ level: LogLevel }> = ({ level }) => {
    const levelMap = {
        error: 'bg-red-500 text-white',
        warn: 'bg-yellow-500 text-black',
        info: 'bg-blue-500 text-white',
        debug: 'bg-gray-500 text-white',
    };
    return <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${levelMap[level]}`}>{level.toUpperCase()}</span>;
};

const LogRow: React.FC<{ log: LogEntry }> = ({ log }) => {
    return (
        <div className="flex items-start space-x-3 rtl:space-x-reverse p-2 border-b border-gray-700 hover:bg-gray-800/50">
            <div className="flex-shrink-0 pt-0.5">
                <LogLevelBadge level={log.level} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-gray-200 whitespace-pre-wrap break-words">{log.message}</p>
                <p className="text-xs text-gray-500 mt-1">{log.timestamp.toLocaleTimeString()}</p>
            </div>
        </div>
    );
};


export const LogViewer: React.FC = () => {
    const { logs, clearLogs } = useAppData();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-4 end-4 z-[90]">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-transform hover:scale-110"
                    title={isOpen ? t('hide_logs_tooltip') : t('show_logs_tooltip')}
                >
                    <TerminalIcon className="w-6 h-6" />
                </button>
            </div>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[95]"
                    onClick={() => setIsOpen(false)}
                />
            )}
            
            <div
                className={`fixed bottom-0 end-0 h-1/2 w-full md:w-3/4 lg:w-2/3 bg-gray-900 border-t-2 border-cyan-500 shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-y-0' : 'translate-y-full'
                } flex flex-col`}
            >
                <header className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <TerminalIcon className="w-6 h-6 me-2" />
                        {t('system_logs_title')}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={clearLogs}
                            className="flex items-center px-3 py-1 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-red-600 hover:text-white transition-colors"
                        >
                            <TrashIcon className="w-4 h-4 me-1" />
                            {t('clear_logs_button')}
                        </button>
                         <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-colors"
                         >
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-2">
                    {logs.length > 0 ? (
                        [...logs].reverse().map(log => <LogRow key={log.id} log={log} />)
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">{t('no_logs_message')}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
