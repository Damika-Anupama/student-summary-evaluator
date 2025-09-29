// Dummy API for summaries by assignment ID
export default function handler(req, res) {
	const { id } = req.query;

	if (req.method === 'GET') {
		// Return dummy summaries data
		const dummySummaries = [
			{
				id: 1,
				question_id: parseInt(id),
				student_id: 1,
				content_score: 85,
				wording_score: 78,
				is_submitted: true,
				submitted_on: new Date('2025-09-20'),
				eval_students: {
					firstName: 'John',
					lastName: 'Doe',
				},
			},
			{
				id: 2,
				question_id: parseInt(id),
				student_id: 2,
				content_score: 92,
				wording_score: 88,
				is_submitted: true,
				submitted_on: new Date('2025-09-21'),
				eval_students: {
					firstName: 'Jane',
					lastName: 'Smith',
				},
			},
			{
				id: 3,
				question_id: parseInt(id),
				student_id: 3,
				content_score: 76,
				wording_score: 82,
				is_submitted: true,
				submitted_on: new Date('2025-09-22'),
				eval_students: {
					firstName: 'Mike',
					lastName: 'Johnson',
				},
			},
			{
				id: 4,
				question_id: parseInt(id),
				student_id: 4,
				content_score: 88,
				wording_score: 85,
				is_submitted: false,
				submitted_on: null,
				eval_students: {
					firstName: 'Emily',
					lastName: 'Davis',
				},
			},
			{
				id: 5,
				question_id: parseInt(id),
				student_id: 5,
				content_score: 95,
				wording_score: 90,
				is_submitted: true,
				submitted_on: new Date('2025-09-23'),
				eval_students: {
					firstName: 'Sarah',
					lastName: 'Wilson',
				},
			},
		];

		res.status(200).json({ summaries: dummySummaries });
	} else {
		res.status(405).json({ error: 'Method not allowed' });
	}
}