import { ClerkProvider } from "@clerk/tanstack-react-start";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import HeaderUser from "#/integrations/clerk/header-user";
import { SITE_NAME } from "#/lib/seo";
import appCss from "#/styles.css?url";

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
		<>
			<header className="flex justify-end p-4">
				<HeaderUser />
			</header>
			<main className="mx-auto w-full max-w-7xl px-4 pb-20 sm:pb-4">
				<Outlet />
			</main>
		</>
	);
}
