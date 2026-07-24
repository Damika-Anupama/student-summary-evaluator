// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { REMARKS_KEY, __resetStoreRuntime, resetDemoData } from "./local-store";
import {
	SEEDED_REMARKS,
	getRemark,
	getSeededRemarks,
	indexRemarks,
	isBlankRemark,
	readRemarks,
	remarkId,
	saveRemark,
} from "./remarks";

beforeEach(() => {
	localStorage.clear();
	__resetStoreRuntime();
});

describe("seeded remarks", () => {
	it("ships feedback for John Doe so the demo looks alive on a first visit", () => {
		expect(localStorage.getItem(REMARKS_KEY)).toBeNull();
		const johns = getSeededRemarks(1);
		expect(johns.length).toBeGreaterThan(0);
		for (const remark of johns) {
			expect(remark.studentId).toBe(1);
			expect(remark.text.trim()).not.toBe("");
			expect(remark.author).toBe("Amara Perera");
		}
	});

	it("carries no timestamp, which is what keeps hydration stable", () => {
		for (const remark of SEEDED_REMARKS) {
			expect(remark.createdAt).toBeUndefined();
		}
	});

	it("only seeds pairs the student actually submitted", () => {
		// A remark on work that was never handed in would never be reachable
		// from the student's history.
		const ids = new Set(SEEDED_REMARKS.map((r) => r.id));
		expect(ids.size).toBe(SEEDED_REMARKS.length);
	});

	it("filters to one student, or returns everything without an id", () => {
		expect(getSeededRemarks()).toHaveLength(SEEDED_REMARKS.length);
		expect(getSeededRemarks("1")).toEqual(getSeededRemarks(1));
		expect(getSeededRemarks(999)).toEqual([]);
	});
});

describe("saving a remark", () => {
	it("writes to the store and reads back for the same pair", () => {
		saveRemark({ studentId: 4, assignmentId: 2, text: "Strong opening." });

		expect(getRemark(4, 2).text).toBe("Strong opening.");
		expect(getRemark(4, 2).author).toBe("Amara Perera");
		// Someone else's row is untouched.
		expect(getRemark(5, 2)).toBeUndefined();
	});

	it("survives a fresh read of localStorage", () => {
		saveRemark({ studentId: 4, assignmentId: 2, text: "Nice work." });
		__resetStoreRuntime(); // drop the in-memory fallback; force a real read

		expect(getRemark(4, 2).text).toBe("Nice work.");
		expect(JSON.parse(localStorage.getItem(REMARKS_KEY)).created).toHaveLength(
			1
		);
	});

	it("trims the text and stamps when it was written", () => {
		const saved = saveRemark({
			studentId: 4,
			assignmentId: 2,
			text: "  padded  ",
		});
		expect(saved.text).toBe("padded");
		expect(Date.parse(saved.createdAt)).not.toBeNaN();
	});

	it("refuses empty and whitespace-only text", () => {
		for (const text of ["", "   ", "\n\t ", null, undefined]) {
			expect(isBlankRemark(text)).toBe(true);
			expect(saveRemark({ studentId: 4, assignmentId: 2, text })).toBeNull();
		}
		expect(localStorage.getItem(REMARKS_KEY)).toBeNull();
	});

	it("does not blank out an existing remark with empty text", () => {
		saveRemark({ studentId: 4, assignmentId: 2, text: "Keep this." });
		saveRemark({ studentId: 4, assignmentId: 2, text: "   " });
		expect(getRemark(4, 2).text).toBe("Keep this.");
	});

	it("replaces a remark on the same pair rather than stacking them", () => {
		saveRemark({ studentId: 4, assignmentId: 2, text: "First take." });
		saveRemark({ studentId: 4, assignmentId: 2, text: "Second take." });

		const forPair = readRemarks().filter((r) => r.id === remarkId(4, 2));
		expect(forPair).toHaveLength(1);
		expect(forPair[0].text).toBe("Second take.");
	});

	it("layers a rewrite on top of a seeded remark", () => {
		const seeded = SEEDED_REMARKS[0];
		saveRemark({
			studentId: seeded.studentId,
			assignmentId: seeded.assignmentId,
			text: "Reworded by the teacher.",
		});

		const index = indexRemarks(readRemarks());
		expect(index.get(seeded.id).text).toBe("Reworded by the teacher.");
		// The rest of the seed is left alone.
		expect(index.size).toBe(SEEDED_REMARKS.length);
	});

	it("keeps written remarks alongside the seeded ones", () => {
		saveRemark({ studentId: 6, assignmentId: 4, text: "Brand new." });
		const index = indexRemarks(readRemarks());
		expect(index.size).toBe(SEEDED_REMARKS.length + 1);
		expect(index.get(remarkId(6, 4)).text).toBe("Brand new.");
	});
});

describe("resetDemoData", () => {
	it("clears written remarks back to the seeded set", () => {
		const seeded = SEEDED_REMARKS[0];
		saveRemark({ studentId: 6, assignmentId: 4, text: "Brand new." });
		saveRemark({
			studentId: seeded.studentId,
			assignmentId: seeded.assignmentId,
			text: "Reworded.",
		});
		expect(readRemarks()).toHaveLength(SEEDED_REMARKS.length + 1);

		resetDemoData();

		expect(localStorage.getItem(REMARKS_KEY)).toBeNull();
		expect(readRemarks()).toEqual([...SEEDED_REMARKS]);
		expect(getRemark(6, 4)).toBeUndefined();
		expect(getRemark(seeded.studentId, seeded.assignmentId).text).toBe(
			seeded.text
		);
	});
});

describe("degraded storage", () => {
	it("still serves the session's remarks when localStorage refuses writes", () => {
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("QuotaExceededError");
		});

		expect(() =>
			saveRemark({ studentId: 6, assignmentId: 4, text: "In memory only." })
		).not.toThrow();
		expect(getRemark(6, 4).text).toBe("In memory only.");

		vi.restoreAllMocks();
	});
});
