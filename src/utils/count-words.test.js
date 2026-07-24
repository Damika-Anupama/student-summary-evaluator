import { describe, it, expect } from "vitest";
import { countWords } from "./count-words";

describe("countWords", () => {
	it("counts words separated by any whitespace", () => {
		expect(countWords("one two three")).toBe(3);
		expect(countWords("one\ntwo\tthree  four")).toBe(4);
	});

	it("returns 0 for empty or whitespace-only text", () => {
		expect(countWords("")).toBe(0);
		expect(countWords("   \n\t ")).toBe(0);
		expect(countWords()).toBe(0);
	});

	it("ignores leading and trailing whitespace", () => {
		expect(countWords("  hello world  ")).toBe(2);
	});
});
