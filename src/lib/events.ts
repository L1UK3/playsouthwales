import type {
	EventsByDate,
	League,
	LeagueMap,
	ScheduleEvent,
} from "#/types/domain";

export interface EventFilters {
	league?: number;
	eventType?: string;
	game?: string;
}

export function createLeagueMap(leagues: League[]): LeagueMap {
	return Object.fromEntries(leagues.map((league) => [league.leagueId, league]));
}

export function matchesFilters(
	event: ScheduleEvent,
	filters: EventFilters,
): boolean {
	if (filters.league !== undefined && event.leagueId !== filters.league) {
		return false;
	}
	if (filters.eventType && event.eventType !== filters.eventType) {
		return false;
	}
	if (filters.game && event.game !== filters.game && event.game !== "ALL") {
		return false;
	}
	return true;
}

export function groupByDate(events: ScheduleEvent[]): EventsByDate {
	const grouped: EventsByDate = {};
	for (const event of events) {
		const dateKey = event.date.slice(0, 10);
		grouped[dateKey] ??= [];
		grouped[dateKey].push(event);
	}
	return grouped;
}
