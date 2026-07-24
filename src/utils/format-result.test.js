import { describe, it, expect } from "vitest";
import { formatResultText } from "./format-result";

describe("formatResultText", () => {
	it("includes overall (mean of content and wording) with both components", () => {
		const text = formatResultText({ contentScore: 74, wordingScore: 80 });
		expect(text).toContain("Overall: 77/100 (content 74, wording 80)");
	});

	it("lists covered and missed concepts when present", () => {
		const text = formatResultText({
			contentScore: 70,
			wordingScore: 70,
			matchedTerms: ["climate", "change"],
			missedTerms: ["fuels"],
		});
		expect(text).toContain("Covered: climate, change");
		expect(text).toContain("Consider adding: fuels");
	});

	it("adds a words line with readability when provided", () => {
		const text = formatResultText({
			contentScore: 60,
			wordingScore: 60,
			wordCount: 42,
			readability: { label: "Clear", avgSentenceLength: 10 },
		});
		expect(text).toContain("Words: 42 · readability: Clear");
	});

	it("omits optional lines when their data is absent", () => {
		const text = formatResultText({ contentScore: 50, wordingScore: 50 });
		expect(text).not.toContain("Words:");
		expect(text).not.toContain("Covered:");
		expect(text).not.toContain("Consider adding:");
	});

	it("omits the readability suffix for the placeholder label", () => {
		const text = formatResultText({
			contentScore: 50,
			wordingScore: 50,
			wordCount: 10,
			readability: { label: "—", avgSentenceLength: 0 },
		});
		expect(text).toContain("Words: 10");
		expect(text).not.toContain("readability");
	});

	it("clamps out-of-range scores", () => {
		const text = formatResultText({ contentScore: 130, wordingScore: -20 });
		expect(text).toContain("(content 100, wording 0)");
	});

	it("is safe with no arguments", () => {
		expect(formatResultText()).toContain("Overall: 0/100");
	});
});
