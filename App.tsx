// Fix: Added App component implementation to serve as the application root.
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { LanguageProvider, useTranslation } from './context/LanguageContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { Dashboard } from './components/dashboard/Dashboard.tsx';
import { BotsManager } from './components/bots/BotsManager.tsx';
import { TradesTable } from './components/trades/TradesTable.tsx';
import { Reports } from './components/reports/Reports.tsx';
import { Backtesting } from './components/backtesting/Backtesting.tsx';
import { ApiKeysManager } from './components/settings/ApiKeysManager.tsx';
import { NotificationContainer } from './components/shared/NotificationToast.tsx';
import { useAppData } from './context/AppContext.tsx';
import { LogViewer } from './components/layout/LogViewer.tsx';

const MainContent: React.FC = () => {
    const { t } = useTranslation();
    const [activeView, setActiveView] = useState('dashboard');
    const { trades, notifications, dismissNotification } = useAppData();

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard />;
            case 'bots':
                return <BotsManager />;
            case 'trades':
                return <TradesTable trades={trades} title={t('all_trades')} />;
            case 'reports':
                return <Reports />;
            case 'backtesting':
                return <Backtesting />;
            case 'settings':
                return <ApiKeysManager />;
            default:
                return <Dashboard />;
        }
    };
    
    const viewTitle = t(`sidebar_${activeView}`);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4">
                    <Header title={viewTitle} />
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {renderView()}
                </div>
            </main>
            <NotificationContainer notifications={notifications} onDismiss={dismissNotification} />
            <LogViewer />
        </div>
    );
}


const App: React.FC = () => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppProvider>
                    <MainContent />
                </AppProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;