/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V4 */
/* Hallmark · component: card · genre: modern-minimal · theme: custom (design.md)
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 */
import React from 'react';

import type { Event } from '@/types/Event';
import type {
    EventCardProps,
    EventCardAdditionalProps,
} from '../types/EventCard.types';
import { useEventCard } from '../hooks/useEventCard';
import {
    TAG_BASE_CLASSES,
    TAG_STYLE_PROPERTIES,
} from '../constants/EventCard.constants';

/**
 * ListCardProps interface extends EventCardProps and EventCardAdditionalProps to include additional properties specific to the ListCard component.
 * @param isExpanded {boolean} - Whether the card is expanded to show additional details.
 * @param onToggle {function} - Callback function invoked when the card is toggled (expanded/collapsed).
 * @param onEdit {function} - Callback function invoked when the edit button is clicked.
 * @param onDelete {function} - Callback function invoked when the delete button is clicked.
 * @param onExclude {function} - Callback function invoked when the exclude button is clicked.
 * @param onUnexclude {function} - Callback function invoked when the unexclude button is clicked.
 */
export interface ListCardProps
    extends EventCardProps, EventCardAdditionalProps {
    isExpanded?: boolean;
    onToggle?: (id: number | string) => void;
    onEdit?: (event: Event) => void;
    onDelete?: (event: Event) => void;
    onExclude?: (event: Event) => void;
    onUnexclude?: (event: Event) => void;
}

/**
 * ListCard component represents a single event entry within a list view.
 * Redesigned with a soft tone, proper keyboard accessibility, and 8-state support.
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 * @param types {EventTypeMap} - A mapping of event types to their corresponding properties.
 * @param isExpanded {boolean} - Whether the card is expanded to show additional details.
 * @param onToggle {function} - Callback function invoked when the card is toggled (expanded/collapsed).
 * @param onEdit {function} - Callback function invoked when the edit button is clicked.
 * @param onDelete {function} - Callback function invoked when the delete button is clicked.
 * @param onExclude {function} - Callback function invoked when the exclude button is clicked.
 * @param onUnexclude {function} - Callback function invoked when the unexclude button is clicked.
 * @param state {EventCardAdditionalProps['state']} - The current visual state of the card.
 * @returns A React component rendering the event card with appropriate styles, states, and accessibility features.
 */
