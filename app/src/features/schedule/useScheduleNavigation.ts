import { useState } from "react";
import type { EventFilters } from "#/lib/events";
import { currentMonthKey, shiftMonth, todayDateKey } from "#/lib/month";
import { CLEARED_FILTERS, filterPatch, type ScheduleSearch } from "./search";

type SwipeDirection = "left" | "right" | "up" | "down" | null;

const SWIPE_CLASS: Record<NonNullable<SwipeDirection>, string> = {
	left: "animate-swipe-left",
	right: "animate-swipe-right",
	up: "animate-swipe-up",
	down: "animate-swipe-down",
};

/** Writes a patch into the URL; the route supplies the router adapter. */
export type UpdateScheduleSearch = (
	patch: ScheduleSearch,
	options?: { viewTransition?: boolean },
) => void;

/**
 * The schedule page's user intents (month paging, today, view toggle, day
 * selection, filters) expressed as search patches, plus the swipe animation
 * class implied by the most recent intent.
 */
export function useScheduleNavigation(
	month: string,
	search: ScheduleSearch,
	updateSearch: UpdateScheduleSearch,
) {
	const [direction, setDirection] = useState<SwipeDirection>("up");
	const view: "calendar" | "list" = search.view ?? "calendar";

	return {
		view,
		swipeClass: direction ? SWIPE_CLASS[direction] : "",
		goToMonth: (delta: number) => {
			setDirection(delta < 0 ? "right" : "left");
			updateSearch({ month: shiftMonth(month, delta), day: undefined });
		},
		goToToday: () => {
			const today = currentMonthKey();
			setDirection(today < month ? "right" : today > month ? "left" : null);
			updateSearch({ month: undefined, day: todayDateKey() });
		},
		toggleView: () => {
			setDirection("down");
			updateSearch(
				{ view: view === "calendar" ? "list" : undefined },
				{ viewTransition: true },
			);
		},
		selectDay: (dateKey: string) =>
			updateSearch({ day: search.day === dateKey ? undefined : dateKey }),
		changeFilter: (name: keyof EventFilters, value: string) =>
			updateSearch(filterPatch(name, value)),
		clearFilters: () => updateSearch(CLEARED_FILTERS),
	};
}
