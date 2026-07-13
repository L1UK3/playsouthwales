import { createFileRoute, redirect } from '@tanstack/react-router';
import AdminPage from '@/pages/AdminPage';

export const Route = createFileRoute('/admin')({
    component: AdminPage,
    beforeLoad: async ({ context }) => {
        // Wait for Clerk to finish loading
        await context.auth.isLoaded;

        if (!context.auth.isSignedIn) {
            throw redirect({ to: '/' });
        }
    },
});
