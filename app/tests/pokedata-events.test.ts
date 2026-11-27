import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cleanText, toEventValues } from "#/web/pokedata/events";

describe("cleanText", () => {
	const cases: [string | null | undefined, string][] = [
		["Pok�mon League Cardiff", "Pokémon League Cardiff"],
		["Pokǣmon League Newport", "Pokémon League Newport"],
		["PokǸmon League Swansea", "Pokémon League Swansea"],
		["Entry Fee: �5.00", "Entry Fee: £5.00"],
		["  Standard \n  Event ", "Standard Event"],
		["", ""],
		[null, ""],
		[undefined, ""],
	];

	for (const [input, expected] of cases) {
		it(`cleans ${JSON.stringify(input)}`, () => {
			assert.equal(cleanText(input), expected);
		});
	}
});

describe("toEventValues", () => {
	it("maps a Pokedata event to an events row", () => {
		const row = toEventValues(
			{
				guid: "new-456",
				name: "League Challenge Cardiff Pok�mon",
				date: "2026-07-20",
				time: "18:30",
				league: "1",
				type: "League Challenge",
				product: "tcg",
				cost: "£5.00",
				Third_party_registration_website: " https://tickets.example.com ",
				Event_website: "https://event.example.com",
			},
			1,
		);

		assert.deepEqual(row, {
			pokedataGuid: "new-456",
			leagueId: 1,
			name: "League Challenge Cardiff Pokémon",
			date: "2026-07-20",
			startTime: "18:30",
			eventType: "CHALLENGE",
			game: "TCG",
			ticketLink: "https://tickets.example.com",
			entryFee: "£5.00",
		});
	});

	it("maps VGC and GO products to their game codes", () => {
		const base = { guid: "g", name: "n", date: "d", league: "1", type: "t" };
		assert.equal(toEventValues({ ...base, product: "vg" }, 1).game, "VGC");
		assert.equal(toEventValues({ ...base, product: "GO" }, 1).game, "GO");
		assert.equal(toEventValues(base, 1).game, "TCG");
	});

	it("stores missing optional fields as null", () => {
		const row = toEventValues(
			{ guid: "g", name: "n", date: "d", league: "1", type: "League Cup" },
			1,
		);
		assert.equal(row.eventType, "CUP");
		assert.equal(row.startTime, null);
		assert.equal(row.ticketLink, null);
		assert.equal(row.entryFee, null);
	});
});
