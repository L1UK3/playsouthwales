import type { Event } from '../../../../types/Event';
import type { EventTypes } from '../../../../types/EventTypes';
import type { League } from '../../../../types/League';

export interface EventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
}
