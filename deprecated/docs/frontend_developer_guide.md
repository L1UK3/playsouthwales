---
meta.contentType: How-to
---

# How to develop and extend the React frontend

This guide explains how to add routes with TanStack Router, fetch API data with TanStack Query, authenticate requests with Clerk, and style components using modern-minimal design tokens.

## Add a new route

The application uses TanStack Router file-based routing with code splitting.

1. Create a page component in [frontend/src/pages/](file:///d:/Projects/playsouthwales/frontend/src/pages/):

    ```tsx
    // src/pages/AboutPage.tsx
    export default function AboutPage() {
        return (
            <main className="p-6">
                <h1 className="text-2xl font-bold font-display text-(--color-ink)">
                    About Play! South Wales
                </h1>
                <p className="mt-2 text-(--color-ink-2)">
                    Connecting competitive Pokémon communities across South
                    Wales.
                </p>
            </main>
        );
    }
    ```

2. Register the route in [frontend/src/routes/](file:///d:/Projects/playsouthwales/frontend/src/routes/):

    ```tsx
    // src/routes/about.lazy.tsx
    import { createLazyFileRoute } from '@tanstack/react-router';
    import AboutPage from '@/pages/AboutPage';

    export const Route = createLazyFileRoute('/about')({
        component: AboutPage,
    });
    ```

Vite automatically rebuilds `src/routeTree.gen.ts` whenever you add or modify route files.

## Fetch data with TanStack Query

Define asynchronous API fetch functions in [frontend/src/services/api.ts](file:///d:/Projects/playsouthwales/frontend/src/services/api.ts).

1. Write an API request helper:

    ```typescript
    export async function fetchLeagues() {
        const response = await fetch('/api/leagues');
        if (!response.ok) {
            throw new Error('Failed to fetch leagues');
        }
        return response.json();
    }
    ```

2. Query the data inside your React component:

    ```tsx
    import { useQuery } from '@tanstack/react-query';
    import { fetchLeagues } from '@/services/api';

    export function LeagueList() {
        const { data, isLoading, error } = useQuery({
            queryKey: ['leagues'],
            queryFn: fetchLeagues,
        });

        if (isLoading)
            return <p className="text-(--color-ink-2)">Loading leagues...</p>;
        if (error)
            return (
                <p className="text-(--color-accent)">Error loading leagues</p>
            );

        return (
            <div className="flex flex-col gap-3">
                {data?.map((league: any) => (
                    <div
                        key={league.id}
                        className="p-4 rounded-md bg-(--color-paper-2) border border-(--color-rule)"
                    >
                        <h3 className="font-display font-bold text-(--color-ink)">
                            {league.name}
                        </h3>
                        <p className="text-sm text-(--color-ink-2)">
                            {league.location}
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    ```

## Authenticate requests with Clerk

Use the Clerk React SDK to access user session tokens for administrative API mutations:

```tsx
import { useAuth } from '@clerk/react';

export function AdminActionButton() {
    const { isSignedIn, getToken } = useAuth();

    const handleAction = async () => {
        const token = await getToken();
        await fetch('/api/events/sync-pokedata', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    };

    if (!isSignedIn) return null;

    return (
        <button
            onClick={handleAction}
            className="px-4 py-2 font-display font-bold text-white bg-(--color-accent) rounded"
        >
            Run Sync
        </button>
    );
}
```

## Apply design system tokens

Style all interface elements using Tailwind CSS v4 and the modern-minimal design tokens defined in [frontend/design.md](file:///d:/Projects/playsouthwales/frontend/design.md):

- **Backgrounds**: `bg-[var(--color-paper)]` for pages and `bg-[var(--color-paper-2)]` for cards.
- **Text**: `text-[var(--color-ink)]` for primary headers and `text-[var(--color-ink-2)]` for muted copy.
- **Borders**: `border-[var(--color-rule)]` for clean structural dividers.
- **Accents**: `bg-[var(--color-accent)]` for primary calls to action.
- **Typography**: `font-display` (Outfit) for headings and `font-sans` (Geist) for body copy.

## Verify frontend changes

Run linting, formatting, and build scripts before submitting code:

```bash
cd frontend

# Lint TypeScript code
npm run lint

# Format code with Prettier
npm run format

# Run production build check
npm run build
```
