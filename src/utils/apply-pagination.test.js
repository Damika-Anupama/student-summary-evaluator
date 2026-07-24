import { describe, it, expect } from "vitest";
import { applyPagination } from "./apply-pagination";

const rows = Array.from({ length: 12 }, (_, i) => i + 1);

describe("applyPagination", () => {
	it("returns the first page", () => {
		expect(applyPagination(rows, 0, 5)).toEqual([1, 2, 3, 4, 5]);
	});

	it("returns a middle page offset correctly", () => {
		expect(applyPagination(rows, 1, 5)).toEqual([6, 7, 8, 9, 10]);
	});

	it("returns a short final page", () => {
		expect(applyPagination(rows, 2, 5)).toEqual([11, 12]);
	});

	it("returns an empty array for a page past the end", () => {
		expect(applyPagination(rows, 5, 5)).toEqual([]);
	});
});
