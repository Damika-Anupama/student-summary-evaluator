import { describe, it, expect } from "vitest";
import {
	getKpiSnapshot,
	getSearchableEntries,
	getStudentProfile,
	getCohortMatrix,
	evaluateSummary,
	getSampleSummary,
	getReadability,
	getInsightsForAssignment,
	getSummaryRemarks,
	getActivityFeed,
	getNeedsAttention,
	DEMO_STUDENTS,
	DEMO_ASSIGNMENTS,
} from "./demo-data";

describe("getActivityFeed", () => {
	it("respects the limit", () => {
		expect(getActivityFeed(3)).toHaveLength(3);
	});

	it("is sorted newest first", () => {
		const feed = getActivityFeed(10);
		for (let i = 1; i < feed.length; i++) {
			expect(new Date(feed[i - 1].ts).getTime()).toBeGreaterThanOrEqual(
				new Date(feed[i].ts).getTime()
			);
		}
	});

	it("classifies each event with a known type and required fields", () => {
		for (const e of getActivityFeed(8)) {
			expect(["highlight", "alert", "submission"]).toContain(e.type);
			expect(typeof e.student).toBe("string");
			expect(typeof e.studentId).toBe("number");
		}
	});
});

describe("getNeedsAttention", () => {
	const items = getNeedsAttention();

	it("returns items with a valid severity and student reference", () => {
		expect(Array.isArray(items)).toBe(true);
		for (const it of items) {
			expect(["high", "medium", "low"]).toContain(it.severity);
			expect(it.studentId).toBeDefined();
			expect(typeof it.reason).toBe("string");
		}
	});
});

describe("getSummaryRemarks", () => {
	it("suggests content tips when content is weak", () => {
		const tips = getSummaryRemarks(50, 90).join(" ");
		expect(tips).toMatch(/key concepts|consequence/);
	});

	it("suggests wording tips when wording is weak", () => {
		const tips = getSummaryRemarks(90, 50).join(" ");
		expect(tips).toMatch(/vocabulary|flow|sentences/);
	});

	it("gives refinement tips when both scores are strong", () => {
		const tips = getSummaryRemarks(90, 90).join(" ");
		expect(tips).toMatch(/Tighten|crisp opening/);
	});

	it("always returns at least one bullet and caps at five", () => {
		const tips = getSummaryRemarks(40, 40);
		expect(tips.length).toBeGreaterThan(0);
		expect(tips.length).toBeLessThanOrEqual(5);
	});
});

describe("evaluateSummary", () => {
	const passage =
		"Climate change is driven by greenhouse gases from burning fossil fuels, raising global temperatures and sea levels.";

	it("returns zeros for an empty summary", () => {
		expect(evaluateSummary("", passage)).toEqual({
			content_score: 0,
			wording_score: 0,
			word_count: 0,
			matched_terms: [],
			missed_terms: [],
		});
	});

	it("reports which passage concepts the summary matched vs. missed", () => {
		const out = evaluateSummary(
			"Greenhouse gases raise global temperatures.",
			passage
		);
		// Terms present in the summary are matched; passage terms absent from it
		// are missed. "fuels" is in the passage but not this summary.
		expect(out.matched_terms).toContain("greenhouse");
		expect(out.matched_terms).toContain("temperatures");
		expect(out.missed_terms).toContain("fuels");
		// No term is reported as both covered and missing.
		const overlap = out.matched_terms.filter((t) =>
			out.missed_terms.includes(t)
		);
		expect(overlap).toEqual([]);
	});

	it("returns no concept lists when there is no passage to compare against", () => {
		const out = evaluateSummary("a fairly short summary of some text", "");
		expect(out.matched_terms).toEqual([]);
		expect(out.missed_terms).toEqual([]);
	});

	it("caps each concept list to keep the feedback focused", () => {
		const wordyPassage =
			"alpha bravo charlie delta echo foxtrot golf hotel india juliett kilo lima mike november oscar papa quebec";
		const out = evaluateSummary("alpha bravo charlie", wordyPassage);
		expect(out.matched_terms.length).toBeLessThanOrEqual(8);
		expect(out.missed_terms.length).toBeLessThanOrEqual(8);
	});

	it("scores a relevant summary higher on content than same-length filler", () => {
		const relevant =
			"Greenhouse gases from burning fossil fuels raise global temperatures and sea levels worldwide.";
		const filler =
			"Lorem ipsum dolor consectetur adipiscing elit sed eiusmod tempor incididunt labore magna aliqua.";
		const a = evaluateSummary(relevant, passage);
		const b = evaluateSummary(filler, passage);
		expect(a.content_score).toBeGreaterThan(b.content_score);
	});

	it("falls back to a length estimate when no passage is given", () => {
		const out = evaluateSummary("a fairly short summary of some text", "");
		expect(out.content_score).toBeGreaterThan(0);
		expect(out.content_score).toBeLessThanOrEqual(95);
	});

	it("caps scores at sensible maxima", () => {
		const out = evaluateSummary("greenhouse gases fossil fuels temperatures sea levels".repeat(20), passage);
		expect(out.content_score).toBeLessThanOrEqual(97);
		expect(out.wording_score).toBeLessThanOrEqual(93);
	});
});

