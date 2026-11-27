import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { confirmMessage } from "#/features/admin/confirmMessage";

describe("confirmMessage", () => {
	it("warns that deleting a league deletes its events", () => {
		assert.equal(
			confirmMessage({ action: "delete-league", name: "Cardiff League" }),
			"Are you sure you want to delete Cardiff League? All of its events will be deleted too.",
		);
	});

	it("names a one-off event", () => {
		assert.equal(
			confirmMessage({ action: "delete-event", name: "Winter Cup" }),
			"Are you sure you want to delete Winter Cup?",
		);
		assert.equal(
			confirmMessage({
				action: "delete-event",
				name: "Winter Cup",
				isRecurring: false,
			}),
			"Are you sure you want to delete Winter Cup?",
		);
	});

	it("warns that a recurring event deletes the whole series", () => {
		assert.equal(
			confirmMessage({
				action: "delete-event",
				name: "Weekly Locals",
				isRecurring: true,
			}),
			"Are you sure you want to delete the ENTIRE weekly series for Weekly Locals?",
		);
	});

	it("names the occurrence to exclude or restore", () => {
		assert.equal(
			confirmMessage({
				action: "exclude",
				name: "Weekly Locals",
				date: "2026-11-24",
			}),
			"Are you sure you want to exclude the occurrence of Weekly Locals on 2026-11-24?",
		);
		assert.equal(
			confirmMessage({
				action: "unexclude",
				name: "Weekly Locals",
				date: "2026-11-24",
			}),
			"Are you sure you want to restore the occurrence of Weekly Locals on 2026-11-24?",
		);
	});

	it("needs a date to exclude an occurrence", () => {
		// @ts-expect-error exclude requires a date
		confirmMessage({ action: "exclude", name: "Weekly Locals" });
	});
});
