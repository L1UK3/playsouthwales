/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import SuspenseLoader from '@components/suspense-loader/SuspenseLoader';
import Header from '@layouts/Header';
import "@/assets/styles/global.css";

const RootComponent = () => {
	return (
		<div>
			<Header />

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
