import React from 'react';
import { useSettings } from '@/context/SettingsContext';

export interface SettingsBoxProps {
    onClose: () => void;
}

const SettingsBox: React.FC<SettingsBoxProps> = () => {
    const { settings, toggleSetting } = useSettings();

    return (
        <div className="bg-bg-card border-2 border-border-color rounded-lg shadow-main overflow-hidden w-64 p-3 flex flex-col gap-1.5">
            <button 
                type="button"
                className={`flex items-center justify-between w-full py-2 px-3 rounded-md border-none text-text-main text-sm font-semibold cursor-pointer transition-all duration-150 ${settings.highContrast ? 'bg-primary/10 text-primary!' : 'bg-transparent hover:bg-bg-card-hover'}`} 
                onClick={() => toggleSetting('highContrast')}
            >
                <span>High Contrast</span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 border-current transition-all duration-200 ${settings.highContrast ? 'bg-primary scale-110' : 'bg-transparent scale-90'}`} />
            </button>

            <button 
                type="button"
                className={`flex items-center justify-between w-full py-2 px-3 rounded-md border-none text-text-main text-sm font-semibold cursor-pointer transition-all duration-150 ${settings.largeText ? 'bg-primary/10 text-primary!' : 'bg-transparent hover:bg-bg-card-hover'}`} 
                onClick={() => toggleSetting('largeText')}
            >
                <span>Large Text</span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 border-current transition-all duration-200 ${settings.largeText ? 'bg-primary scale-110' : 'bg-transparent scale-90'}`} />
            </button>

            <button 
                type="button"
                className={`flex items-center justify-between w-full py-2 px-3 rounded-md border-none text-text-main text-sm font-semibold cursor-pointer transition-all duration-150 ${settings.disableAnimations ? 'bg-primary/10 text-primary!' : 'bg-transparent hover:bg-bg-card-hover'}`} 
                onClick={() => toggleSetting('disableAnimations')}
            >
                <span>Disable Animations</span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 border-current transition-all duration-200 ${settings.disableAnimations ? 'bg-primary scale-110' : 'bg-transparent scale-90'}`} />
            </button>

            <button 
                type="button"
                className={`flex items-center justify-between w-full py-2 px-3 rounded-md border-none text-text-main text-sm font-semibold cursor-pointer transition-all duration-150 ${settings.darkMode ? 'bg-primary/10 text-primary!' : 'bg-transparent hover:bg-bg-card-hover'}`} 
                onClick={() => toggleSetting('darkMode')}
            >
                <span>Dark Mode</span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 border-current transition-all duration-200 ${settings.darkMode ? 'bg-primary scale-110' : 'bg-transparent scale-90'}`} />
            </button>
        </div>
    );
};

export default SettingsBox;
