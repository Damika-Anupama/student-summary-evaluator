import { describe, it, expect } from "vitest";
import { parseStudentsCsv } from "./parse-students-csv";
import { toCsv } from "./to-csv";
import { UTF8_BOM } from "./download-csv";

const EXPORT_SAMPLE = `"Name","Email","Grade","Status","City","State"
"John Doe","john@school.demo","Grade 10","Enrolled","Colombo","Western"
"Jane, M. Smith","jane@school.demo","Grade 9","Not enrolled","Kandy","Central"
"Quote ""Q"" Test","q@school.demo","Grade 8","Enrolled","Galle","Southern"`;

describe("parseStudentsCsv", () => {
	it("round-trips the app's own export format", () => {
		const { students, skipped } = parseStudentsCsv(EXPORT_SAMPLE);
		expect(skipped).toBe(0);
		expect(students).toHaveLength(3);
		expect(students[0]).toMatchObject({
			name: "John Doe",
			email: "john@school.demo",
			grade: "10",
			enrolled: true,
		});
		// Comma inside quotes stays in the field.
		expect(students[1].name).toBe("Jane, M. Smith");
		expect(students[1].enrolled).toBe(false);
		// Escaped quotes unescape.
		expect(students[2].name).toBe('Quote "Q" Test');
	});

	it("fills defaults for missing email and location", () => {
		const { students } = parseStudentsCsv(
			"Name,Grade\nAva Perera,11\n"
		);
		expect(students[0].email).toBe("ava.perera@school.demo");
		expect(students[0].grade).toBe("11");
		expect(students[0].address.city).toBe("Colombo");
	});

	it("skips rows without a name and handles CRLF", () => {
		const { students, skipped } = parseStudentsCsv(
			"Name,Email\r\nA One,a@x.demo\r\n,missing@x.demo\r\n"
		);
		expect(students).toHaveLength(1);
		expect(skipped).toBe(1);
	});

	it("rejects files without a Name column", () => {
		const { students, skipped } = parseStudentsCsv("Foo,Bar\n1,2\n");
		expect(students).toHaveLength(0);
		expect(skipped).toBe(1);
	});

	it("handles empty input", () => {
		expect(parseStudentsCsv("")).toEqual({ students: [], skipped: 0 });
		expect(parseStudentsCsv(null)).toEqual({ students: [], skipped: 0 });
	});
});

describe("parseStudentsCsv — real export round-trip", () => {
	// The students page exports through toCsv and downloads with a UTF-8 BOM.
	// Re-importing that exact byte stream is the documented workflow, so build
	// the fixture the same way the page does instead of hand-writing it.
	const buildExport = (students) =>
		UTF8_BOM +
		toCsv([
			["Name", "Email", "Grade", "Status", "City", "State"],
			...students.map((s) => [
				s.name,
				s.email,
				s.grade != null ? `Grade ${s.grade}` : "",
				s.enrolled ? "Enrolled" : "Not enrolled",
				s.address?.city ?? "",
				s.address?.state ?? "",
			]),
		]);

	it("re-imports its own BOM-prefixed export without losing rows", () => {
		const original = [
			{
				name: "Ana Muñoz",
				email: "ana@school.demo",
				grade: 7,
				enrolled: true,
				address: { city: "Colombo", state: "Western" },
			},
			{
				name: "Jane, M. Smith",
				email: "jane@school.demo",
				grade: 9,
				enrolled: false,
				address: { city: "Kandy", state: "Central" },
			},
		];

		const { students, skipped } = parseStudentsCsv(buildExport(original));

		expect(skipped).toBe(0);
		expect(students).toHaveLength(2);
		// The BOM must not end up glued to the first header cell, which would
		// hide the Name column and skip every row.
		expect(students[0].name).toBe("Ana Muñoz");
		expect(students[0].grade).toBe("7");
		expect(students[0].enrolled).toBe(true);
		expect(students[1].name).toBe("Jane, M. Smith");
		expect(students[1].enrolled).toBe(false);
	});

	it("keeps a formula-defused name importable", () => {
		// toCsv prefixes `=...` with an apostrophe so spreadsheets treat it as
		// text; the value comes back with that marker, but the row still imports.
		const { students, skipped } = parseStudentsCsv(
			buildExport([
				{
					name: "=cmd|'/c calc'!A1",
					email: "x@school.demo",
					grade: 5,
					enrolled: true,
					address: { city: "Galle", state: "Southern" },
				},
			])
		);
		expect(skipped).toBe(0);
		expect(students).toHaveLength(1);
		expect(students[0].name).toBe("'=cmd|'/c calc'!A1");
	});
});
