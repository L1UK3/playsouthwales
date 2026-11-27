import { useMemo, useState } from 'react';
import { useEvents } from '@/hooks';
import type { Event } from '@/types/Event';

/**
 * Formats a date as YYYY-MM-DD in local time, matching event date strings.
 */
function toDateKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Returns a league's next events, from today onwards.
 *
 * It reads this month and next month through useEvents, so it shares the
 * Schedule page's cache and includes weekly recurring events. Reading two
 * months keeps the list filled near the end of a month.
 */
export function useLeagueUpcomingEvents(leagueId: number, limit: number) {
    // Fixed for the component's lifetime, so the query keys stay stable.
    const [{ thisMonth, nextMonth, todayKey }] = useState(() => {
        const now = new Date();
        return {
            thisMonth: new Date(now.getFullYear(), now.getMonth(), 1),
            nextMonth: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            todayKey: toDateKey(now),
        };
    });

    const current = useEvents(thisMonth);
    const next = useEvents(nextMonth);

    const events = useMemo<Event[]>(() => {
        const all = [...(current.data ?? []), ...(next.data ?? [])];

        return all
            .filter(
                (event) =>
                    event.leagueId === leagueId &&
                    !event.isExcluded &&
                    event.date.slice(0, 10) >= todayKey
            )
            .sort((a, b) => {
                const byDate = a.date
                    .slice(0, 10)
                    .localeCompare(b.date.slice(0, 10));
                return byDate !== 0
                    ? byDate
                    : (a.startTime ?? '').localeCompare(b.startTime ?? '');
            })
            .slice(0, limit);
    }, [current.data, next.data, leagueId, todayKey, limit]);

    return {
        events,
        isLoading: current.isLoading || next.isLoading,
        isError: current.isError || next.isError,
    };
}

export default useLeagueUpcomingEvents;
