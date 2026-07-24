// Per-assignment class rosters.
//
// A roster is not a new kind of record: it is one more field on the assignment
// itself, `studentIds`, so it rides the overlay that already exists at
// sse.assignments.v1. Changing a fixture's roster is stored as a patch,
// a roster on an assignment the visitor created is folded into that created
// record, deleting the assignment drops its roster with it, and "Reset demo
// data" clears it along with everything else. No second key, no second key
// scheme, and nothing here touches localStorage at module scope.
//
// Where the first roster comes from, when the visitor has never edited one:
//
//   * A fixture assignment already has a real class — the students with a
//     submission row for it. That is the same set the API counts for
//     `studentCount`, so the chip does not change meaning under anyone.
//   * A newly created assignment has no submissions, so it starts with the
//     enrolled class. "0 Students" on an assignment you just made was never
//     true; every enrolled student is who it is actually for.

import {
	DEMO_STUDENTS,
	DEMO_SUMMARIES_BY_ASSIGNMENT,
} from "src/demo/demo-data";
import { ASSIGNMENTS_KEY, mergeOverlay, patchRecord } from "src/demo/local-store";

const asId = (value) => String(value);
const unique = (ids) => [...new Set(ids)];

/** Fixture students in the shape the /students page stores them in. */
export const STUDENT_DIRECTORY_SEED = DEMO_STUDENTS.map((student) => ({
	id: asId(student.id),
	name: `${student.firstName} ${student.lastName}`,
	enrolled: student.enrolled,
}));

const ENROLLED_SEED_IDS = STUDENT_DIRECTORY_SEED.filter((s) => s.enrolled).map(
	(s) => s.id
);

const displayName = (student) =>
	(
		student?.name ??
		[student?.firstName, student?.lastName].filter(Boolean).join(" ")
	)?.trim() ?? "";

/**
 * Every student the app knows about — the fixtures plus anyone the visitor
 * added or imported on /students — as `{ id, name }`, sorted by name so the
 * picker reads like a class list.
 *
 * `overlay` is the students overlay; pass the one from useDemoOverlay so the
 * first render still matches the server.
 */
export function studentDirectory(overlay) {
	return mergeOverlay(STUDENT_DIRECTORY_SEED, overlay)
		.map((student) => ({ id: asId(student.id), name: displayName(student) }))
		.filter((student) => student.name)
		.sort((a, b) => a.name.localeCompare(b.name));
}

/** The roster an assignment starts with before anyone edits it. */
export function seedRosterIds(assignmentId) {
	const submissions = DEMO_SUMMARIES_BY_ASSIGNMENT[assignmentId];
	if (submissions?.length) {
		return unique(submissions.map((s) => asId(s.student_id)));
	}
	return [...ENROLLED_SEED_IDS];
}

/**
 * The roster stored for `assignmentId` in `overlay`, or null when the visitor
 * has never saved one. Looks in both halves of the overlay: an edit to a
 * fixture lands in `patches`, an edit to a created assignment is folded into
 * the record in `created`.
 */
export function savedRosterIds(assignmentId, overlay) {
	const id = asId(assignmentId);
	const patched = overlay?.patches?.[id]?.studentIds;
	if (Array.isArray(patched)) return patched.map(asId);
	const created = overlay?.created?.find((record) => asId(record?.id) === id);
	if (Array.isArray(created?.studentIds)) return created.studentIds.map(asId);
	return null;
}

/**
 * The effective roster for an assignment: what was saved, else what the record
 * already carries (a list merged through mergeOverlay has the patch applied
 * for us), else the seed.
 */
export function rosterIdsFor(assignment, overlay) {
	if (assignment == null) return [];
	const saved = savedRosterIds(assignment.id, overlay);
	if (saved) return saved;
	if (Array.isArray(assignment.studentIds)) return assignment.studentIds.map(asId);
	return seedRosterIds(assignment.id);
}

/** Persist a roster. Degrades to the in-memory store like every other write. */
export function saveRoster(assignmentId, studentIds) {
	const ids = unique((studentIds ?? []).map(asId));
	patchRecord(ASSIGNMENTS_KEY, assignmentId, { studentIds: ids });
	return ids;
}
