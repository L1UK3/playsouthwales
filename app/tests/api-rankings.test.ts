import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankPlayers } from "#/features/rankings/ranking";
import { ApiError } from "#/lib/api";
import {
	filterRankings,
	parseRankingsQuery,
	type RankingsQuery,
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

describe("filterRankings", () => {
	const ranked = rankPlayers([
		{ name: "Owain Hughes", playerId: 123456, cp: 85 },
		{ name: "Megan Jones", playerId: 104562, cp: 240 },
		{ name: "Alys Morgan", playerId: null, cp: 85 },
		{ name: "Dylan Thomas", playerId: 100234, cp: 285 },
	]);
	const query = (filters: Partial<RankingsQuery>): RankingsQuery => ({
		season: "2027",
		playerId: null,
		playerName: null,
		...filters,
	});

	it("leaves out a missing playerId", () => {
		assert.deepEqual(filterRankings(ranked, query({})), [
			{ position: 1, name: "Dylan Thomas", playerId: 100234, cp: 285 },
			{ position: 2, name: "Megan Jones", playerId: 104562, cp: 240 },
			{ position: 3, name: "Alys Morgan", cp: 85 },
			{ position: 4, name: "Owain Hughes", playerId: 123456, cp: 85 },
		]);
	});

	it("returns an empty list for a season with no players", () => {
		assert.deepEqual(filterRankings([], query({})), []);
	});

	it("filters by playerId without renumbering", () => {
		assert.deepEqual(filterRankings(ranked, query({ playerId: 123456 })), [
			{ position: 4, name: "Owain Hughes", playerId: 123456, cp: 85 },
		]);
	});

	it("filters by a case-insensitive part of the name", () => {
		assert.deepEqual(
			filterRankings(ranked, query({ playerName: "AN" })).map(
				(ranking) => ranking.position,
			),
			[1, 2, 3],
		);
	});

	for (const filters of [{ playerId: 1 }, { playerName: "Zed" }]) {
		it(`rejects an unknown player: ${JSON.stringify(filters)}`, () => {
			assertApiError(
				() => filterRankings(ranked, query(filters)),
				404,
				"not_found",
			);
		});
	}
});
