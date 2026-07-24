import { describe, it, expect } from "vitest";
import { toCsv } from "./to-csv";

describe("toCsv", () => {
	it("joins fields with commas and rows with CRLF", () => {
		expect(
			toCsv([
				["Name", "Score"],
				["Ada", 90],
			])
		).toBe("Name,Score\r\nAda,90");
	});

	it("quotes fields that contain a comma", () => {
		expect(toCsv([["Doe, Jane", 1]])).toBe('"Doe, Jane",1');
	});

	it("escapes double-quotes by doubling them and wrapping", () => {
		expect(toCsv([['She said "hi"', 2]])).toBe('"She said ""hi""",2');
	});

	it("quotes fields that contain newlines", () => {
		expect(toCsv([["line1\nline2"]])).toBe('"line1\nline2"');
	});

	it("renders null and undefined as empty fields", () => {
		expect(toCsv([[null, undefined, 0]])).toBe(",,0");
	});

	it("coerces numbers and does not quote plain values", () => {
		expect(toCsv([["plain", 42, "no-comma"]])).toBe("plain,42,no-comma");
	});

	it("returns an empty string for non-array input", () => {
		expect(toCsv(null)).toBe("");
		expect(toCsv(undefined)).toBe("");
	});

	it("defuses fields that a spreadsheet would run as a formula", () => {
		expect(toCsv([["=1+1"]])).toBe("'=1+1");
		expect(toCsv([["@SUM(A1)"]])).toBe("'@SUM(A1)");
		expect(toCsv([["\tinjected"]])).toBe("'\tinjected");
		expect(toCsv([["=cmd|'/c calc'!A1"]])).toBe("'=cmd|'/c calc'!A1");
	});

	it("quotes a defused field that also contains a comma", () => {
		expect(toCsv([["=HYPERLINK(1,2)"]])).toBe('"\'=HYPERLINK(1,2)"');
	});

	it("leaves negative and plain numbers untouched", () => {
		expect(toCsv([[-5, "-2.5", 0, "42"]])).toBe("-5,-2.5,0,42");
	});

	it("defuses a value that only looks numeric at the start", () => {
		expect(toCsv([["-5+cmd"]])).toBe("'-5+cmd");
	});

	it("leaves ordinary text and empty fields alone", () => {
		expect(toCsv([["Ada Lovelace", "", null]])).toBe("Ada Lovelace,,");
	});

	it("round-trips a header plus records shape", () => {
		const rows = [
			["Student", "Average"],
			["Ada Lovelace", 88],
			["Grace, Hopper", null],
		];
		expect(toCsv(rows)).toBe(
			'Student,Average\r\nAda Lovelace,88\r\n"Grace, Hopper",'
		);
	});
});
