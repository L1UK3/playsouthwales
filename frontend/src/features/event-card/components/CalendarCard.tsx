/* Hallmark ◆ genre: modern-minimal ◆ component: Card ◆ design-system: design.md ◆ designed-as-app */
import React from 'react';
import type { EventCardProps } from '../types/EventCard.types';
import { useEventCard } from '../hooks/useEventCard';

/**
 * Additional props for the CalendarCard component.
 * @property {boolean} [isOtherMonth] - Indicates if the card is for a day in another month, which may affect its styling.
 */
export interface CalendarCardProps extends EventCardProps {
    isOtherMonth?: boolean;
}

/**
 * CalendarCard component represents a single event entry within a calendar cell.
 * @param {CalendarCardProps} props - The properties passed to the component including the event, leagueMap, and event types.
 * @returns {JSX.Element} The rendered card component.
 */
const CalendarCard: React.FC<CalendarCardProps> = React.memo(
    ({ event, leagueMap, types, isOtherMonth }) => {
        const { league, leagueName, storeColor, cardClasses, stateFlags } =
            useEventCard(event, leagueMap, undefined, 'calendar');

        const logo = league?.logo ?? null;
        const isReleaseEvent = stateFlags.isReleaseCard;

        return (
            <div
                className={`
                    ${cardClasses}
                    flex justify-between
                    items-center gap-1.5 py-1 px-2
                    calendar-card
                    text-text-main text-[10px]
                    font-semibold
                    cursor-pointer
                    min-w-0 w-full
                    max-sm:text-[8.5px]
                    max-sm:py-0.5 max-sm:px-1.5
                    max-sm:gap-1
                    type-${event.eventType}
                    ${isOtherMonth ? 'opacity-35! grayscale! pointer-events-none!' : ''}
                `}
                style={{ '--store-color': storeColor } as React.CSSProperties}
            >
                <span className="truncate min-w-0">
                    {logo && (
                        <img
                            src={logo}
                            className="rounded-full object-cover text-align-left w-4 h-4 max-sm:w-3.5 max-sm:h-3.5"
                        />
                    )}
                </span>
                <span className="truncate min-w-0 text-align-left">
                    {(isReleaseEvent && event.name) || leagueName}
                </span>
                <span className="shrink-0 text-[8.5px] max-sm:text-[7.5px] rounded-full px-1 py-0 text-right type-${event.eventType} bg-white text-black dark:bg-white dark:text-black">
                    {types[event.eventType] ?? event.eventType}
                </span>
            </div>
        );
    }
);

export default CalendarCard;
