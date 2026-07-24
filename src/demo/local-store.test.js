// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
	ASSIGNMENTS_KEY,
	STUDENTS_KEY,
	__resetStoreRuntime,
	applyOverlayPatch,
	createRecord,
	findCreatedRecord,
	isPersistent,
	mergeOverlay,
	mergeRecord,
	nextRecordId,
	normalizeOverlay,
	patchRecord,
	readEffective,
	readOverlay,
	removeRecord,
	resetDemoData,
	subscribeDemoStore,
	writeOverlay,
} from "./local-store";

const SEED = [
	{ id: 1, question: "Tides", eval_text: { title: "Tides", text: "Moon." } },
	{ id: 2, question: "Rain", eval_text: { title: "Rain", text: "Clouds." } },
];

beforeEach(() => {
	localStorage.clear();
	__resetStoreRuntime();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("normalizeOverlay", () => {
	it("returns an empty overlay for anything that is not an overlay", () => {
		for (const value of [null, undefined, 7, "nope", [], true]) {
			expect(normalizeOverlay(value)).toEqual({
				created: [],
				patches: {},
				deleted: [],
			});
		}
	});

	it("keeps only the well-formed parts of a half-broken overlay", () => {
		expect(
			normalizeOverlay({
				created: [{ id: 1 }, "junk", null],
				patches: "not-an-object",
				deleted: [3, "4", null],
			})
		).toEqual({ created: [{ id: 1 }], patches: {}, deleted: ["3", "4"] });
	});
});

describe("mergeRecord", () => {
	it("merges nested objects one level deep instead of replacing them", () => {
		expect(
			mergeRecord(
				{ id: 1, question: "Tides", eval_text: { title: "Tides", text: "Moon." } },
				{ eval_text: { title: "Ocean tides" } }
			)
		).toEqual({
			id: 1,
			question: "Tides",
			eval_text: { title: "Ocean tides", text: "Moon." },
		});
	});

	it("leaves the base alone when the patch is not an object", () => {
		const base = { id: 1 };
		expect(mergeRecord(base, undefined)).toBe(base);
	});
});

describe("mergeOverlay", () => {
	it("returns the seed untouched for an empty overlay", () => {
		expect(mergeOverlay(SEED, null)).toEqual(SEED);
	});

	it("puts created records ahead of the seed", () => {
		const merged = mergeOverlay(SEED, { created: [{ id: 9, question: "New" }] });
		expect(merged.map((r) => r.id)).toEqual([9, 1, 2]);
	});

	it("applies patches to seed records without dropping their other fields", () => {
		const merged = mergeOverlay(SEED, {
			patches: { 2: { question: "Why does it rain?" } },
		});
		expect(merged[1]).toEqual({
			id: 2,
			question: "Why does it rain?",
			eval_text: { title: "Rain", text: "Clouds." },
		});
		// The fixture itself is never mutated.
		expect(SEED[1].question).toBe("Rain");
	});

	it("drops tombstoned records from the seed and from created", () => {
		const merged = mergeOverlay(SEED, {
			created: [{ id: 9 }],
			deleted: ["1", "9"],
		});
		expect(merged.map((r) => r.id)).toEqual([2]);
	});

	it("deduplicates by id with the overlay winning", () => {
		// A warm lambda replays its own copy of a created assignment; without the
		// dedupe the visitor sees the same card twice.
		const merged = mergeOverlay([...SEED, { id: 9, question: "Server copy" }], {
			created: [{ id: 9, question: "Local copy" }],
		});
		expect(merged).toHaveLength(3);
		expect(merged[0]).toEqual({ id: 9, question: "Local copy" });
	});

	it("matches ids across string and number forms", () => {
		const merged = mergeOverlay([{ id: "1" }], { deleted: [1] });
		expect(merged).toEqual([]);
	});

	it("survives a missing or non-array seed", () => {
		expect(mergeOverlay(undefined, { created: [{ id: 1 }] })).toEqual([
			{ id: 1 },
		]);
		expect(mergeOverlay("nonsense", null)).toEqual([]);
	});
});

describe("create / patch / tombstone round-trips", () => {
	it("round-trips a created record through localStorage", () => {
		createRecord(ASSIGNMENTS_KEY, { id: 9, question: "Volcanoes" });
		expect(JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY)).created).toEqual([
			{ id: 9, question: "Volcanoes" },
		]);
		expect(readEffective(ASSIGNMENTS_KEY, SEED).map((r) => r.id)).toEqual([
			9, 1, 2,
		]);
	});

	it("keeps created records newest-first and replaces same-id creates", () => {
		createRecord(ASSIGNMENTS_KEY, { id: 9, question: "First" });
		createRecord(ASSIGNMENTS_KEY, { id: 10, question: "Second" });
		createRecord(ASSIGNMENTS_KEY, { id: 9, question: "Rewritten" });
		expect(readOverlay(ASSIGNMENTS_KEY).created).toEqual([
			{ id: 9, question: "Rewritten" },
			{ id: 10, question: "Second" },
		]);
	});

	it("stores an edit to a fixture as a patch, not a copy", () => {
		patchRecord(ASSIGNMENTS_KEY, 1, { question: "Edited" });
		const stored = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY));
		expect(stored.created).toEqual([]);
		expect(stored.patches).toEqual({ 1: { question: "Edited" } });
		// Fields the patch never mentions still come from the fixture.
		expect(readEffective(ASSIGNMENTS_KEY, SEED)[0].eval_text.text).toBe("Moon.");
	});

	it("accumulates successive patches to the same record", () => {
		patchRecord(ASSIGNMENTS_KEY, 1, { question: "Once" });
		patchRecord(ASSIGNMENTS_KEY, 1, { eval_text: { title: "Twice" } });
		const [first] = readEffective(ASSIGNMENTS_KEY, SEED);
		expect(first.question).toBe("Once");
		expect(first.eval_text).toEqual({ title: "Twice", text: "Moon." });
	});

	it("folds an edit into the created record itself", () => {
		createRecord(ASSIGNMENTS_KEY, { id: 9, question: "Draft" });
		patchRecord(ASSIGNMENTS_KEY, 9, { question: "Final" });
		expect(readOverlay(ASSIGNMENTS_KEY)).toEqual({
			created: [{ id: 9, question: "Final" }],
			patches: {},
			deleted: [],
		});
	});

	it("tombstones a deleted fixture so it stays gone", () => {
		removeRecord(ASSIGNMENTS_KEY, 1);
		expect(readOverlay(ASSIGNMENTS_KEY).deleted).toEqual(["1"]);
		expect(readEffective(ASSIGNMENTS_KEY, SEED).map((r) => r.id)).toEqual([2]);
	});

	it("tombstones a deleted created record too, so a warm lambda cannot revive it", () => {
		createRecord(ASSIGNMENTS_KEY, { id: 9, question: "Temp" });
		removeRecord(ASSIGNMENTS_KEY, 9);
		const overlay = readOverlay(ASSIGNMENTS_KEY);
		expect(overlay.created).toEqual([]);
		expect(overlay.deleted).toEqual(["9"]);
		// The server still returns it; the merge must still hide it.
		expect(
			mergeOverlay([...SEED, { id: 9, question: "Temp" }], overlay).map(
				(r) => r.id
			)
		).toEqual([1, 2]);
	});

	it("drops the patch when the record it edited is deleted", () => {
		patchRecord(ASSIGNMENTS_KEY, 1, { question: "Edited" });
		removeRecord(ASSIGNMENTS_KEY, 1);
		expect(readOverlay(ASSIGNMENTS_KEY).patches).toEqual({});
	});

	it("lifts the tombstone when the id is created again", () => {
		removeRecord(ASSIGNMENTS_KEY, 1);
		createRecord(ASSIGNMENTS_KEY, { id: 1, question: "Back" });
		expect(readOverlay(ASSIGNMENTS_KEY).deleted).toEqual([]);
		expect(readEffective(ASSIGNMENTS_KEY, SEED)[0].question).toBe("Back");
	});

	it("keeps assignments and students in separate namespaced keys", () => {
		createRecord(ASSIGNMENTS_KEY, { id: 9 });
		createRecord(STUDENTS_KEY, { id: "new-1" });
		expect(readOverlay(ASSIGNMENTS_KEY).created).toEqual([{ id: 9 }]);
		expect(readOverlay(STUDENTS_KEY).created).toEqual([{ id: "new-1" }]);
		expect(ASSIGNMENTS_KEY).toBe("sse.assignments.v1");
		expect(STUDENTS_KEY).toBe("sse.students.v1");
	});
});

