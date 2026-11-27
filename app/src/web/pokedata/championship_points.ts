interface _PokedataPlayer {
	guid: string;
	name: string;
	points: number;
}

/**
 * Fetch championship points data from the Pokedata API.
 * @returns
 */
async function _getChampionshipPoints(): Promise<_PokedataPlayer[] | null> {
	const response = await fetch(
		`${_API_URL}championship-points/${_COORDS_TO_STRING}`,
	);
	if (!response.ok) {
		console.error(
			`Failed to fetch championship points: ${response.statusText}`,
		);
		return null;
	}

	const data = await response.json();
	if (!Array.isArray(data)) {
		console.error(
			`Invalid data format for championship points: expected an array, got ${typeof data}`,
		);
		return null;
	}
	return data as _PokedataPlayer[];
}
