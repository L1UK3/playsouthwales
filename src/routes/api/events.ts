import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/events")({
	server: {
		handlers: {
			GET: async () => {
				return Response.json({
					events: [
						{
							id: 42,
							name: "Cardiff League Challenge",
							date: "2026-11-21",
							startTime: "18:30",
							leagueId: 1,
							eventType: "CHALLENGE",
							game: "TCG",
							ticketLink: "https://example.com/tickets",
							description: "Registration opens at 18:00.",
							prizes: "Booster packs",
							entryFee: "£5",
							isRecurring: false,
						},
						{
							id: "7:2026-11-24",
							name: "Cardiff Weekly League",
							date: "2026-11-24",
							startTime: "18:00",
							leagueId: 1,
							eventType: "CASUAL",
							game: "TCG",
							entryFee: "Free",
							isRecurring: true,
							recurringEventId: 7,
						},
					],
				});
			},
		},
	},
});
