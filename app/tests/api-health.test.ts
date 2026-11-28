import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { healthResponse } from "#/lib/health";

describe("health route", () => {
	it("reports ok when the database check passes", async () => {
		const response = await healthResponse(async () => {});
		assert.equal(response.status, 200);
		assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
		assert.equal(response.headers.get("Cache-Control"), "no-store");
		assert.deepEqual(await response.json(), { status: "ok", db: "ok" });
	});

	it("reports a 503 when the database check throws", async () => {
		const original = console.error;
		console.error = () => {};
		try {
			const response = await healthResponse(async () => {
				throw new Error("D1 unreachable");
			});
			assert.equal(response.status, 503);
			assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
			assert.equal(response.headers.get("Cache-Control"), "no-store");
			assert.deepEqual(await response.json(), {
				status: "error",
				db: "error",
			});
		} finally {
			console.error = original;
		}
	});
});
