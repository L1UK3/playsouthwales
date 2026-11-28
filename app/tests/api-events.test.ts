import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "#/lib/api";
import {
	type ApiEvent,
	eventsDateRange,
	groupEvents,
	monthsInRange,
	parseEventsQuery,
	toApiEvent,
} from "#/lib/events-query";
import { expandRecurring } from "#/lib/recurrence";

const parse = (query: string) => parseEventsQuery(new URLSearchParams(query));

function assertInvalid(query: string, message: RegExp) {
	assert.throws(
		() => parse(query),
		(error: unknown) =>
			error instanceof ApiError &&
			error.status === 400 &&
			error.code === "invalid_parameter" &&
			message.test(error.message),
	);
}

describe("parseEventsQuery", () => {
	it("reads every parameter", () => {
		assert.deepEqual(
			parse("leagueId=3&day=2026-11-21&month=2026-11&year=2026&groupBy=day"),
			{
				leagueId: 3,
				day: "2026-11-21",
				month: "2026-11",
				year: "2026",
				groupBy: "day",
			},
		);
	});

	it("returns an empty query with no parameters", () => {
		assert.deepEqual(parse(""), {});
	});

	it("rejects a non-integer leagueId", () => {
		for (const value of ["abc", "1.5", "", "1e3", " 1"]) {
			assertInvalid(`leagueId=${encodeURIComponent(value)}`, /leagueId/);
		}
	});

	it("rejects malformed and impossible days", () => {
		for (const value of ["2026-02-30", "2026-13-01", "2026-1-01", "", "x"]) {
			assertInvalid(`day=${value}`, /day/);
		}
	});

	it("rejects malformed months and years", () => {
		assertInvalid("month=2026-13", /month/);
		assertInvalid("month=2026-1", /month/);
		assertInvalid("year=26", /year/);
		assertInvalid("year=20266", /year/);
	});

	it("rejects an unknown groupBy", () => {
		assertInvalid("groupBy=week", /groupBy/);
	});

	it("rejects a repeated parameter", () => {
		assertInvalid("month=2026-11&month=2026-12", /month/);
	});
});

describe("eventsDateRange", () => {
	const now = new Date("2026-11-28T12:00:00Z");

	it("defaults to the current month", () => {
		assert.deepEqual(eventsDateRange({}, now), {
			from: "2026-11-01",
			to: "2026-12-01",
		});
	});

	it("covers a single day, month or year", () => {
		assert.deepEqual(eventsDateRange({ day: "2026-12-31" }, now), {
			from: "2026-12-31",
			to: "2027-01-01",
		});
		assert.deepEqual(eventsDateRange({ month: "2026-12" }, now), {
			from: "2026-12-01",
			to: "2027-01-01",
		});
		assert.deepEqual(eventsDateRange({ year: "2026" }, now), {
			from: "2026-01-01",
			to: "2027-01-01",
		});
	});

	it("intersects combined filters", () => {
		assert.deepEqual(eventsDateRange({ year: "2026", month: "2026-03" }, now), {
			from: "2026-03-01",
			to: "2026-04-01",
		});
		assert.equal(
			eventsDateRange({ year: "2025", month: "2026-03" }, now),
			null,
		);
		assert.equal(
			eventsDateRange({ month: "2026-03", day: "2026-04-01" }, now),
			null,
		);
	});

	it("lists the months a range overlaps", () => {
		assert.deepEqual(
			monthsInRange({ from: "2026-01-01", to: "2027-01-01" }).length,
			12,
		);
		assert.deepEqual(monthsInRange({ from: "2026-12-31", to: "2027-01-01" }), [
			"2026-12",
		]);
	});
});

describe("toApiEvent", () => {
	it("keeps only documented properties and omits empty optionals", () => {
		const event = toApiEvent({
			id: 7,
			name: "League Cup",
			date: "2026-11-21",
			startTime: "",
			leagueId: 2,
			eventType: "CUP",
			game: "TCG",
			description: "Bring a deck",
			pokedataGuid: "abc",
			leagueName: "Cardiff",
			excludedDates: [],
		});
		assert.deepEqual(event, {
			id: 7,
			name: "League Cup",
			date: "2026-11-21",
			leagueId: 2,
			eventType: "CUP",
			game: "TCG",
			description: "Bring a deck",
			isRecurring: false,
		});
	});

	it("maps weekly occurrences, omitting excluded dates", () => {
		const occurrences = expandRecurring(
			[
				{
					id: 4,
					name: "Weekly",
					date: "2026-11-02",
					startTime: "18:30:00",
					leagueId: 1,
					eventType: "CASUAL",
					game: "ALL",
					isRecurring: true,
					excludedDates: ["2026-11-09"],
				},
			],
			"2026-11",
			false,
		).map(toApiEvent);

		assert.deepEqual(
			occurrences.map((e) => e.id),
			["4:2026-11-02", "4:2026-11-16", "4:2026-11-23", "4:2026-11-30"],
		);
		assert.deepEqual(occurrences[0], {
			id: "4:2026-11-02",
			name: "Weekly",
			date: "2026-11-02",
			startTime: "18:30",
			leagueId: 1,
			eventType: "CASUAL",
			game: "ALL",
			isRecurring: true,
			recurringEventId: 4,
		});
	});
});

describe("groupEvents", () => {
	const event = (id: number, leagueId: number, date: string): ApiEvent => ({
		id,
		name: `Event ${id}`,
		date,
		leagueId,
		eventType: "CASUAL",
		game: "TCG",
		isRecurring: false,
	});
	const events = [
		event(1, 1, "2026-11-21"),
		event(2, 2, "2026-11-21"),
		event(3, 1, "2026-12-05"),
	];
	const ids = (grouped: Record<string, ApiEvent[]>) =>
		Object.fromEntries(
			Object.entries(grouped).map(([key, list]) => [
				key,
				list.map((e) => e.id),
			]),
		);

	it("groups by league, day, month and year", () => {
		assert.deepEqual(ids(groupEvents(events, "league")), {
			"1": [1, 3],
			"2": [2],
		});
		assert.deepEqual(ids(groupEvents(events, "day")), {
			"2026-11-21": [1, 2],
			"2026-12-05": [3],
		});
		assert.deepEqual(ids(groupEvents(events, "month")), {
			"2026-11": [1, 2],
			"2026-12": [3],
		});
		assert.deepEqual(ids(groupEvents(events, "year")), { "2026": [1, 2, 3] });
	});
});