describe("lookups", () => {
	it("finds a created record but never a fixture", () => {
		createRecord(ASSIGNMENTS_KEY, { id: 9, question: "Created" });
		expect(findCreatedRecord(ASSIGNMENTS_KEY, "9").question).toBe("Created");
		expect(findCreatedRecord(ASSIGNMENTS_KEY, 1)).toBeNull();
		expect(findCreatedRecord(ASSIGNMENTS_KEY, 404)).toBeNull();
	});

	it("does not find a tombstoned record", () => {
		createRecord(ASSIGNMENTS_KEY, { id: 9 });
		removeRecord(ASSIGNMENTS_KEY, 9);
		expect(findCreatedRecord(ASSIGNMENTS_KEY, 9)).toBeNull();
	});

	it("applies a stored patch to a record fetched from the API", () => {
		patchRecord(ASSIGNMENTS_KEY, 2, { question: "Edited" });
		expect(applyOverlayPatch(ASSIGNMENTS_KEY, SEED[1]).question).toBe("Edited");
		expect(applyOverlayPatch(ASSIGNMENTS_KEY, SEED[0])).toBe(SEED[0]);
		expect(applyOverlayPatch(ASSIGNMENTS_KEY, null)).toBeNull();
	});

	it("allocates ids above everything already in the list", () => {
		expect(nextRecordId(SEED)).toBe(3);
		expect(nextRecordId([{ id: "7" }, { id: "not-a-number" }])).toBe(8);
		expect(nextRecordId([])).toBe(1);
		expect(nextRecordId(undefined)).toBe(1);
	});
});

