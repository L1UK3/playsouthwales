import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
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

export type LeagueValues = typeof leagues.$inferInsert;

export async function findLeague(
	id: number,
): Promise<{ id: number; isChampionshipSeries: boolean } | undefined> {
	const [row] = await getDb()
		.select({
			id: leagues.id,
			isChampionshipSeries: leagues.isChampionshipSeries,
		})
		.from(leagues)
		.where(eq(leagues.id, id));
	return row;
}

export async function insertLeague(values: LeagueValues): Promise<void> {
	await getDb().insert(leagues).values(values);
}

/** Returns false when no league has the given id. */
export async function updateLeague(
	id: number,
	values: LeagueValues,
): Promise<boolean> {
	const rows = await getDb()
		.update(leagues)
		.set(values)
		.where(eq(leagues.id, id))
		.returning({ id: leagues.id });
	return rows.length > 0;
}

/** Removes a league and its events atomically. */
export async function deleteLeague(id: number): Promise<void> {
	const db = getDb();
	await db.batch([
		db.delete(events).where(eq(events.leagueId, id)),
		db.delete(leagues).where(eq(leagues.id, id)),
	]);
}

export interface PlayerValues {
	name: string;
	cp: number;
	playerId: number;
}

/**
 * Makes the players table match `incoming`: players missing from it are
 * removed, changed points are updated and new names are inserted.
 */
export async function replacePlayers(
	incoming: PlayerValues[],
	season: number,
): Promise<void> {
	const db = getDb();
	const existing = await db
		.select({
			name: players.name,
			cp: players.cp,
			playerId: players.playerId,
		})
		.from(players);
	const existingByName = new Map(existing.map((row) => [row.name, row]));
	const incomingNames = new Set(incoming.map((player) => player.name));

	const statements: BatchItem<"sqlite">[] = [];
	for (const row of existing) {
		if (!incomingNames.has(row.name)) {
			statements.push(db.delete(players).where(eq(players.name, row.name)));
		}
	}
	for (const player of incoming) {
		const current = existingByName.get(player.name);
		if (!current) {
			statements.push(db.insert(players).values({ ...player, season }));
		} else if (
			current.cp !== player.cp ||
			current.playerId !== player.playerId
		) {
			statements.push(
				db
					.update(players)
					.set({ cp: player.cp, playerId: player.playerId })
					.where(eq(players.name, player.name)),
			);
		}
	}

	const [first, ...rest] = statements;
	if (first) await db.batch([first, ...rest]);
}

export type EventValues = typeof events.$inferInsert;

export async function insertEvent(values: EventValues): Promise<void> {
	await getDb().insert(events).values(values);
}

/** Returns false when no event row has the given id. */
export async function updateEvent(
	id: number,
	values: Partial<EventValues>,
): Promise<boolean> {
	const rows = await getDb()
		.update(events)
		.set(values)
		.where(eq(events.id, id))
		.returning({ id: events.id });
	return rows.length > 0;
}

export async function findEvent(
	id: number,
): Promise<
	{ id: number; isRecurring: boolean; excludedDates: string[] } | undefined
> {
	const [row] = await getDb()
		.select({
			id: events.id,
			isRecurring: events.isRecurring,
			excludedDates: events.excludedDates,
		})
		.from(events)
		.where(eq(events.id, id));
	return row;
}

/** Deletes an event row, which for a series removes every occurrence. */
export async function deleteEvent(id: number): Promise<boolean> {
	const rows = await getDb()
		.delete(events)
		.where(eq(events.id, id))
		.returning({ id: events.id });
	return rows.length > 0;
}
