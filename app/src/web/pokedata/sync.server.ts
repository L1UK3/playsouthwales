import {
	insertPokedataEvents,
	queryLeagues,
	updatePlayerCp,
} from "#/db/queries.server";
import type { EventValues } from "#/db/schema";
import { getChampionshipPoints } from "./championship_points";
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

/** Store each player's championship points from Pokedata. */
export async function syncChampionshipPoints(): Promise<void> {
	const players = await getChampionshipPoints();
	await updatePlayerCp(
		players.map(({ name, points }) => ({ name, cp: points })),
	);
}
