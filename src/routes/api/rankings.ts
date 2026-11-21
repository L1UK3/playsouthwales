import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/rankings")({
	server: {
		handlers: {
			GET: async () => {
				return Response.json({
					season: "2027",
					rankings: [
						{ position: 1, name: "Example Player", cp: 250, playerId: 1001 },
						{ position: 2, name: "Another Player", cp: 180, playerId: 1002 },
					],
				});
			},
		},
	},
});