describe("getSampleSummary", () => {
	const passageFor = (id) =>
		DEMO_ASSIGNMENTS.find((a) => a.id === id)?.eval_text?.text || "";

	it("returns a passage-grounded strong sample that outscores the weak one", () => {
		const strong = getSampleSummary(1, "strong");
		expect(strong.length).toBeGreaterThan(0);
		const passage = passageFor(1);
		const strongScore = evaluateSummary(strong, passage).content_score;
		const weakScore = evaluateSummary(
			getSampleSummary(1, "weak"),
			passage
		).content_score;
		expect(strongScore).toBeGreaterThan(weakScore);
	});

	it("returns the same off-topic filler for any weak request", () => {
		expect(getSampleSummary(1, "weak")).toBe(getSampleSummary(3, "weak"));
		expect(getSampleSummary(1, "weak").length).toBeGreaterThan(0);
	});

	it("defaults to the strong sample", () => {
		expect(getSampleSummary(1)).toBe(getSampleSummary(1, "strong"));
	});

	it("returns an empty string for an unknown assignment", () => {
		expect(getSampleSummary(999, "strong")).toBe("");
	});
});

describe("getReadability", () => {
	it("returns a placeholder for empty input", () => {
		expect(getReadability("")).toEqual({ label: "—", avgSentenceLength: 0 });
		expect(getReadability("   ")).toEqual({ label: "—", avgSentenceLength: 0 });
	});

	it("rates short, plain sentences as Clear", () => {
		const out = getReadability("The cat sat. The dog ran. Birds fly high.");
		expect(out.label).toBe("Clear");
		expect(out.avgSentenceLength).toBeGreaterThan(0);
	});

	it("rates long sentences full of long words as Dense", () => {
		const dense =
			"Photosynthesis fundamentally represents an extraordinarily complicated biochemical transformation whereby chloroplasts systematically convert electromagnetic radiation into metabolically accessible chemical energy throughout numerous interdependent enzymatic reactions.";
		expect(getReadability(dense).label).toBe("Dense");
	});

	it("reports average sentence length in words", () => {
		// 8 words across 2 sentences → avg 4.
		expect(getReadability("one two three four. five six seven eight.").avgSentenceLength).toBe(4);
	});
});

describe("getInsightsForAssignment", () => {
	it("returns null for an assignment with no insights", () => {
		expect(getInsightsForAssignment(999)).toBeNull();
	});

	it("ranks common gaps by count, largest first", () => {
		const insight = getInsightsForAssignment(1);
		const counts = insight.commonErrors.map((e) => e.count);
		const sorted = [...counts].sort((a, b) => b - a);
		expect(counts).toEqual(sorted);
	});

	it("derives a top gap matching the highest-count error with a 0-100 share", () => {
		const insight = getInsightsForAssignment(2);
		const max = insight.commonErrors.reduce((m, e) =>
			e.count > m.count ? e : m
		);
		expect(insight.topGap.error).toBe(max.error);
		expect(insight.topGap.count).toBe(max.count);
		expect(insight.topGap.pct).toBeGreaterThanOrEqual(0);
		expect(insight.topGap.pct).toBeLessThanOrEqual(100);
	});

	it("accepts a string id (as the API passes it)", () => {
		expect(getInsightsForAssignment("1")).not.toBeNull();
	});
});

describe("getKpiSnapshot", () => {
	const kpi = getKpiSnapshot();

	it("reports the correct roster counts", () => {
		expect(kpi.students).toBe(DEMO_STUDENTS.length);
		expect(kpi.assignments).toBe(DEMO_ASSIGNMENTS.length);
		expect(kpi.enrolled).toBe(
			DEMO_STUDENTS.filter((s) => s.enrolled).length
		);
	});

	it("computes a non-zero completion in range (regression: was stuck at 0%)", () => {
		expect(kpi.completion).toBeGreaterThan(0);
		expect(kpi.completion).toBeLessThanOrEqual(100);
	});

	it("computes an average score in a sane range", () => {
		expect(kpi.avgScore).toBeGreaterThan(0);
		expect(kpi.avgScore).toBeLessThanOrEqual(100);
	});

	it("returns six weekly buckets for the sparklines", () => {
		expect(kpi.avgWeekly).toHaveLength(6);
		expect(kpi.submissionsWeekly).toHaveLength(6);
	});
});

describe("getSearchableEntries", () => {
	const entries = getSearchableEntries();

	it("returns entries with required fields", () => {
		expect(entries.length).toBeGreaterThan(0);
		for (const e of entries) {
			expect(typeof e.title).toBe("string");
			expect(typeof e.type).toBe("string");
		}
	});

	it("includes student and page entries", () => {
		const types = new Set(entries.map((e) => e.type));
		expect(types.has("student")).toBe(true);
		expect(types.has("page")).toBe(true);
	});
});

