/**
 * Shared response helpers for the public API in src/routes/api. The contract
 * they implement is documented in src/routes/api/api.md.
 */

export type ApiErrorCode =
	| "invalid_parameter"
	| "not_found"
	| "internal_error"
	| "unavailable";

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
} as const;

/** Thrown inside a handler to send a documented error response. */
export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly code: ApiErrorCode,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

function withCors(init?: ResponseInit): Headers {
	const headers = new Headers(init?.headers);
	for (const [key, value] of Object.entries(CORS_HEADERS)) {
		headers.set(key, value);
	}
	return headers;
}

/** A JSON response with the CORS headers every API route sends. */
export function json(body: unknown, init?: ResponseInit): Response {
	return Response.json(body, { ...init, headers: withCors(init) });
}

/** A JSON error response in the documented `{ error: { code, message } }` shape. */
export function apiError(
	status: number,
	code: ApiErrorCode,
	message: string,
): Response {
	return json({ error: { code, message } }, { status });
}

/** The `204` answer to an `OPTIONS` preflight request. */
export function preflight(): Response {
	return new Response(null, { status: 204, headers: withCors() });
}

/**
 * Runs a handler, turning a thrown ApiError into its error response and any
 * other failure into a `500`.
 */
export async function handle(run: () => Promise<Response>): Promise<Response> {
	try {
		return await run();
	} catch (error) {
		if (error instanceof ApiError) {
			return apiError(error.status, error.code, error.message);
		}
		console.error(error);
		return apiError(500, "internal_error", "Unexpected server failure");
	}
}
