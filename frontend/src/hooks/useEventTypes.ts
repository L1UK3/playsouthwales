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

export function useEventTypes() {
    return {
        data: EVENT_TYPES,
        isLoading: false,
        error: null as Error | null
    };
}
