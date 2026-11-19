import type React from "react";
import { lazy, Suspense, useMemo, useRef } from "react";
import Cell from "#/features/calendar/components/Cell";
import type { CellData } from "#/features/calendar/types/CellData";
import { getLocalDateString } from "#/features/calendar/utils/getLocalDateString";
import { cn } from "#/lib/utils";
import type { EventTypeMap, League, ScheduleEvent } from "#/types/domain";

const ActiveMarkerOverlay = lazy(() => import("./ActiveMarkerOverlay"));

/**
 * Properties for the CalendarView component.
 * @property month - The currently viewed month as a YYYY-MM key.
 * @property events - A mapping of date keys (YYYY-MM-DD) to arrays of events for those dates.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property selectedDateKey - The dateKey of the currently selected day.
 * @property onSelectDay - Callback function triggered when a day is selected.
 */
export interface CalendarViewProps {
	month: string;
	events: Record<string, ScheduleEvent[]>;
	leagueMap: Record<number, League>;
	types: EventTypeMap;
	selectedDateKey: string | undefined;
	onSelectDay: (dateKey: string) => void;
}

const EMPTY_ARRAY: ScheduleEvent[] = [];

/**
 * CalendarView component manages the logic for generating the calendar grid data.
 * It calculates the days for the current month, including padding for previous and next months,
 * and passes the processed data to the CalendarRenderer.
 * @param {CalendarViewProps} props - The properties passed to the component, including the current date, events, and selection handlers.
 * @returns {JSX.Element} The rendered calendar view.
 */
const CalendarView: React.FC<CalendarViewProps> = ({
	month: monthKey,
	events,
	leagueMap,
	types,
	selectedDateKey,
	onSelectDay,
}) => {
	const today = useMemo(() => new Date(), []);
	const todayKey = getLocalDateString(today);
	const wrapperRef = useRef<HTMLDivElement>(null);

	const cells = useMemo(() => {
		const [year, monthNumber] = monthKey.split("-").map(Number);
		const month = monthNumber - 1;

		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysInPrevMonth = new Date(year, month, 0).getDate();
		const startDay = firstDay === 0 ? 6 : firstDay - 1;

		const generateCellData = (
			day: number,
			m: number,
			y: number,
			isOtherMonth: boolean,
		): CellData => {
			const cellDate = new Date(y, m - 1, day);
			return {
				day,
				month: m,
				year: y,
				isOtherMonth,
				dateKey: getLocalDateString(cellDate),
			};
		};

		const list: CellData[] = [];

		for (let i = startDay - 1; i >= 0; i--) {
			list.push(generateCellData(daysInPrevMonth - i, month, year, true));
		}

		for (let day = 1; day <= daysInMonth; day++) {
			list.push(generateCellData(day, month + 1, year, false));
		}

		const totalCells = list.length;
		const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
		for (let day = 1; day <= remainingCells; day++) {
			list.push(generateCellData(day, month + 2, year, true));
		}

		return list;
	}, [monthKey]);

	return (
		<div
			className={cn(
				"relative bg-bg-card rounded-lg shadow-main overflow-hidden lg:flex lg:flex-col",
			)}
			ref={wrapperRef}
		>
			<div
				className={cn(
					"grid grid-cols-7 bg-bg-day-header border-b border-border-color text-center text-text-muted font-bold border-2 rounded-t-lg shrink-0",
				)}
			>
				{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
					<div
						key={d}
						className={cn("py-2.5 px-2 text-xs uppercase tracking-wider")}
					>
						{d}
					</div>
				))}
			</div>
			<div
				className={cn(
					"relative grid grid-cols-7 grid-rows-[repeat(auto-fill,minmax(0,1fr))] @6xl:grid-rows-[repeat(var(--num-rows,5),minmax(0,1fr))]! gap-px bg-border-color border-2 border-border-color border-t-0 rounded-b-lg overflow-hidden @6xl:flex-1",
				)}
				style={{ "--num-rows": cells.length / 7 } as React.CSSProperties}
			>
				{cells.map((cell) => (
					<Cell
						key={cell.dateKey}
						day={cell.day}
						dateKey={cell.dateKey}
						isOtherMonth={cell.isOtherMonth}
						eventsForDay={events[cell.dateKey] ?? EMPTY_ARRAY}
						leagueMap={leagueMap}
						types={types}
						selectedDateKey={selectedDateKey}
						todayKey={todayKey}
						isSpecialDay={
							events[cell.dateKey]?.some(
								(event) =>
									event.eventType === "LEGALITY" ||
									event.eventType === "REGULATION",
							) ?? false
						}
						onSelectDay={onSelectDay}
					/>
				))}
			</div>
			<Suspense fallback={null}>
				<ActiveMarkerOverlay
					containerRef={wrapperRef}
					selectedDateKey={selectedDateKey}
					todayKey={todayKey}
				/>
			</Suspense>
		</div>
	);
};

export default CalendarView;
