import { getAssignment } from "../../../demo/assignment-store";

// Demo API for a single assignment. Reads the same session list as
// /api/assignments, so an assignment created during this session resolves
// here too instead of falling back to a fixture.
export default function handler(req, res) {
	const { id } = req.query;

	// Read-only: every mutation goes through /api/assignments.
	if (req.method !== "GET") {
		res.status(405).json({ error: "Method not allowed" });
		return;
	}

	const match = getAssignment(id);
	if (!match) {
		res.status(404).json({ error: `No assignment with id ${id}` });
		return;
	}
	res.status(200).json({ assignments: match });
}
