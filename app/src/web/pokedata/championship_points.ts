import { env } from "cloudflare:workers";
import { queryRankings } from "#/db/queries.server";

interface _PokedataPlayer {
	guid: string;
	name: string;
	points: number;
}

/**
 * Fetch the list of player names from the database.
 * @returns A promise resolving to an array of player names.
 */
async function _fetchPlayerData(): Promise<string[]> {
	return queryRankings().then((rankings) =>
		rankings.map((player: { name: string }) => player.name),
	);
}

/**
 * Fetch championship points data from the Pokedata API.
 * Server-only: reads the POKEDATA_KEY secret from the Worker environment.
 * @returns The parsed JSON response from the Pokedata API.
 */
async function _getChampionshipPoints() {
	const response = await fetch("https://pokedata.ovh/2026/api/", {
		method: "POST",
		headers: { accept: "application/json", "content-type": "application/json" },
		body: JSON.stringify({
			APIKEY: env.POKEDATA_KEY,
			players: await _fetchPlayerData(),
		}),
	});

	if (!response.ok) {
		throw new Error(`Pokedata API request failed: ${response.status}`);
	}

	return response.json();
}
