// Excel ignores the charset in the MIME type and falls back to the system
// codepage, which mangles non-ASCII names ("Ana Muñoz" → "Ana MuÃ±oz"). A
// leading UTF-8 BOM is the one hint it does honour. It belongs here rather
// than in toCsv, which stays a pure string builder.
//
// Written as an escape, not the raw character, so it stays visible in review.
export const UTF8_BOM = "\uFEFF";

// Trigger a browser download for CSV text. Shared by the report, students and
// assignments exports so every export gets the same BOM and MIME treatment.
export function downloadCsv(text, filename) {
	const blob = new Blob([UTF8_BOM + text], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
