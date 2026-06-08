import { useQuery } from '@tanstack/react-query';
import { loadEvents } from '@/services/api';
import type { Event } from '@/types/Event';

/**
 * Hook to fetch events for the current month.
 * 
 * @param currentDate The current date representing the primary month to display.
 */
export function useEvents(currentDate: Date) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    return useQuery<Event[]>({
        queryKey: ['events', year, month],
        queryFn: () => loadEvents(month, year),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
