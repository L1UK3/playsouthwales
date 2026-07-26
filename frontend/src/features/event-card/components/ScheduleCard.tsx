/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V4 */
/* Hallmark · component: card · genre: modern-minimal · theme: custom (design.md)
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 */
import React from 'react';

import { useEventCard } from '../hooks/useEventCard';
import type {
    EventCardProps,
    EventCardAdditionalProps,
} from '../types/EventCard.types';
import {
    TAG_BASE_CLASSES,
    TAG_STYLE_PROPERTIES,
} from '../constants/EventCard.constants';

/**
 * EventCard component displays information about a single event.
 * Redesigned with a soft tone, microinteraction states, and no nested cards.
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 * @param types {EventTypeMap} - A mapping of event types to their corresponding properties.
 * @param state {EventCardAdditionalProps['state']} - The current state of the card.
 * @returns A React component rendering the event card with appropriate styles and states.
 */
const EventCard: React.FC<EventCardProps & EventCardAdditionalProps> =
    React.memo(({ event, leagueMap, types, state }) => {
        const {
            league,
            leagueName,
            storeColor,
            stateFlags,
            cardClasses,
            isOfficial,
        } = useEventCard(event, leagueMap, state, 'schedule');
        const { isLoading, isError, isReleaseCard } = stateFlags;

        // Loading state (Skeleton layout)
        if (isLoading) {
            return (
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-border-color/40 bg-bg-card shadow-sm animate-pulse w-full max-w-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-bg-main shrink-0" />
                        <div className="flex flex-col gap-1.5 grow">
                            <div className="h-3 w-16 bg-bg-main rounded" />
                            <div className="h-4 w-32 bg-bg-main rounded" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <div className="h-5 w-20 bg-bg-main rounded-full" />
                        <div className="h-5 w-12 bg-bg-main rounded-full" />
                    </div>
                    <div className="h-3 w-full bg-bg-main rounded mt-1.5" />
                    <div className="h-3 w-3/4 bg-bg-main rounded" />
                    <div className="h-9 w-full bg-bg-main rounded-md mt-3" />
                </div>
            );
        }

        // Error state fallback banner inside card
        if (isError) {
            return (
                <div className="flex flex-col gap-2 p-4 rounded-xl border-2 border-red-500/20 bg-red-500/2 shadow-sm w-full max-w-sm">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                        <span></span>
                        <span>Failed to load event details</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                        Something went wrong while retrieving info for this
                        event. Please try again.
                    </p>
                </div>
            );
        }

        if (isReleaseCard) {
            return (
                <div
                    className={cardClasses}
                    style={
                        { '--store-color': storeColor } as React.CSSProperties
                    }
                >
                    <div className="flex items-start gap-3">
                        {/* Metadata & Title */}
                        <div className="flex flex-col gap-0.5 grow min-w-0">
                            <h3 className="font-bold text-text-darker text-[15px] font-sans tracking-tight leading-snug truncate">
                                {event.name}
                            </h3>
                        </div>
                    </div>

                    {/* Event Format Tags */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                        <span
                            className={`${TAG_BASE_CLASSES} px-2.5 py-0.5 rounded-full type-${event.eventType}`}
                            style={TAG_STYLE_PROPERTIES as React.CSSProperties}
                        >
                            {event.eventType}
                        </span>
                        <span className="text-[9px] font-semibold text-text-muted bg-bg-main px-2 py-0.5 rounded-full border border-border-color/60 uppercase tracking-wider">
                            {event.game === 'ALL' ? 'TCG, VGC, GO' : event.game}
                        </span>
                        <span className="text-[9px] font-semibold text-text-muted bg-bg-main px-2 py-0.5 rounded-full border border-border-color/60 uppercase tracking-wider bg-white/20 text-white border-white/30">
                            Official
                        </span>
                    </div>

                    {/* Description */}
                    <div className="text-xs leading-relaxed text-text-muted border-l-2 border-border-color/80 pl-3 mt-1.5">
                        {event.description}
                    </div>
                </div>
            );
        }

        return (
            <div
                className={cardClasses}
                style={{ '--store-color': storeColor } as React.CSSProperties}
            >
                <div className="flex items-start gap-3">
                    {/* League Logo */}
                    {league?.logo ? (
                        <img
                            src={league.logo}
                            alt={`${leagueName} Logo`}
                            width="36"
                            height="36"
                            loading="lazy"
                            decoding="async"
                            className="size-9 rounded-lg object-contain bg-white border border-border-color shrink-0 p-1 transition-transform duration-200 group-hover:scale-105"
                        />
                    ) : (
                        <div className="size-9 rounded-lg bg-bg-main border border-border-color shrink-0 flex items-center justify-center text-sm font-bold text-text-muted">
                            {leagueName.charAt(0)}
                        </div>
                    )}

                    {/* Metadata & Title */}
                    <div className="flex flex-col gap-0.5 grow min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex flex-wrap items-center gap-1.5 leading-none">
                            <span className="">{leagueName}</span>
                        </div>
                        <h3 className="font-bold text-text-darker text-[15px] font-sans tracking-tight leading-snug">
                            {event.name}
                        </h3>
                    </div>
                </div>

                {/* Event Format Tags */}
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span
                        className={`${TAG_BASE_CLASSES} px-2.5 py-0.5 rounded-full type-${event.eventType}`}
                        style={TAG_STYLE_PROPERTIES as React.CSSProperties}
                    >
                        {isOfficial
                            ? `${types[event.eventType]}` + ` ${event.eventType}`
                            :
                            event.eventType}


                    </span>
                    <span className="text-[9px] font-semibold text-text-muted bg-bg-main px-2 py-0.5 rounded-full border border-border-color/60 uppercase tracking-wider">
                        {event.game === 'ALL' ? 'TCG, VGC, GO' : event.game}
                    </span>
                    {isOfficial && (
                        <span className="text-[9px] font-semibold text-text-muted bg-bg-main px-2 py-0.5 rounded-full border border-border-color/60 uppercase tracking-wider bg-white/20 text-white border-white/30">
                            Official
                        </span>
                    )}
                </div>

                {/* Time & Cost Info */}
                <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5 leading-none">
                    {event.startTime && (
                        <div className="flex items-center gap-1.5">
                            <span className="opacity-75"></span>
                            <span>{event.startTime}</span>
                        </div>
                    )}
                    {event.entryFee && (
                        <div className="flex items-center gap-1.5">
                            <span className="opacity-75"></span>
                            <span>{event.entryFee}</span>
                        </div>
                    )}
                </div>

                {/* Description & Prizes (No nested card structures) */}
                {event.description && (
                    <div className="text-xs leading-relaxed text-text-muted border-l-2 border-border-color/80 pl-3 mt-1.5">
                        {event.description}
                    </div>
                )}
                {event.prizes && (
                    <div className="text-xs leading-relaxed text-text-muted pl-3 border-l-2 border-amber-500/40 mt-1 flex gap-1.5 items-start">
                        <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">
                            Prizes:
                        </span>
                        <span>{event.prizes}</span>
                    </div>
                )}

                {/* Action Button */}
                {event.ticketLink && (
                    <a
                        href={event.ticketLink}
                        className="btn btn-primary w-full justify-center mt-2.5"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Tickets & Info
                    </a>
                )}
            </div>
        );
    });

export default EventCard;
