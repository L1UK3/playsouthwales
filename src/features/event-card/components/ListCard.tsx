/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V4 */
/* Hallmark · component: card · genre: modern-minimal · theme: custom (design.md)
 * states: default · hover · active
 * contrast: pass (46–50)
 */
import React from "react";

import { cn } from "#/lib/utils";
import type { ScheduleEvent } from "#/types/domain";
import {
	ACTIVE_CLASSES,
	CARD_BASE_CLASSES,
	HOVER_CLASSES,
} from "../constants/EventCard.constants";
import { useEventCard } from "../hooks/useEventCard";
import type { EventCardProps } from "../types/EventCard.types";
import { getEntryFeeLabel } from "../utils/EventCard.utils";
import {
	getListCardActions,
	type ListCardAction,
} from "../utils/listCardActions";
import {
	DescriptionNote,
	EventTypeTag,
	PrizesNote,
	VenueNote,
} from "./EventCardParts";

/**
 * ListCardProps interface extends EventCardProps to include additional properties specific to the ListCard component.
 * @param isExpanded {boolean} - Whether the card is expanded to show additional details.
 * @param onToggle {function} - Callback function invoked when the card is toggled (expanded/collapsed).
 * @param onEdit {function} - Callback function invoked when the edit button is clicked.
 * @param onDelete {function} - Callback function invoked when the delete button is clicked.
 * @param onExclude {function} - Callback function invoked when the exclude button is clicked.
 * @param onUnexclude {function} - Callback function invoked when the unexclude button is clicked.
 */
export interface ListCardProps extends EventCardProps {
	isExpanded?: boolean;
	onToggle?: (id: number | string) => void;
	onEdit?: (event: ScheduleEvent) => void;
	onDelete?: (event: ScheduleEvent) => void;
	onExclude?: (event: ScheduleEvent) => void;
	onUnexclude?: (event: ScheduleEvent) => void;
}

const ACTION_TONE_CLASSES: Record<ListCardAction["tone"], string> = {
	neutral: "btn btn-secondary",
	positive: cn(
		"btn btn-secondary border-emerald-500! text-emerald-600!",
		"dark:text-emerald-400! bg-emerald-500/5!",
		"hover:bg-emerald-500/10!",
	),
	danger: cn(
		"btn btn-secondary border-red-500! text-red-600!",
		"dark:text-red-400! bg-red-500/5! hover:bg-red-500/10!",
	),
};

