import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getListCardActions } from "#/features/event-card/utils/listCardActions";
import type { ScheduleEvent } from "#/types/domain";

function makeEvent(overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
	return {
		id: 1,
		name: "Weekly Locals",
		date: "2026-11-24",
		leagueId: 1,
		eventType: "STANDARD",
		game: "TCG",
		...overrides,
	};
}

const noop = () => {};
const allHandlers = {
	onEdit: noop,
	onDelete: noop,
	onExclude: noop,
	onUnexclude: noop,
};

const keys = (event: ScheduleEvent, handlers = allHandlers) =>
	getListCardActions(event, handlers).map((action) => action.key);

describe("getListCardActions", () => {
	it("offers nothing without handlers (public schedule)", () => {
		assert.deepEqual(getListCardActions(makeEvent(), {}), []);
	});

	it("offers edit and delete for a one-off event", () => {
		assert.deepEqual(keys(makeEvent()), ["edit", "delete"]);
		assert.equal(getListCardActions(makeEvent(), allHandlers)[1].label, "Delete");
	});

	it("offers exclude and series delete for a live recurring occurrence", () => {
		const event = makeEvent({ isRecurring: true });
		assert.deepEqual(keys(event), ["edit", "exclude", "delete"]);
		assert.equal(
			getListCardActions(event, allHandlers).at(-1)?.label,
			"Delete Series",
		);
	});

	it("offers unexclude instead of exclude for an excluded occurrence", () => {
		const event = makeEvent({ isRecurring: true, isExcluded: true });
		assert.deepEqual(keys(event), ["edit", "unexclude", "delete"]);
	});

	it("passes the event to the chosen handler", () => {
		const event = makeEvent();
		let edited: ScheduleEvent | undefined;
		const [edit] = getListCardActions(event, {
			onEdit: (e) => {
				edited = e;
			},
		});
		edit.run();
		assert.equal(edited, event);
	});
});
