// Summarize a list of graded summaries into average / best / count of the
// overall score (mean of content and wording). Non-numeric rows are ignored.
const toNumber = (v) =>
	v === "" || v === null || v === undefined ? NaN : Number(v);

export const summarizeScores = (rows = []) => {
	const overalls = rows
		.map((r) => {
			const c = toNumber(r.content_score);
			const w = toNumber(r.wording_score);
			return Number.isFinite(c) && Number.isFinite(w) ? (c + w) / 2 : NaN;
		})
		.filter((v) => Number.isFinite(v));
	const graded = overalls.length;
	const avg = graded
		? Math.round(overalls.reduce((a, b) => a + b, 0) / graded)
		: 0;
	const best = graded ? Math.round(Math.max(...overalls)) : 0;
	return { graded, avg, best };
};
