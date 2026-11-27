import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sets = sqliteTable(
	"sets",
	{
		id: integer().primaryKey({ autoIncrement: true }),
		code: text().notNull(),
		name: text().notNull(),
		releaseDate: text().notNull(),
		legalDate: text().notNull(),
		format: text().notNull().default("Standard"),
	},
	(table) => [
		index("sets_releaseDate_idx").on(table.releaseDate),
		index("sets_legalDate_idx").on(table.legalDate),
	],
);

export type SetValues = typeof sets.$inferInsert;
export type SetRow = typeof sets.$inferSelect;
