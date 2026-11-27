import { and, gte, lt } from "drizzle-orm";
import { shiftMonth } from "#/lib/month";
import { getDb } from "../client.server";
import { withoutNulls } from "../utils";
import { type RegRow, type RegValues, regs } from "./schema";

export async function queryRegs(month?: string): Promise<RegRow[]> {
	const db = getDb();
	if (!month) {
		const rows = await db.select().from(regs).orderBy(regs.date);
		return rows.map(withoutNulls);
	}

	const monthStart = `${month}-01`;
	const nextMonthStart = `${shiftMonth(month, 1)}-01`;

	const rows = await db
		.select()
		.from(regs)
		.where(and(gte(regs.date, monthStart), lt(regs.date, nextMonthStart)))
		.orderBy(regs.date);

	return rows.map(withoutNulls);
}

export async function insertReg(values: RegValues): Promise<void> {
	await getDb().insert(regs).values(values);
}
