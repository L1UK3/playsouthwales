/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, Outlet } from '@tanstack/react-router';
import React, { Suspense, useCallback, useState } from 'react';
import SuspenseLoader from '@/components/suspense-loader/SuspenseLoader';
import styles from './App.module.css'
import Header from '@/layouts/Header';


const RootComponent = () => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const handleSettingsBox = useCallback(() => setIsSettingsOpen(prev => !prev), []);
	const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);

	return (
		<div className={styles.appRoot}>
			<Header
				onSettingsBox={handleSettingsBox}
				isSettingsOpen={isSettingsOpen}
				onCloseSettings={handleCloseSettings}
			/>


			<main className={styles.appContainer}>
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
