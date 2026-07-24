import { describe, it, expect } from "vitest";
import { sortHistory } from "./sort-history";

const rows = [
	{
		id: 1,
		assignment: "Water Cycle",
		content_score: "82",
		wording_score: "80",
		submitted_on: "2025-10-10T10:00:00Z",
	},
	{
		id: 2,
		assignment: "ancient Rome",
		content_score: "86",
		wording_score: "83",
		submitted_on: "2025-10-13T10:00:00Z",
	},
	{
		id: 3,
		assignment: "Climate Change",
		content_score: "85",
		wording_score: "78",
		submitted_on: "2025-09-20T10:00:00Z",
	},
];

describe("sortHistory", () => {
	it("sorts by assignment title case-insensitively", () => {
		expect(sortHistory(rows, "assignment", "asc").map((r) => r.id)).toEqual([
			2, 3, 1,
		]);
	});

	it("sorts by submission date", () => {
		expect(sortHistory(rows, "submitted", "asc").map((r) => r.id)).toEqual([
			3, 1, 2,
		]);
		expect(sortHistory(rows, "submitted", "desc").map((r) => r.id)).toEqual([
			2, 1, 3,
		]);
	});

	it("sorts scores numerically", () => {
		expect(sortHistory(rows, "content", "asc").map((r) => r.id)).toEqual([
			1, 3, 2,
		]);
		// Overall: id1 81, id2 85 (84.5 rounded), id3 82 (81.5 rounded)
		expect(sortHistory(rows, "overall", "desc").map((r) => r.id)).toEqual([
			2, 3, 1,
		]);
	});

	it("returns input untouched for unknown fields and does not mutate", () => {
		const copy = [...rows];
		expect(sortHistory(rows, "bogus", "asc")).toBe(rows);
		sortHistory(rows, "overall", "asc");
		expect(rows).toEqual(copy);
	});
});
