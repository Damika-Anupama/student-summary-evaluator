import { describe, it, expect } from "vitest";
import { studentsCsv, assignmentsCsv } from "./report-csv";

const report = {
	students: [
		{ studentId: 1, student: "Ada Lovelace", submitted: 3, total: 4, avg: 88 },
		{ studentId: 2, student: "Grace, Hopper", submitted: 0, total: 4, avg: null },
	],
	assignments: [
		{ id: 1, title: "Climate", question: "Summarise the passage", submitted: 8, total: 10, avg: 76 },
	],
};

describe("studentsCsv", () => {
	it("emits a header and one row per student", () => {
		const lines = studentsCsv(report).split("\r\n");
		expect(lines[0]).toBe("Student,Submitted,Total,Average");
		expect(lines[1]).toBe("Ada Lovelace,3,4,88");
	});

	it("escapes commas in names and renders a null average as empty", () => {
		const lines = studentsCsv(report).split("\r\n");
		expect(lines[2]).toBe('"Grace, Hopper",0,4,');
	});

	it("returns just the header for an empty report", () => {
		expect(studentsCsv({ students: [] })).toBe("Student,Submitted,Total,Average");
		expect(studentsCsv(null)).toBe("Student,Submitted,Total,Average");
	});
});

describe("assignmentsCsv", () => {
	it("emits a header and one row per assignment", () => {
		const lines = assignmentsCsv(report).split("\r\n");
		expect(lines[0]).toBe("Topic,Prompt,Submitted,Total,Average");
		expect(lines[1]).toBe("Climate,Summarise the passage,8,10,76");
	});

	it("returns just the header for an empty report", () => {
		expect(assignmentsCsv({ assignments: [] })).toBe(
			"Topic,Prompt,Submitted,Total,Average"
		);
	});
});
