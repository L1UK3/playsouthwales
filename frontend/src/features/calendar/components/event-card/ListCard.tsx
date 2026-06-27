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
    onToggle?: () => void;
    onEdit?: (event: Event) => void;
    onDelete?: (event: Event) => void;
}

/**
 * ListCard component represents a single event entry within a list view.
 * @param {EventCardProps & ListCardProps} props - The properties passed to the ListCard component, including event details, league mapping, event types, and expansion state/handlers.
 * @returns {JSX.Element} The rendered list card component.
 */
const ListCard: React.FC<EventCardProps & ListCardProps> = React.memo(({
    event,
    leagueMap,
    types,
    isExpanded,
    onToggle,
    onEdit,
    onDelete
}) => {
    const league = event.leagueId ? leagueMap[event.leagueId] : null;
    const leagueName = league?.name ?? event.leagueName ?? 'Unknown League';
    const storeColor = league?.brandColor ?? `hsl(${(event.leagueId ?? 0) * 137 % 360}, 70%, 50%)`;

    return (
        <div
            className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:translate-x-1 gradient-card type-${event.eventType} ${isExpanded ? "[&_.expand-icon]:rotate-180 [&_.expand-icon]:text-primary [&_.expandable-content]:max-h-125 [&_.expandable-content]:border-t [&_.expandable-content]:border-border-color" : ""}`}
            style={{ '--store-color': storeColor } as React.CSSProperties}
            onClick={onToggle}
        >
            <div className="py-2.5 px-4 flex justify-between items-center gap-4">
                <div className="flex items-center gap-4 grow">
                    <div className="text-sm font-bold text-primary min-w-11">{event.startTime?.slice(0, 5) ?? ''}</div>
                    <div className="flex flex-col gap-0.5">
                        <div className="text-[15px] font-bold text-text-main">{event.name}</div>
                        <div className="text-[12px] text-text-muted">{leagueName} • {event.game}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-base opacity-80">{types[event.eventType] ?? ''}</span>
                    <span className="expand-icon text-xs text-text-muted transition-transform duration-300">▼</span>
                </div>
            </div>
            <div className="expandable-content max-h-0 overflow-hidden transition-all duration-300 bg-black/10">
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex gap-4 text-xs [&_strong]:text-text-muted [&_strong]:font-semibold [&_strong]:mr-1">
                        <span className=""><strong>Format:</strong> {event.eventType}</span>
                        {event.entryFee ? <span className=""><strong>Entry:</strong> {event.entryFee}</span> : null}
                    </div>
                    {event.description ? <div className={"text-xs leading-relaxed text-text-darker bg-white/5 p-2 rounded-lg"}>{event.description}</div> : null}
                    {event.prizes ? <div className={"text-xs text-amber-400 bg-amber-400/10 p-2 rounded-lg border border-amber-400/20 flex gap-2"}><strong>Prizes:</strong> {event.prizes}</div> : null}
                    {event.directions ? (
                        <div className={"text-xs text-text-muted bg-white/5 p-2 rounded-lg flex flex-col gap-0.5 border border-border-color/30"}>
                            <div className="font-semibold text-text-main flex items-center gap-1">📍 Directions</div>
                            <div className="leading-relaxed">{event.directions}</div>
                        </div>
                    ) : null}
                    {event.accessibility ? (
                        <div className={"text-xs text-text-muted bg-white/5 p-2 rounded-lg flex flex-col gap-0.5 border border-border-color/30"}>
                            <div className="font-semibold text-text-main flex items-center gap-1">♿ Accessibility</div>
                            <div className="leading-relaxed">{event.accessibility}</div>
                        </div>
                    ) : null}
                    <div className="flex justify-end">
                        {event.ticketLink ? (
                            <a
                                href={event.ticketLink}
                                className={"btn btn-primary"}
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
                                className="btn btn-secondary"
                                style={{ marginLeft: '8px' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(event);
                                }}
                            >
                                Edit
                            </button>
                        ) : null}
                        {onDelete ? (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{
                                    marginLeft: '8px',
                                    borderColor: '#ef4444',
                                    color: '#ef4444',
                                    background: 'rgba(239, 68, 68, 0.05)'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(event);
                                }}
                            >
                                Delete
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ListCard;
