/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V4 */
/* Hallmark · component: card · genre: modern-minimal · theme: custom (design.md)
 * states: default · hover · active
 * contrast: pass (46–50)
 */
import React from "react";
import { cn } from "#/lib/utils";
import {
	ACTIVE_CLASSES,
	CARD_BASE_CLASSES,
	HOVER_CLASSES,
	TAG_BASE_CLASSES,
	TAG_STYLE_PROPERTIES,
} from "../constants/EventCard.constants";
import { useEventCard } from "../hooks/useEventCard";
import type { EventCardProps } from "../types/EventCard.types";
import { getEntryFeeLabel } from "../utils/EventCard.utils";

/**
 * EventCard component displays information about a single event.
 * Redesigned with a soft tone, microinteraction states, and no nested cards.
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 * @param types {EventTypeMap} - A mapping of event types to their corresponding properties.
 * @returns A React component rendering the event card with appropriate styles and states.
 */
const EventCard: React.FC<EventCardProps> = React.memo(
	({ event, leagueMap, types }) => {
		const {
			description,
			league,
			leagueName,
			style,
			isChampionship,
			isOfficial,
			isDateMarker,
			gameLabel,
			themeClasses,
		} = useEventCard(event, leagueMap);

		const cardClasses = cn(
			"flex flex-col gap-3 p-4 rounded-xl",
			CARD_BASE_CLASSES,
			themeClasses,
			HOVER_CLASSES,
			ACTIVE_CLASSES,
			isDateMarker &&
				cn(
					"bg-bg-card-release border-2 border-black",
					"shadow-[0_0_8px_rgba(0,0,0,0.15)]",
				),
		);
		const links = [event?.ticketLink, league?.website]
			.map((value) => value?.trim())
			.filter((value): value is string => Boolean(value));

		const link = links[0] ?? null;

		if (isDateMarker) {
			return (
				<div className={cardClasses} style={style}>
					<div className="flex items-start gap-3">
						{/* Metadata & Title */}
						<div className="flex flex-col gap-0.5 grow min-w-0">
							<h3
								className={cn(
									"font-bold text-text-darker text-[15px] font-sans",
									"tracking-tight leading-snug truncate",
								)}
							>
								{event.name}
							</h3>
						</div>
					</div>

					{/* Event Format Tags */}
					<div className="flex flex-wrap gap-1.5 items-center">
						<span
							className={cn(
								TAG_BASE_CLASSES,
								"px-2.5 py-0.5 rounded-full",
								`type-${event.eventType}`,
							)}
							style={TAG_STYLE_PROPERTIES as React.CSSProperties}
						>
							{event.eventType}
						</span>
						<span
							className={cn(
								"text-[9px] font-semibold text-text-muted bg-bg-main px-2",
								"py-0.5 rounded-full border border-border-color/60 uppercase",
								"tracking-wider",
							)}
						>
							{gameLabel}
						</span>
						<span
							className={cn(
								"text-[9px] font-semibold text-text-muted bg-bg-main px-2",
								"py-0.5 rounded-full border border-border-color/60 uppercase",
								"tracking-wider",
							)}
						>
							Official
						</span>
					</div>

					{/* Description */}
					<div
						className={cn(
							"text-xs leading-relaxed text-text-muted border-l-2",
							"border-border-color/80 pl-3 mt-1.5",
						)}
					>
						{description}
					</div>
				</div>
			);
		}

		return (
			<div className={cardClasses} style={style}>
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
							className={cn(
								"size-9 rounded-lg object-contain bg-white border",
								"border-border-color shrink-0 p-1 transition-transform",
								"duration-200 group-hover:scale-105",
							)}
						/>
					) : (
						<div
							className={cn(
								"size-9 rounded-lg bg-bg-main border border-border-color",
								"shrink-0 flex items-center justify-center text-sm font-bold",
								"text-text-muted",
							)}
						>
							{leagueName.charAt(0)}
						</div>
					)}

					{/* Metadata & Title */}
					<div className="flex flex-col gap-0.5 grow min-w-0">
						<div
							className={cn(
								"text-[10px] font-bold uppercase tracking-wider",
								"text-text-muted flex flex-wrap items-center gap-1.5",
								"leading-none",
							)}
						>
							<span className="">{leagueName}</span>
						</div>
						<h3
							className={cn(
								"font-bold text-text-darker text-[15px] font-sans",
								"tracking-tight leading-snug",
							)}
						>
							{event.name}
						</h3>
					</div>
				</div>

				{/* Event Format Tags */}
				<div className="flex flex-wrap gap-1.5 items-center">
					<span
						className={cn(
							TAG_BASE_CLASSES,
							"px-2.5 py-0.5 rounded-full",
							`type-${event.eventType}`,
						)}
						style={TAG_STYLE_PROPERTIES as React.CSSProperties}
					>
						{isOfficial
							? `${types[event.eventType]}` + ` ${event.eventType}`
							: event.eventType}
					</span>
					<span
						className={cn(
							"text-[9px] font-semibold text-text-muted bg-bg-main px-2 py-0.5",
							"rounded-full border border-border-color/60 uppercase",
							"tracking-wider",
						)}
					>
						{gameLabel}
					</span>
					{isOfficial && (
						<span
							className={cn(
								"text-[9px] font-semibold text-text-muted bg-bg-main px-2",
								"py-0.5 rounded-full border border-border-color/60 uppercase",
								"tracking-wider",
							)}
						>
							Official
						</span>
					)}
				</div>

				{/* Time & Cost Info */}
				{(event.startTime != null || !isChampionship) && (
					<div
						className={cn(
							"flex items-center gap-3 text-xs text-text-muted mt-0.5",
							"leading-none",
						)}
					>
						{event.startTime && (
							<div className="flex items-center gap-1.5">
								<span className="opacity-75"></span>
								<span>{event.startTime}</span>
							</div>
						)}
						{!isChampionship && (
							<div className="flex items-center gap-1.5">
								<span className="opacity-75"></span>
								<span>{getEntryFeeLabel(event.entryFee)}</span>
							</div>
						)}
					</div>
				)}

				{/* Description & Prizes (No nested card structures) */}
				{description && (
					<div
						className={cn(
							"text-xs leading-relaxed text-text-muted border-l-2",
							"border-border-color/80 pl-3 mt-1.5",
						)}
					>
						{description}
					</div>
				)}

				{event.prizes && (
					<div
						className={cn(
							"text-xs leading-relaxed text-text-muted pl-3 border-l-2",
							"border-amber-500/40 mt-1 flex gap-1.5 items-start",
						)}
					>
						<span
							className={cn(
								"text-amber-600 dark:text-amber-400 font-bold shrink-0",
							)}
						>
							Prizes:
						</span>
						<span>{event.prizes}</span>
					</div>
				)}

				{/* Action Button */}
				{link && (
					<a
						href={link}
						className="btn btn-primary w-full justify-center mt-2.5"
						target="_blank"
						rel="noopener noreferrer"
					>
						Tickets / Info
					</a>
				)}
			</div>
		);
	},
);

export default EventCard;
