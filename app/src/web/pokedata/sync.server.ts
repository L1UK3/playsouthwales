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
async function _syncEvents(): Promise<void> {
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
async function _syncChampionshipPoints(): Promise<void> {
	const players = await getChampionshipPoints();
	await updatePlayerCp(
		players.map(({ name, points }) => ({ name, cp: points })),
	);
}

/** Sync Pokedata events and championship points at the same time. */
export async function syncPokedata(): Promise<void> {
	await Promise.all([_syncEvents(), _syncChampionshipPoints()]);
}
