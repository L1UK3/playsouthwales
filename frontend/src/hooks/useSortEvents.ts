import type { Event } from '@/types/Event';
import React from 'react';

export function useSortEvents(eventsForDay: Event[]) {
    return React.useMemo(() => {
        return [...eventsForDay].sort((a, b) => {
            const aIsSetEvent =
                a.eventType === 'LEGALITY' ||
                a.eventType === 'RELEASE' ||
                a.eventType === 'REGULATION';
            const bIsSetEvent =
                b.eventType === 'LEGALITY' ||
                b.eventType === 'RELEASE' ||
                b.eventType === 'REGULATION';
            if (aIsSetEvent && !bIsSetEvent) return -1;
            if (!aIsSetEvent && bIsSetEvent) return 1;
            return 0;
        });
    }, [eventsForDay]);
}
