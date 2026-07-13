import React from 'react';

import type { EventCardProps } from '@calendar/types/EventCard.types';

/**
 * EventCard component displays information about a single event.
 * It supports two variants: 'default' (full details) and 'list' (expandable summary).
 * @param {EventCardProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered event card.
 */
const EventCard: React.FC<EventCardProps> = React.memo(
    ({ event, leagueMap, types }) => {
        const league =
            event.leagueId && event.leagueId !== -1
                ? leagueMap[event.leagueId]
                : null;
        const leagueName =
            event.eventType === 'LEGALITY'
                ? 'Standard TCG Legality'
                : (league?.name ?? event.leagueName ?? 'Unknown League');
        const storeColor =
            event.eventType === 'LEGALITY'
                ? 'var(--secondary)'
                : (league?.brandColor ??
                    `hsl(${((event.leagueId ?? 0) * 137) % 360}, 70%, 50%)`);

        return (
            <div
                className={`flex flex-col gap-2 p-3.5 rounded-lg shadow-main calendar-card text-white! type-${event.eventType} ${league?.isChampionshipSeries ? 'border-2 border-amber-500/50 bg-linear-to-br from-amber-500/10 to-transparent' : ''}`}
                style={{ '--store-color': storeColor } as React.CSSProperties}
            >
                <div className="flex flex-col gap-2">
                    {/* Event Name and Type */}
                    <div className="flex flex-col gap-0.5">
                        <div className="font-bold text-white text-base flex items-center gap-1.5">
                            {league?.isChampionshipSeries && (
                                <span className="text-amber-500 text-sm">
                                    🏆
                                </span>
                            )}
                            <span>{event.name}</span>
                        </div>
                        <div className="text-xs font-semibold text-white/80">
                            {`[${types[event.eventType] ?? '⚖️'}] ${event.eventType} • ${event.game}`}
                        </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                            {league?.logo && (
                                <img
                                    src={league.logo}
                                    alt={`${leagueName} Logo`}
                                    width="20"
                                    height="20"
                                    loading="lazy"
                                    decoding="async"
                                    className="size-5 rounded object-contain bg-white border border-border-color shrink-0 p-px"
                                />
                            )}
                            <div className="text-xs font-medium text-white/90">
                                {leagueName}
                            </div>
                        </div>
                        <div className="text-[12px] text-white/75">
                            {event.startTime ?? ''}{' '}
                            {event.entryFee ? `• ${event.entryFee}` : ''}
                        </div>
                    </div>

                    {event.description ? (
                        <div
                            className={
                                'text-xs leading-relaxed text-white/75 bg-white/5 p-2 rounded-lg'
                            }
                        >
                            {event.description}
                        </div>
                    ) : null}
                    {event.prizes ? (
                        <div
                            className={
                                'text-xs text-amber-300 bg-white/10 p-2 rounded-lg border border-white/20 flex gap-2 [&_strong]:text-white'
                            }
                        >
                            <strong>Prizes:</strong> {event.prizes}
                        </div>
                    ) : null}
                    {event.ticketLink ? (
                        <a
                            href={event.ticketLink}
                            className={'btn btn-primary mt-2'}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Tickets & Info
                        </a>
                    ) : null}
                </div>
            </div>
        );
    }
);

export default EventCard;
