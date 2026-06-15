import React from 'react';

import type { EventCardProps } from '@calendar/types/EventCard.types';

/**
 * EventCard component displays information about a single event.
 * It supports two variants: 'default' (full details) and 'list' (expandable summary).
 * @param {EventCardProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered event card.
 */
const EventCard: React.FC<EventCardProps> = React.memo(({
    event,
    leagueMap,
    types
}) => {
    const league = event.leagueId ? leagueMap[event.leagueId] : null;
    const leagueName = league?.name ?? event.leagueName ?? 'Unknown League';
    const storeColor = league?.brandColor ?? `hsl(${(event.leagueId ?? 0) * 137 % 360}, 70%, 50%)`;

    return (
        <div className={`flex flex-col gap-3 p-5 rounded-lg shadow-main border-l-8 border-l-(--store-color,var(--type-border)) gradient-card type-${event.type}`} style={{ '--store-color': storeColor } as React.CSSProperties}>
            <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                    <div className="font-bold text-text-main text-lg">{event.name}</div>
                    <div className="text-sm font-semibold text-type-text">
                        {types[event.type] ? `${types[event.type]} ` : ''}{event.type} • {event.game}
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-text-darker">{leagueName}</div>
                    <div className="text-[13px] text-text-muted">
                        {event.startTime ?? ''} {event.entryFee ? `• ${event.entryFee}` : ''}
                    </div>
                </div>

                {event.description ? <div className={"text-sm leading-relaxed text-text-muted bg-white/5 p-3 rounded-lg"}>{event.description}</div> : null}
                {event.prizes ? (
                    <div className={"text-sm text-amber-400 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20 flex gap-2 [&_strong]:text-text-main"}>
                        <strong>Prizes:</strong> {event.prizes}
                    </div>
                ) : null}
                {event.ticketLink ? (
                    <a href={event.ticketLink} className={"btn btn-primary mt-2"} target="_blank" rel="noopener noreferrer">
                        Tickets & Info
                    </a>
                ) : null}
            </div>
        </div>
    );
});

export default EventCard;
