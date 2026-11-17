import type React from "react";
import { useCallback, useMemo, useState } from "react";

import ListEventGroup from "#/features/calendar/components/ListEventGroup";
import type { EventTypeMap, League, ScheduleEvent } from "#/types/domain";

/**
 * Properties for the ListView component.
 * @property month - The currently viewed month as a YYYY-MM key (optional).
 * @property events - A mapping of date keys (YYYY-MM-DD) to arrays of events for those dates.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 */
export interface ListViewProps {
	month?: string;
	events: Record<string, ScheduleEvent[]>;
	leagueMap: Record<number, League>;
	types: EventTypeMap;
	onEdit?: (event: ScheduleEvent) => void;
	onDelete?: (event: ScheduleEvent) => void;
	onExclude?: (event: ScheduleEvent) => void;
	onUnexclude?: (event: ScheduleEvent) => void;
}

/**
 * ListView component displays a chronological list of events for the currently viewed month.
 * It groups events by date and provides expandable details for each event.
 * @param props - The properties passed to the component including the current date, events mapping, league mapping, and event types.
 * @returns JSX.Element
 */
const ListView: React.FC<ListViewProps> = ({
	month,
	events,
	leagueMap,
	types,
	onEdit,
	onDelete,
	onExclude,
	onUnexclude,
}) => {
	const [expandedEventId, setExpandedEventId] = useState<
		number | string | null
	>(null);

	const sortedDates = useMemo(() => {
		const dateKeys = Object.keys(events);
		if (month) {
			const prefix = `${month}-`;
			return dateKeys.filter((dateKey) => dateKey.startsWith(prefix)).sort();
		}
		return dateKeys.sort();
	}, [events, month]);

	const handleToggleEvent = useCallback((eventId: number | string) => {
		setExpandedEventId((prev) => (prev === eventId ? null : eventId));
	}, []);

	if (sortedDates.length === 0) {
		return (
			<div className="py-10 px-5 text-center text-text-muted text-base">
				No events found.
			</div>
		);
	}

	return (
		<div id="list-view-events" className="flex flex-col gap-3">
			{sortedDates.map((dateKey) => (
				<ListEventGroup
					key={dateKey}
					dateKey={dateKey}
					eventsForDay={events[dateKey]}
					leagueMap={leagueMap}
					types={types}
					expandedEventId={expandedEventId}
					onToggleEvent={handleToggleEvent}
					onEdit={onEdit}
					onDelete={onDelete}
					onExclude={onExclude}
					onUnexclude={onUnexclude}
				/>
			))}
		</div>
	);
};

export default ListView;
