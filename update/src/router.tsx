import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { NotFound, RouteError, RoutePending } from "./components/RouteStatus";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	return createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultErrorComponent: RouteError,
		defaultNotFoundComponent: NotFound,
		defaultPendingComponent: RoutePending,
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
