import { createFileRoute } from "@tanstack/react-router";
import { queryLeagues } from "#/db/leagues/queries.server";

export const Route = createFileRoute("/api/leagues")({
	server: {
		handlers: {
			GET: async () => {
				const leagues = await queryLeagues();
				return Response.json({ leagues });
			},
		},
	},
});
