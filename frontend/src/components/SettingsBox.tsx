import React from 'react';

export interface SettingsBoxProps {
    onClose: () => void;
}

const SettingsBox: React.FC<SettingsBoxProps> = ({ onClose }) => {
    return (
        <div className="bg-bg-card border-2 border-border-color rounded-lg shadow-main overflow-hidden">
            <button className="flex items-center gap-2.5 w-full py-3 px-4 bg-transparent border-none text-text-main text-sm font-medium cursor-pointer text-left transition-colors duration-150 hover:bg-bg-card-hover hover:transform-none" onClick={onClose}>
                High Contrast Mode
            </button>
            <button className="flex items-center gap-2.5 w-full py-3 px-4 bg-transparent border-none text-text-main text-sm font-medium cursor-pointer text-left transition-colors duration-150 hover:bg-bg-card-hover hover:transform-none" onClick={onClose}>
                Large Text Mode
            </button>
            <button className="flex items-center gap-2.5 w-full py-3 px-4 bg-transparent border-none text-text-main text-sm font-medium cursor-pointer text-left transition-colors duration-150 hover:bg-bg-card-hover hover:transform-none" onClick={onClose}>
                Dark Mode
            </button>
        </div>
    );
};

export default SettingsBox;
