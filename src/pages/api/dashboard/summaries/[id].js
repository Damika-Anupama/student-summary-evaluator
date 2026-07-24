import { getSummariesForAssignment } from "../../../../demo/demo-data";

// Demo API for summaries by assignment ID — served from in-app fixtures.
export default function handler(req, res) {
	const { id } = req.query;

	if (req.method === "GET") {
		res.status(200).json({ summaries: getSummariesForAssignment(id) });
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
