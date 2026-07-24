import { DEMO_SUMMARIES_BY_ASSIGNMENT } from "../../../demo/demo-data";
import {
	createAssignment,
	deleteAssignment,
	listAssignments,
	updateAssignment,
} from "../../../demo/assignment-store";

// Demo API for assignments — served from in-app fixtures (no backend).
// The session list lives in src/demo/assignment-store so this route and
// /api/assignments/[id] share one source of truth.

// Real per-assignment roster size from the demo summaries, so cards show
// an honest student count instead of a hardcoded placeholder.
const studentCountFor = (id) =>
	(DEMO_SUMMARIES_BY_ASSIGNMENT[id] || []).length;

export default function handler(req, res) {
	if (req.method === "GET") {
		const assignments = listAssignments().map((a) => ({
			...a,
			studentCount: studentCountFor(a.id),
		}));
		res.status(200).json({ assignments });
	} else if (req.method === "POST") {
		const created = createAssignment(req.body || {});
		res.status(201).json({ assignment: created, message: "Assignment created" });
	} else if (req.method === "PUT") {
		const body = req.body || {};
		const updated = updateAssignment(body.id, body);
		if (!updated) {
			res.status(404).json({ error: "Assignment not found" });
			return;
		}
		res.status(200).json({ assignment: updated, message: "Assignment updated" });
	} else if (req.method === "DELETE") {
		const id = (req.body && req.body.id) ?? req.query.id;
		deleteAssignment(id);
		res.status(200).json({ message: "Assignment deleted" });
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
