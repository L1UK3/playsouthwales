import type { EventFilters } from "#/lib/events";
import { isMonthKey } from "#/lib/month";
import { optionalId, optionalString } from "#/lib/search";

/** URL state of the public schedule page. Absent keys mean "default". */
export interface ScheduleSearch {
	month?: string;
	view?: "list";
	day?: string;
	league?: number;
	type?: string;
	game?: string;
}

export function validateScheduleSearch(
	search: Record<string, unknown>,
): ScheduleSearch {
	return {
		month: isMonthKey(search.month) ? search.month : undefined,
		view: search.view === "list" ? "list" : undefined,
		day: optionalString(search.day),
		league: optionalId(search.league),
		type: optionalString(search.type),
		game: optionalString(search.game),
	};
}

/** The event filters encoded in the schedule search. */
export function filtersFromSearch(search: ScheduleSearch): EventFilters {
	return { league: search.league, eventType: search.type, game: search.game };
}

/** The search patch for a raw filter control value ("" clears it). */
export function filterPatch(
	name: keyof EventFilters,
	value: string,
): ScheduleSearch {
	switch (name) {
		case "league":
			return { league: optionalId(value) };
		case "eventType":
			return { type: optionalString(value) };
		case "game":
			return { game: optionalString(value) };
	}
}

export const CLEARED_FILTERS: ScheduleSearch = {
	league: undefined,
	type: undefined,
	game: undefined,
};
