import { useState } from 'react';
import SchedulePage from '@pages/schedule/SchedulePage';
import Header from '@layouts/header/Header';
import { useOverlay } from '@hooks/useOverlay';
import LoginBox from './components/login/LoginBox';
import LeaguesPage from '@pages/leagues/LeaguesPage';
import RankingsPage from '@pages/rankings/RankingsPage';
import styles from './App.module.css';

export type ActiveTab = 'schedule' | 'leagues' | 'rankings';

/**
 * Main application component that orchestrates the state, data fetching, 
 * and routing between the Schedule and Leagues pages.
 * @returns {JSX.Element} The rendered application component.
 */
function App() {
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
			{isLoginOpen && <LoginBox onClose={handleCloseLogin} />}

			<main className={styles.appContainer}>
				{activeTab === 'schedule' && (
					<SchedulePage />
				)} {activeTab === 'leagues' && (
					<LeaguesPage />
				)} {activeTab === 'rankings' && (
					<RankingsPage />
				)}
			</main>
		</div>
	);
}

export default App;
