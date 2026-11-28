import { createFileRoute } from "@tanstack/react-router";
import { queryRankings } from "#/db/queries.server";
import { handle, json, preflight } from "#/lib/api";
import { filterRankings, parseRankingsQuery } from "#/lib/rankings-query";

export const Route = createFileRoute("/api/rankings")({
	server: {
		handlers: {
			GET: ({ request }) =>
				handle(async () => {
					const query = parseRankingsQuery(new URL(request.url).searchParams);
					const ranked = await queryRankings(Number(query.season));
					return json({
						season: query.season,
						rankings: filterRankings(ranked, query),
					});
				}),
			OPTIONS: () => preflight(),
		},
	},
});
