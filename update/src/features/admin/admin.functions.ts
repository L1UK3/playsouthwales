import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/features/auth/auth.middleware";
import { isMonthKey } from "#/lib/month";
import type { EventTypeMap, League, ScheduleEvent } from "#/types/domain";

interface AdminData {
	leagues: League[];
	types: EventTypeMap;
	/** Events for the requested month, including excluded occurrences. */
	events: ScheduleEvent[];
}

export const getAdminData = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator((input: { month: string }) => {
		if (!isMonthKey(input.month)) throw new Error("Invalid month");
		return input;
	})
	.handler(async (): Promise<AdminData> => {
		// TODO(db): query leagues, event types and the month's events from D1
		// through Drizzle once src/db/schema.ts exists.
		return { leagues: [], types: {}, events: [] };
	});
