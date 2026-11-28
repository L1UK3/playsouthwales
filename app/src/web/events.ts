import type { EventValues } from "#/db/events/schema";

const _API_URL: string = "https://pokedata.ovh/events/api/";

const _COORDS: { [key: string]: number | string } = {
	latitude: 51.7576404113981,
	longitude: -3.5224914550781254,
	radius: 50,
	unit: "km",
};

const _COORDS_TO_STRING: string =
	`_latitude/${_COORDS.latitude}/_longitude/${_COORDS.longitude}` +
	`/_radius/${_COORDS.radius}/_unit/${_COORDS.unit}`;

const _EVENT_TYPE_MAP: { [key: string]: string } = {
	"League Challenge": "CHALLENGE",
	"League Cup": "CUP",
	"Pre Release": "PRE-RELEASE",
};

const _GAME_MAP: { [key: string]: string } = {
	tcg: "TCG",
	vg: "VGC",
	go: "GO",
};

const _URLS: string[] = [
	`${_API_URL}_tcg/cups/challenges/pre/${_COORDS_TO_STRING}`,
	`${_API_URL}_vg/cups/challenges/${_COORDS_TO_STRING}`,
	`${_API_URL}_go/cups/challenges/${_COORDS_TO_STRING}`,
];

export interface PokedataEvent {
	guid: string;
	name: string;
	date: string;
	time?: string | null;
	league: string;
	type: string;
	product?: string | null;
	shop?: string | null;
	street_address?: string | null;
	city?: string | null;
	state?: string | null;
	pokemon_url?: string | null;
	cost?: string | null;
	Event_website?: string | null;
	Third_party_registration_website?: string | null;
}

const _TEXT_REPLACEMENTS: [string, string][] = [
	["Pok\ufffdmon", "Pok\u00e9mon"],
	["Pok\u01e3mon", "Pok\u00e9mon"],
	["Pok\u01f8mon", "Pok\u00e9mon"],
	["\ufffd", "\u00a3"],
];

/**
 * Repair the mis-encoded characters Pokedata sends and collapse whitespace.
 * @returns The cleaned text, or an empty string when there is none.
 */
export function cleanText(text: string | null | undefined): string {
	if (!text) return "";

	let cleaned = text;
	for (const [bad, good] of _TEXT_REPLACEMENTS) {
		cleaned = cleaned.replaceAll(bad, good);
	}
	return cleaned.split(/\s+/).filter(Boolean).join(" ");
}

/**
 * Pokedata returns either the event list or an object with an `events` list.
 */
function _unwrapEvents(payload: unknown): PokedataEvent[] {
	if (Array.isArray(payload)) return payload;
	return (payload as { events?: PokedataEvent[] } | null)?.events ?? [];
}

/**
 * Fetch event data from the Pokedata API, retrying failed requests.
 * @returns The events, or an empty list once every attempt has failed.
 */
export async function getEvents(URL: string): Promise<PokedataEvent[]> {
	const maxRetries = 3;
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetch(URL, {
				headers: { accept: "application/json" },
				signal: AbortSignal.timeout(15_000),
			});

			if (!response.ok) {
				throw new Error(`Pokedata API request failed: ${response.status}`);
			}

			return _unwrapEvents(await response.json());
		} catch (error) {
			console.warn(
				`Pokedata events attempt ${attempt}/${maxRetries} failed: ${error}`,
			);
			if (attempt < maxRetries) {
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}
	}

	console.error(`Pokedata events failed after ${maxRetries} attempts`);
	return [];
}

/**
 * Fetch the TCG, VGC and GO event feeds around South Wales.
 * @returns Every event across the feeds.
 */
export async function getAllEvents(): Promise<PokedataEvent[]> {
	const feeds = await Promise.all(_URLS.map((URL) => getEvents(URL)));
	return feeds.flat();
}

/**
 * Build the D1 events row for a Pokedata event.
 * @returns The row to insert, linked to the given league.
 */
export function toEventValues(
	event: PokedataEvent,
	leagueId: number,
): EventValues {
	const eventType = event.type.trim();
	const ticketLink = event.Third_party_registration_website?.trim();

	return {
		pokedataGuid: event.guid,
		leagueId,
		name: cleanText(event.name),
		date: cleanText(event.date),
		startTime: cleanText(event.time) || null,
		eventType: cleanText(_EVENT_TYPE_MAP[eventType] ?? eventType),
		game: _GAME_MAP[(event.product ?? "").toLowerCase()] ?? "TCG",
		ticketLink: ticketLink || null,
		entryFee: cleanText(event.cost) || null,
	};
}
