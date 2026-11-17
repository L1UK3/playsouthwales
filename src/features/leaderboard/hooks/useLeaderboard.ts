import { useEffect, useState } from "react";
import { getRankings } from "#/features/rankings/rankings.functions";
import { currentSeason } from "#/features/rankings/season";
import type { LeaderboardPosition } from "#/types/domain";

export function useLeaderboard(season?: string, skip = false) {
	const [data, setData] = useState<LeaderboardPosition[]>();
	const [isLoading, setIsLoading] = useState(!skip);

	useEffect(() => {
		if (skip) {
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		setIsLoading(true);

		getRankings({ data: { season: season ?? currentSeason() } })
			.then((rankings) => {
				if (!cancelled) setData(rankings.players);
			})
			.catch((err) => {
				console.error("Failed to fetch global leaderboard:", err);
				if (!cancelled) setData([]);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [season, skip]);

	return { data, isLoading };
}
