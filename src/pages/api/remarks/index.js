import { getSummaryRemarks } from "../../../demo/demo-data";
import { getSeededRemarks } from "../../../demo/remarks";

// Two kinds of feedback share this route because they are the same idea from
// two sources:
//
//   GET  — the teacher remarks the fixtures ship with, for one student or all.
//          Like every other demo route this serves the seed only; remarks the
//          visitor writes live in the browser overlay (see demo/remarks.js).
//   POST — AI improvement suggestions for a just-scored summary (there is no
//          OpenAI key in demo mode), tailored to the submitted scores.
export default function handler(req, res) {
	if (req.method === "GET") {
		res.status(200).json({ remarks: getSeededRemarks(req.query?.studentId) });
	} else if (req.method === "POST") {
		const body = req.body || {};
		const content = Number(body.contentScore);
		const wording = Number(body.wordingScore);
		res.status(200).json({
			result: {
				bullets: getSummaryRemarks(
					Number.isFinite(content) ? content : 0,
					Number.isFinite(wording) ? wording : 0
				),
				note: "Demo mode — suggestions are illustrative.",
			},
		});
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
