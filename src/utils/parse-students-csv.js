// Minimal RFC-4180-ish CSV parsing: quoted fields, escaped quotes,
// commas inside quotes, CRLF or LF line endings.
function parseCsv(text) {
	const rows = [];
	let row = [];
	let field = "";
	let inQuotes = false;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (inQuotes) {
			if (ch === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				field += ch;
			}
		} else if (ch === '"') {
			inQuotes = true;
		} else if (ch === ",") {
			row.push(field);
			field = "";
		} else if (ch === "\n" || ch === "\r") {
			if (ch === "\r" && text[i + 1] === "\n") i++;
			row.push(field);
			field = "";
			if (row.some((c) => c !== "")) rows.push(row);
			row = [];
		} else {
			field += ch;
		}
	}
	row.push(field);
	if (row.some((c) => c !== "")) rows.push(row);
	return rows;
}

// Accepts the same format exportStudentsCsv produces:
// Name,Email,Grade,Status,City,State (header row required, any casing).
// Returns { students, skipped } — rows without a name are skipped.
export function parseStudentsCsv(text) {
	// Strip a leading UTF-8 BOM. Our own export writes one so Excel reads
	// accented names correctly, and files round-tripped through Excel gain one
	// either way — left in place it would hide the "Name" header behind an
	// invisible character and silently import nothing.
	const rows = parseCsv(String(text ?? "").replace(/^\uFEFF/, ""));
	if (!rows.length) return { students: [], skipped: 0 };

	const header = rows[0].map((h) => h.trim().toLowerCase());
	const col = (name) => header.indexOf(name);
	const idx = {
		name: col("name"),
		email: col("email"),
		grade: col("grade"),
		status: col("status"),
		city: col("city"),
		state: col("state"),
	};
	if (idx.name === -1) return { students: [], skipped: rows.length - 1 };

	const students = [];
	let skipped = 0;
	for (const row of rows.slice(1)) {
		const name = (row[idx.name] || "").trim();
		if (!name) {
			skipped++;
			continue;
		}
		const gradeRaw = idx.grade >= 0 ? (row[idx.grade] || "").trim() : "";
		const gradeMatch = gradeRaw.match(/\d+/);
		const status =
			idx.status >= 0 ? (row[idx.status] || "").trim().toLowerCase() : "";
		students.push({
			name,
			email:
				(idx.email >= 0 && (row[idx.email] || "").trim()) ||
				`${name.toLowerCase().replace(/\s+/g, ".")}@school.demo`,
			grade: gradeMatch ? gradeMatch[0] : null,
			enrolled: status !== "not enrolled",
			address: {
				city: (idx.city >= 0 && (row[idx.city] || "").trim()) || "Colombo",
				state:
					(idx.state >= 0 && (row[idx.state] || "").trim()) || "Western",
				country: "Sri Lanka",
			},
		});
	}
	return { students, skipped };
}
