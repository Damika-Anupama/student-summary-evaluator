import {
	getActivityFeed,
	getClassProgressByAssignment,
	getCohortMatrix,
	getKpiSnapshot,
	getNeedsAttention,
	getSmartSummary,
} from "../../../demo/demo-data";

// Aggregated dashboard payload for the Mission Control view.
// One request → smart summary + KPIs + activity + needs queue + cohort matrix.
export default function handler(req, res) {
	if (req.method !== "GET") {
		res.status(405).json({ error: "Method not allowed" });
		return;
	}
	res.status(200).json({
		kpis: getKpiSnapshot(),
		summary: getSmartSummary(),
		activity: getActivityFeed(15),
		needsAttention: getNeedsAttention(),
		cohort: getCohortMatrix(),
		classProgress: getClassProgressByAssignment(),
	});
}
