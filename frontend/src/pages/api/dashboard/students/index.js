import { API_ENDPOINTS } from '../../../../config';

// Proxy API for students count - connects to Django backend
export default async function handler(req, res) {
	try {
		if (req.method === 'GET') {
			// Fetch students from Django backend
			const response = await fetch(API_ENDPOINTS.students);
			const students = await response.json();

			res.status(200).json({
				totalStudents: students.length,
			});
		} else {
			res.status(405).json({ error: 'Method not allowed' });
		}
	} catch (error) {
		console.error('Error fetching students:', error);
		res.status(500).json({ error: 'Failed to fetch students count' });
	}
}