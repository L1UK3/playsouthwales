import { createFileRoute } from "@tanstack/react-router";
import { findLeague } from "#/db/leagues/queries.server";
import { queryEventsInRange } from "#/db/queries.server";
import { ApiError, handle, json, preflight } from "#/lib/api";
import {
	eventsDateRange,
	groupEvents,
	parseEventsQuery,
	toApiEvent,
} from "#/lib/events-query";

export const Route = createFileRoute("/api/events")({
	server: {
		handlers: {
			GET: ({ request }) =>
				handle(async () => {
					const query = parseEventsQuery(new URL(request.url).searchParams);
					if (
						query.leagueId !== undefined &&
						!(await findLeague(query.leagueId))
					) {
						throw new ApiError(404, "not_found", "Unknown league");
					}

					const range = eventsDateRange(query);
					const events = range
						? (await queryEventsInRange(range, query.leagueId)).map(toApiEvent)
						: [];
					return json({
						events: query.groupBy ? groupEvents(events, query.groupBy) : events,
					});
				}),
			OPTIONS: () => preflight(),
		},
	},
});
