// Dummy API for assignments
export default function handler(req, res) {
	if (req.method === 'GET') {
		// Return dummy assignments data
		const dummyAssignments = [
			{
				id: 1,
				question: "Write a summary about Climate Change",
				description: "Summarize the main points about climate change and its effects on the environment",
				createdBy_id: 1,
				created_at: "2025-09-15T10:00:00.000Z",
				eval_text: {
					id: 1,
					title: "Climate Change Article",
					text: "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change.",
				},
			},
			{
				id: 2,
				question: "Summarize the Water Cycle",
				description: "Explain the water cycle process in your own words",
				createdBy_id: 1,
				created_at: "2025-09-16T10:00:00.000Z",
				eval_text: {
					id: 2,
					title: "The Water Cycle",
					text: "The water cycle describes how water evaporates from the surface of the earth, rises into the atmosphere, cools and condenses into clouds, and falls back to the surface as precipitation.",
				},
			},
			{
				id: 3,
				question: "Explain Photosynthesis",
				description: "Describe how plants make their food through photosynthesis",
				createdBy_id: 1,
				created_at: "2025-09-17T10:00:00.000Z",
				eval_text: {
					id: 3,
					title: "Photosynthesis Process",
					text: "Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.",
				},
			},
			{
				id: 4,
				question: "The Solar System Summary",
				description: "Write about the planets in our solar system and their characteristics",
				createdBy_id: 1,
				created_at: "2025-09-18T10:00:00.000Z",
				eval_text: {
					id: 4,
					title: "Our Solar System",
					text: "The Solar System consists of the Sun and everything that orbits around it, including eight planets, their moons, dwarf planets, asteroids, and comets.",
				},
			},
		];

		res.status(200).json({ assignments: dummyAssignments });
	} else if (req.method === 'POST') {
		// Handle POST request (create new assignment)
		const newAssignment = {
			id: Date.now(),
			...req.body,
			created_at: new Date().toISOString(),
		};
		res.status(201).json({ assignment: newAssignment });
	} else {
		res.status(405).json({ error: 'Method not allowed' });
	}
}