import type { Event } from '@/types/Event';
import React from 'react';

/**
 * Display rank for each event type. Lower ranks render higher in the stack.
 * Types that share a rank keep their chronological order.
 */
export const EVENT_TYPE_PRIORITY: Record<string, number> = {
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

const UNKNOWN_PRIORITY = Object.keys(EVENT_TYPE_PRIORITY).length;

/**
 * Returns the display rank of an event type. Unknown types sort last.
 * @param eventType {string} - The type of the event.
 * @returns {number} The display rank.
 */
export const getEventTypePriority = (eventType: string): number =>
    EVENT_TYPE_PRIORITY[eventType.trim().toUpperCase()] ?? UNKNOWN_PRIORITY;

/**
 * Orders events by date, then event type hierarchy, then start time.
 * @param a {Event} - The first event.
 * @param b {Event} - The second event.
 * @returns {number} A negative, zero, or positive sort value.
 */
export const compareEvents = (a: Event, b: Event): number =>
    a.date.slice(0, 10).localeCompare(b.date.slice(0, 10)) ||
    getEventTypePriority(a.eventType) - getEventTypePriority(b.eventType) ||
    (a.startTime ?? '').localeCompare(b.startTime ?? '');

export function useSortEvents(events: Event[]) {
    return React.useMemo(() => [...events].sort(compareEvents), [events]);
}
