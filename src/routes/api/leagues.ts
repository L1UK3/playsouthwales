import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/leagues")({
	server: {
		handlers: {
			GET: async () => {
				return Response.json({
					leagues: [
						{
							leagueId: 1,
							name: "Cardiff League",
							location: "Cardiff",
							latitude: 51.48,
							longitude: -3.18,
							directions: "Next to the train station",
							accessibility: "Step-free access",
							logo: "https://example.com/logo.png",
							brandColor: "#E3350D",
							website: "https://example.com",
							socialLink: "https://example.com/social",
							eventLink: "https://example.com/events",
							webLink: "https://example.com/links",
							isChampionshipSeries: false,
						},
					],
				});
			},
		},
	},
});
