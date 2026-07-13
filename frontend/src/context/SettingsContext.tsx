import React, { createContext, use, useState, useEffect } from 'react';

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

const COOKIE_NAME = 'playwales-settings';

function getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
        while (c.startsWith(' ')) c = c.substring(1, c.length);
        if (c.startsWith(nameEQ)) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name: string, value: string, days = 365) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie =
        name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
}

const SettingsContext = createContext<SettingsContextType | undefined>(
    undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const saved = getCookie(COOKIE_NAME);
            const parsed = saved ? JSON.parse(decodeURIComponent(saved)) : {};
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
        setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(settings)));

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
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <SettingsContext value={{ settings, toggleSetting }}>
            {children}
        </SettingsContext>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = (): SettingsContextType => {
    const context = use(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
