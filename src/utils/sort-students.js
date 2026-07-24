const ACCESSORS = {
	name: (s) => (s.name || "").toLowerCase(),
	email: (s) => (s.email || "").toLowerCase(),
	grade: (s) => Number(s.grade) || 0,
	enrolled: (s) => (s.enrolled ? 1 : 0),
	location: (s) =>
		`${s.address?.city ?? ""} ${s.address?.state ?? ""}`.toLowerCase(),
};

export const SORTABLE_FIELDS = Object.keys(ACCESSORS);

export function sortStudents(students, field, dir = "asc") {
	const accessor = ACCESSORS[field];
	if (!accessor) return students;
	const sign = dir === "desc" ? -1 : 1;
	return [...students].sort((a, b) => {
		const va = accessor(a);
		const vb = accessor(b);
		if (va < vb) return -1 * sign;
		if (va > vb) return 1 * sign;
		return 0;
	});
}
