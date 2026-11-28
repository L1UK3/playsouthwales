import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTableColumns } from "drizzle-orm";
import { leagues } from "#/db/leagues/schema";
import { withoutNulls } from "#/db/utils";

describe("GET /api/leagues", () => {
	it("sends only the documented League properties", () => {
		const keys = Object.keys(getTableColumns(leagues)).map((key) =>
			key === "id" ? "leagueId" : key,
		);
		assert.deepEqual(keys.sort(), [
			"accessibility",
			"brandColor",
			"directions",
			"eventLink",
			"isChampionshipSeries",
			"latitude",
			"leagueId",
			"location",
			"logo",
			"longitude",
			"name",
			"socialLink",
			"website",
		]);
	});

	it("omits null optionals", () => {
		assert.deepEqual(
			withoutNulls({ id: 1, name: "Swansea League", location: null }),
			{ id: 1, name: "Swansea League" },
		);
	});
});
