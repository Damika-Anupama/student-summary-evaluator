import { describe, it, expect, beforeEach } from "vitest";
import { DEMO_ASSIGNMENTS } from "./demo-data";
import {
	createAssignment,
	deleteAssignment,
	getAssignment,
	listAssignments,
	resetAssignments,
	updateAssignment,
} from "./assignment-store";

beforeEach(resetAssignments);

describe("assignment store", () => {
	it("starts from the demo fixtures", () => {
		expect(listAssignments()).toHaveLength(DEMO_ASSIGNMENTS.length);
		expect(listAssignments().map((a) => a.id)).toEqual(
			DEMO_ASSIGNMENTS.map((a) => a.id)
		);
	});

	it("returns a copy of the list so callers cannot mutate it", () => {
		const list = listAssignments();
		list.push({ id: 999 });
		expect(listAssignments()).toHaveLength(DEMO_ASSIGNMENTS.length);
	});

	it("looks assignments up by id, matching string or number", () => {
		const first = DEMO_ASSIGNMENTS[0];
		expect(getAssignment(first.id).question).toBe(first.question);
		expect(getAssignment(String(first.id)).question).toBe(first.question);
	});

	it("returns null for an unknown id instead of a fixture fallback", () => {
		expect(getAssignment(9999)).toBeNull();
		expect(getAssignment(undefined)).toBeNull();
	});

	it("supports the full create -> get -> update -> delete -> list cycle", () => {
		const created = createAssignment({
			question: "What causes tides?",
			title: "Tides",
			text: "The moon pulls on the oceans.",
			deadline: "2026-01-01T00:00:00.000Z",
		});

		// New id is allocated above every existing one.
		const maxFixtureId = Math.max(...DEMO_ASSIGNMENTS.map((a) => a.id));
		expect(created.id).toBe(maxFixtureId + 1);
		expect(listAssignments()).toHaveLength(DEMO_ASSIGNMENTS.length + 1);

		// The detail lookup now finds it — this is the bug the store fixes.
		const fetched = getAssignment(created.id);
		expect(fetched).not.toBeNull();
		expect(fetched.question).toBe("What causes tides?");
		expect(fetched.eval_text.title).toBe("Tides");
		expect(fetched.deadline).toBe("2026-01-01T00:00:00.000Z");

		const updated = updateAssignment(created.id, {
			question: "What causes ocean tides?",
			title: "Ocean tides",
			text: "Lunar gravity.",
		});
		expect(updated.question).toBe("What causes ocean tides?");
		expect(updated.eval_text.title).toBe("Ocean tides");
		expect(updated.eval_text.text).toBe("Lunar gravity.");
		// Untouched fields survive the patch.
		expect(updated.deadline).toBe("2026-01-01T00:00:00.000Z");
		expect(getAssignment(created.id).question).toBe("What causes ocean tides?");

		expect(deleteAssignment(created.id)).toBe(true);
		expect(getAssignment(created.id)).toBeNull();
		expect(listAssignments()).toHaveLength(DEMO_ASSIGNMENTS.length);
	});

	it("fills in defaults when creating with no input", () => {
		const created = createAssignment();
		expect(created.question).toBe("Untitled assignment");
		expect(created.eval_text.title).toBe("Custom passage");
		expect(Number.isNaN(Date.parse(created.deadline))).toBe(false);
	});

	it("puts new assignments at the head of the list", () => {
		const created = createAssignment({ question: "Newest" });
		expect(listAssignments()[0].id).toBe(created.id);
	});

	it("reports misses on update and delete", () => {
		expect(updateAssignment(9999, { question: "x" })).toBeNull();
		expect(deleteAssignment(9999)).toBe(false);
	});

	it("resets back to the fixtures", () => {
		createAssignment({ question: "Temporary" });
		resetAssignments();
		expect(listAssignments()).toHaveLength(DEMO_ASSIGNMENTS.length);
	});
});
