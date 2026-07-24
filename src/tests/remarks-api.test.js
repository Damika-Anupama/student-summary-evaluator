import { describe, it, expect, afterEach, vi } from "vitest";
import { SEEDED_REMARKS } from "src/demo/remarks";
import handler from "src/pages/api/remarks/index";

// Next.js API routes are plain functions — call them with mock req/res.
const call = ({ method = "GET", query = {}, body } = {}) => {
	const res = { statusCode: null, body: null };
	res.status = vi.fn((code) => {
		res.statusCode = code;
		return res;
	});
	res.json = vi.fn((payload) => {
		res.body = payload;
		return res;
	});
	handler({ method, query, body }, res);
	return res;
};

afterEach(() => vi.restoreAllMocks());

describe("/api/remarks", () => {
	it("serves every seeded teacher remark", () => {
		const res = call();
		expect(res.statusCode).toBe(200);
		expect(res.body.remarks).toEqual([...SEEDED_REMARKS]);
	});

	it("filters to one student", () => {
		const res = call({ query: { studentId: "1" } });
		expect(res.body.remarks.length).toBeGreaterThan(0);
		expect(res.body.remarks.every((r) => r.studentId === 1)).toBe(true);
	});

	it("returns an empty list for a student with no remarks", () => {
		expect(call({ query: { studentId: "999" } }).body.remarks).toEqual([]);
	});

	it("keys every remark by its (student, assignment) pair", () => {
		for (const remark of call().body.remarks) {
			expect(remark.id).toBe(`${remark.studentId}:${remark.assignmentId}`);
		}
	});

	it("still answers POST with AI improvement suggestions", () => {
		const res = call({
			method: "POST",
			body: { contentScore: 55, wordingScore: 60 },
		});
		expect(res.statusCode).toBe(200);
		expect(res.body.result.bullets.length).toBeGreaterThan(0);
		expect(res.body.remarks).toBeUndefined();
	});

	it("rejects other methods", () => {
		expect(call({ method: "DELETE" }).statusCode).toBe(405);
	});
});
