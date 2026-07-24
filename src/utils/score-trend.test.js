import { describe, it, expect } from "vitest";
import { buildScoreTrend } from "./score-trend";

const rows = [
	// Newest first, as getStudentHistory returns.
	{
		id: 3,
		content_score: "90",
		wording_score: "80",
		submitted_on: "2025-03-10T10:00:00Z",
	},
	{
		id: 2,
		content_score: "70",
		wording_score: "60",
		submitted_on: "2025-02-01T10:00:00Z",
	},
	{
		id: 1,
		content_score: "55",
		wording_score: "65",
		submitted_on: "2025-01-05T10:00:00Z",
	},
];

describe("buildScoreTrend", () => {
	it("orders points chronologically (oldest first)", () => {
		const trend = buildScoreTrend(rows);
		expect(trend.overall).toEqual([60, 65, 85]);
		expect(trend.content).toEqual([55, 70, 90]);
		expect(trend.wording).toEqual([65, 60, 80]);
		expect(trend.labels).toHaveLength(3);
	});

	it("reports the overall delta from first to last submission", () => {
		const trend = buildScoreTrend(rows);
		expect(trend.delta).toBe(25);
	});

	it("returns a null delta with fewer than two points", () => {
		expect(buildScoreTrend([rows[0]]).delta).toBeNull();
		expect(buildScoreTrend([]).delta).toBeNull();
	});

	it("skips rows with missing dates or unparseable scores", () => {
		const trend = buildScoreTrend([
			...rows,
			{ id: 4, content_score: "n/a", wording_score: "80", submitted_on: "2025-04-01T10:00:00Z" },
			{ id: 5, content_score: "80", wording_score: "80", submitted_on: null },
		]);
		expect(trend.overall).toEqual([60, 65, 85]);
	});

	it("handles an empty history", () => {
		expect(buildScoreTrend([])).toEqual({
			labels: [],
			content: [],
			wording: [],
			overall: [],
			delta: null,
			best: null,
			average: null,
			yMin: 0,
		});
	});

	it("reports the personal best and average overall scores", () => {
		const trend = buildScoreTrend(rows);
		// overall series is [60, 65, 85] → best 85, average round(210/3)=70.
		expect(trend.best).toBe(85);
		expect(trend.average).toBe(70);
	});

	it("returns null best/average for an empty history", () => {
		const trend = buildScoreTrend([]);
		expect(trend.best).toBeNull();
		expect(trend.average).toBeNull();
	});

	it("floors the y-axis just below the lowest plotted score", () => {
		// Lowest plotted value is 55 (content of first row) → 55-5=50 → 50.
		expect(buildScoreTrend(rows).yMin).toBe(50);
		// Tightly clustered high scores get a high floor: min 78 → 73 → 70.
		const high = [
			{ id: 1, content_score: "78", wording_score: "84", submitted_on: "2025-01-05T10:00:00Z" },
			{ id: 2, content_score: "86", wording_score: "80", submitted_on: "2025-02-01T10:00:00Z" },
		];
		expect(buildScoreTrend(high).yMin).toBe(70);
		// Low scores never push the axis below zero.
		const low = [
			{ id: 1, content_score: "4", wording_score: "8", submitted_on: "2025-01-05T10:00:00Z" },
		];
		expect(buildScoreTrend(low).yMin).toBe(0);
	});
});
