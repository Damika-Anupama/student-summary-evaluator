import {
	getInsightsForAssignment,
	getSummariesForAssignment,
} from "../../../../demo/demo-data";

// Restate the headline gap against an honest denominator.
//
// The base topGap divides the error tally by the number of enrolled students
// and clamps the result to 100%. That is wrong twice over: students who never
// submitted cannot have made the error, and the clamp hides a tally that has
// outgrown its denominator by reporting a confident "100% of the class".
//
// The population that could exhibit the error is the set of scored
// submissions for this assignment, so that is the denominator. When the tally
// still exceeds it — meaning the count is occurrences, not students — no
// percentage is truthful, so we report the raw occurrence count instead of
// inventing one.
function withHonestDenominator(topGap, submissionCount) {
	if (!topGap) return null;

	const { error, count } = topGap;
	const expressible = submissionCount > 0 && count <= submissionCount;
	const pct = expressible
		? Math.round((count / submissionCount) * 100)
		: null;

	return {
		error,
		count,
		submissionCount,
		pct,
		label: expressible
			? `${count} of ${submissionCount} submissions (${pct}%)`
			: `${count} occurrence${count === 1 ? "" : "s"}`,
	};
}

// Per-assignment AI gap analysis (common errors + suggested intervention).
export default function handler(req, res) {
	if (req.method !== "GET") {
		res.status(405).json({ error: "Method not allowed" });
		return;
	}
	const { id } = req.query;
	const insight = getInsightsForAssignment(id);
	if (!insight) {
		res.status(404).json({ error: "No insight for assignment" });
		return;
	}

	const submissionCount = getSummariesForAssignment(id).filter(
		(s) => s.is_submitted
	).length;

	res.status(200).json({
		insight: {
			...insight,
			submissionCount,
			topGap: withHonestDenominator(insight.topGap, submissionCount),
		},
	});
}
