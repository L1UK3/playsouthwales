import { createServerFn } from "@tanstack/react-start";
import { querySchedule } from "#/db/queries.server";
import { isMonthKey } from "#/lib/month";

export const getSchedule = createServerFn({ method: "GET" })
	.validator((input: { month: string }) => {
		if (!isMonthKey(input.month)) throw new Error("Invalid month");
		return input;
	})
	.handler(({ data }) => querySchedule(data.month, false));
