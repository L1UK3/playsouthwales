/**
 * What an admin is about to do, for the confirmation shown before it runs.
 * Exclude and restore act on one occurrence, so they need its date.
 */
export type ConfirmTarget =
	| { action: "delete-league"; name: string }
	| { action: "delete-event"; name: string; isRecurring?: boolean }
	| { action: "exclude" | "unexclude"; name: string; date: string };

/**
 * The question asked before a destructive admin action (issue #273).
 * Deleting a league also deletes all of its events, and deleting an
 * occurrence of a recurring event deletes the whole series, so both say so.
 */
export function confirmMessage(target: ConfirmTarget): string {
	switch (target.action) {
		case "delete-league":
			return `Are you sure you want to delete ${target.name}? All of its events will be deleted too.`;
		case "delete-event":
			return target.isRecurring
				? `Are you sure you want to delete the ENTIRE weekly series for ${target.name}?`
				: `Are you sure you want to delete ${target.name}?`;
		case "exclude":
			return `Are you sure you want to exclude the occurrence of ${target.name} on ${target.date}?`;
		case "unexclude":
			return `Are you sure you want to restore the occurrence of ${target.name} on ${target.date}?`;
	}
}
