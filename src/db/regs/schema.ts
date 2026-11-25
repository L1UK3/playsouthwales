import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const regs = sqliteTable(
	"regs",
	{
		id: integer().primaryKey({ autoIncrement: true }),
		name: text().notNull(),
		date: text().notNull(),
	},
	(table) => [index("regs_date_idx").on(table.date)],
);

export type RegValues = typeof regs.$inferInsert;
export type RegRow = typeof regs.$inferSelect;
