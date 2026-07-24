import { evaluateSummary, DEMO_ASSIGNMENTS } from "../../../demo/demo-data";

// Demo API for ML summary evaluation — deterministic mock scoring (no Django/BERT).
// Content score reflects overlap with the assignment's passage when available.
export default function handler(req, res) {
	if (req.method === "POST") {
		const body = req.body || {};
		const summaryText = body.summary || body.text || "";
		const assignment = DEMO_ASSIGNMENTS.find(
			(a) => String(a.id) === String(body.prompt_id)
		);
		const passageText = assignment?.eval_text?.text || "";
		res.status(200).json(evaluateSummary(summaryText, passageText));
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
