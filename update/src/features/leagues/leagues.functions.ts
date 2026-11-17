import { createServerFn } from "@tanstack/react-start";
import { queryLeagues } from "#/db/queries.server";

export const getLeagues = createServerFn({ method: "GET" }).handler(() =>
	queryLeagues(),
);
