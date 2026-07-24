import { format } from "date-fns";

const toNumber = (v) => {
	const n = typeof v === "number" ? v : parseFloat(v);
	return Number.isFinite(n) ? n : NaN;
};

// Turn newest-first history rows into chronological chart series.
export function buildScoreTrend(rows = []) {
	const points = rows
		.filter((r) => r.submitted_on)
		.map((r) => {
			const c = toNumber(r.content_score);
			const w = toNumber(r.wording_score);
			return {
				date: new Date(r.submitted_on),
				content: Number.isFinite(c) ? Math.round(c) : null,
				wording: Number.isFinite(w) ? Math.round(w) : null,
				overall:
					Number.isFinite(c) && Number.isFinite(w)
						? Math.round((c + w) / 2)
						: null,
			};
		})
		.filter((p) => p.overall !== null && !Number.isNaN(p.date.getTime()))
		.sort((a, b) => a.date - b.date);

	const overall = points.map((p) => p.overall);
	const delta =
		points.length >= 2 ? overall[overall.length - 1] - overall[0] : null;

	// Headline stats for the trend card — the student's personal best and
	// running average across all graded summaries.
	const best = overall.length ? Math.max(...overall) : null;
	const average = overall.length
		? Math.round(overall.reduce((sum, v) => sum + v, 0) / overall.length)
		: null;

	// Start the y-axis just below the lowest plotted score (rounded down to a
	// ten) so small movements stay readable instead of flattening on a 0-100
	// axis.
	const plotted = points
		.flatMap((p) => [p.content, p.wording, p.overall])
		.filter((v) => v !== null);
	const yMin = plotted.length
		? Math.max(0, Math.floor((Math.min(...plotted) - 5) / 10) * 10)
		: 0;

	return {
		labels: points.map((p) => format(p.date, "d MMM")),
		content: points.map((p) => p.content),
		wording: points.map((p) => p.wording),
		overall,
		delta,
		best,
		average,
		yMin,
	};
}
