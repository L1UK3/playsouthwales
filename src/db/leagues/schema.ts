import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leagues = sqliteTable("leagues", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	logo: text(),
	website: text(),
	socialLink: text(),
	eventLink: text(),
	brandColor: text(),
	location: text(),
	directions: text(),
	accessibility: text(),
	latitude: real(),
	longitude: real(),
	isChampionshipSeries: integer({ mode: "boolean" }).notNull().default(false),
});

export type LeagueValues = typeof leagues.$inferInsert;
