import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	playerId: integer(),
	cp: integer().notNull().default(0),
	season: integer().notNull(),
});
