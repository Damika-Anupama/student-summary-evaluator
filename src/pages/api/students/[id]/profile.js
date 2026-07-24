import { getStudentProfile } from "../../../../demo/demo-data";

// Deep-dive payload for the student profile drawer.
export default function handler(req, res) {
	if (req.method !== "GET") {
		res.status(405).json({ error: "Method not allowed" });
		return;
	}
	const { id } = req.query;
	const profile = getStudentProfile(id);
	if (!profile) {
		res.status(404).json({ error: "Student not found" });
		return;
	}
	res.status(200).json({ profile });
}
