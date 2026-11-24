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

/**
 * Picks `keys` from `input`, writing an absent value as null so an update
 * clears the column. The inverse of withoutNulls for nullable columns.
 */
export function withNulls<Input extends object, Key extends keyof Input>(
	input: Input,
	keys: readonly Key[],
): { [K in Key]-?: Exclude<Input[K], undefined> | null } {
	return Object.fromEntries(keys.map((key) => [key, input[key] ?? null])) as {
		[K in Key]-?: Exclude<Input[K], undefined> | null;
	};
}
