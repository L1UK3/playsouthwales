import { EVENT_TYPE_MAP } from '@/constants';

// eslint-disable-next-line react-x/no-unnecessary-use-prefix
export function useEventTypeMap() {
    return {
        data: EVENT_TYPE_MAP,
        isLoading: false,
        error: null as Error | null,
    };
}
