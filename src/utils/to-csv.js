// Build an RFC-4180 CSV string from a matrix of rows.
//
// Each field is coerced to a string (null/undefined → ""), and any field that
// contains a comma, double-quote, carriage return, or newline is wrapped in
// double-quotes with internal quotes doubled. Rows are joined with CRLF, the
// line ending spreadsheets expect. This is the safe building block for any
// data export — unlike naive string concatenation, it survives names like
// "Doe, Jane" or free-text that contains quotes.

// Leading characters that make Excel/Sheets treat a cell as a formula rather
// than text, so a student name like `=cmd|'/c calc'!A1` would execute on open.
const FORMULA_LEAD = /^[=+\-@\t\r]/;

// Numeric columns (scores, counts) must stay clean: prefixing a negative
// number would export `'-5`, which spreadsheets read as text and refuse to
// average. So the guard only fires on values that are not plain numbers —
// `-5` is exported as-is, while `-5+cmd` or `=SUM(A1)` is neutralised.
const isPlainNumber = (s) => s.trim() !== "" && Number.isFinite(Number(s));

// Prefix a risky value with an apostrophe, the spreadsheet convention for
// "treat the rest of this cell as literal text". The apostrophe is not part
// of the displayed value once imported.
const defuseFormula = (s) =>
	FORMULA_LEAD.test(s) && !isPlainNumber(s) ? `'${s}` : s;

export function toCsv(rows) {
	if (!Array.isArray(rows)) return "";
	return rows
		.map((row) =>
			(Array.isArray(row) ? row : [row])
				.map((field) => {
					const s = defuseFormula(field == null ? "" : String(field));
					return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
				})
				.join(",")
		)
		.join("\r\n");
}
