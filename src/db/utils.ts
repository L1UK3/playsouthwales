/**
 * A row with its nullable columns turned into optional keys, which is how the
 * domain types in src/types/domain.ts spell "no value".
 */
export type WithoutNulls<Row> = {
	[Key in keyof Row as null extends Row[Key] ? never : Key]: Row[Key];
} & {
	[Key in keyof Row as null extends Row[Key] ? Key : never]?: Exclude<
		Row[Key],
		null
	>;
};

/** Drops null columns from a row, so they read as absent optional fields. */
export function withoutNulls<Row extends object>(row: Row): WithoutNulls<Row> {
	return Object.fromEntries(
		Object.entries(row).filter(([, value]) => value !== null),
	) as WithoutNulls<Row>;
}
