import { useCallback, useSyncExternalStore } from 'react';

/**
 * Returns whether a CSS media query currently matches, and re-renders when it changes.
 * @param query - A media query string, for example '(max-width: 991px)'.
 */
export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback(
        (onChange: () => void) => {
            const mediaQuery = window.matchMedia(query);
            mediaQuery.addEventListener('change', onChange);
            return () => mediaQuery.removeEventListener('change', onChange);
        },
        [query]
    );

    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches,
        () => false
    );
}
