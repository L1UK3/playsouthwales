import { type EventTypes } from '@/types/EventTypes';

export const EVENT_TYPES: EventTypes = {
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
export function useEventTypes() {
    return {
        data: EVENT_TYPES,
        isLoading: false,
        error: null as Error | null
    };
}
