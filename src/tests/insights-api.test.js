import { describe, it, expect, afterEach, vi } from "vitest";
import * as demoData from "src/demo/demo-data";
import handler from "src/pages/api/dashboard/insights/[id]";

const { DEMO_STUDENTS } = demoData;

// Next.js API routes are plain functions — call them with mock req/res.
const call = (query, method = "GET") => {
	const res = { statusCode: null, body: null };
	res.status = vi.fn((code) => {
		res.statusCode = code;
		return res;
	});
	res.json = vi.fn((payload) => {
		res.body = payload;
		return res;
	});
	handler({ method, query }, res);
	return res;
};

const submittedCount = (id) =>
	demoData.getSummariesForAssignment(id).filter((s) => s.is_submitted).length;

afterEach(() => vi.restoreAllMocks());

describe("/api/dashboard/insights/[id]", () => {
	it("404s for an assignment with no insight", () => {
		expect(call({ id: "999" }).statusCode).toBe(404);
	});

	it("rejects non-GET methods", () => {
		expect(call({ id: "1" }, "POST").statusCode).toBe(405);
	});

	it("reports the submission count it measured the gap against", () => {
		const res = call({ id: "1" });
		expect(res.statusCode).toBe(200);
		expect(res.body.insight.submissionCount).toBe(submittedCount(1));
	});

	it("measures the top gap against submissions, not the whole class", () => {
		const enrolled = DEMO_STUDENTS.filter((s) => s.enrolled).length;
		const submissions = submittedCount(1);
		// The fixtures only exercise the bug if the two denominators differ.
		expect(submissions).not.toBe(enrolled);

		const { topGap } = call({ id: "1" }).body.insight;
		expect(topGap.submissionCount).toBe(submissions);
		expect(topGap.pct).toBe(Math.round((topGap.count / submissions) * 100));
		// The old denominator was the enrolled headcount.
		expect(topGap.pct).not.toBe(Math.round((topGap.count / enrolled) * 100));
	});

	it("labels the gap as a share of submissions rather than of the class", () => {
		const { topGap } = call({ id: "2" }).body.insight;
		expect(topGap.label).toBe(
			`${topGap.count} of ${topGap.submissionCount} submissions (${topGap.pct}%)`
		);
	});

	it("never reports a percentage above 100 for any fixture", () => {
		for (const id of [1, 2, 3, 4, 5]) {
			const { topGap } = call({ id: String(id) }).body.insight;
			expect(topGap.count).toBeLessThanOrEqual(topGap.submissionCount);
			expect(topGap.pct).toBeGreaterThan(0);
			expect(topGap.pct).toBeLessThanOrEqual(100);
		}
	});

	it("reports occurrences instead of inventing a percentage when the tally exceeds the submissions", () => {
		// Two students, but the top gap for assignment 1 is tallied 4 times —
		// the old code clamped this to a confident "100% of the class".
		vi.spyOn(demoData, "getSummariesForAssignment").mockReturnValue([
			{ is_submitted: true },
			{ is_submitted: true },
		]);

		const { topGap } = call({ id: "1" }).body.insight;
		expect(topGap.count).toBeGreaterThan(topGap.submissionCount);
		expect(topGap.pct).toBeNull();
		expect(topGap.label).toBe(`${topGap.count} occurrences`);
	});

	it("reports occurrences when nothing has been submitted yet", () => {
		vi.spyOn(demoData, "getSummariesForAssignment").mockReturnValue([]);

		const { topGap, submissionCount } = call({ id: "1" }).body.insight;
		expect(submissionCount).toBe(0);
		expect(topGap.pct).toBeNull();
		expect(topGap.label).toMatch(/occurrences?$/);
	});

	it("keeps the ranked common errors and suggestion from the fixtures", () => {
		const { commonErrors, suggestion, topGap } = call({ id: "5" }).body.insight;
		expect(commonErrors[0].count).toBeGreaterThanOrEqual(commonErrors[1].count);
		expect(topGap.error).toBe(commonErrors[0].error);
		expect(suggestion).toBeTruthy();
	});
});
