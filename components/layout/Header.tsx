
// Fix: Implemented the Header component to resolve module and rendering errors.
import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon } from '../Icons.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';
import { Avatar } from '../shared/Avatar.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface HeaderProps {
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    const { language, setLanguage } = useLanguage();
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    const handleLanguageChange = (lang: 'en' | 'ar') => {
        setLanguage(lang);
        setIsLangDropdownOpen(false);
    };

    return (
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>

            <div className="flex items-center space-x-4">
                <ThemeToggle />

                {/* Language Selector */}
                <div className="relative">
                    <button
                        onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                        className="flex items-center space-x-1 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="text-sm font-medium">{language.toUpperCase()}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isLangDropdownOpen && (
                        <div className="absolute end-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleLanguageChange('en'); }}
                                className={`block px-4 py-2 text-sm ${language === 'en' ? 'font-bold text-cyan-600' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-600`}
                            >
                                English
                            </a>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleLanguageChange('ar'); }}
                                className={`block px-4 py-2 text-sm ${language === 'ar' ? 'font-bold text-cyan-600' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-600`}
                            >
                                العربية (Arabic)
                            </a>
                        </div>
                    )}
                </div>

                <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <BellIcon className="w-6 h-6" />
                </button>

                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600"></div>

                <div className="flex items-center space-x-2">
                    <Avatar />
                    <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">Alex Doe</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Trader</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
