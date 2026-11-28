import { createFileRoute } from "@tanstack/react-router";
import { queryLeagues } from "#/db/leagues/queries.server";
import { handle, json, preflight } from "#/lib/api";

export const Route = createFileRoute("/api/leagues")({
	server: {
		handlers: {
			GET: () => handle(async () => json({ leagues: await queryLeagues() })),
			OPTIONS: () => preflight(),
		},
	},
});
