import { createFileRoute } from "@tanstack/react-router";
import { queryRankings } from "#/db/queries.server";

export const Route = createFileRoute("/api/rankings")({
	server: {
		handlers: {
			GET: async () => {
				const rankings = await queryRankings();
				return Response.json({ rankings });
			},
		},
	},
});
