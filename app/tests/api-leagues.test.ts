import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toPublicLeague } from "#/lib/public-league";
import type { League } from "#/types/domain";

describe("toPublicLeague", () => {
	it("keeps the documented properties", () => {
		const league: League = {
			leagueId: 3,
			name: "Cardiff League",
			location: "Cardiff",
			latitude: 51.48,
			longitude: -3.18,
			directions: "Upstairs",
			accessibility: "Step-free",
			logo: "https://example.com/logo.png",
			brandColor: "#ff0000",
			website: "https://example.com",
			socialLink: "https://example.com/social",
			eventLink: "https://example.com/events",
			isChampionshipSeries: true,
		};
		assert.deepEqual(toPublicLeague(league), league);
	});

	it("omits absent and null optionals", () => {
		const league = {
			leagueId: 1,
			name: "Swansea League",
			location: null,
			webLink: null,
			isChampionshipSeries: false,
		} as unknown as League;
		assert.deepEqual(toPublicLeague(league), {
			leagueId: 1,
			name: "Swansea League",
			isChampionshipSeries: false,
		});
	});

	it("drops undocumented keys", () => {
		const league = {
			leagueId: 2,
			name: "Newport League",
			id: 2,
			secret: "internal",
			isChampionshipSeries: false,
		} as League;
		const result = toPublicLeague(league);
		assert.deepEqual(Object.keys(result).sort(), [
			"isChampionshipSeries",
			"leagueId",
			"name",
		]);
	});

	it("sends isChampionshipSeries as a boolean when missing", () => {
		const result = toPublicLeague({ leagueId: 4, name: "Bridgend League" });
		assert.equal(result.isChampionshipSeries, false);
	});

	it("keeps a webLink when the source has one", () => {
		const result = toPublicLeague({
			leagueId: 5,
			name: "Barry League",
			webLink: "https://example.com/more",
			isChampionshipSeries: false,
		});
		assert.equal(result.webLink, "https://example.com/more");
	});
});
