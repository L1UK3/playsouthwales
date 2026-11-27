import type React from "react";

import type { EventFilters } from "#/lib/events";
import { cn } from "#/lib/utils";
import type { EventTypeMap, League } from "#/types/domain";

/**
 * Properties for the Filters component, enabling users to refine the list of displayed events.

 * @property leagues - Array of available leagues to filter by.
 * @property types - Mapping of event types to their associated games for selection.
 * @property filters - The current state of active filter selections.
 * @property onFilterChange - Callback function triggered when a filter value is updated.
 * @property onClear - Callback function to reset all active filters to their default state.
 */
export interface FiltersProps {
	leagues: League[];
	types: EventTypeMap;
	filters: EventFilters;
	onFilterChange: (name: keyof EventFilters, value: string) => void;
	onClear: () => void;
}

const GAMES = ["TCG", "VGC", "GO"];

interface FilterSelectProps {
	id: string;
	label: string;
	allLabel: string;
	value: string | number | undefined;
	options: { value: string | number; label: string }[];
	onChange: (value: string) => void;
	className: string;
}

function FilterSelect({
	id,
	label,
	allLabel,
	value,
	options,
	onChange,
	className,
}: FilterSelectProps) {
	return (
		<div className={cn("w-full sm:flex-1 flex flex-col", className)}>
			<label htmlFor={id} className="sr-only">
				{label}
			</label>
			<select
				id={id}
				className={cn(
					"py-1.5 px-2.5 rounded-md border border-border-color text-xs",
					"sm:text-sm bg-bg-card text-text-main",
					"transition-[background-color,border-color] duration-150 ease-out",
					"focus:outline-none focus:border-secondary focus:ring-3",
					"focus:ring-secondary/15 w-full cursor-pointer",
				)}
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="">{allLabel}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}

/**
 * Filters component provides dropdown menus to filter events by league, event type, and game category.
 * @param props - The properties passed to the component including leagues, types, current filters, and change handlers.
 * @returns JSX.Element
 */
const Filters: React.FC<FiltersProps> = ({
	leagues,
	types,
	filters,
	onFilterChange,
	onClear,
}) => {
	return (
		<div
			className="grid grid-cols-2 sm:flex sm:flex-row gap-2.5 w-full"
			id="view-filters"
		>
			<FilterSelect
				id="league-filter"
				label="Filter by League"
				allLabel="All Leagues"
				className="sm:min-w-37.5"
				value={filters.league}
				options={leagues.map((l) => ({ value: l.leagueId, label: l.name }))}
				onChange={(value) => onFilterChange("league", value)}
			/>
			<FilterSelect
				id="type-filter"
				label="Filter by Event Type"
				allLabel="All Event Types"
				className="sm:min-w-37.5"
				value={filters.eventType}
				options={Object.keys(types).map((eventType) => ({
					value: eventType,
					label: types[eventType]
						? `[${types[eventType]}] ${eventType}`
						: eventType,
				}))}
				onChange={(value) => onFilterChange("eventType", value)}
			/>
			<FilterSelect
				id="game-filter"
				label="Filter by Game"
				allLabel="All Games"
				className="sm:min-w-27.5"
				value={filters.game}
				options={GAMES.map((game) => ({ value: game, label: game }))}
				onChange={(value) => onFilterChange("game", value)}
			/>

			<button
				type="button"
				className="btn btn-primary py-1.5 w-full sm:w-auto sm:shrink-0 sm:min-w-20"
				onClick={onClear}
			>
				Clear
			</button>
		</div>
	);
};

export default Filters;
