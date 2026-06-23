import { type EventTypeMap } from '@/types/EventTypeMap';

export const EVENT_TYPE_MAP: EventTypeMap = {
    "CASUAL": "C",
    "STANDARD": "S",
    "CHALLENGE": "🏅",
    "CUP": "🏆",
    "PRE-RELEASE": "PR",
    "SPECIAL": "📍",
    "REGIONAL": "📍",
    "INTERNATIONAL": "INT",
    "WORLDS": "🌍"
};

// eslint-disable-next-line react-x/no-unnecessary-use-prefix
export function useEventTypeMap() {
    return {
        data: EVENT_TYPE_MAP,
        isLoading: false,
        error: null as Error | null
    };
}
