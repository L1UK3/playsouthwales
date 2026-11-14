import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { getLeagues } from "#/features/leagues/leagues.functions";
import { optionalId } from "#/lib/search";
import { pageMeta } from "#/lib/seo";

export const Route = createFileRoute("/leagues")({
	validateSearch: (search): { league?: number } => ({
		league: optionalId(search.league),
	}),
	loader: () => getLeagues(),
	head: () =>
		pageMeta("South Wales League Map & Stores", {
			description:
				"Find local TCG, VGC and GO leagues and stores across South Wales.",
		}),
	component: LeaguesPage,
});

function LeaguesPage() {
	const allLeagues = Route.useLoaderData();
	const { league: selectedLeagueId } = Route.useSearch();
	const navigate = Route.useNavigate();

	const leagues = useMemo(
		() => allLeagues.filter((league) => !league.isChampionshipSeries),
		[allLeagues],
	);

	const selectLeague = (id: number | null) => {
		navigate({ search: { league: id ?? undefined }, replace: true });
		if (id !== null) {
			document
				.getElementById(`league-card-${id}`)
				?.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
	};

	return (
		<div className="grid animate-swipe-up overflow-hidden rounded-md border border-border-color bg-bg-card lg:h-[calc(100dvh-8rem)] lg:min-h-150 lg:grid-cols-[minmax(340px,400px)_1fr]">
			<div className="flex min-h-0 flex-col gap-3.5 overflow-y-auto border-b-2 border-border-color p-4 delay-75 animate-swipe-up lg:h-full lg:border-r-2 lg:border-b-0">
				{leagues.length === 0 ? (
					<p className="px-5 py-15 text-center text-base font-medium text-text-muted">
						No leagues found.
					</p>
				) : (
					<LeagueSelector
						leagues={leagues}
						selectedLeagueId={selectedLeagueId ?? null}
						setSelectedLeagueId={selectLeague}
						columns={1}
						showInfo
					/>
				)}
			</div>

			<div className="relative h-[60dvh] min-h-0 bg-bg-main lg:h-full">
				<ClientOnly>
					<LeagueMap
						leagues={leagues}
						selectedLeagueId={selectedLeagueId ?? null}
						onLeagueSelect={selectLeague}
					/>
				</ClientOnly>
			</div>
		</div>
	);
}
