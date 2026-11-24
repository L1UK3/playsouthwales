import { useMemo } from "react";
import { isDateMarkerType } from "#/lib/event-types";
import { cn } from "#/lib/utils";
import type { League, ScheduleEvent } from "#/types/domain";
import {
	ACTIVE_CLASSES,
	CARD_BASE_CLASSES,
	HOVER_CLASSES,
} from "../constants/EventCard.constants";
import {
	getCardStyles,
	getLeagueInfo,
	getStoreColor,
} from "../utils/EventCard.utils";
import { getEventDescription } from "../utils/getEventDescription";

/**
 * Custom React hook that resolves and memoizes event card metadata, store colors,
 * and computed CSS classes based on Vercel's React best practices.
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 * @param cardType {'list' | 'schedule' | 'calendar'} - The type of card being rendered.
 * @returns An object containing league info, store color, and computed CSS classes.
 */
export function useEventCard(
	event: ScheduleEvent,
	leagueMap: Record<number, League>,
	cardType?: "list" | "schedule" | "calendar",
) {
	return useMemo(() => {
		const { league, leagueName } = getLeagueInfo(event, leagueMap);
		const storeColor = getStoreColor(event, league);
		const isChampionship = league?.isChampionshipSeries ?? false;

		const isDateMarker = isDateMarkerType(event.eventType);
		const cardStyles = cardType
			? getCardStyles(event.eventType, isChampionship)
			: "";

		const isOfficial =
			event.eventType === "CUP" ||
			event.eventType === "CHALLENGE" ||
			event.eventType === "PRE-RELEASE" ||
			isChampionship;

		let cardClasses = "";
		if (cardType === "list") {
			cardClasses = cn(
				"rounded-xl overflow-hidden cursor-pointer",
				CARD_BASE_CLASSES,
				cardStyles,
				HOVER_CLASSES,
				"hover:translate-x-0.5",
				ACTIVE_CLASSES,
				event.isExcluded &&
					"opacity-55 grayscale-[30%] border-dashed border-red-500/20",
			);
		} else if (cardType === "schedule") {
			cardClasses = cn(
				"flex flex-col gap-3 p-4 rounded-xl",
				CARD_BASE_CLASSES,
				cardStyles,
				HOVER_CLASSES,
				ACTIVE_CLASSES,
				isDateMarker &&
					cn(
						"bg-bg-card-release border-2 border-black",
						"shadow-[0_0_8px_rgba(0,0,0,0.15)]",
					),
			);
		} else if (cardType === "calendar") {
			cardClasses = cardStyles;
		}

		return {
			description: getEventDescription(event),
			league,
			leagueName,
			storeColor,
			isChampionship,
			isDateMarker,
			cardClasses,
			isOfficial,
		};
	}, [event, leagueMap, cardType]);
}
