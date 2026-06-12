/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Suspense, useCallback, useState } from 'react';
import SuspenseLoader from '@components/suspense-loader/SuspenseLoader';
import Header from '@layouts/Header';
import "@/assets/styles/global.css";

const RootComponent = () => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const handleSettingsBox = useCallback(() => setIsSettingsOpen(prev => !prev), []);
	const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);

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

export const Route = createRootRoute({
	component: RootComponent,
});
