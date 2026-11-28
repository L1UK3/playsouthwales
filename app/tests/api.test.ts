import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError, apiError, handle, json, preflight } from "#/lib/api";

describe("api helpers", () => {
	it("sends CORS headers with JSON", async () => {
		const response = json({ ok: true });
		assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
		assert.deepEqual(await response.json(), { ok: true });
	});

	it("answers preflight with 204", () => {
		const response = preflight();
		assert.equal(response.status, 204);
		assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
	});

	it("shapes errors", async () => {
		const response = apiError(400, "invalid_parameter", "Invalid month");
		assert.equal(response.status, 400);
		assert.deepEqual(await response.json(), {
			error: { code: "invalid_parameter", message: "Invalid month" },
		});
	});

	it("turns a thrown ApiError into its response", async () => {
		const response = await handle(async () => {
			throw new ApiError(404, "not_found", "Unknown league");
		});
		assert.equal(response.status, 404);
	});

	it("turns other failures into a 500", async () => {
		const original = console.error;
		console.error = () => {};
		try {
			const response = await handle(async () => {
				throw new Error("boom");
			});
			assert.equal(response.status, 500);
			assert.equal(
				((await response.json()) as { error: { code: string } }).error.code,
				"internal_error",
			);
		} finally {
			console.error = original;
		}
	});
});
