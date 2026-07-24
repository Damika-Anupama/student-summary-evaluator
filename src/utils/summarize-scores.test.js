import { describe, it, expect } from "vitest";
import { summarizeScores } from "./summarize-scores";

describe("summarizeScores", () => {
	it("computes average, best and count from content+wording", () => {
		const rows = [
			{ content_score: 80, wording_score: 90 }, // overall 85
			{ content_score: 60, wording_score: 70 }, // overall 65
		];
		expect(summarizeScores(rows)).toEqual({ graded: 2, avg: 75, best: 85 });
	});

	it("rounds the average", () => {
		const rows = [
			{ content_score: 80, wording_score: 80 }, // 80
			{ content_score: 81, wording_score: 81 }, // 81
		];
		// (80 + 81) / 2 = 80.5 -> 81
		expect(summarizeScores(rows).avg).toBe(81);
	});

	it("returns zeros for empty input", () => {
		expect(summarizeScores([])).toEqual({ graded: 0, avg: 0, best: 0 });
	});

	it("ignores rows with non-numeric scores", () => {
		const rows = [
			{ content_score: 90, wording_score: 90 },
			{ content_score: "", wording_score: "" },
		];
		const out = summarizeScores(rows);
		expect(out.graded).toBe(1);
		expect(out.best).toBe(90);
	});
});
