import React from 'react';
import type { EventCardProps } from '@calendar/types/EventCard.types';


/**
 * Additional props for the Card component.
 * @property {boolean} [isOtherMonth] - Indicates if the card is for a day in another month, which may affect its styling.
 */
export interface CardProps {
    isOtherMonth?: boolean;
}

/**
 * Card component represents a single event entry within a calendar cell.
 * @param {EventCardProps & CardProps} props - The properties passed to the component including the event, leagueMap, and event types.
 * @returns {JSX.Element} The rendered card component.
 */
const Card: React.FC<EventCardProps & CardProps> = React.memo(({ event, leagueMap, types, isOtherMonth }) => {
    const league = event.leagueId ? leagueMap[event.leagueId] : null;
    const leagueName = league?.name ?? event.leagueName ?? 'Event';
    const storeColor = league?.brandColor ?? `hsl(${(event.leagueId ?? 0) * 137 % 360}, 70%, 50%)`;

    return (
        <div
            className={`
                flex justify-between 
                items-center gap-1.5 py-1 px-1.5 
                rounded-md calendar-card
                text-text-main text-[11px] 
                font-bold 
                cursor-pointer 
                max-sm:text-[10px] 
                max-sm:py-1 max-sm:px-1.5 
                type-${event.eventType} 
                ${isOtherMonth ? "opacity-35! grayscale! pointer-events-none!" : ""}
            `}
            style={{ '--store-color': storeColor } as React.CSSProperties}
        >
            <span className="truncate min-w-0">{leagueName}</span>
            <span className="shrink-0 text-[10px] text-text-muted">{types[event.eventType] ?? event.eventType}</span>
        </div>
    );
});

export default Card;
