/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V4 */
/* Hallmark · component: card · genre: modern-minimal · theme: custom (design.md)
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 */
import React from 'react';

import type { EventCardProps } from '@calendar/types/EventCard.types';

interface EventCardAdditionalProps {
    state?:
    | 'default'
    | 'hover'
    | 'focus'
    | 'active'
    | 'disabled'
    | 'loading'
    | 'error'
    | 'success';
}

/**
 * EventCard component displays information about a single event.
 * Redesigned with a soft tone, microinteraction states, and no nested cards.
 */
const EventCard: React.FC<EventCardProps & EventCardAdditionalProps> =
    React.memo(({ event, leagueMap, types, state }) => {
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
                ? 'var(--color-secondary)'
                : (league?.brandColor ??
                    `hsl(${((event.leagueId ?? 0) * 137) % 360}, 65%, 55%)`);

        // Resolve states
        const isHover = state === 'hover';
        const isFocus = state === 'focus';
        const isActive = state === 'active';
        const isDisabled = state === 'disabled';
        const isLoading = state === 'loading';
        const isError = state === 'error';
        const isSuccess = state === 'success';
        const isReleaseCard =
            event.eventType === 'RELEASE' || event.eventType === 'LEGALITY';

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

        // Success state styling adjustment
        const successBorder = isSuccess
            ? 'border-2 border-emerald-500/30 bg-emerald-500/[0.01]'
            : '';

        // Championship series decoration
        const isChampionship = league?.isChampionshipSeries ?? false;
        const champStyles = isChampionship
            ? 'border-2 border-amber-500/40 bg-linear-to-br from-yellow-600/[0.5] to-transparent shadow-md shadow-amber-500/5'
            : 'border-2 border-(--store-color) bg-solid-gold shadow-[0_0_8px_color-mix(in_oklch,var(--store-color)_15%,transparent)]';

        // Combine wrapper styling
        const cardClasses = `
            flex flex-col gap-3 p-4 rounded-xl transition-all duration-200 outline-hidden
            ${champStyles}
            ${successBorder}
            ${isHover ? '-translate-y-0.5 shadow-md bg-bg-card-hover border-(--store-color) shadow-[0_0_12px_color-mix(in_oklch,var(--store-color)_30%,transparent)]' : 'hover:-translate-y-0.5 hover:shadow-md hover:bg-bg-card-hover'}
            ${isFocus ? 'ring-2 ring-focus ring-offset-2' : ''}
            ${isActive ? 'scale-[0.99] translate-y-px' : 'active:scale-[0.99] active:translate-y-px'}
            ${isDisabled ? 'opacity-55 pointer-events-none cursor-not-allowed' : ''}
            ${isReleaseCard ? 'bg-bg-card-release border-2 border-black shadow-[0_0_8px_rgba(0,0,0,0.15)]' : ''}
        `
            .trim()
            .replace(/\s+/g, ' ');

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
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border border-(--type-border)/30 text-(--type-border) bg-(--type-bg) type-${event.eventType}`}
                            style={
                                {
                                    '--type-bg': `var(--type-bg, rgba(0, 0, 0, 0.05))`,
                                    '--type-border': `var(--type-border, var(--color-text-muted))`,
                                } as React.CSSProperties
                            }
                        >
                            {types[event.eventType]
                                ? `${types[event.eventType]} `
                                : ''}
                            {event.eventType}
                        </span>
                        <span className="text-[9px] font-semibold text-text-muted bg-bg-main px-2 py-0.5 rounded-full border border-border-color/60 uppercase tracking-wider">
                            {event.game === 'ALL' ? 'TCG, VGC, GO' : event.game}
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
                            <span className="">
                                {leagueName}
                            </span>
                        </div>
                        <h3 className="font-bold text-text-darker text-[15px] font-sans tracking-tight leading-snug">
                            {event.name}
                        </h3>
                    </div>
                </div>

                {/* Event Format Tags */}
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border border-(--type-border)/30 text-(--type-border) bg-(--type-bg) type-${event.eventType}`}
                        style={
                            {
                                '--type-bg': `var(--type-bg, rgba(0, 0, 0, 0.05))`,
                                '--type-border': `var(--type-border, var(--color-text-muted))`,
                            } as React.CSSProperties
                        }
                    >
                        {types[event.eventType]
                            ? `${types[event.eventType]} `
                            : ''}
                        {event.eventType}
                    </span>
                    <span className="text-[9px] font-semibold text-text-muted bg-bg-main px-2 py-0.5 rounded-full border border-border-color/60 uppercase tracking-wider">
                        {event.game === 'ALL' ? 'TCG, VGC, GO' : event.game}
                    </span>
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
