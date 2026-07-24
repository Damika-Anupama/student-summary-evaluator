const toNumber = (v) => {
	const n = typeof v === "number" ? v : parseFloat(v);
	return Number.isFinite(n) ? n : 0;
};

const ACCESSORS = {
	assignment: (r) => (r.assignment || "").toLowerCase(),
	submitted: (r) => (r.submitted_on ? new Date(r.submitted_on).getTime() : 0),
	content: (r) => toNumber(r.content_score),
	wording: (r) => toNumber(r.wording_score),
	overall: (r) =>
		Math.round((toNumber(r.content_score) + toNumber(r.wording_score)) / 2),
};

export function sortHistory(rows, field, dir = "asc") {
	const accessor = ACCESSORS[field];
	if (!accessor) return rows;
	const sign = dir === "desc" ? -1 : 1;
	return [...rows].sort((a, b) => {
		const va = accessor(a);
		const vb = accessor(b);
		if (va < vb) return -1 * sign;
		if (va > vb) return 1 * sign;
		return 0;
	});
}
