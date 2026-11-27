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

interface _PokedataEvent {
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

/**
 * Pull the event list out of a Pokedata response, which is either the list
 * itself or an object with an `events` list.
 * @returns The events, or an empty list when the payload has another shape.
 */
function _unwrapEvents(payload: unknown): _PokedataEvent[] {
	const events =
		payload !== null && typeof payload === "object" && !Array.isArray(payload)
			? (payload as { events?: unknown }).events
			: payload;

	if (!Array.isArray(events)) {
		console.warn(`Unexpected Pokedata events payload: ${typeof events}`);
		return [];
	}
	return events as _PokedataEvent[];
}

/**
 * Fetch event data from the Pokedata API, retrying failed requests.
 * @returns The events, or an empty list once every attempt has failed.
 */
export async function getEvents(
	URL: string,
	{ maxRetries = 3, retryDelayMs = 2000 } = {},
): Promise<_PokedataEvent[]> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetch(URL, {
				headers: { accept: "application/json" },
				signal: AbortSignal.timeout(15_000),
			});

			if (!response.ok) {
				throw new Error(`Pokedata API request failed: ${response.status}`);
			}

			const eventData = _unwrapEvents(await response.json());

			return eventData.map((event: _PokedataEvent) => ({
				...event,
				type: _EVENT_TYPE_MAP[event.type] || event.type,
				product: _GAME_MAP[event.product ?? "tcg"] || event.product,
			}));
		} catch (error) {
			console.warn(
				`Pokedata events attempt ${attempt}/${maxRetries} failed: ${error}`,
			);
			if (attempt < maxRetries) {
				await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
			}
		}
	}

	console.error(`Pokedata events failed after ${maxRetries} attempts`);
	return [];
}
