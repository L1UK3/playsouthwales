import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import '@/assets/styles/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, useAuth } from '@clerk/react';
import SuspenseLoader from '@/components/SuspenseLoader';
import { SettingsProvider } from './context/SettingsContext';
import { Analytics } from '@vercel/analytics/react';

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        auth: undefined!,
    },
    defaultPendingComponent: () => <SuspenseLoader fullPage />,
});

export function AuthenticatedApp() {
    const auth = useAuth();
    return <RouterProvider router={router} context={{ auth }} />;
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Query Client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
            retry: 1,
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_API_KEY}>
            <QueryClientProvider client={queryClient}>
                <SettingsProvider>
                    <AuthenticatedApp />
                </SettingsProvider>
            </QueryClientProvider>
        </ClerkProvider>
        <Analytics />
    </StrictMode>
);
