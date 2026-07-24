// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
	ASSIGNMENTS_KEY,
	__resetStoreRuntime,
	createRecord,
	readOverlay,
	removeRecord,
	resetDemoData,
} from "./local-store";
import {
	rosterIdsFor,
	savedRosterIds,
	saveRoster,
	seedRosterIds,
	studentDirectory,
} from "./roster";
import { DEMO_STUDENTS, DEMO_SUMMARIES_BY_ASSIGNMENT } from "./demo-data";

beforeEach(() => {
	localStorage.clear();
	__resetStoreRuntime();
});

const ENROLLED = DEMO_STUDENTS.filter((s) => s.enrolled).length;

describe("seedRosterIds", () => {
	it("uses the students who have a submission row for a fixture assignment", () => {
		const expected = DEMO_SUMMARIES_BY_ASSIGNMENT[1].map((s) =>
			String(s.student_id)
		);
		expect(seedRosterIds(1)).toEqual(expected);
		// Ids arrive from the card as strings as often as numbers.
		expect(seedRosterIds("1")).toEqual(expected);
	});

	it("gives an assignment with no submissions the enrolled class", () => {
		// A created assignment used to read "0 Students", which was never true.
		expect(seedRosterIds(99)).toHaveLength(ENROLLED);
		expect(seedRosterIds(99)).not.toContain("10"); // Noah is not enrolled
	});
});

describe("saveRoster", () => {
	it("stores a fixture's roster as a patch, not a copy of the record", () => {
		saveRoster(1, ["1", "2"]);
		const overlay = readOverlay(ASSIGNMENTS_KEY);
		expect(overlay.created).toEqual([]);
		expect(overlay.patches["1"]).toEqual({ studentIds: ["1", "2"] });
	});

	it("folds a created assignment's roster into that record", () => {
		createRecord(ASSIGNMENTS_KEY, { id: 6, question: "Volcanoes" });
		saveRoster(6, [3, 4]);
		const overlay = readOverlay(ASSIGNMENTS_KEY);
		expect(overlay.patches).toEqual({});
		expect(overlay.created[0]).toMatchObject({
			id: 6,
			question: "Volcanoes",
			studentIds: ["3", "4"],
		});
	});

	it("replaces the roster wholesale and drops duplicates", () => {
		saveRoster(1, ["1", "2", "3"]);
		saveRoster(1, ["4", "4"]);
		expect(savedRosterIds(1, readOverlay(ASSIGNMENTS_KEY))).toEqual(["4"]);
	});

	it("keeps an empty roster instead of falling back to the seed", () => {
		saveRoster(1, []);
		expect(rosterIdsFor({ id: 1 }, readOverlay(ASSIGNMENTS_KEY))).toEqual([]);
	});

	it("goes away with the assignment and with a demo reset", () => {
		saveRoster(1, ["1"]);
		removeRecord(ASSIGNMENTS_KEY, 1);
		expect(savedRosterIds(1, readOverlay(ASSIGNMENTS_KEY))).toBeNull();

		saveRoster(2, ["1"]);
		resetDemoData();
		expect(savedRosterIds(2, readOverlay(ASSIGNMENTS_KEY))).toBeNull();
	});
});

describe("rosterIdsFor", () => {
	it("prefers the saved roster over everything else", () => {
		saveRoster(1, ["7"]);
		const overlay = readOverlay(ASSIGNMENTS_KEY);
		expect(rosterIdsFor({ id: 1, studentIds: ["1", "2"] }, overlay)).toEqual([
			"7",
		]);
	});

	it("falls back to the roster already on the record, then to the seed", () => {
		expect(rosterIdsFor({ id: 1, studentIds: [1, 2] }, undefined)).toEqual([
			"1",
			"2",
		]);
		expect(rosterIdsFor({ id: 1 }, undefined)).toEqual(seedRosterIds(1));
		expect(rosterIdsFor(null, undefined)).toEqual([]);
	});
});

describe("studentDirectory", () => {
	it("lists the fixture students by name", () => {
		const names = studentDirectory(undefined).map((s) => s.name);
		expect(names).toContain("John Doe");
		expect(names).toHaveLength(DEMO_STUDENTS.length);
		expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
	});

	it("includes students the visitor added on the students page", () => {
		const overlay = {
			created: [{ id: "new-1", name: "Nimal Fernando" }],
			patches: {},
			deleted: [],
		};
		expect(studentDirectory(overlay).map((s) => s.name)).toContain(
			"Nimal Fernando"
		);
	});

	it("drops a stored record with no usable name rather than rendering a blank row", () => {
		const overlay = { created: [{ id: "new-2" }], patches: {}, deleted: [] };
		expect(studentDirectory(overlay).every((s) => s.name)).toBe(true);
	});
});
