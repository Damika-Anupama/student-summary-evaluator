// Teacher remarks: the feedback a teacher leaves on one student's work for one
// assignment, and that the student reads back on their grade history.
//
// Storage follows the same split as the rest of the demo (see local-store.js):
// the fixtures are the seed, and anything the visitor writes lives in the
// browser as an overlay on top of that seed. A remark's id encodes the pair it
// belongs to, so the overlay lines up with the seed without a second index.
//
// The seeded wording is reused from DEMO_AI_REMARKS rather than written afresh,
// so there is exactly one place where demo feedback copy lives.

import {
	DEMO_AI_REMARKS,
	DEMO_SUMMARIES_BY_ASSIGNMENT,
	DEMO_TEACHER,
} from "./demo-data";
import {
	REMARKS_KEY,
	createRecord,
	mergeOverlay,
	patchRecord,
	readOverlay,
} from "./local-store";

export { REMARKS_KEY };

/** The id of the remark on `assignmentId` for `studentId`. */
export const remarkId = (studentId, assignmentId) =>
	`${studentId}:${assignmentId}`;

export const TEACHER_NAME = `${DEMO_TEACHER.firstName} ${DEMO_TEACHER.lastName}`;

// [studentId, assignmentId, index into DEMO_AI_REMARKS]. Spread across
// students and assignments so the teacher's cohort view and John Doe's
// student view both have feedback to show on a first visit.
const SEEDED_PAIRS = [
	[1, 1, 0],
	[1, 3, 3],
	[1, 5, 2],
	[2, 1, 4],
	[3, 2, 1],
	[5, 4, 4],
	[7, 5, 2],
];

const wasSubmitted = (studentId, assignmentId) =>
	(DEMO_SUMMARIES_BY_ASSIGNMENT[assignmentId] || []).some(
		(s) => s.student_id === studentId && s.is_submitted
	);

/**
 * The remarks the demo ships with.
 *
 * Deliberately carries no timestamp: this list is evaluated both at build time
 * (getStaticProps) and in the browser, and anything derived from the clock
 * would differ between the two and mismatch on hydration.
 */
export const SEEDED_REMARKS = Object.freeze(
	SEEDED_PAIRS.filter(([studentId, assignmentId]) =>
		wasSubmitted(studentId, assignmentId)
	).map(([studentId, assignmentId, tip]) =>
		Object.freeze({
			id: remarkId(studentId, assignmentId),
			studentId,
			assignmentId,
			text: DEMO_AI_REMARKS[tip % DEMO_AI_REMARKS.length],
			author: TEACHER_NAME,
		})
	)
);

const seedIds = new Set(SEEDED_REMARKS.map((r) => r.id));

/** The remarks seeded for one student, or all of them when no id is given. */
export function getSeededRemarks(studentId) {
	if (studentId == null || studentId === "") return [...SEEDED_REMARKS];
	const id = Number(studentId);
	return SEEDED_REMARKS.filter((r) => r.studentId === id);
}

/** A remark is only worth saving if it says something. */
export const isBlankRemark = (text) => String(text ?? "").trim().length === 0;

/** Look remarks up by (student, assignment) without rescanning the list. */
export function indexRemarks(remarks) {
	const index = new Map();
	for (const remark of remarks || []) {
		if (remark?.id != null) index.set(String(remark.id), remark);
	}
	return index;
}

/** Seed plus everything the visitor has written, newest wording winning. */
export function readRemarks(seed = SEEDED_REMARKS) {
	return mergeOverlay(seed, readOverlay(REMARKS_KEY));
}

/** The effective remark for one pair, or undefined. */
export function getRemark(studentId, assignmentId, seed = SEEDED_REMARKS) {
	return indexRemarks(readRemarks(seed)).get(
		remarkId(studentId, assignmentId)
	);
}

/**
 * Save a teacher's remark on (student, assignment).
 *
 * Returns the stored record, or null when the text is empty — an accidental
 * save must not blank out feedback the student may already have read.
 *
 * Rewording a seeded remark is stored as a patch and a brand new one as a
 * created record, which is what makes "Reset demo data" fall back to the
 * shipped wording instead of leaving the visitor's edits behind.
 */
export function saveRemark({
	studentId,
	assignmentId,
	text,
	author = TEACHER_NAME,
}) {
	if (isBlankRemark(text)) return null;
	const id = remarkId(studentId, assignmentId);
	const record = {
		id,
		studentId: Number(studentId),
		assignmentId: Number(assignmentId),
		text: String(text).trim(),
		author,
		createdAt: new Date().toISOString(),
	};

	if (seedIds.has(id)) {
		patchRecord(REMARKS_KEY, id, {
			text: record.text,
			author: record.author,
			createdAt: record.createdAt,
		});
	} else {
		createRecord(REMARKS_KEY, record);
	}
	return record;
}
