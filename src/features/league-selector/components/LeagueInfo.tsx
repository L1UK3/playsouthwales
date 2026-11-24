import type React from "react";
import { cn } from "#/lib/utils";
import type { League } from "#/types/domain";

/** The free-text venue details, in the order they are listed. */
const DETAILS = [
	{ key: "location", label: "Location" },
	{ key: "directions", label: "Directions" },
	{ key: "accessibility", label: "Accessibility" },
] as const satisfies readonly { key: keyof League; label: string }[];

interface LeagueInfoProps {
	league: League;
}

/**
 * LeagueInfo lists a league's location, directions, accessibility notes, and
 * external links. LeagueCard and the mobile map sheet both use it.
 */
export const LeagueInfo: React.FC<LeagueInfoProps> = ({ league }) => (
	<div className="flex flex-col gap-2.5 mt-0.5">
		{DETAILS.map(({ key, label }) =>
			league[key] ? (
				<div
					key={key}
					className={cn(
						"text-xs text-text-muted pl-3 border-l-2 border-border-color/80 flex",
						"flex-col gap-0.5",
					)}
				>
					<span className="font-semibold text-text-main">{label}</span>
					<span className="leading-relaxed">{league[key]}</span>
				</div>
			) : null,
		)}

		{/* External Website & Event Links */}
		{(league.website ?? league.eventLink) && (
			<div className="flex flex-wrap gap-2 mt-1">
				{league.website && (
					<a
						href={league.website}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-secondary text-xs py-1.5 px-3"
						onClick={(e) => e.stopPropagation()}
					>
						League Website
					</a>
				)}
				{league.eventLink && (
					<a
						href={league.eventLink}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-secondary text-xs py-1.5 px-3"
						onClick={(e) => e.stopPropagation()}
					>
						Event Page
					</a>
				)}
			</div>
		)}
	</div>
);

export default LeagueInfo;