const ListCard: React.FC<ListCardProps> = React.memo(
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
        state,
    }) => {
        const {
            league,
            leagueName,
            storeColor,
            isChampionship,
            stateFlags,
            cardClasses,
            isOfficial,
        } = useEventCard(event, leagueMap, state, 'list');
        const { isLoading, isError, isDisabled: isStateDisabled } = stateFlags;
        const isDisabled = isStateDisabled || event.isExcluded;

        // Keyboard press handler for toggle
        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle?.(event.id);
            }
        };

        // Loading state (Skeleton row)
        if (isLoading) {
            return (
                <div className="py-3 px-4 flex items-center justify-between gap-4 rounded-xl border border-border-color/40 bg-bg-card shadow-sm animate-pulse w-full">
                    <div className="flex items-center gap-4 grow">
                        <div className="h-4 w-10 bg-bg-main rounded shrink-0" />
                        <div className="flex flex-col gap-1.5 grow">
                            <div className="h-4 w-1/3 bg-bg-main rounded" />
                            <div className="h-3.5 w-1/4 bg-bg-main rounded" />
                        </div>
                    </div>
                    <div className="h-5 w-12 bg-bg-main rounded-full" />
                </div>
            );
        }

        // Error state row
        if (isError) {
            return (
                <div className="py-3 px-4 rounded-xl border-2 border-red-500/20 bg-red-500/1 shadow-sm flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                        <span>Failed to load event</span>
                    </div>
                </div>
            );
        }

        return (
            <div
                role="button"
                tabIndex={isDisabled && state === 'disabled' ? -1 : 0}
                className={cardClasses}
                style={{ '--store-color': storeColor } as React.CSSProperties}
                onClick={() => onToggle?.(event.id)}
                onKeyDown={handleKeyDown}
            >
                <div className="py-3 px-4 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 grow min-w-0">
                        {/* Start Time */}
                        <div className="text-xs font-bold text-text-muted min-w-10 tabular-nums">
                            {event.startTime?.slice(0, 5) ?? '—:—'}
                        </div>

                        {/* Name & Subtitle */}
                        <div className="flex flex-col gap-0.5 grow min-w-0">
                            <div className="text-sm font-bold text-text-darker flex flex-wrap items-center gap-1.5 leading-snug">
                                {isChampionship && (
                                    <span className="text-amber-500 text-xs shrink-0">
                                        🏆
                                    </span>
                                )}
                                <span className="truncate">{event.name}</span>
                                {event.isExcluded && (
                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-500/10 px-1.5 py-0.2 rounded shrink-0">
                                        Excluded
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-text-muted flex items-center gap-1.5 truncate">
                                {league?.logo && (
                                    <img
                                        src={league.logo}
                                        alt={`${leagueName} Logo`}
                                        width="14"
                                        height="14"
                                        loading="lazy"
                                        decoding="async"
                                        className="size-3.5 rounded object-contain bg-white border border-border-color shrink-0 p-px"
                                    />
                                )}
                                <span className="truncate">
                                    {leagueName} •{' '}
                                    {event.game === 'ALL'
                                        ? 'TCG, VGC, GO'
                                        : event.game}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Format Emoji & Expand Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                        {isOfficial && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase bg-white/20 text-white border border-white/30">
                                Official
                            </span>
                        )}
                        <span
                            className={`${TAG_BASE_CLASSES} px-2 py-0.5 rounded type-${event.eventType}`}
                            style={TAG_STYLE_PROPERTIES as React.CSSProperties}
                        >
                            {types[event.eventType]
                                ? `${types[event.eventType]} `
                                : ''}
                        </span>
                        <span
                            className={`text-[9px] text-text-muted/70 transition-transform duration-250 ${isExpanded ? 'rotate-180 text-text-main' : ''}`}
                        >
                            ▼
                        </span>
                    </div>
                </div>

                {/* Expanded Content (Pure CSS transition based on height) */}
                <div
                    className={`transition-all duration-300 ease-out border-t border-border-color/30 bg-bg-main/30 overflow-hidden ${isExpanded
                        ? 'max-h-150 opacity-100'
                        : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="p-4 flex flex-col gap-3.5">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                            <span>
                                <strong className="text-text-main font-bold">
                                    Format:
                                </strong>{' '}
                                {event.eventType}
                            </span>
                            {event.entryFee && (
                                <span>
                                    <strong className="text-text-main font-bold">
                                        Entry:
                                    </strong>{' '}
                                    {event.entryFee}
                                </span>
                            )}
                        </div>

                        {/* Details (Clean text with left border indicators instead of cards-in-card) */}
                        {event.description && (
                            <div className="text-xs leading-relaxed text-text-muted border-l-2 border-border-color/80 pl-3">
                                {event.description}
                            </div>
                        )}

                        {event.prizes && (
                            <div className="text-xs leading-relaxed text-text-muted pl-3 border-l-2 border-amber-500/40 flex gap-1.5 items-start">
                                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">
                                    Prizes:
                                </span>
                                <span>{event.prizes}</span>
                            </div>
                        )}

                        {league?.directions && (
                            <div className="text-xs text-text-muted pl-3 border-l-2 border-border-color/80 flex flex-col gap-0.5">
                                <span className="font-semibold text-text-main">
                                    📍 Directions
                                </span>
                                <span className="leading-relaxed">
                                    {league.directions}
                                </span>
                            </div>
                        )}

                        {league?.accessibility && (
                            <div className="text-xs text-text-muted pl-3 border-l-2 border-border-color/80 flex flex-col gap-0.5">
                                <span className="font-semibold text-text-main">
                                    ♿ Accessibility
                                </span>
                                <span className="leading-relaxed">
                                    {league.accessibility}
                                </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-2 mt-1">
                            {event.ticketLink && (
                                <a
                                    href={event.ticketLink}
                                    className="btn btn-primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Tickets & Info
                                </a>
                            )}
                            {onEdit && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(event);
                                    }}
                                >
                                    Edit
                                </button>
                            )}
                            {event.isExcluded && onUnexclude && (
                                <button
                                    type="button"
                                    className="btn btn-secondary border-emerald-500! text-emerald-600! dark:text-emerald-400! bg-emerald-500/5! hover:bg-emerald-500/10!"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUnexclude(event);
                                    }}
                                >
                                    Unexclude
                                </button>
                            )}
                            {!event.isExcluded &&
                                event.isRecurring &&
                                onExclude && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary border-red-500! text-red-600! dark:text-red-400! bg-red-500/5! hover:bg-red-500/10!"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onExclude(event);
                                        }}
                                    >
                                        Exclude
                                    </button>
                                )}
                            {onDelete && (
                                <button
                                    type="button"
                                    className="btn btn-secondary border-red-500! text-red-600! dark:text-red-400! bg-red-500/5! hover:bg-red-500/10!"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(event);
                                    }}
                                >
                                    {event.isRecurring
                                        ? 'Delete Series'
                                        : 'Delete'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

export default ListCard;
