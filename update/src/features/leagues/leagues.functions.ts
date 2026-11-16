import { createServerFn } from "@tanstack/react-start";
import type { League } from "#/types/domain";

export const getLeagues = createServerFn({ method: "GET" }).handler(
	async (): Promise<League[]> => {
		return [];
	},
);
