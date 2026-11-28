import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionUserId } from "#/features/auth/auth.functions";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async () => {
		const userId = await getSessionUserId();
		if (!userId) {
			throw redirect({ to: "/" });
		}
		return { userId };
	},
});
