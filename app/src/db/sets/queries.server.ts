import { and, gte, lt, or } from "drizzle-orm";
import { shiftMonth } from "#/lib/month";
import { getDb } from "../client.server";
import { withoutNulls } from "../utils";
import { type SetRow, type SetValues, sets } from "./schema";

export async function querySets(month?: string): Promise<SetRow[]> {
	const db = getDb();
	if (!month) {
		const rows = await db.select().from(sets).orderBy(sets.releaseDate);
		return rows.map(withoutNulls);
	}

	const monthStart = `${month}-01`;
	const nextMonthStart = `${shiftMonth(month, 1)}-01`;

	const rows = await db
		.select()
		.from(sets)
		.where(
			or(
				and(
					gte(sets.releaseDate, monthStart),
					lt(sets.releaseDate, nextMonthStart),
				),
				and(
					gte(sets.legalDate, monthStart),
					lt(sets.legalDate, nextMonthStart),
				),
			),
		)
		.orderBy(sets.releaseDate);

	return rows.map(withoutNulls);
}

export async function insertSet(values: SetValues): Promise<void> {
	await getDb().insert(sets).values(values);
}
