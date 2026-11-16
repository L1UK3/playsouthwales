import { ClerkProvider } from "@clerk/tanstack-react-start";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Suspense, type ReactNode } from "react";
import { SettingsProvider } from "#/context/SettingsContext";
import { SITE_NAME } from "#/lib/seo";
import appCss from "#/styles.css?url";
import { MobileNavBar } from "#/components/MobileNavBar";
import { SuspenseLoader } from "#/components/SuspenseLoader";
import Header from "#/components/Header";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: SITE_NAME },
			{
				name: "description",
				content:
					"Events, leagues and championship rankings for TCG and VGC players across South Wales.",
			},
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
	component: RootLayout,
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ClerkProvider>
					{children}
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "TanStack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}

function RootLayout() {
	return (
		<SettingsProvider>
			<div className="appRoot">
				<Header />

				<main className="appContainer pb-20 sm:pb-4">
					<Suspense fallback={<SuspenseLoader />}>
						<Outlet />
					</Suspense>
				</main>

				<MobileNavBar />
			</div>
		</SettingsProvider>
	);
}
