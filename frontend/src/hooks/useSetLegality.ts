import { useQuery } from '@tanstack/react-query';
import { loadSetLegality } from '@services/api';

export function useSetLegality() {
    return useQuery<any[]>({
        queryKey: ['set-legality'],
        queryFn: loadSetLegality,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours (legality sets change very infrequently)
    });
}
