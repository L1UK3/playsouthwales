import { useQuery } from '@tanstack/react-query';
import { loadRegs } from '@services/api';

export function useRegs() {
    return useQuery<any[]>({
        queryKey: ['regs'],
        queryFn: loadRegs,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours (legality sets change very infrequently)
    });
}
