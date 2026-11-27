import {
	insertPokedataEvents,
	queryLeagues,
	queryPokedataGuids,
} from "#/db/queries.server";
import type { EventValues } from "#/db/schema";
import { getAllEvents, toEventValues } from "./events";

export interface PokedataSyncResult {
	inserted: number;
	skippedExisting: number;
	skippedNoLeague: number;
}

/**
 * Import new Pokedata events into D1. Events already imported, and events
 * whose league is not in the leagues table, are skipped.
 * @returns How many events were inserted and skipped.
 */
export async function syncPokedataEvents(): Promise<PokedataSyncResult> {
	const result: PokedataSyncResult = {
		inserted: 0,
		skippedExisting: 0,
		skippedNoLeague: 0,
	};

	const pokedataEvents = await getAllEvents();
	if (pokedataEvents.length === 0) {
		console.warn("No events fetched from Pokedata");
		return result;
	}

	const [leagues, existingGuids] = await Promise.all([
		queryLeagues(),
		queryPokedataGuids(),
	]);
	const leagueIds = new Set(leagues.map((league) => league.leagueId));

	const rows: EventValues[] = [];
	for (const event of pokedataEvents) {
		if (!event.guid) continue;
		if (existingGuids.has(event.guid)) {
			result.skippedExisting++;
			continue;
		}

		const leagueId = Number(event.league);
		if (!Number.isInteger(leagueId) || !leagueIds.has(leagueId)) {
			result.skippedNoLeague++;
			continue;
		}

		rows.push(toEventValues(event, leagueId));
		existingGuids.add(event.guid);
	}

	await insertPokedataEvents(rows);
	result.inserted = rows.length;

	if (result.skippedNoLeague > 0) {
		console.warn(
			`Pokedata sync skipped ${result.skippedNoLeague} events whose ` +
				"league ID is not in the leagues table. Set the league's ID to " +
				"its official League ID in the admin dashboard to sync it.",
		);
	}

	return result;
}
