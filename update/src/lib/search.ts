export function optionalString(value: unknown): string | undefined {
	return typeof value === "string" && value !== "" ? value : undefined;
}

export function optionalId(value: unknown): number | undefined {
	const id = typeof value === "string" ? Number(value) : value;
	return typeof id === "number" && Number.isInteger(id) && id > 0
		? id
		: undefined;
}
