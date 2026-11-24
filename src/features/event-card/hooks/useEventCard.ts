import type React from "react";
import { useMemo } from "react";
import type { League, ScheduleEvent } from "#/types/domain";
import {
	describeEventCard,
	type EventCardView,
} from "../utils/EventCard.utils";

export interface EventCardViewWithStyle extends EventCardView {
	/** Inline style exposing the store colour as `--store-color`. */
	style: React.CSSProperties;
}

/**
 * Memoised {@link describeEventCard} plus the `--store-color` inline style
 * every card variant applies to its root element.
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 */
export function useEventCard(
	event: ScheduleEvent,
	leagueMap: Record<number, League>,
): EventCardViewWithStyle {
	return useMemo(() => {
		const view = describeEventCard(event, leagueMap);
		const style = { "--store-color": view.storeColor } as React.CSSProperties;
		return { ...view, style };
	}, [event, leagueMap]);
}
