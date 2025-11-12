import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

type Language = 'en' | 'ar';
type Translations = Record<string, string>;

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, options?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedLang = window.localStorage.getItem('language');
        if (storedLang === 'en' || storedLang === 'ar') {
            return storedLang;
        }
    }
    // Fallback to browser language if it's Arabic, otherwise default to English
    if (typeof navigator !== 'undefined' && navigator.language.startsWith('ar')) {
        return 'ar';
    }
    return 'en';
};


export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);
    const [translations, setTranslations] = useState<Record<Language, Translations> | null>(null);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const [enRes, arRes] = await Promise.all([
                    fetch('/i18n/en.json'),
                    fetch('/i18n/ar.json')
                ]);
                const enData = await enRes.json();
                const arData = await arRes.json();
                setTranslations({ en: enData, ar: arData });
            } catch (error) {
                console.error("Failed to load translation files:", error);
                // Set empty translations to prevent app crash
                setTranslations({ en: {}, ar: {} });
            }
        };
        fetchTranslations();
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', lang);
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        }
    };
    
    const t = useCallback((key: string, options: Record<string, any> = {}) => {
        if (!translations) {
            return key; // Return key if translations aren't loaded yet
        }
        
        let translation = translations[language][key] || key;
        
        // Basic interpolation
        Object.keys(options).forEach(optionKey => {
            const regex = new RegExp(`{{${optionKey}}}`, 'g');
            translation = translation.replace(regex, options[optionKey]);
        });

        return translation;
    }, [language, translations]);


    useEffect(() => {
        setLanguage(getInitialLanguage());
    }, []);

    // Don't render children until translations are loaded to prevent FOUC
    if (!translations) {
        return null; 
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return { language: context.language, setLanguage: context.setLanguage };
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return { t: context.t };
};