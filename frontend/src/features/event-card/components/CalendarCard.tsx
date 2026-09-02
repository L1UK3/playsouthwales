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
        const displayName =
            isReleaseEvent && event.name ? event.name : leagueName;

        return (
            <div
                className={`
                    ${cardClasses}
                    flex justify-between items-center
                    gap-0.5 @min-[700px]:gap-1.5
                    py-[1.5px] px-1 @min-[700px]:py-1 @min-[700px]:px-2
                    calendar-card
                    text-text-main
                    font-semibold
                    cursor-pointer
                    min-w-0 w-full
                    rounded-[3px] @min-[700px]:rounded-sm
                    type-${event.eventType}
                    ${isOtherMonth ? 'opacity-35! grayscale! pointer-events-none!' : ''}
                `}
                style={{ '--store-color': storeColor } as React.CSSProperties}
            >
                {logo ? (
                    <img
                        src={logo}
                        alt=""
                        className="rounded-full object-cover shrink-0 size-3 @min-[700px]:size-4"
                    />
                ) : (
                    <span
                        className="size-1.5 @min-[700px]:size-2 rounded-full shrink-0"
                        style={{ backgroundColor: storeColor }}
                    />
                )}
                <span className="truncate min-w-0 flex-1 text-left text-[7.5px] @min-[700px]:text-[10px] leading-tight">
                    {displayName}
                </span>
                <span className="shrink-0 text-[8.5px] max-sm:text-[7.5px] rounded-full px-1 py-0 text-right type-${event.eventType} bg-white text-black dark:bg-white dark:text-black">
                    {types[event.eventType] ?? event.eventType}
                </span>
            </div>
        );
    }
);

export default CalendarCard;
