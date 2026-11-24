import type { ScheduleEvent } from "#/types/domain";

export interface ListCardHandlers {
	onEdit?: (event: ScheduleEvent) => void;
	onDelete?: (event: ScheduleEvent) => void;
	onExclude?: (event: ScheduleEvent) => void;
	onUnexclude?: (event: ScheduleEvent) => void;
}

export interface ListCardAction {
	key: "edit" | "unexclude" | "exclude" | "delete";
	label: string;
	tone: "neutral" | "positive" | "danger";
	run: () => void;
}

/**
 * Admin actions offered on an expanded list card, in display order.
 * An action appears only when its handler is supplied and it applies to the
 * event: Unexclude for an excluded occurrence, Exclude for a live recurring
 * occurrence, and Delete removes the whole series for recurring events.
 */
export function getListCardActions(
	event: ScheduleEvent,
	{ onEdit, onDelete, onExclude, onUnexclude }: ListCardHandlers,
): ListCardAction[] {
	const actions: ListCardAction[] = [];
	if (onEdit) {
		actions.push({
			key: "edit",
			label: "Edit",
			tone: "neutral",
			run: () => onEdit(event),
		});
	}
	if (event.isExcluded && onUnexclude) {
		actions.push({
			key: "unexclude",
			label: "Unexclude",
			tone: "positive",
			run: () => onUnexclude(event),
		});
	}
	if (!event.isExcluded && event.isRecurring && onExclude) {
		actions.push({
			key: "exclude",
			label: "Exclude",
			tone: "danger",
			run: () => onExclude(event),
		});
	}
	if (onDelete) {
		actions.push({
			key: "delete",
			label: event.isRecurring ? "Delete Series" : "Delete",
			tone: "danger",
			run: () => onDelete(event),
		});
	}
	return actions;
}
