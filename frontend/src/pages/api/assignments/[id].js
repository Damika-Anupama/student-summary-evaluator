// Dummy API for single assignment
export default function handler(req, res) {
	const { id } = req.query;

	if (req.method === 'GET') {
		// Return dummy assignment data
		const dummyAssignment = {
			id: parseInt(id),
			question: "Write a summary about Climate Change",
			description: "Summarize the main points about climate change and its effects on the environment",
			createdBy_id: 1,
			created_at: "2025-09-15T10:00:00.000Z",
			deadline: "2025-10-15T23:59:59.000Z",
			eval_text: {
				id: 1,
				title: "Climate Change Article",
				text: "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels like coal, oil, and gas. Burning fossil fuels generates greenhouse gas emissions that act like a blanket wrapped around the Earth, trapping the sun's heat and raising temperatures.",
			},
		};

		res.status(200).json({ assignments: dummyAssignment });
	} else if (req.method === 'PUT') {
		// Handle update
		res.status(200).json({ message: 'Assignment updated successfully' });
	} else if (req.method === 'DELETE') {
		// Handle delete
		res.status(200).json({ message: 'Assignment deleted successfully' });
	} else {
		res.status(405).json({ error: 'Method not allowed' });
	}
}