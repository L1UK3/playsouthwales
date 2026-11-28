import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";

export const getSessionUserId = createServerFn({ method: "GET" }).handler(
	async () => {
		const { userId } = await auth();
		return userId ?? null;
	},
);
