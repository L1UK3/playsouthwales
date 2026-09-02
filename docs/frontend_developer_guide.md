---
meta.contentType: How-to
---

# How do I develop and extend the React frontend?

This guide covers creating pages, routing, data fetching, and styling in the frontend.

## Add a new route

The app uses TanStack Router with file-based lazy routing:

1. Create a page component in `src/pages/`:

    ```tsx
    // src/pages/AboutPage.tsx
    export default function AboutPage() {
        return (
            <h1 className="text-xl font-bold font-display text-(--color-ink)">
                About Us
            </h1>
        );
    }
    ```

2. Register the route in `src/routes/`:
    ```tsx
    // src/routes/about.lazy.tsx
    import { createLazyFileRoute } from '@tanstack/react-router';
    import AboutPage from '@/pages/AboutPage';

    export const Route = createLazyFileRoute('/about')({
        component: AboutPage,
    });
    ```

Vite automatically generates `src/routeTree.gen.ts`.

## Fetch data with TanStack Query

1. Add your API function in `src/services/api.ts`:

    ```typescript
    export async function fetchLeagues() {
        const res = await fetch('/api/leagues');
        return res.json();
    }
    ```

2. Query data in your component:
    ```tsx
    import { useQuery } from '@tanstack/react-query';
    import { fetchLeagues } from '@/services/api';

    export function LeagueList() {
        const { data, isLoading } = useQuery({
            queryKey: ['leagues'],
            queryFn: fetchLeagues,
        });

        if (isLoading) return <p>Loading...</p>;
        return (
            <ul>
                {data?.map((l: any) => (
                    <li key={l.id}>{l.name}</li>
                ))}
            </ul>
        );
    }
    ```

## User authentication

Use Clerk's React hooks:

```tsx
import { useAuth } from '@clerk/react';

export function AuthButton() {
    const { isSignedIn, getToken } = useAuth();

    const callApi = async () => {
        const token = await getToken();
        await fetch('/api/events', {
            headers: { Authorization: `Bearer ${token}` },
        });
    };

    return isSignedIn ? (
        <button onClick={callApi}>Manage</button>
    ) : (
        <p>Sign in</p>
    );
}
```

## Styling and tokens

Use Tailwind CSS v4 with OKLCH theme variables from [design.md](../frontend/design.md):

- `bg-[var(--color-paper)]` (sand background)
- `bg-[var(--color-paper-2)]` (cards)
- `text-[var(--color-ink)]` (body text)
- `text-[var(--color-ink-2)]` (muted text)
- `bg-[var(--color-accent)]` (red CTA button)

Fonts: `font-display` (Outfit for headings), `font-sans` (Geist for text), `font-mono` (Geist Mono).

## Verification

```bash
cd frontend
npm run lint
npm run format
npm run build
```
