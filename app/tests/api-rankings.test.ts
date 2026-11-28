import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "#/lib/api";
import {
	buildRankings,
	parseRankingsQuery,
	type SeasonPlayer,
} from "#/lib/rankings-query";

const params = (query: string) => new URLSearchParams(query);

function assertApiError(run: () => unknown, status: number, code: string) {
	assert.throws(run, (error: unknown) => {
		assert.ok(error instanceof ApiError);
		assert.equal(error.status, status);
		assert.equal(error.code, code);
		return true;
	});
}

describe("parseRankingsQuery", () => {
	it("defaults to the season that started last July", () => {
		const november = new Date("2026-11-28T12:00:00Z");
		assert.equal(parseRankingsQuery(params(""), november).season, "2027");
	});

	it("rolls the season over at the start of July in London", () => {
		// 23:30 UTC on 30 June is already 1 July in British Summer Time.
		const lastOfJune = new Date("2026-06-30T22:30:00Z");
		const firstOfJuly = new Date("2026-06-30T23:30:00Z");
		assert.equal(parseRankingsQuery(params(""), lastOfJune).season, "2026");
		assert.equal(parseRankingsQuery(params(""), firstOfJuly).season, "2027");
	});

	it("reads every parameter", () => {
		assert.deepEqual(
			parseRankingsQuery(params("season=2026&playerId=42&playerName=Meg")),
			{ season: "2026", playerId: 42, playerName: "Meg" },
		);
	});

	for (const query of [
		"season=",
		"season=27",
		"season=2027a",
		"playerId=",
		"playerId=abc",
		"playerId=1.5",
		"playerId=-3",
	]) {
		it(`rejects ${query}`, () => {
			assertApiError(
				() => parseRankingsQuery(params(query)),
				400,
				"invalid_parameter",
			);
		});
	}
});

describe("buildRankings", () => {
	const players: SeasonPlayer[] = [
		{ name: "Owain Hughes", playerId: 123456, cp: 85 },
		{ name: "Megan Jones", playerId: 104562, cp: 240 },
		{ name: "Alys Morgan", playerId: null, cp: 85 },
		{ name: "Dylan Thomas", playerId: 100234, cp: 285 },
	];

	it("ranks by points then name, leaving out a missing playerId", () => {
		assert.deepEqual(
			buildRankings(players, {
				season: "2027",
				playerId: null,
				playerName: null,
			}),
			[
				{ position: 1, name: "Dylan Thomas", playerId: 100234, cp: 285 },
				{ position: 2, name: "Megan Jones", playerId: 104562, cp: 240 },
				{ position: 3, name: "Alys Morgan", cp: 85 },
				{ position: 4, name: "Owain Hughes", playerId: 123456, cp: 85 },
			],
		);
	});

	it("returns an empty list for a season with no players", () => {
		assert.deepEqual(
			buildRankings([], { season: "2020", playerId: null, playerName: null }),
			[],
		);
	});

	it("filters by playerId without renumbering", () => {
		assert.deepEqual(
			buildRankings(players, {
				season: "2027",
				playerId: 123456,
				playerName: null,
			}),
			[{ position: 4, name: "Owain Hughes", playerId: 123456, cp: 85 }],
		);
	});

	it("filters by a case-insensitive part of the name", () => {
		assert.deepEqual(
			buildRankings(players, {
				season: "2027",
				playerId: null,
				playerName: "AN",
			}).map((ranking) => ranking.position),
			[1, 2, 3],
		);
		assert.deepEqual(
			buildRankings(players, {
				season: "2027",
				playerId: null,
				playerName: "MEGAN",
			}),
			[{ position: 2, name: "Megan Jones", playerId: 104562, cp: 240 }],
		);
	});

	it("applies both filters together", () => {
		assertApiError(
			() =>
				buildRankings(players, {
					season: "2027",
					playerId: 123456,
					playerName: "Megan",
				}),
			404,
			"not_found",
		);
	});

	it("rejects an unknown playerId", () => {
		assertApiError(
			() =>
				buildRankings(players, {
					season: "2027",
					playerId: 1,
					playerName: null,
				}),
			404,
			"not_found",
		);
	});

	it("rejects a playerName that matches nobody", () => {
		assertApiError(
			() =>
				buildRankings(players, {
					season: "2027",
					playerId: null,
					playerName: "Zed",
				}),
			404,
			"not_found",
		);
	});
});
