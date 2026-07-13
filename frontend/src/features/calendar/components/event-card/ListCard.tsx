import React from 'react';

import type { EventCardProps } from '@calendar/types/EventCard.types';
import type { Event } from '@/types/Event';

/**
 * @interface ListCardProps
 * @description Additional props for the ListCard component.
 * @property {boolean} [isExpanded] - Whether the card is expanded (used in 'list' variant).
 * @property {() => void} [onToggle] - Callback triggered when toggling the card expansion.
 */

export interface ListCardProps {
    isExpanded?: boolean;
    onToggle?: (id: number | string) => void;
    onEdit?: (event: Event) => void;
    onDelete?: (event: Event) => void;
    onExclude?: (event: Event) => void;
    onUnexclude?: (event: Event) => void;
}

/**
 * ListCard component represents a single event entry within a list view.
 * @param {EventCardProps & ListCardProps} props - The properties passed to the ListCard component, including event details, league mapping, event types, and expansion state/handlers.
 * @returns {JSX.Element} The rendered list card component.
 */
const ListCard: React.FC<EventCardProps & ListCardProps> = React.memo(
    ({
        event,
        leagueMap,
        types,
        isExpanded,
        onToggle,
        onEdit,
        onDelete,
        onExclude,
        onUnexclude,
    }) => {
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
                className={`
                    rounded-xl
                    overflow-hidden
                    cursor-pointer
                    transition-[transform,background-color]
                    duration-150
                    ease-out
                    hover:translate-x-1
                    calendar-card
                    type-${event.eventType}
                    ${isExpanded ? '[&_.expand-icon]:rotate-180 [&_.expand-icon]:text-primary [&_.expandable-content]:max-h-125 [&_.expandable-content]:border-t [&_.expandable-content]:border-border-color' : ''}
                    ${event.isExcluded ? 'opacity-50 grayscale-40 border border-dashed border-red-500/20' : ''}
                `}
                style={{ '--store-color': storeColor } as React.CSSProperties}
                onClick={() => onToggle?.(event.id)}
            >
                <div className="py-2.5 px-4 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 grow">
                        <div className="text-sm font-bold text-primary min-w-11">
                            {event.startTime?.slice(0, 5) ?? ''}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <div className="text-[15px] font-bold text-text-main flex items-center gap-1.5">
                                {league?.isChampionshipSeries && (
                                    <span className="text-amber-500 text-sm">
                                        🏆
                                    </span>
                                )}
                                <span>{event.name}</span>
                                {event.isExcluded && (
                                    <span className="text-xs font-normal text-red-400 ml-1.5">
                                        (Excluded)
                                    </span>
                                )}
                            </div>
                            <div className="text-[12px] text-text-muted flex items-center gap-1.5">
                                {league?.logo && (
                                    <img
                                        src={league.logo}
                                        alt={`${leagueName} Logo`}
                                        width="16"
                                        height="16"
                                        loading="lazy"
                                        decoding="async"
                                        className="w-4 h-4 rounded object-contain bg-white border border-border-color shrink-0 p-px"
                                    />
                                )}
                                <span>
                                    {leagueName} • {event.game}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-base opacity-80">
                            {types[event.eventType] ?? '⚖️'}
                        </span>
                        <span className="expand-icon text-xs text-text-muted transition-transform duration-300">
                            ▼
                        </span>
                    </div>
                </div>
                <div className="expandable-content max-h-0 overflow-hidden transition-[max-height] duration-300 ease-out bg-black/10">
                    <div className="p-4 flex flex-col gap-3">
                        <div className="flex gap-4 text-xs [&_strong]:text-text-muted [&_strong]:font-semibold [&_strong]:mr-1">
                            <span className="">
                                <strong>Format:</strong> {event.eventType}
                            </span>
                            {event.entryFee ? (
                                <span className="">
                                    <strong>Entry:</strong> {event.entryFee}
                                </span>
                            ) : null}
                        </div>
                        {event.description ? (
                            <div
                                className={
                                    'text-xs leading-relaxed text-text-darker bg-white/5 p-2 rounded-lg'
                                }
                            >
                                {event.description}
                            </div>
                        ) : null}
                        {event.prizes ? (
                            <div
                                className={
                                    'text-xs text-amber-400 bg-amber-400/10 p-2 rounded-lg border border-amber-400/20 flex gap-2'
                                }
                            >
                                <strong>Prizes:</strong> {event.prizes}
                            </div>
                        ) : null}
                        {league?.directions ? (
                            <div
                                className={
                                    'text-xs text-text-muted bg-white/5 p-2 rounded-lg flex flex-col gap-0.5 border border-border-color/30'
                                }
                            >
                                <div className="font-semibold text-text-main flex items-center gap-1">
                                    📍 Directions
                                </div>
                                <div className="leading-relaxed">
                                    {league.directions}
                                </div>
                            </div>
                        ) : null}
                        {league?.accessibility ? (
                            <div
                                className={
                                    'text-xs text-text-muted bg-white/5 p-2 rounded-lg flex flex-col gap-0.5 border border-border-color/30'
                                }
                            >
                                <div className="font-semibold text-text-main flex items-center gap-1">
                                    ♿ Accessibility
                                </div>
                                <div className="leading-relaxed">
                                    {league.accessibility}
                                </div>
                            </div>
                        ) : null}
                        <div className="flex justify-end">
                            {event.ticketLink ? (
                                <a
                                    href={event.ticketLink}
                                    className={'btn btn-primary'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Tickets & Info
                                </a>
                            ) : null}
                            {onEdit ? (
                                <button
                                    type="button"
                                    className="btn btn-secondary ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(event);
                                    }}
                                >
                                    Edit
                                </button>
                            ) : null}
                            {event.isExcluded && onUnexclude ? (
                                <button
                                    type="button"
                                    className="btn btn-secondary ml-2 border-emerald-500! text-emerald-500! bg-emerald-500/5!"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUnexclude(event);
                                    }}
                                >
                                    Unexclude
                                </button>
                            ) : null}
                            {!event.isExcluded &&
                                event.isRecurring &&
                                onExclude ? (
                                <button
                                    type="button"
                                    className="btn btn-secondary ml-2 border-red-500! text-red-500! bg-red-500/5!"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onExclude(event);
                                    }}
                                >
                                    Exclude
                                </button>
                            ) : null}
                            {onDelete ? (
                                <button
                                    type="button"
                                    className="btn btn-secondary ml-2 border-red-500! text-red-500! bg-red-500/5!"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(event);
                                    }}
                                >
                                    {event.isRecurring
                                        ? 'Delete Series'
                                        : 'Delete'}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

export default ListCard;
