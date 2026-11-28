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
		assert.deepEqual(parseRankingsQuery(params(""), november), {
			season: "2027",
		});
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
			parseRankingsQuery(
				params("season=2026&playerId=42&playerName=%20Meg%20"),
			),
			{ season: "2026", playerId: 42, playerName: "Meg" },
		);
	});

	it("ignores a blank playerName", () => {
		const query = parseRankingsQuery(params("season=2027&playerName=%20"));
		assert.deepEqual(query, { season: "2027" });
	});

	for (const season of ["", "27", "20277", "2027a", "abcd"]) {
		it(`rejects season=${JSON.stringify(season)}`, () => {
			assertApiError(
				() => parseRankingsQuery(params(`season=${season}`)),
				400,
				"invalid_parameter",
			);
		});
	}

	for (const playerId of [
		"",
		"abc",
		"1.5",
		"-3",
		"1e3",
		"99999999999999999999",
	]) {
		it(`rejects playerId=${JSON.stringify(playerId)}`, () => {
			assertApiError(
				() =>
					parseRankingsQuery(
						params(`playerId=${encodeURIComponent(playerId)}`),
					),
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
		assert.deepEqual(buildRankings(players, { season: "2027" }), [
			{ position: 1, name: "Dylan Thomas", playerId: 100234, cp: 285 },
			{ position: 2, name: "Megan Jones", playerId: 104562, cp: 240 },
			{ position: 3, name: "Alys Morgan", cp: 85 },
			{ position: 4, name: "Owain Hughes", playerId: 123456, cp: 85 },
		]);
	});

	it("returns an empty list for a season with no players", () => {
		assert.deepEqual(buildRankings([], { season: "2020" }), []);
	});

	it("filters by playerId without renumbering", () => {
		assert.deepEqual(
			buildRankings(players, { season: "2027", playerId: 123456 }),
			[{ position: 4, name: "Owain Hughes", playerId: 123456, cp: 85 }],
		);
	});

	it("filters by a case-insensitive part of the name", () => {
		assert.deepEqual(
			buildRankings(players, { season: "2027", playerName: "AN" }).map(
				(ranking) => ranking.position,
			),
			[1, 2, 3],
		);
		assert.deepEqual(
			buildRankings(players, { season: "2027", playerName: "MEGAN" }),
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
			() => buildRankings(players, { season: "2027", playerId: 1 }),
			404,
			"not_found",
		);
	});

	it("rejects a playerName that matches nobody", () => {
		assertApiError(
			() => buildRankings(players, { season: "2027", playerName: "Zed" }),
			404,
			"not_found",
		);
	});
});
