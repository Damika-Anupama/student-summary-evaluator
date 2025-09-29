// Dummy API for students count
export default function handler(req, res) {
	if (req.method === 'GET') {
		// Return dummy data
		res.status(200).json({
			totalStudents: 45,
		});
	} else {
		res.status(405).json({ error: 'Method not allowed' });
	}
}