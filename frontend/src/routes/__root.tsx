import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import useHeaderLogic from '@/hooks/useHeaderLogic';
import SuspenseLoader from '@/components/SuspenseLoader';
import Header from '@layouts/Header';
import "@/assets/styles/global.css";
import type { useAuth } from '@clerk/react';

//loads useAuth before we even start loading the page so isLoading actually works and we can stop the user from even seeing the admin page
interface RouterContext {
	auth: ReturnType<typeof useAuth>
}
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

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
})