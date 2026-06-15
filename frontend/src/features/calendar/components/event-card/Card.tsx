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
            className={`flex justify-between items-center gap-1.5 py-2 px-2.5 rounded-[10px] bg-(--type-bg) text-text-main text-xs font-bold cursor-pointer transition-all duration-200 border-l-[6px] border-l-(--store-color,var(--type-border)) hover:bg-(--type-border)/20 max-sm:text-[11px] max-sm:py-1.5 max-sm:px-2 type-${event.type} ${isOtherMonth ? "opacity-50" : ""}`}
            style={{ '--store-color': storeColor } as React.CSSProperties}
        >
            <span className="truncate min-w-0">{leagueName}</span>
            <span className="shrink-0 text-[11px] text-text-muted">{types[event.type] ?? event.type}</span>
        </div>
    );
});

export default Card;
