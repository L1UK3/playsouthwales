import React, { useState, lazy, Suspense } from 'react';
import { useOverlay } from '@hooks/useOverlay';
import styles from './App.module.css';
import Header from './layouts/Header';
import SuspenseLoader from '~components/SuspenseLoader';

// Lazy loaded page views and modal overlay components
const LoginBox = lazy(() => import('@features/auth/components/LoginBox'));
const SchedulePage = lazy(() => import('@pages/schedule/SchedulePage'));
const LeaguesPage = lazy(() => import('@pages/leagues/LeaguesPage'));
const RankingsPage = lazy(() => import('@pages/rankings/RankingsPage'));

export type ActiveTab = 'schedule' | 'leagues' | 'rankings';

/**
 * Main application component that orchestrates state, layout, and page routing
 * with lazy loading and suspense boundaries.
 * 
 * @returns {JSX.Element} The rendered application.
 */
const App: React.FC = () => {
	const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');

	// Overlay State
	const {
		isLoginOpen, handleLoginBox, handleCloseLogin,
		isSettingsOpen, handleSettingsBox, handleCloseSettings,
	} = useOverlay();

	return (
		<div className={styles.appRoot}>
			<Header
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onLoginBox={handleLoginBox}
				onSettingsBox={handleSettingsBox}
				isSettingsOpen={isSettingsOpen}
				onCloseSettings={handleCloseSettings}
			/>
			
			<Suspense fallback={null}>
				{isLoginOpen && <LoginBox onClose={handleCloseLogin} />}
			</Suspense>

			<main className={styles.appContainer}>
				<Suspense fallback={<SuspenseLoader />}>
					{activeTab === 'schedule' && (
						<SchedulePage />
					)} 
					{activeTab === 'leagues' && (
						<LeaguesPage />
					)} 
					{activeTab === 'rankings' && (
						<RankingsPage />
					)}
				</Suspense>
			</main>
		</div>
	);
};

export default App;
