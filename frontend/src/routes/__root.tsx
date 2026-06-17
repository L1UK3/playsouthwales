import { createRootRouteWithContext } from '@tanstack/react-router';
import "@/assets/styles/global.css";
import type { useAuth } from '@clerk/react';
import RootComponent from '../components/Root';

// loads useAuth before we even start loading the page so isLoading actually works and we can stop the user from even seeing the admin page
interface RouterContext {
	auth: ReturnType<typeof useAuth>
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});