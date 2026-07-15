import type { Event } from '@/types/Event';
import React from 'react';

export function useSortEvents(eventsForDay: Event[]) {
    return React.useMemo(() => {
        return [...eventsForDay].sort((a, b) => {
            const aIsSetEvent =
                a.eventType === 'LEGALITY' || a.eventType === 'RELEASE';
            const bIsSetEvent =
                b.eventType === 'LEGALITY' || b.eventType === 'RELEASE';
            if (aIsSetEvent && !bIsSetEvent) return -1;
            if (!aIsSetEvent && bIsSetEvent) return 1;
            return 0;
        });
    }, [eventsForDay]);
}
