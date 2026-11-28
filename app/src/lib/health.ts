import { json } from "#/lib/api";

const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * Builds the `GET /api/health` response from a database check. A check that
 * throws gives the health-specific `503` body, not the generic error shape.
 */
export async function healthResponse(
	checkDb: () => Promise<unknown>,
): Promise<Response> {
	try {
		await checkDb();
	} catch (error) {
		console.error(error);
		return json(
			{ status: "error", db: "error" },
			{ status: 503, headers: NO_STORE },
		);
	}
	return json({ status: "ok", db: "ok" }, { headers: NO_STORE });
}