/**
 * ListCard component represents a single event entry within a list view.
 * Redesigned with a soft tone and proper keyboard accessibility.
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 * @param types {EventTypeMap} - A mapping of event types to their corresponding properties.
 * @param isExpanded {boolean} - Whether the card is expanded to show additional details.
 * @param onToggle {function} - Callback function invoked when the card is toggled (expanded/collapsed).
 * @param onEdit {function} - Callback function invoked when the edit button is clicked.
 * @param onDelete {function} - Callback function invoked when the delete button is clicked.
 * @param onExclude {function} - Callback function invoked when the exclude button is clicked.
 * @param onUnexclude {function} - Callback function invoked when the unexclude button is clicked.
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
	}) => {
		const {
			description,
			league,
			leagueName,
			style,
			isChampionship,
			isOfficial,
			gameLabel,
			themeClasses,
		} = useEventCard(event, leagueMap);

		const cardClasses = cn(
			"rounded-xl overflow-hidden cursor-pointer",
			CARD_BASE_CLASSES,
			themeClasses,
			HOVER_CLASSES,
			"hover:translate-x-0.5",
			ACTIVE_CLASSES,
			event.isExcluded &&
				"opacity-55 grayscale-[30%] border-dashed border-red-500/20",
		);

		const actions = getListCardActions(event, {
			onEdit,
			onDelete,
			onExclude,
			onUnexclude,
		});

		// Keyboard press handler for toggle
		const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onToggle?.(event.id);
			}
		};

		return (
			// biome-ignore lint/a11y/useSemanticElements: the card contains nested interactive controls, so it cannot be a <button>
			<div
				role="button"
				tabIndex={0}
				className={cardClasses}
				style={style}
				onClick={() => onToggle?.(event.id)}
				onKeyDown={handleKeyDown}
			>
				<div className="py-3 px-4 flex justify-between items-center gap-4">
					<div className="flex items-center gap-4 grow min-w-0">
						{/* Start Time */}
						<div
							className={cn(
								"text-xs font-bold text-text-muted min-w-10 tabular-nums",
							)}
						>
							{event.startTime?.slice(0, 5) ?? "—:—"}
						</div>

						{/* Name & Subtitle */}
						<div className="flex flex-col gap-0.5 grow min-w-0">
							<div
								className={cn(
									"text-sm font-bold text-text-darker flex flex-wrap",
									"items-center gap-1.5 leading-snug",
								)}
							>
								{isChampionship && (
									<span className="text-amber-500 text-xs shrink-0">🏆</span>
								)}
								<span className="truncate">{event.name}</span>
								{event.isExcluded && (
									<span
										className={cn(
											"text-[10px] font-bold text-red-600 uppercase",
											"tracking-wider bg-red-500/10 px-1.5 py-0.2 rounded",
											"shrink-0",
										)}
									>
										Excluded
									</span>
								)}
							</div>
							<div
								className={cn(
									"text-[11px] text-text-muted flex items-center gap-1.5",
									"truncate",
								)}
							>
								{league?.logo && (
									<img
										src={league.logo}
										alt={`${leagueName} Logo`}
										width="14"
										height="14"
										loading="lazy"
										decoding="async"
										className={cn(
											"size-3.5 rounded object-contain bg-white border",
											"border-border-color shrink-0 p-px",
										)}
									/>
								)}
								<span className="truncate">
									{leagueName} • {gameLabel}
								</span>
							</div>
						</div>
					</div>

					{/* Format Emoji & Expand Arrow */}
					<div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap justify-end">
						{isOfficial && (
							<span
								className={cn(
									"px-1.5 py-0.5 rounded text-[8px] font-extrabold",
									"tracking-wider uppercase bg-white/20 text-white border",
									"border-white/30 shrink-0",
								)}
							>
								Official
							</span>
						)}
						<EventTypeTag
							eventType={event.eventType}
							className="px-2 py-0.5 rounded text-[11px] sm:text-xs shrink-0 whitespace-nowrap"
						>
							{types[event.eventType] ? `${types[event.eventType]} ` : ""}
						</EventTypeTag>
						<span
							className={cn(
								"text-[9px] text-text-muted/70 transition-transform",
								"duration-250",
								isExpanded && "rotate-180 text-text-main",
							)}
						>
							▼
						</span>
					</div>
				</div>

				{/* Expanded Content (Pure CSS transition based on height) */}
				<div
					className={cn(
						"transition-all duration-300 ease-out",
						"border-t border-border-color/30 bg-bg-main/30 overflow-hidden",
						isExpanded ? "max-h-150 opacity-100" : "max-h-0 opacity-0",
					)}
				>
					<div className="p-4 flex flex-col gap-3.5">
						<div
							className={cn(
								"flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted",
							)}
						>
							<span>
								<strong className="text-text-main font-bold">Format:</strong>{" "}
								{event.eventType}
							</span>
							{!isChampionship && (
								<span>
									<strong className="text-text-main font-bold">Entry:</strong>{" "}
									{getEntryFeeLabel(event.entryFee)}
								</span>
							)}
						</div>

						{/* Details (Clean text with left border indicators instead of cards-in-card) */}
						{description && <DescriptionNote>{description}</DescriptionNote>}

						{event.prizes && <PrizesNote prizes={event.prizes} />}

						{league?.directions && (
							<VenueNote title="📍 Directions">{league.directions}</VenueNote>
						)}

						{league?.accessibility && (
							<VenueNote title="♿ Accessibility">
								{league.accessibility}
							</VenueNote>
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
							{actions.map((action) => (
								<button
									key={action.key}
									type="button"
									className={ACTION_TONE_CLASSES[action.tone]}
									onClick={(e) => {
										e.stopPropagation();
										action.run();
									}}
								>
									{action.label}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	},
);

export default ListCard;
