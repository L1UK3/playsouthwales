import type { Event } from '@/types/Event';
import React from 'react';

/**
 * Events arrive from `/api/events` sorted by date, event type hierarchy, and start time.
 * This helper preserves that order when rendering a day or filtered slice.
 */
export function eventsInScheduleOrder(events: Event[]): Event[] {
    return events;
}

export function useSortEvents(events: Event[]) {
    return React.useMemo(() => eventsInScheduleOrder(events), [events]);
}
