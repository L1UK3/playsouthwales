import { useQuery } from '@tanstack/react-query';
import { loadTop20Players } from '@/services/api';
import type { Top20Response } from '@/services/api';

export function useTop20Players(season?: string) {
    return useQuery<Top20Response>({
        queryKey: ['top20', season],
        queryFn: () => loadTop20Players(season),
    });
}
