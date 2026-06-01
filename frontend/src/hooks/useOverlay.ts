import { useState } from 'react';

export function useOverlay() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLoginBox = () => setIsLoginOpen(true);
    const handleCloseLogin = () => setIsLoginOpen(false);

    const handleSettingsBox = () => setIsSettingsOpen(true);
    const handleCloseSettings = () => setIsSettingsOpen(false);

    return {
        isLoginOpen,
        handleLoginBox,
        handleCloseLogin,
        isSettingsOpen,
        handleSettingsBox,
        handleCloseSettings,
    };
}
