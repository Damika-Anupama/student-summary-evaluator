import { describe, it, expect, beforeEach, vi } from "vitest";
import { DEMO_ASSIGNMENTS } from "src/demo/demo-data";
import { resetAssignments } from "src/demo/assignment-store";
import listHandler from "src/pages/api/assignments/index";
import detailHandler from "src/pages/api/assignments/[id]";

// Next.js API routes are plain functions — call them with mock req/res.
const mockRes = () => {
	const res = { statusCode: null, body: null };
	res.status = vi.fn((code) => {
		res.statusCode = code;
		return res;
	});
	res.json = vi.fn((payload) => {
		res.body = payload;
		return res;
	});
	return res;
};

const call = (handler, req) => {
	const res = mockRes();
	handler({ query: {}, body: undefined, ...req }, res);
	return res;
};

beforeEach(resetAssignments);

describe("/api/assignments", () => {
	it("GET lists the fixtures with a real student count", () => {
		const res = call(listHandler, { method: "GET" });
		expect(res.statusCode).toBe(200);
		expect(res.body.assignments).toHaveLength(DEMO_ASSIGNMENTS.length);
		expect(res.body.assignments[0].studentCount).toBeGreaterThan(0);
	});

	it("POST creates an assignment and returns 201", () => {
		const res = call(listHandler, {
			method: "POST",
			body: { question: "Explain the tides", title: "Tides", text: "Moon." },
		});
		expect(res.statusCode).toBe(201);
		expect(res.body.assignment.question).toBe("Explain the tides");
		expect(call(listHandler, { method: "GET" }).body.assignments).toHaveLength(
			DEMO_ASSIGNMENTS.length + 1
		);
	});

	it("PUT updates an existing assignment and 404s on an unknown id", () => {
		const ok = call(listHandler, {
			method: "PUT",
			body: { id: DEMO_ASSIGNMENTS[0].id, question: "Reworded" },
		});
		expect(ok.statusCode).toBe(200);
		expect(ok.body.assignment.question).toBe("Reworded");

		const miss = call(listHandler, { method: "PUT", body: { id: 9999 } });
		expect(miss.statusCode).toBe(404);
	});

	it("DELETE removes an assignment", () => {
		const res = call(listHandler, {
			method: "DELETE",
			body: { id: DEMO_ASSIGNMENTS[0].id },
		});
		expect(res.statusCode).toBe(200);
		expect(call(listHandler, { method: "GET" }).body.assignments).toHaveLength(
			DEMO_ASSIGNMENTS.length - 1
		);
	});

	it("rejects unsupported methods", () => {
		expect(call(listHandler, { method: "PATCH" }).statusCode).toBe(405);
	});
});

describe("/api/assignments/[id]", () => {
	it("GET returns the matching fixture", () => {
		const target = DEMO_ASSIGNMENTS[1];
		const res = call(detailHandler, {
			method: "GET",
			query: { id: String(target.id) },
		});
		expect(res.statusCode).toBe(200);
		expect(res.body.assignments.id).toBe(target.id);
		expect(res.body.assignments.question).toBe(target.question);
	});

	it("GET resolves an assignment created in the same session", () => {
		// The regression: created assignments used to live only in the
		// collection route, so this lookup silently returned DEMO_ASSIGNMENTS[0].
		const created = call(listHandler, {
			method: "POST",
			body: { question: "Session-only assignment", title: "Session" },
		}).body.assignment;

		const res = call(detailHandler, {
			method: "GET",
			query: { id: String(created.id) },
		});
		expect(res.statusCode).toBe(200);
		expect(res.body.assignments.id).toBe(created.id);
		expect(res.body.assignments.question).toBe("Session-only assignment");
		expect(res.body.assignments.question).not.toBe(DEMO_ASSIGNMENTS[0].question);
	});

	it("GET 404s for an unknown id instead of falling back to a fixture", () => {
		const res = call(detailHandler, { method: "GET", query: { id: "9999" } });
		expect(res.statusCode).toBe(404);
		expect(res.body.error).toMatch(/9999/);
		expect(res.body.assignments).toBeUndefined();
	});

	it("is read-only — mutations belong to /api/assignments", () => {
		const target = String(DEMO_ASSIGNMENTS[0].id);
		for (const method of ["PUT", "DELETE", "POST", "PATCH"]) {
			const res = call(detailHandler, { method, query: { id: target } });
			expect(res.statusCode).toBe(405);
		}
		// Nothing was mutated on the way through.
		expect(call(listHandler, { method: "GET" }).body.assignments).toHaveLength(
			DEMO_ASSIGNMENTS.length
		);
	});
});
