import { useState } from 'react';
import { SchedulePage, Header, useOverlay } from '@playwales/shared';
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
		isSettingsOpen, handleSettingsBox, handleCloseSettings,
	} = useOverlay();

	return (
		<div className={styles.appRoot}>
			<Header
				activeTab={activeTab}
				onTabChange={setActiveTab}
			
				onSettingsBox={handleSettingsBox}
				isSettingsOpen={isSettingsOpen}
				onCloseSettings={handleCloseSettings}
			/>

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
