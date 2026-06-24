import React, { Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import useHeaderLogic from '@/hooks/useHeaderLogic';
import SuspenseLoader from '@/components/SuspenseLoader';
import Header from '@layouts/Header';
import MobileNavBar from '@/components/MobileNavBar';

export const RootComponent: React.FC = () => {
    const { isSettingsOpen, handleSettingsBox, handleCloseSettings } = useHeaderLogic();

    return (
        <div className="appRoot">
            <Header
                onSettingsBox={handleSettingsBox}
                isSettingsOpen={isSettingsOpen}
                onCloseSettings={handleCloseSettings}
            />

            <main className="appContainer pb-20 sm:pb-4">
                <Suspense fallback={<SuspenseLoader />}>
                    <Outlet />
                </Suspense>
            </main>

            <MobileNavBar />
        </div>
    );
};

export default RootComponent;
