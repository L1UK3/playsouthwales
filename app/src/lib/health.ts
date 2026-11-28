import { json } from "#/lib/api";

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
		return json({ status: "error", db: "error" }, { status: 503 });
	}
	return json({ status: "ok", db: "ok" });
}
