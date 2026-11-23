export function withoutNulls<Row extends object>(
	row: Row,
): { [Key in keyof Row]: NonNullable<Row[Key]> } {
	return Object.fromEntries(
		Object.entries(row).filter(([, value]) => value !== null),
	) as { [Key in keyof Row]: NonNullable<Row[Key]> };
}
