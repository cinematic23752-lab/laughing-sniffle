// Fix: Added Sidebar component implementation.
import React from 'react';
import { LogoIcon, DashboardIcon, BotsIcon, TradesIcon, ReportsIcon, BacktestIcon, SettingsIcon } from '../Icons.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';

type NavItemKey = 'dashboard' | 'bots' | 'trades' | 'reports' | 'backtesting' | 'settings';

const navItemsConfig: { key: NavItemKey; icon: React.ElementType; }[] = [
    { key: 'dashboard', icon: DashboardIcon },
    { key: 'bots', icon: BotsIcon },
    { key: 'trades', icon: TradesIcon },
    { key: 'reports', icon: ReportsIcon },
    { key: 'backtesting', icon: BacktestIcon },
    { key: 'settings', icon: SettingsIcon },
];

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const { t } = useTranslation();

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 flex flex-col border-r rtl:border-r-0 rtl:border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <LogoIcon className="w-8 h-8 text-cyan-500" />
                <h1 className="ms-3 text-2xl font-bold text-gray-900 dark:text-white">Zenith</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItemsConfig.map((item) => {
                    const itemName = t(`sidebar_${item.key}`);
                    const isActive = activeView === item.key;
                    return (
                        <a
                            key={item.key}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveView(item.key);
                            }}
                            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-cyan-500 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <item.icon className="w-6 h-6 ms-3" />
                            {itemName}
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
};