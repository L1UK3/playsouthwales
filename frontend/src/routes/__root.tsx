import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import useHeaderLogic from '@/hooks/useHeaderLogic';
import SuspenseLoader from '@components/suspense-loader/SuspenseLoader';
import Header from '@layouts/Header';
import "@/assets/styles/global.css";

const RootComponent = () => {
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

export const Route = createRootRoute({
	component: RootComponent,
});
