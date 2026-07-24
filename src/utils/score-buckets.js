// Pure helpers for the dashboard score charts. Extracted so the bucketing
// logic (which has had off-by-one bugs) can be unit tested.

// Round a score to an integer percentage clamped to 0-100; non-numeric
// input becomes 0. Used for the result-modal score dials.
export const clampPct = (value) => {
	const n = Number(value);
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(100, Math.round(n)));
};

// MUI color token for a score dial by band.
// Canonical score scale used across the app (heatmap, drawer, queue,
// histograms): 85+ success, 70-84 info, 55-69 warning, below 55 error.
export const scorePalette = (pct) => {
	if (pct >= 85) return "success";
	if (pct >= 70) return "info";
	if (pct >= 55) return "warning";
	return "error";
};

export const scoreColor = (pct) => `${scorePalette(pct)}.main`;

// Encouraging verdict line shown above the result-modal score dials.
// Bands must match scorePalette exactly: the verdict sits next to a dial
// painted by that scale, and a 50-54 score used to read "a solid start"
// in error red — praise and colour contradicting each other on one screen.
export const verdict = (pct) => {
	if (pct >= 85) return "Excellent summary!";
	if (pct >= 70) return "Good work — nearly there.";
	if (pct >= 55) return "A solid start. Keep refining.";
	return "Room to grow — try the tips below.";
};

// Count scores into ten buckets: 0-10, 10-20, ... 90-100.
// Non-numeric values are ignored; out-of-range values clamp to the ends.
export const bucketByTens = (values = []) => {
	const counts = new Array(10).fill(0);
	for (const raw of values) {
		const value =
			raw === "" || raw === null || raw === undefined ? NaN : Number(raw);
		if (!Number.isFinite(value)) continue;
		let idx = Math.floor(value / 10);
		if (idx < 0) idx = 0;
		if (idx > 9) idx = 9;
		counts[idx]++;
	}
	return counts;
};

// Count scores into Low / Normal / Best ranges. The final range is
// inclusive of its max so a perfect 100 is counted (it previously fell
// through every range and was dropped).
export const bucketByRange = (values = []) => {
	const ranges = [
		{ min: 0, max: 35 },
		{ min: 35, max: 75 },
		{ min: 75, max: 100 },
	];
	const counts = new Array(ranges.length).fill(0);
	for (const raw of values) {
		const value =
			raw === "" || raw === null || raw === undefined ? NaN : Number(raw);
		if (!Number.isFinite(value)) continue;
		for (let i = 0; i < ranges.length; i++) {
			const isLast = i === ranges.length - 1;
			const inRange =
				value >= ranges[i].min &&
				(value < ranges[i].max || (isLast && value <= ranges[i].max));
			if (inRange) {
				counts[i]++;
				break;
			}
		}
	}
	return counts;
};
