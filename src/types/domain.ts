import type { events } from "#/db/events/schema";
import type { leagues } from "#/db/leagues/schema";
import type { WithoutNulls } from "#/db/utils";

// League and ScheduleEvent are derived from the table schemas, so a column
// added, renamed or retyped in src/db/*/schema.ts reaches every caller without
// a second hand-kept copy. Nullable columns become optional fields; the fields
// listed after `&` are the ones the domain shapes differently from the row.

type LeagueRow = WithoutNulls<typeof leagues.$inferSelect>;

export type League = Omit<LeagueRow, "id" | "isChampionshipSeries"> & {
	leagueId: number;
	isChampionshipSeries?: boolean;
};

type EventRow = WithoutNulls<typeof events.$inferSelect>;

export type ScheduleEvent = Omit<
	EventRow,
	"id" | "pokedataGuid" | "isRecurring" | "excludedDates"
> & {
	/** A row id, or `"<seriesId>:<YYYY-MM-DD>"` for a series occurrence. */
	id: number | string;
	pokedataGuid?: string;
	leagueName?: string;
	isRecurring?: boolean;
	recurringEventId?: number;
	excludedDates?: string[];
	isExcluded?: boolean;
};

export type EventTypeMap = Record<string, string>;

export interface LeaderboardPosition {
	position: number;
	name: string;
	cp?: number;
}

export type LeagueMap = Record<number, League>;

export type EventsByDate = Record<string, ScheduleEvent[]>;

export interface ScheduleData {
	leagues: League[];
	types: EventTypeMap;
	events: ScheduleEvent[];
}