describe("getStudentProfile", () => {
	it("returns null for an unknown student (drives the drawer empty state)", () => {
		expect(getStudentProfile(99999)).toBeNull();
	});

	it("returns a profile with student, trajectory and class averages", () => {
		const profile = getStudentProfile(1);
		expect(profile).toBeTruthy();
		expect(profile.student).toBeTruthy();
		expect(Array.isArray(profile.trajectory)).toBe(true);
		expect(Array.isArray(profile.classAvgs)).toBe(true);
	});

	it("accepts a numeric-string id", () => {
		expect(getStudentProfile("1")).toBeTruthy();
	});
});

describe("getCohortMatrix", () => {
	const matrix = getCohortMatrix();

	it("has one column per assignment", () => {
		expect(matrix.columns).toHaveLength(DEMO_ASSIGNMENTS.length);
	});

	it("has one row per enrolled student, each cell aligned to a column", () => {
		const enrolled = DEMO_STUDENTS.filter((s) => s.enrolled).length;
		expect(matrix.rows).toHaveLength(enrolled);
		for (const row of matrix.rows) {
			expect(typeof row.student).toBe("string");
			expect(row.cells).toHaveLength(matrix.columns.length);
		}
	});
});

describe("getStudentSubmissionMap", () => {
	it("maps submitted assignments to rounded overall scores", async () => {
		const { getStudentSubmissionMap } = await import("./demo-data");
		const map = getStudentSubmissionMap(1);
		// John Doe submitted Climate Change: content 85, wording 78 → 82.
		expect(map[1]).toMatchObject({ overall: 82 });
		expect(map[1].submittedOn).toBeTruthy();
	});

	it("omits unsubmitted assignments and unknown students", async () => {
		const { getStudentSubmissionMap } = await import("./demo-data");
		// Emily Davis (id 4) did not submit assignment 1.
		expect(getStudentSubmissionMap(4)[1]).toBeUndefined();
		expect(getStudentSubmissionMap(999)).toEqual({});
	});
});

describe("activity feed freshness", () => {
	it("anchors the newest event to the recent past", async () => {
		const { getActivityFeed } = await import("./demo-data");
		const feed = getActivityFeed(5);
		const newest = new Date(feed[0].ts).getTime();
		const ageMs = Date.now() - newest;
		expect(ageMs).toBeGreaterThan(0);
		expect(ageMs).toBeLessThan(60 * 60 * 1000); // fresher than an hour
	});
});

describe("fixture timeline shift", () => {
	it("keeps the newest submission ~2 days old", async () => {
		const { DEMO_SUMMARIES_BY_ASSIGNMENT } = await import("./demo-data");
		const times = Object.values(DEMO_SUMMARIES_BY_ASSIGNMENT)
			.flat()
			.filter((s) => s.is_submitted && s.submitted_on)
			.map((s) => new Date(s.submitted_on).getTime());
		const newestAgeDays = (Date.now() - Math.max(...times)) / 86400000;
		expect(newestAgeDays).toBeGreaterThan(1);
		expect(newestAgeDays).toBeLessThan(4);
	});
});

describe("weekly KPI windows", () => {
	it("always shows recent submissions in 'this week'", async () => {
		const { getKpiSnapshot } = await import("./demo-data");
		// Rolling 7-day windows + the ~2-day-old newest submission mean the
		// current window can never be empty.
		expect(getKpiSnapshot().submissionsThisWeek).toBeGreaterThan(0);
	});
});

describe("getClassReport", () => {
	it("aggregates assignments and students with sane bounds", async () => {
		const { getClassReport, DEMO_ASSIGNMENTS } = await import("./demo-data");
		const report = getClassReport();
		expect(report.assignments).toHaveLength(DEMO_ASSIGNMENTS.length);
		expect(report.kpis.avgScore).toBeGreaterThan(0);
		for (const a of report.assignments) {
			expect(a.submitted).toBeLessThanOrEqual(a.total);
			if (a.avg !== null) {
				expect(a.avg).toBeGreaterThanOrEqual(0);
				expect(a.avg).toBeLessThanOrEqual(100);
			}
		}
		expect(report.students.length).toBeGreaterThan(0);
		for (const s of report.students) {
			expect(s.submitted).toBeLessThanOrEqual(s.total);
		}
	});
});

describe("getAssignmentDetail", () => {
	it("aggregates submissions, missing students, and averages", async () => {
		const { getAssignmentDetail } = await import("./demo-data");
		const d = getAssignmentDetail(1);
		expect(d.question).toMatch(/Climate Change/);
		expect(d.submissions.length).toBeGreaterThan(0);
		expect(d.submissions.length + d.missing.length).toBe(d.total);
		// Sorted by overall, best first.
		for (let i = 1; i < d.submissions.length; i++) {
			expect(d.submissions[i - 1].overall).toBeGreaterThanOrEqual(
				d.submissions[i].overall
			);
		}
		expect(d.avg).toBeGreaterThan(0);
		expect(d.avg).toBeLessThanOrEqual(100);
	});

	it("returns null for unknown assignments", async () => {
		const { getAssignmentDetail } = await import("./demo-data");
		expect(getAssignmentDetail(999)).toBeNull();
	});
});
