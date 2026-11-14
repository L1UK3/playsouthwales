import { createServerFn } from "@tanstack/react-start";
import { isMonthKey } from "#/lib/month";
import type { EventTypeMap, League, ScheduleEvent } from "#/types/domain";

interface ScheduleData {
	leagues: League[];
	types: EventTypeMap;
	events: ScheduleEvent[];
}

export const getSchedule = createServerFn({ method: "GET" })
	.validator((input: { month: string }) => {
		if (!isMonthKey(input.month)) throw new Error("Invalid month");
		return input;
	})
	.handler(async (): Promise<ScheduleData> => {
		return { leagues: [], types: {}, events: [] };
	});
