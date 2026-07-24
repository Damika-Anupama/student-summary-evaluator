import { describe, it, expect } from "vitest";
import { getInitials } from "./get-initials";

describe("getInitials", () => {
	it("returns the first letters of the first two words, uppercased", () => {
		expect(getInitials("Amara Perera")).toBe("AP");
		expect(getInitials("john doe")).toBe("JD");
	});

	it("uses only the first two words for longer names", () => {
		expect(getInitials("Mary Jane Watson")).toBe("MJ");
	});

	it("handles a single name", () => {
		expect(getInitials("Cher")).toBe("C");
	});

	it("returns an empty string for empty or missing input", () => {
		expect(getInitials("")).toBe("");
		expect(getInitials()).toBe("");
	});
});
