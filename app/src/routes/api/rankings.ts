import { createFileRoute } from "@tanstack/react-router";
import { querySeasonPlayers } from "#/db/queries.server";
import { handle, json, preflight } from "#/lib/api";
import { buildRankings, parseRankingsQuery } from "#/lib/rankings-query";

export const Route = createFileRoute("/api/rankings")({
	server: {
		handlers: {
			GET: ({ request }) =>
				handle(async () => {
					const query = parseRankingsQuery(new URL(request.url).searchParams);
					const players = await querySeasonPlayers(Number(query.season));
					return json({
						season: query.season,
						rankings: buildRankings(players, query),
					});
				}),
			OPTIONS: () => preflight(),
		},
	},
});
