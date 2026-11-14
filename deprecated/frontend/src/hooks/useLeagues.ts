import { useQuery } from '@tanstack/react-query';
import { loadLeagues } from '@services/api';
import type { League } from '@/types/League';

export function useLeagues() {
    return useQuery<League[]>({
        queryKey: ['leagues'],
        queryFn: loadLeagues,
        staleTime: 1000 * 60 * 30, // 30 minutes (leagues change very infrequently)
    });
}
