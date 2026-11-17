import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { EVENT_TYPE_LABELS, sortEventsForSchedule } from "#/lib/event-types";
import { shiftMonth } from "#/lib/month";
import { expandRecurring } from "#/lib/recurrence";
import type {
	EventTypeMap,
	LeaderboardPosition,
	League,
	ScheduleEvent,
} from "#/types/domain";
import { getDb } from "./client.server";
import { events, leaderboards, leagues, players } from "./schema";

function withoutNulls<Row extends object>(
	row: Row,
): { [Key in keyof Row]: NonNullable<Row[Key]> } {
	return Object.fromEntries(
		Object.entries(row).filter(([, value]) => value !== null),
	) as { [Key in keyof Row]: NonNullable<Row[Key]> };
}

export async function queryLeagues(): Promise<League[]> {
	const db = getDb();
	const [rows, standings] = await Promise.all([
		db.select().from(leagues).orderBy(asc(leagues.id)),
		db.select({ leagueId: leaderboards.leagueId }).from(leaderboards),
	]);
	const leagueIdsWithStandings = new Set(standings.map((s) => s.leagueId));

	return rows.map((row) => {
		const { id, ...league } = withoutNulls(row);
		return {
			...league,
			leagueId: id,
			hasStandings: leagueIdsWithStandings.has(id),
		};
	});
}

async function queryMonthEvents(
	month: string,
	includeExcluded: boolean,
): Promise<ScheduleEvent[]> {
	const db = getDb();
	const monthStart = `${month}-01`;
	const nextMonthStart = `${shiftMonth(month, 1)}-01`;

	const [oneOff, weekly] = await Promise.all([
		db
			.select()
			.from(events)
			.where(
				and(
					eq(events.isRecurring, false),
					gte(events.date, monthStart),
					lt(events.date, nextMonthStart),
				),
			),
		db
			.select()
			.from(events)
			.where(
				and(eq(events.isRecurring, true), lt(events.date, nextMonthStart)),
			),
	]);

	return sortEventsForSchedule([
		...oneOff.map(withoutNulls),
		...expandRecurring(weekly.map(withoutNulls), month, includeExcluded),
	]);
}

export interface ScheduleData {
	leagues: League[];
	types: EventTypeMap;
	events: ScheduleEvent[];
}

export async function querySchedule(
	month: string,
	includeExcluded: boolean,
): Promise<ScheduleData> {
	const [allLeagues, monthEvents] = await Promise.all([
		queryLeagues(),
		queryMonthEvents(month, includeExcluded),
	]);
	return { leagues: allLeagues, types: EVENT_TYPE_LABELS, events: monthEvents };
}

export async function queryRankings(): Promise<LeaderboardPosition[]> {
	const rows = await getDb()
		.select({ name: players.name, cp: players.cp })
		.from(players)
		.orderBy(desc(players.cp), asc(players.name));

	return rows.map((row, index) => ({ ...row, position: index + 1 }));
}
