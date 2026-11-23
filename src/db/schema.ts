export * from "./events/schema";
export * from "./leagues/schema";
export * from "./players/schema";

export const sets = sqliteTable("sets", {
	id: integer().primaryKey({ autoIncrement: true }),
	code: text().notNull().unique(),
	name: text().notNull(),
	releaseDate: text().notNull(),
	legalDate: text().notNull(),
});

export const regs = sqliteTable("regs", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	date: text().notNull(),
});
