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
    time: string;
    league: string;
    type: string;
    product: string;
    shop: string | null;
    street_address: string | null;
    city: string | null;
    state: string | null;
    pokemon_url: string | null;
    cost: string;
    event_website: string;
    third_party_registration_website: string;
}

async function _getPokedataEvents(): Promise<_PokedataEvent[]> {
    const events: _PokedataEvent[] = [];

    for (const url of _URLS) {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch events from ${url}: ${response.statusText}`);
            continue;
        }

        const data: _PokedataEvent[] = await response.json();
        events.push(...data);
    }

    return events;
}
