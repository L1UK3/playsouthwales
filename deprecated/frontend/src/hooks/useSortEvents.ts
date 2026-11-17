import type { Event } from '@/types/Event';
import React from 'react';

/** Matches backend `app/services/event_hierarchy.py` schedule ordering. */
const EVENT_TYPE_PRIORITY: Record<string, number> = {
    LEGALITY: 0,
    RELEASE: 0,
    REGULATION: 0,
    WORLDS: 1,
    INTERNATIONAL: 1,
    REGIONAL: 1,
    SPECIAL: 1,
    CUP: 2,
    CHALLENGE: 3,
    'PRE-RELEASE': 4,
    STANDARD: 5,
    CASUAL: 6,
};

const UNKNOWN_SCHEDULE_PRIORITY =
    Math.max(...Object.values(EVENT_TYPE_PRIORITY), -1) + 1;

function getEventTypePriority(eventType: string | undefined): number {
    if (!eventType) {
        return UNKNOWN_SCHEDULE_PRIORITY;
    }
    const normalized = eventType.trim().toUpperCase();
    return EVENT_TYPE_PRIORITY[normalized] ?? UNKNOWN_SCHEDULE_PRIORITY;
}

function scheduleSortKey(event: Event): [string, number, string] {
    const date = event.date.slice(0, 10);
    const start = event.startTime ?? '';
    return [date, getEventTypePriority(event.eventType), start];
}

function compareScheduleKeys(
    a: [string, number, string],
    b: [string, number, string]
): number {
    if (a[0] !== b[0]) {
        return a[0] < b[0] ? -1 : 1;
    }
    if (a[1] !== b[1]) {
        return a[1] - b[1];
    }
    if (a[2] !== b[2]) {
        return a[2] < b[2] ? -1 : 1;
    }
    return 0;
}

/**
 * Re-applies public schedule order (date, event type rank, start time) after
 * client-side merges (weekly expansion, virtual markers). Pure API slices that
 * are already ordered stay in the same relative order (stable sort).
 */
export function eventsInScheduleOrder(events: Event[]): Event[] {
    if (events.length <= 1) {
        return events;
    }
    return [...events].sort((left, right) =>
        compareScheduleKeys(scheduleSortKey(left), scheduleSortKey(right))
    );
}

export function useSortEvents(events: Event[]) {
    return React.useMemo(() => eventsInScheduleOrder(events), [events]);
}
