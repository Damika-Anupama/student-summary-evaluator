import { API_ENDPOINTS } from '../../../config';

// Proxy API for assignments - connects to Django backend
export default async function handler(req, res) {
	const backendUrl = API_ENDPOINTS.assignments;

	try {
		if (req.method === 'GET') {
			// Fetch assignments from Django backend
			const response = await fetch(backendUrl);
			const assignments = await response.json();

			// Fetch text data for each assignment
			const assignmentsWithText = await Promise.all(
				assignments.map(async (assignment) => {
					const textResponse = await fetch(`${API_ENDPOINTS.text}${assignment.textTitle}/`);
					const textData = await textResponse.json();
					return {
						id: assignment.id,
						question: assignment.question,
						description: assignment.question, // Using question as description
						createdBy_id: assignment.createdBy,
						created_at: assignment.deadline, // Using deadline as created_at
						eval_text: {
							id: textData.id,
							title: textData.title,
							text: textData.text,
						},
					};
				})
			);

			res.status(200).json({ assignments: assignmentsWithText });
		} else if (req.method === 'POST') {
			// Forward POST request to Django backend
			const response = await fetch(backendUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(req.body),
			});
			const data = await response.json();
			res.status(response.status).json(data);
		} else {
			res.status(405).json({ error: 'Method not allowed' });
		}
	} catch (error) {
		console.error('Error fetching assignments:', error);
		res.status(500).json({ error: 'Failed to fetch assignments' });
	}
}