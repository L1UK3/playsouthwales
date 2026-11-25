import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const regs = sqliteTable("regs", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	date: text().notNull(),
});
