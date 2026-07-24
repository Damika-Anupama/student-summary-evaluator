import { toCsv } from "./to-csv";

// Turn a class report (from getClassReport) into spreadsheet-ready CSV text.
// Kept out of the page component so the row shaping is unit-testable and both
// exports share one escaping path via toCsv.

export function studentsCsv(report) {
	const students = report?.students || [];
	return toCsv([
		["Student", "Submitted", "Total", "Average"],
		...students.map((s) => [
			s.student,
			s.submitted,
			s.total,
			s.avg != null ? s.avg : "",
		]),
	]);
}

export function assignmentsCsv(report) {
	const assignments = report?.assignments || [];
	return toCsv([
		["Topic", "Prompt", "Submitted", "Total", "Average"],
		...assignments.map((a) => [
			a.title,
			a.question,
			a.submitted,
			a.total,
			a.avg != null ? a.avg : "",
		]),
	]);
}
