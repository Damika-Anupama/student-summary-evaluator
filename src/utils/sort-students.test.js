import { describe, it, expect } from "vitest";
import { sortStudents } from "./sort-students";

const students = [
	{
		id: "1",
		name: "Charlie Adams",
		email: "charlie@school.demo",
		grade: "11",
		enrolled: false,
		address: { city: "Kandy", state: "Central" },
	},
	{
		id: "2",
		name: "alice Brown",
		email: "Alice@school.demo",
		grade: "9",
		enrolled: true,
		address: { city: "Colombo", state: "Western" },
	},
	{
		id: "3",
		name: "Bob Clark",
		email: "bob@school.demo",
		grade: "12",
		enrolled: true,
		address: { city: "Galle", state: "Southern" },
	},
];

describe("sortStudents", () => {
	it("sorts by name case-insensitively", () => {
		const sorted = sortStudents(students, "name", "asc");
		expect(sorted.map((s) => s.id)).toEqual(["2", "3", "1"]);
	});

	it("sorts descending when dir is desc", () => {
		const sorted = sortStudents(students, "name", "desc");
		expect(sorted.map((s) => s.id)).toEqual(["1", "3", "2"]);
	});

	it("sorts grade numerically, not lexically", () => {
		const sorted = sortStudents(students, "grade", "asc");
		// Lexical would give 11 < 12 < 9; numeric gives 9 < 11 < 12.
		expect(sorted.map((s) => s.grade)).toEqual(["9", "11", "12"]);
	});

	it("sorts enrolled status with enrolled first on desc", () => {
		const sorted = sortStudents(students, "enrolled", "desc");
		expect(sorted.map((s) => s.enrolled)).toEqual([true, true, false]);
	});

	it("sorts by location city", () => {
		const sorted = sortStudents(students, "location", "asc");
		expect(sorted.map((s) => s.address.city)).toEqual([
			"Colombo",
			"Galle",
			"Kandy",
		]);
	});

	it("returns the input untouched for unknown fields", () => {
		expect(sortStudents(students, "unknown", "asc")).toBe(students);
	});

	it("does not mutate the original array", () => {
		const copy = [...students];
		sortStudents(students, "name", "asc");
		expect(students).toEqual(copy);
	});
});
