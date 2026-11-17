import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
    beforeLoad: async ({ context }) => {
        // Wait for Clerk to finish loading
        await context.auth.isLoaded;

        if (!context.auth.isSignedIn) {
            throw redirect({ to: '/' });
        }
    },
});
