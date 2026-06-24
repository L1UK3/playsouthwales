import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
    highContrast: boolean;
    largeText: boolean;
    disableAnimations: boolean;
    darkMode: boolean;
}

interface SettingsContextType {
    settings: Settings;
    toggleSetting: (key: keyof Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const saved = localStorage.getItem('playwales-settings');
            const parsed = saved ? JSON.parse(saved) : {};
            return {
                highContrast: parsed.highContrast ?? false,
                largeText: parsed.largeText ?? false,
                disableAnimations: parsed.disableAnimations ?? false,
                darkMode: parsed.darkMode ?? false,
            };
        } catch {
            return {
                highContrast: false,
                largeText: false,
                disableAnimations: false,
                darkMode: false,
            };
        }
    });

    useEffect(() => {
        localStorage.setItem('playwales-settings', JSON.stringify(settings));

        const root = document.documentElement;
        
        if (settings.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        if (settings.largeText) {
            root.classList.add('large-text');
        } else {
            root.classList.remove('large-text');
        }

        if (settings.disableAnimations) {
            root.classList.add('disable-animations');
        } else {
            root.classList.remove('disable-animations');
        }

        if (settings.darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [settings]);

    const toggleSetting = (key: keyof Settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <SettingsContext.Provider value={{ settings, toggleSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
