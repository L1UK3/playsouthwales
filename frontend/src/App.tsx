import { useState } from 'react';
import { useOverlay } from './hooks/useOverlay';
import { SchedulePage, useScheduleState, Header } from '@playwales/shared';
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

	const scheduleState = useScheduleState();
	const { leagues } = scheduleState;

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
					<SchedulePage {...scheduleState} />
				)} {activeTab === 'leagues' && (
					<LeaguesPage leagues={leagues} />
				)} {activeTab === 'rankings' && (
					<RankingsPage />
				)}
			</main>
		</div>
	);
}

export default App;
