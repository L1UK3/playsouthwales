import React, { Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import useHeaderLogic from '@/hooks/useHeaderLogic';
import SuspenseLoader from '@/components/SuspenseLoader';
import Header from '@layouts/Header';

export const RootComponent: React.FC = () => {
    const { isSettingsOpen, handleSettingsBox, handleCloseSettings } = useHeaderLogic();

    return (
        <div className="appRoot">
            <Header
                onSettingsBox={handleSettingsBox}
                isSettingsOpen={isSettingsOpen}
                onCloseSettings={handleCloseSettings}
            />

            <main className="appContainer">
                <Suspense fallback={<SuspenseLoader />}>
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
};

export default RootComponent;
