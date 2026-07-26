import { useCallback, useState } from 'react';

const useHeaderLogic = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleSettingsBox = useCallback(
        () => setIsSettingsOpen((prev) => !prev),
        []
    );
    const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);

    return {
        isSettingsOpen,
        handleSettingsBox,
        handleCloseSettings,
    };
};

export default useHeaderLogic;
