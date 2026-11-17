import { auth } from "@clerk/tanstack-react-start/server";
import { createMiddleware } from "@tanstack/react-start";

/**
 * Attach to every server function that needs a signed-in user. Route guards
 * only hide pages; this is the data boundary.
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}
		return next({ context: { userId } });
	},
);
