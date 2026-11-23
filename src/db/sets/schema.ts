
export const sets = sqliteTable("sets", {
	id: integer().primaryKey({ autoIncrement: true }),
	code: text().notNull().unique(),
	name: text().notNull(),
	releaseDate: text().notNull(),
	legalDate: text().notNull(),
});
