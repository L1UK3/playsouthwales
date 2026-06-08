import { useQuery } from '@tanstack/react-query';
import { loadTypes } from '@/services/api';
import type { EventTypes } from '@/types/EventTypes';

export function useEventTypes() {
    return useQuery<EventTypes>({
        queryKey: ['eventTypes'],
        queryFn: loadTypes,
    });
}