describe("corrupt data recovery", () => {
	it("falls back to the seed when the stored JSON is unparseable", () => {
		localStorage.setItem(ASSIGNMENTS_KEY, "{not json");
		expect(() => readOverlay(ASSIGNMENTS_KEY)).not.toThrow();
		expect(readEffective(ASSIGNMENTS_KEY, SEED)).toEqual(SEED);
	});

	it("falls back to the seed when the stored JSON is the wrong shape", () => {
		localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(["an", "array"]));
		expect(readEffective(ASSIGNMENTS_KEY, SEED)).toEqual(SEED);
	});

	it("recovers by overwriting the corrupt value on the next write", () => {
		localStorage.setItem(ASSIGNMENTS_KEY, "%%%");
		createRecord(ASSIGNMENTS_KEY, { id: 9, question: "Fresh" });
		expect(readOverlay(ASSIGNMENTS_KEY).created).toEqual([
			{ id: 9, question: "Fresh" },
		]);
	});
});

describe("unavailable storage", () => {
	it("degrades to memory when setItem throws, without crashing", () => {
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new DOMException("QuotaExceededError");
		});

		expect(isPersistent()).toBe(true);
		expect(() =>
			createRecord(ASSIGNMENTS_KEY, { id: 9, question: "Volcanoes" })
		).not.toThrow();
		expect(isPersistent()).toBe(false);

		// Still correct for the rest of this session, just not across a reload.
		expect(readEffective(ASSIGNMENTS_KEY, SEED).map((r) => r.id)).toEqual([
			9, 1, 2,
		]);
		expect(localStorage.getItem(ASSIGNMENTS_KEY)).toBeNull();
	});

	it("keeps working when getItem throws", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError");
		});
		expect(() => readOverlay(ASSIGNMENTS_KEY)).not.toThrow();
		expect(readEffective(ASSIGNMENTS_KEY, SEED)).toEqual(SEED);
	});

	it("reports no persistence and never throws with no window (SSR)", () => {
		const { window: realWindow } = globalThis;
		// eslint-disable-next-line no-undef
		delete globalThis.window;
		try {
			expect(isPersistent()).toBe(false);
			expect(() => readOverlay(ASSIGNMENTS_KEY)).not.toThrow();
			expect(readEffective(ASSIGNMENTS_KEY, SEED)).toEqual(SEED);
			expect(writeOverlay(ASSIGNMENTS_KEY, { created: [{ id: 9 }] })).toBe(
				false
			);
			expect(() => resetDemoData()).not.toThrow();
		} finally {
			globalThis.window = realWindow;
		}
	});
});

describe("resetDemoData", () => {
	it("clears every key in the demo namespace and leaves others alone", () => {
		createRecord(ASSIGNMENTS_KEY, { id: 9 });
		createRecord(STUDENTS_KEY, { id: "new-1" });
		localStorage.setItem("sse.legacy.v0", "{}");
		localStorage.setItem("notificationPrefs", '{"email":true}');

		resetDemoData();

		expect(localStorage.getItem(ASSIGNMENTS_KEY)).toBeNull();
		expect(localStorage.getItem(STUDENTS_KEY)).toBeNull();
		expect(localStorage.getItem("sse.legacy.v0")).toBeNull();
		expect(localStorage.getItem("notificationPrefs")).toBe('{"email":true}');
		expect(readEffective(ASSIGNMENTS_KEY, SEED)).toEqual(SEED);
	});

	it("tells subscribers to re-read", () => {
		const listener = vi.fn();
		const unsubscribe = subscribeDemoStore(ASSIGNMENTS_KEY, listener);
		try {
			createRecord(ASSIGNMENTS_KEY, { id: 9 });
			expect(listener).toHaveBeenCalledTimes(1);

			resetDemoData();
			expect(listener).toHaveBeenLastCalledWith({
				created: [],
				patches: {},
				deleted: [],
			});

			unsubscribe();
			createRecord(ASSIGNMENTS_KEY, { id: 10 });
			expect(listener).toHaveBeenCalledTimes(2);
		} finally {
			unsubscribe();
		}
	});
});

describe("subscribeDemoStore", () => {
	it("notifies only the listeners for the mutated key", () => {
		const onAssignments = vi.fn();
		const onStudents = vi.fn();
		const stop = [
			subscribeDemoStore(ASSIGNMENTS_KEY, onAssignments),
			subscribeDemoStore(STUDENTS_KEY, onStudents),
		];
		try {
			createRecord(ASSIGNMENTS_KEY, { id: 9 });
			expect(onAssignments).toHaveBeenCalledTimes(1);
			expect(onStudents).not.toHaveBeenCalled();

			patchRecord(ASSIGNMENTS_KEY, 1, { question: "x" });
			removeRecord(ASSIGNMENTS_KEY, 1);
			expect(onAssignments).toHaveBeenCalledTimes(3);
		} finally {
			stop.forEach((unsubscribe) => unsubscribe());
		}
	});
});
