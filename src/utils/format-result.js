// Render a scored summary as a plain-text block a student can copy and paste
// (into an email, a doc, a chat). Pure and deterministic — the same result
// always formats the same way. Overall is the mean of content and wording,
// matching the score modal's dial.
const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

export function formatResultText({
	contentScore = 0,
	wordingScore = 0,
	wordCount = 0,
	matchedTerms = [],
	missedTerms = [],
	readability = null,
} = {}) {
	const content = clamp(contentScore);
	const wording = clamp(wordingScore);
	const overall = Math.round((content + wording) / 2);

	const lines = ["Summary evaluation"];
	lines.push(`Overall: ${overall}/100 (content ${content}, wording ${wording})`);

	if (wordCount) {
		const readable =
			readability?.label && readability.label !== "—"
				? ` · readability: ${readability.label}`
				: "";
		lines.push(`Words: ${wordCount}${readable}`);
	}
	if (matchedTerms.length) {
		lines.push(`Covered: ${matchedTerms.join(", ")}`);
	}
	if (missedTerms.length) {
		lines.push(`Consider adding: ${missedTerms.join(", ")}`);
	}
	return lines.join("\n");
}
