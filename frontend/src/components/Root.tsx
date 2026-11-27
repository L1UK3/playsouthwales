import Header from "@layouts/Header";
import { Outlet } from "@tanstack/react-router";
import type React from "react";
import { Suspense } from "react";
import MobileNavBar from "@/components/MobileNavBar";
import SuspenseLoader from "@/components/SuspenseLoader";

export const RootComponent: React.FC = () => {
	return (
		<div className="appRoot">
			<Header />

			<main className="appContainer pb-20 sm:pb-4">
				<Suspense fallback={<SuspenseLoader />}>
					<Outlet />
				</Suspense>
			</main>

			<MobileNavBar />
		</div>
	);
};

export default RootComponent;
