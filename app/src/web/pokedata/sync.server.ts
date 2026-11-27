import { insertPokedataEvents, queryLeagues } from "#/db/queries.server";
import type { EventValues } from "#/db/schema";
import { getAllEvents, toEventValues } from "./events";

/**
 * Import new Pokedata events into D1. Events already imported, and events
 * whose league is not in the leagues table, are skipped.
 */
export async function syncPokedataEvents(): Promise<void> {
	const [pokedataEvents, leagues] = await Promise.all([
		getAllEvents(),
		queryLeagues(),
	]);
	const leagueIds = new Set(leagues.map((league) => league.leagueId));

	const rows: EventValues[] = [];
	for (const event of pokedataEvents) {
		const leagueId = Number(event.league);
		if (leagueIds.has(leagueId)) rows.push(toEventValues(event, leagueId));
	}

	await insertPokedataEvents(rows);
}
