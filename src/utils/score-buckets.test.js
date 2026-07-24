import { describe, it, expect } from "vitest";
import {
	bucketByTens,
	bucketByRange,
	clampPct,
	scoreColor,
	scorePalette,
	verdict,
} from "./score-buckets";

describe("scoreColor", () => {
	it("maps score bands to the canonical four-tier scale", () => {
		expect(scoreColor(85)).toBe("success.main");
		expect(scoreColor(84)).toBe("info.main");
		expect(scoreColor(70)).toBe("info.main");
		expect(scoreColor(69)).toBe("warning.main");
		expect(scoreColor(55)).toBe("warning.main");
		expect(scoreColor(54)).toBe("error.main");
		expect(scoreColor(0)).toBe("error.main");
	});

	it("exposes the palette name for MUI color props", () => {
		expect(scorePalette(90)).toBe("success");
		expect(scorePalette(75)).toBe("info");
		expect(scorePalette(60)).toBe("warning");
		expect(scorePalette(10)).toBe("error");
	});
});

describe("verdict", () => {
	it("returns an encouraging line per band", () => {
		expect(verdict(90)).toMatch(/Excellent/);
		expect(verdict(70)).toMatch(/Good work/);
		expect(verdict(55)).toMatch(/solid start/);
		expect(verdict(20)).toMatch(/Room to grow/);
	});

	// Regression: verdict's lowest cut used to be 50 while the dial it sits
	// beside switched to error at 55, so a 50-54 score was praised in red.
	it("changes band at exactly the same scores as the colour scale", () => {
		const bandOf = (pct) =>
			[
				/Room to grow/,
				/solid start/,
				/Good work/,
				/Excellent/,
			].findIndex((re) => re.test(verdict(pct)));
		const rankOf = (pct) =>
			["error", "warning", "info", "success"].indexOf(scorePalette(pct));

		for (let pct = 0; pct <= 100; pct++) {
			expect(bandOf(pct)).toBe(rankOf(pct));
		}
	});

	it("treats the 50-54 band as the lowest, matching its error colour", () => {
		for (const pct of [50, 52, 54]) {
			expect(verdict(pct)).toMatch(/Room to grow/);
			expect(scoreColor(pct)).toBe("error.main");
		}
		expect(verdict(55)).toMatch(/solid start/);
		expect(scoreColor(55)).toBe("warning.main");
	});
});

describe("clampPct", () => {
	it("rounds to an integer", () => {
		expect(clampPct(74.6)).toBe(75);
		expect(clampPct(74.4)).toBe(74);
	});

	it("clamps to the 0-100 range", () => {
		expect(clampPct(-10)).toBe(0);
		expect(clampPct(150)).toBe(100);
	});

	it("returns 0 for non-numeric input", () => {
		expect(clampPct("abc")).toBe(0);
		expect(clampPct(NaN)).toBe(0);
		expect(clampPct(undefined)).toBe(0);
	});

	it("accepts numeric strings", () => {
		expect(clampPct("88")).toBe(88);
	});
});

describe("bucketByTens", () => {
	it("places scores in the correct decile", () => {
		// 5->0, 15->1, 88->8
		expect(bucketByTens([5, 15, 88])).toEqual([
			1, 1, 0, 0, 0, 0, 0, 0, 1, 0,
		]);
	});

	it("puts a perfect 100 in the last bucket (not out of bounds)", () => {
		const counts = bucketByTens([100]);
		expect(counts[9]).toBe(1);
		expect(counts).toHaveLength(10);
	});

	it("clamps out-of-range values to the ends", () => {
		expect(bucketByTens([-5])[0]).toBe(1);
		expect(bucketByTens([150])[9]).toBe(1);
	});

	it("ignores non-numeric values", () => {
		expect(bucketByTens(["", null, undefined, NaN, "x"])).toEqual(
			new Array(10).fill(0)
		);
	});

	it("counts numeric strings", () => {
		expect(bucketByTens(["45"])[4]).toBe(1);
	});
});

describe("bucketByRange", () => {
	it("splits into Low / Normal / Best", () => {
		// 20->Low, 50->Normal, 90->Best
		expect(bucketByRange([20, 50, 90])).toEqual([1, 1, 1]);
	});

	it("counts a perfect 100 in the Best range (regression: was dropped)", () => {
		expect(bucketByRange([100])).toEqual([0, 0, 1]);
	});

	it("respects range boundaries (35 -> Normal, 75 -> Best)", () => {
		// 34.9 -> Low, 35 -> Normal, 74.9 -> Normal, 75 -> Best
		expect(bucketByRange([34.9, 35, 74.9, 75])).toEqual([1, 2, 1]);
	});

	it("ignores non-numeric values", () => {
		expect(bucketByRange([null, "x", NaN])).toEqual([0, 0, 0]);
	});
});
