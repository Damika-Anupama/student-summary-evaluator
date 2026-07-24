import { DEMO_ASSIGNMENTS } from "./demo-data";

// Single source of truth for assignments during a demo session.
//
// Both /api/assignments and /api/assignments/[id] read and write through this
// module, so an assignment created during a session is visible from *either*
// route. Previously the collection route kept its own private array while the
// detail route read the static fixtures, so viewing a session-created
// assignment silently returned the first fixture instead.
//
// Demo constraint: this is module-level state. It lives per serverless
// instance and resets on cold start, so created assignments do not survive a
// restart or a second lambda. That is accepted for this demo — the point is
// that both routes agree WITHIN a session. (A later feature will move this
// behind localStorage persistence.)
//
// This module deliberately lives outside src/pages/api/ so Next.js does not
// treat it as an API route.

const DEFAULT_DEADLINE_DAYS = 30;

let assignments = [...DEMO_ASSIGNMENTS];

const sameId = (a, id) => String(a.id) === String(id);

const nextId = () => Math.max(0, ...assignments.map((a) => a.id)) + 1;

/** Every assignment currently known to the session, newest first. */
export function listAssignments() {
	return [...assignments];
}

/** One assignment by id, or null when it does not exist. */
export function getAssignment(id) {
	return assignments.find((a) => sameId(a, id)) || null;
}

/** Append a new assignment to the session list and return it. */
export function createAssignment(input = {}) {
	const created = {
		id: nextId(),
		question: input.question || "Untitled assignment",
		description: input.description || input.question || "",
		createdBy_id: 1,
		created_at: new Date().toISOString(),
		deadline:
			input.deadline ||
			new Date(Date.now() + DEFAULT_DEADLINE_DAYS * 864e5).toISOString(),
		textTitle: input.title || "Custom passage",
		eval_text: {
			id: Date.now(),
			title: input.title || "Custom passage",
			text: input.text || "",
		},
	};
	assignments = [created, ...assignments];
	return created;
}

/** Patch an existing assignment. Returns the updated record, or null if unknown. */
export function updateAssignment(id, patch = {}) {
	const idx = assignments.findIndex((a) => sameId(a, id));
	if (idx === -1) return null;

	const current = assignments[idx];
	const updated = {
		...current,
		question: patch.question ?? current.question,
		description: patch.question ?? current.description,
		deadline: patch.deadline ?? current.deadline,
		textTitle: patch.title ?? current.textTitle,
		eval_text: {
			...current.eval_text,
			title: patch.title ?? current.eval_text.title,
			text: patch.text ?? current.eval_text.text,
		},
	};
	assignments = [
		...assignments.slice(0, idx),
		updated,
		...assignments.slice(idx + 1),
	];
	return updated;
}

/** Remove an assignment. Returns true when something was actually removed. */
export function deleteAssignment(id) {
	const before = assignments.length;
	assignments = assignments.filter((a) => !sameId(a, id));
	return assignments.length < before;
}

/** Restore the pristine fixture list (used by tests). */
export function resetAssignments() {
	assignments = [...DEMO_ASSIGNMENTS];
}
