/* Hallmark · component: league sheet · genre: modern-minimal · theme: custom (design.md) */

import { Link } from "@tanstack/react-router";
import type React from "react";
import { EventCard } from "#/features/event-card";
import LeagueInfo from "#/features/league-selector/components/LeagueInfo";
import { cn } from "#/lib/utils";
import type { League } from "#/types/domain";
import { LEAGUE_SHEET_EVENT_LIMIT } from "../constants";
import useLeagueUpcomingEvents from "../hooks/useLeagueUpcomingEvents";
import MapSheet from "./MapSheet";

interface LeagueSheetProps {
	league: League;
	leagueMap: Record<number, League>;
	onClose: () => void;
}

/**
 * LeagueSheet shows a selected league's details and next events in a bottom
 * sheet over the mobile map.
 */
const LeagueSheet: React.FC<LeagueSheetProps> = ({
	league,
	leagueMap,
	onClose,
}) => {
	const { events, types, isLoading, isError } = useLeagueUpcomingEvents(
		league.leagueId,
		LEAGUE_SHEET_EVENT_LIMIT,
	);

	const logo = league.logo ? (
		<img
			src={league.logo}
			alt=""
			width="36"
			height="36"
			decoding="async"
			className={cn(
				"size-9 shrink-0 rounded-lg border border-border-color bg-white",
				"object-contain p-1",
			)}
		/>
	) : (
		<div
			aria-hidden="true"
			className={cn(
				"flex size-9 shrink-0 items-center justify-center rounded-lg border",
				"border-border-color bg-bg-main text-xs font-bold text-text-muted",
			)}
		>
			{league.name.charAt(0)}
		</div>
	);

	return (
		<MapSheet title={league.name} leading={logo} onClose={onClose}>
			<LeagueInfo league={league} />

			<section aria-label="Upcoming events" className="mt-4">
				<h3 className="m-0 mb-2.5 text-sm font-bold text-text-darker">
					Upcoming events
				</h3>

				{isLoading ? (
					<p className="m-0 text-xs text-text-muted">Loading events…</p>
				) : isError ? (
					<p className="m-0 text-xs text-text-muted">
						Events could not be loaded. Try the full schedule.
					</p>
				) : events.length === 0 ? (
					<p className="m-0 text-xs text-text-muted">
						No upcoming events are listed for this league.
					</p>
				) : (
					<ul className="m-0 flex list-none flex-col gap-3 p-0">
						{events.map((event) => (
							<li key={event.id}>
								<EventCard event={event} leagueMap={leagueMap} types={types} />
							</li>
						))}
					</ul>
				)}

				<Link
					to="/"
					className={cn(
						"mt-3 inline-block text-xs font-bold text-primary no-underline",
						"hover:underline",
					)}
				>
					See full schedule
				</Link>
			</section>
		</MapSheet>
	);
};

export default LeagueSheet;
