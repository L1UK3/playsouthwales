import { useQuery } from '@tanstack/react-query';
import { loadChampionshipsEvents } from '@services/api';

export function useChampionshipsEvents() {
    return useQuery<any[]>({
        queryKey: ['championships-events'],
        queryFn: loadChampionshipsEvents,
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
    });
}
