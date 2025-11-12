
import React, { useEffect } from 'react';
// Fix: Added .ts extension to fix module resolution error.
import { Notification, NotificationType } from '../../types.ts';
// Fix: Added .tsx extension to fix module resolution error.
import { CloseIcon, WarningIcon } from '../Icons.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';

const typeStyles = {
    success: {
        bg: 'bg-green-500',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    error: {
        bg: 'bg-red-500',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    info: {
        bg: 'bg-blue-500',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
};


interface NotificationToastProps {
    notification: Notification;
    onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
    const { t } = useTranslation();
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(notification.id);
        }, 5000);

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);
    
    const styles = typeStyles[notification.type];
    
    const title = t(notification.title, notification.message);
    const message = t(notification.messageKey || '', notification.message);


    return (
        <div className={`relative w-full max-w-sm p-4 rounded-lg shadow-2xl text-white flex items-start space-x-3 rtl:space-x-reverse ${styles.bg}`}>
            <div className="flex-shrink-0">{styles.icon}</div>
            <div className="flex-1">
                <div className="font-bold">{title}</div>
                <p className="text-sm">{message}</p>
            </div>
            <button
                onClick={() => onDismiss(notification.id)}
                className="absolute top-2 end-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss notification"
            >
                <CloseIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export const NotificationContainer: React.FC<{ 
    notifications: Notification[];
    onDismiss: (id: string) => void; 
}> = ({ notifications, onDismiss }) => {
    return (
        <div className="fixed bottom-4 end-4 z-[100] w-full max-w-sm space-y-3">
            {notifications.map(n => (
                <NotificationToast key={n.id} notification={n} onDismiss={onDismiss} />
            ))}
        </div>
    );
};