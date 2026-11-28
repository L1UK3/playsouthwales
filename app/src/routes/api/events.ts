import { createFileRoute } from "@tanstack/react-router";
import { querySchedule } from "#/db/queries.server";
import { currentMonthKey } from "#/lib/month";

export const Route = createFileRoute("/api/events")({
	server: {
		handlers: {
			GET: async () => {
				const events = await querySchedule(currentMonthKey(), false);
				return Response.json({ events });
			},
		},
	},
});
