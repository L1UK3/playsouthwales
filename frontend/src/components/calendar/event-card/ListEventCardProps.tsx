import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

export interface ListEventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
    isExpanded: boolean;
    onToggle: () => void;
}
