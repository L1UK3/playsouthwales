/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, Outlet } from '@tanstack/react-router';
import React, { Suspense, useCallback, useState } from 'react';
import SuspenseLoader from '@/components/suspense-loader/SuspenseLoader';
import styles from './App.module.css'
import Header from '@/layouts/Header';

const LoginBox = React.lazy(() => import('@features/auth/components/LoginBox'));

const RootComponent = () => {
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const handleLoginBox = useCallback(() => setIsLoginOpen(true), []);
	const handleCloseLogin = useCallback(() => setIsLoginOpen(false), []);

	const handleSettingsBox = useCallback(() => setIsSettingsOpen(prev => !prev), []);
	const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);

	return (
		<div className={styles.appRoot}>
			<Header
				onLoginBox={handleLoginBox}
				onSettingsBox={handleSettingsBox}
				isSettingsOpen={isSettingsOpen}
				onCloseSettings={handleCloseSettings}
			/>

			<Suspense fallback={null}>
				{isLoginOpen ? <LoginBox onClose={handleCloseLogin} /> : null}
			</Suspense>

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
