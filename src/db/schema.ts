import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leagues = sqliteTable("leagues", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	logo: text(),
	website: text(),
	socialLink: text(),
	eventLink: text(),
	webLink: text(),
	brandColor: text(),
	location: text(),
	directions: text(),
	accessibility: text(),
	latitude: real(),
	longitude: real(),
	isChampionshipSeries: integer({ mode: "boolean" }).notNull().default(false),
});

export const events = sqliteTable("events", {
	id: integer().primaryKey({ autoIncrement: true }),
	leagueId: integer()
		.notNull()
		.references(() => leagues.id, { onDelete: "cascade" }),
	name: text().notNull(),
	date: text().notNull(),
	startTime: text(),
	eventType: text().notNull(),
	game: text().notNull(),
	ticketLink: text(),
	description: text(),
	prizes: text(),
	entryFee: text(),
	isRecurring: integer({ mode: "boolean" }).notNull().default(false),
	excludedDates: text({ mode: "json" })
		.$type<string[]>()
		.notNull()
		.default(sql`'[]'`),
});

export const leaderboards = sqliteTable("leaderboards", {
	id: integer().primaryKey({ autoIncrement: true }),
	leagueId: integer()
		.notNull()
		.references(() => leagues.id, { onDelete: "cascade" }),
	data: text({ mode: "json" }).notNull().default(sql`'[]'`),
	createdAt: integer({ mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const players = sqliteTable("players", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull().unique(),
	playerId: integer(),
	cp: integer().notNull().default(0),
});
