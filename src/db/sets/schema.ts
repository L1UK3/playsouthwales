import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sets = sqliteTable("sets", {
	id: integer().primaryKey({ autoIncrement: true }),
	code: text().notNull().unique(),
	name: text().notNull(),
	releaseDate: text().notNull(),
	legalDate: text().notNull(),
});
