import { createFileRoute } from "@tanstack/react-router";
import { queryLeagues } from "#/db/leagues/queries.server";
import { handle, json, preflight } from "#/lib/api";
import { toPublicLeague } from "#/lib/public-league";

export const Route = createFileRoute("/api/leagues")({
	server: {
		handlers: {
			GET: () =>
				handle(async () => {
					const leagues = await queryLeagues();
					return json({ leagues: leagues.map(toPublicLeague) });
				}),
			OPTIONS: () => preflight(),
		},
	},
});
