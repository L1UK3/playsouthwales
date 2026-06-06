import { useState, useCallback } from 'react';

export function useOverlay() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLoginBox = useCallback(() => setIsLoginOpen(true), []);
    const handleCloseLogin = useCallback(() => setIsLoginOpen(false), []);

    const handleSettingsBox = useCallback(() => setIsSettingsOpen(prev => !prev), []);
    const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);

    return {
        isLoginOpen,
        handleLoginBox,
        handleCloseLogin,
        isSettingsOpen,
        handleSettingsBox,
        handleCloseSettings,
    };
}
