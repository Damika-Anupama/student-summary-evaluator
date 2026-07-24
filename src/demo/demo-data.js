// Centralized demo fixtures for the frontend-only deployable demo.
// No Django backend, database, or external API is required — every API route
// under src/pages/api/* serves data derived from these fixtures.

export const DEMO_TEACHER = {
	id: 1,
	firstName: "Amara",
	lastName: "Perera",
	email: "amara.perera@school.demo",
	role: "Teacher",
	school: "Greenfield College",
};

export const DEMO_STUDENTS = [
	{ id: 1, firstName: "John", lastName: "Doe", email: "john.doe@school.demo", grade: 8, enrolled: true },
	{ id: 2, firstName: "Jane", lastName: "Smith", email: "jane.smith@school.demo", grade: 8, enrolled: true },
	{ id: 3, firstName: "Mike", lastName: "Johnson", email: "mike.johnson@school.demo", grade: 7, enrolled: true },
	{ id: 4, firstName: "Emily", lastName: "Davis", email: "emily.davis@school.demo", grade: 8, enrolled: true },
	{ id: 5, firstName: "Sarah", lastName: "Wilson", email: "sarah.wilson@school.demo", grade: 9, enrolled: true },
	{ id: 6, firstName: "David", lastName: "Brown", email: "david.brown@school.demo", grade: 7, enrolled: true },
	{ id: 7, firstName: "Olivia", lastName: "Martin", email: "olivia.martin@school.demo", grade: 9, enrolled: true },
	{ id: 8, firstName: "Liam", lastName: "Taylor", email: "liam.taylor@school.demo", grade: 8, enrolled: true },
	{ id: 9, firstName: "Ava", lastName: "Anderson", email: "ava.anderson@school.demo", grade: 7, enrolled: true },
	{ id: 10, firstName: "Noah", lastName: "Thomas", email: "noah.thomas@school.demo", grade: 9, enrolled: false },
];

// Reading passages used as assignment source texts.
export const DEMO_TEXTS = [
	{
		id: 1,
		title: "Climate Change",
		text: "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels like coal, oil, and gas. Burning fossil fuels generates greenhouse gas emissions that act like a blanket wrapped around the Earth, trapping the sun's heat and raising temperatures. The consequences include rising sea levels, more intense storms, and disruptions to ecosystems and agriculture.",
	},
	{
		id: 2,
		title: "Photosynthesis",
		text: "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy. Using sunlight, water, and carbon dioxide, plants produce glucose and release oxygen as a by-product. The process takes place mainly in the leaves, inside structures called chloroplasts that contain the green pigment chlorophyll. Photosynthesis is essential for life on Earth because it provides the oxygen we breathe and forms the base of most food chains.",
	},
	{
		id: 3,
		title: "The Water Cycle",
		text: "The water cycle describes how water moves continuously through the environment. Heat from the sun causes water in oceans, rivers, and lakes to evaporate into water vapor. The vapor rises, cools, and condenses into clouds. When the droplets become heavy enough, they fall back to the surface as precipitation such as rain or snow. This water then collects in bodies of water or soaks into the ground, and the cycle begins again.",
	},
	{
		id: 4,
		title: "Ancient Rome",
		text: "Ancient Rome began as a small settlement on the Italian peninsula and grew into one of the largest empires in history. Roman society was organized around laws, a powerful army, and impressive engineering such as roads, aqueducts, and public baths. The Romans spread their language, architecture, and ideas about government across Europe, North Africa, and the Middle East. Many modern legal and political systems still reflect Roman influence today.",
	},
	{
		id: 5,
		title: "The Industrial Revolution",
		text: "The Industrial Revolution, which began in Britain in the late 18th century, transformed how goods were made and how people lived and worked. Machines powered by steam replaced hand tools, and factories drew workers from the countryside into growing cities. New transportation networks — canals, railways, and steamships — linked markets across continents. The revolution raised living standards over time but also brought harsh working conditions, child labour, and environmental pollution that reformers fought to address.",
	},
];

// Deadlines are anchored to "now" so the demo always shows a realistic
// mix of overdue, due-soon, and upcoming assignments rather than a wall
// of dates stuck in the past.
const DAY_MS = 86400000;
const deadlineInDays = (days) => {
	const d = new Date(Date.now() + days * DAY_MS);
	d.setHours(23, 59, 59, 0);
	return d.toISOString();
};

export const DEMO_ASSIGNMENTS = [
	{
		id: 1,
		question: "Write a summary about Climate Change",
		description: "Summarize the main causes and effects of climate change described in the passage.",
		createdBy_id: 1,
		created_at: "2025-09-15T10:00:00.000Z",
		deadline: deadlineInDays(-3),
		textTitle: "Climate Change",
		eval_text: DEMO_TEXTS[0],
	},
	{
		id: 2,
		question: "Summarize how photosynthesis works",
		description: "Explain the inputs, outputs, and importance of photosynthesis in your own words.",
		createdBy_id: 1,
		created_at: "2025-09-22T10:00:00.000Z",
		deadline: deadlineInDays(1),
		textTitle: "Photosynthesis",
		eval_text: DEMO_TEXTS[1],
	},
	{
		id: 3,
		question: "Explain the water cycle in a short summary",
		description: "Describe each stage of the water cycle and how the stages connect.",
		createdBy_id: 1,
		created_at: "2025-10-01T10:00:00.000Z",
		deadline: deadlineInDays(4),
		textTitle: "The Water Cycle",
		eval_text: DEMO_TEXTS[2],
	},
	{
		id: 4,
		question: "Summarize the rise of Ancient Rome",
		description: "Capture how Rome grew and the lasting influence it had on the modern world.",
		createdBy_id: 1,
		created_at: "2025-10-05T10:00:00.000Z",
		deadline: deadlineInDays(12),
		textTitle: "Ancient Rome",
		eval_text: DEMO_TEXTS[3],
	},
	{
		id: 5,
		question: "Summarise the key changes of the Industrial Revolution",
		description: "Describe what changed, why it happened in Britain first, and what the social consequences were.",
		createdBy_id: 1,
		created_at: "2025-10-12T10:00:00.000Z",
		deadline: deadlineInDays(25),
		textTitle: "The Industrial Revolution",
		eval_text: DEMO_TEXTS[4],
	},
];

// Summaries keyed by assignment (question) id.
export const DEMO_SUMMARIES_BY_ASSIGNMENT = {
	1: [
		{ id: 101, question_id: 1, student_id: 1, content_score: 85, wording_score: 78, is_submitted: true, submitted_on: "2025-09-20T09:30:00.000Z", eval_students: { firstName: "John", lastName: "Doe" }, summary: "Climate change is the long-term change in temperature and weather, mostly caused by humans burning fossil fuels, which traps heat and raises sea levels." },
		{ id: 102, question_id: 1, student_id: 2, content_score: 92, wording_score: 88, is_submitted: true, submitted_on: "2025-09-21T11:10:00.000Z", eval_students: { firstName: "Jane", lastName: "Smith" }, summary: "Since the 1800s, human burning of coal, oil and gas has driven climate change by releasing greenhouse gases that trap the sun's heat, causing rising seas and stronger storms." },
		{ id: 103, question_id: 1, student_id: 3, content_score: 76, wording_score: 82, is_submitted: true, submitted_on: "2025-09-22T14:05:00.000Z", eval_students: { firstName: "Mike", lastName: "Johnson" }, summary: "The weather is changing because people use fossil fuels and that makes the earth hotter." },
		{ id: 104, question_id: 1, student_id: 4, content_score: 0, wording_score: 0, is_submitted: false, submitted_on: null, eval_students: { firstName: "Emily", lastName: "Davis" }, summary: "" },
		{ id: 105, question_id: 1, student_id: 5, content_score: 95, wording_score: 90, is_submitted: true, submitted_on: "2025-09-23T08:45:00.000Z", eval_students: { firstName: "Sarah", lastName: "Wilson" }, summary: "Climate change describes long-term shifts in temperature and weather. Human activity, especially burning fossil fuels, releases greenhouse gases that act like a blanket around Earth, leading to higher temperatures, rising sea levels, and ecosystem disruption." },
		{ id: 106, question_id: 1, student_id: 6, content_score: 71, wording_score: 69, is_submitted: true, submitted_on: "2025-09-24T16:20:00.000Z", eval_students: { firstName: "David", lastName: "Brown" }, summary: "Fossil fuels cause pollution and the planet gets warmer with more storms." },
		{ id: 107, question_id: 1, student_id: 7, content_score: 64, wording_score: 67, is_submitted: true, submitted_on: "2025-09-24T18:05:00.000Z", eval_students: { firstName: "Olivia", lastName: "Martin" }, summary: "The earth is getting hotter because of gases from cars and factories." },
		{ id: 108, question_id: 1, student_id: 8, content_score: 88, wording_score: 84, is_submitted: true, submitted_on: "2025-09-25T10:40:00.000Z", eval_students: { firstName: "Liam", lastName: "Taylor" }, summary: "Human activities, mainly burning fossil fuels, release greenhouse gases that trap heat in the atmosphere, raising temperatures and sea levels and disrupting weather." },
		{ id: 109, question_id: 1, student_id: 9, content_score: 57, wording_score: 60, is_submitted: true, submitted_on: "2025-09-25T13:15:00.000Z", eval_students: { firstName: "Ava", lastName: "Anderson" }, summary: "Pollution makes it warm and the ice melts." },
		{ id: 110, question_id: 1, student_id: 10, content_score: 0, wording_score: 0, is_submitted: false, submitted_on: null, eval_students: { firstName: "Noah", lastName: "Thomas" }, summary: "" },
	],
	2: [
		{ id: 201, question_id: 2, student_id: 1, content_score: 80, wording_score: 84, is_submitted: true, submitted_on: "2025-09-28T10:15:00.000Z", eval_students: { firstName: "John", lastName: "Doe" }, summary: "Plants use sunlight, water and carbon dioxide to make glucose and release oxygen during photosynthesis." },
		{ id: 202, question_id: 2, student_id: 2, content_score: 89, wording_score: 91, is_submitted: true, submitted_on: "2025-09-29T09:00:00.000Z", eval_students: { firstName: "Jane", lastName: "Smith" }, summary: "Photosynthesis converts light energy into chemical energy. In the chloroplasts, chlorophyll uses sunlight, water and carbon dioxide to produce glucose and oxygen, supporting most life on Earth." },
		{ id: 203, question_id: 2, student_id: 7, content_score: 84, wording_score: 80, is_submitted: true, submitted_on: "2025-09-30T13:40:00.000Z", eval_students: { firstName: "Olivia", lastName: "Martin" }, summary: "Green plants make food from sunlight, water and carbon dioxide and give off oxygen that we breathe." },
		{ id: 205, question_id: 2, student_id: 3, content_score: 73, wording_score: 70, is_submitted: true, submitted_on: "2025-09-30T15:20:00.000Z", eval_students: { firstName: "Mike", lastName: "Johnson" }, summary: "Plants take in sunlight and water and make their own food and let out oxygen." },
		{ id: 206, question_id: 2, student_id: 4, content_score: 66, wording_score: 72, is_submitted: true, submitted_on: "2025-10-01T08:50:00.000Z", eval_students: { firstName: "Emily", lastName: "Davis" }, summary: "Photosynthesis is how plants eat using the sun." },
		{ id: 207, question_id: 2, student_id: 5, content_score: 94, wording_score: 90, is_submitted: true, submitted_on: "2025-10-01T11:30:00.000Z", eval_students: { firstName: "Sarah", lastName: "Wilson" }, summary: "Using chlorophyll in the leaves, plants convert sunlight, water and carbon dioxide into glucose for energy and release oxygen, forming the base of nearly every food chain." },
		{ id: 208, question_id: 2, student_id: 6, content_score: 58, wording_score: 61, is_submitted: true, submitted_on: "2025-10-02T09:10:00.000Z", eval_students: { firstName: "David", lastName: "Brown" }, summary: "Plants use the sun to grow." },
		{ id: 204, question_id: 2, student_id: 8, content_score: 0, wording_score: 0, is_submitted: false, submitted_on: null, eval_students: { firstName: "Liam", lastName: "Taylor" }, summary: "" },
	],
	3: [
		{ id: 301, question_id: 3, student_id: 3, content_score: 88, wording_score: 86, is_submitted: true, submitted_on: "2025-10-08T11:30:00.000Z", eval_students: { firstName: "Mike", lastName: "Johnson" }, summary: "The sun heats water so it evaporates, rises, cools into clouds, and falls again as rain or snow before collecting and repeating." },
		{ id: 302, question_id: 3, student_id: 5, content_score: 93, wording_score: 89, is_submitted: true, submitted_on: "2025-10-09T15:10:00.000Z", eval_students: { firstName: "Sarah", lastName: "Wilson" }, summary: "In the water cycle, solar heat evaporates water into vapor, which condenses into clouds, falls as precipitation, and collects in bodies of water or the ground before the cycle restarts." },
		{ id: 303, question_id: 3, student_id: 9, content_score: 74, wording_score: 77, is_submitted: true, submitted_on: "2025-10-10T08:25:00.000Z", eval_students: { firstName: "Ava", lastName: "Anderson" }, summary: "Water goes up to the sky, makes clouds, and comes back down as rain." },
		{ id: 304, question_id: 3, student_id: 1, content_score: 82, wording_score: 80, is_submitted: true, submitted_on: "2025-10-10T10:00:00.000Z", eval_students: { firstName: "John", lastName: "Doe" }, summary: "Water evaporates from oceans and lakes, condenses into clouds, and falls as rain or snow that flows back to the sea." },
		{ id: 305, question_id: 3, student_id: 2, content_score: 90, wording_score: 88, is_submitted: true, submitted_on: "2025-10-11T09:35:00.000Z", eval_students: { firstName: "Jane", lastName: "Smith" }, summary: "Driven by the sun, water evaporates, condenses into clouds, precipitates as rain or snow, and collects again — a continuous cycle that moves water through the environment." },
		{ id: 306, question_id: 3, student_id: 4, content_score: 68, wording_score: 64, is_submitted: true, submitted_on: "2025-10-11T14:20:00.000Z", eval_students: { firstName: "Emily", lastName: "Davis" }, summary: "The sun makes water turn into clouds and then it rains." },
		{ id: 307, question_id: 3, student_id: 7, content_score: 77, wording_score: 81, is_submitted: true, submitted_on: "2025-10-12T08:15:00.000Z", eval_students: { firstName: "Olivia", lastName: "Martin" }, summary: "Heat evaporates water, it forms clouds, and precipitation returns it to rivers and oceans." },
		{ id: 308, question_id: 3, student_id: 6, content_score: 0, wording_score: 0, is_submitted: false, submitted_on: null, eval_students: { firstName: "David", lastName: "Brown" }, summary: "" },
	],
	4: [
		{ id: 401, question_id: 4, student_id: 2, content_score: 90, wording_score: 92, is_submitted: true, submitted_on: "2025-10-12T12:00:00.000Z", eval_students: { firstName: "Jane", lastName: "Smith" }, summary: "Rome grew from a small settlement into a vast empire built on law, a strong army, and engineering, spreading its language and government across three continents." },
		{ id: 402, question_id: 4, student_id: 6, content_score: 79, wording_score: 75, is_submitted: true, submitted_on: "2025-10-13T09:50:00.000Z", eval_students: { firstName: "David", lastName: "Brown" }, summary: "Ancient Rome became a big empire with good roads and armies and influenced laws today." },
		{ id: 404, question_id: 4, student_id: 1, content_score: 86, wording_score: 83, is_submitted: true, submitted_on: "2025-10-13T11:25:00.000Z", eval_students: { firstName: "John", lastName: "Doe" }, summary: "From a small town, Rome built an empire on strong law, military power, and engineering like roads and aqueducts, leaving a lasting mark on modern government." },
		{ id: 405, question_id: 4, student_id: 3, content_score: 72, wording_score: 70, is_submitted: true, submitted_on: "2025-10-14T10:05:00.000Z", eval_students: { firstName: "Mike", lastName: "Johnson" }, summary: "Rome started small and grew big with armies and roads and its ideas are still used." },
		{ id: 406, question_id: 4, student_id: 5, content_score: 91, wording_score: 94, is_submitted: true, submitted_on: "2025-10-14T13:40:00.000Z", eval_students: { firstName: "Sarah", lastName: "Wilson" }, summary: "Ancient Rome expanded from a peninsula settlement into one of history's largest empires, spreading law, language, and engineering whose influence persists in modern legal and political systems." },
		{ id: 407, question_id: 4, student_id: 8, content_score: 64, wording_score: 68, is_submitted: true, submitted_on: "2025-10-15T09:00:00.000Z", eval_students: { firstName: "Liam", lastName: "Taylor" }, summary: "Rome was a powerful empire with a big army." },
		{ id: 403, question_id: 4, student_id: 7, content_score: 0, wording_score: 0, is_submitted: false, submitted_on: null, eval_students: { firstName: "Olivia", lastName: "Martin" }, summary: "" },
	],
	5: [
		{ id: 501, question_id: 5, student_id: 1, content_score: 83, wording_score: 81, is_submitted: true, submitted_on: "2025-10-18T09:20:00.000Z", eval_students: { firstName: "John", lastName: "Doe" }, summary: "The Industrial Revolution transformed Britain from a farming society into a manufacturing one, with steam-powered machines, factories, and railways changing how people worked and lived." },
		{ id: 502, question_id: 5, student_id: 2, content_score: 91, wording_score: 89, is_submitted: true, submitted_on: "2025-10-18T11:05:00.000Z", eval_students: { firstName: "Jane", lastName: "Smith" }, summary: "Beginning in late 18th-century Britain, the Industrial Revolution replaced hand tools with steam-driven machines and shifted the workforce into factories, linking distant markets via canals and railways while raising living standards at the cost of harsh conditions and pollution." },
		{ id: 503, question_id: 5, student_id: 3, content_score: 75, wording_score: 72, is_submitted: true, submitted_on: "2025-10-19T10:30:00.000Z", eval_students: { firstName: "Mike", lastName: "Johnson" }, summary: "Machines and factories changed how things were made, and railways helped move goods quickly, but workers often had bad conditions." },
		{ id: 504, question_id: 5, student_id: 4, content_score: 62, wording_score: 65, is_submitted: true, submitted_on: "2025-10-19T14:00:00.000Z", eval_students: { firstName: "Emily", lastName: "Davis" }, summary: "The Industrial Revolution used steam to make factories that produced lots of goods and made cities bigger." },
		{ id: 505, question_id: 5, student_id: 5, content_score: 94, wording_score: 92, is_submitted: true, submitted_on: "2025-10-20T08:45:00.000Z", eval_students: { firstName: "Sarah", lastName: "Wilson" }, summary: "The Industrial Revolution, starting in Britain, fundamentally restructured economies by replacing hand production with steam-powered machinery. Factories concentrated labour in cities, railways and steamships opened global markets, and while productivity soared, child labour and pollution prompted lasting social reform." },
		{ id: 506, question_id: 5, student_id: 6, content_score: 69, wording_score: 66, is_submitted: true, submitted_on: "2025-10-20T11:10:00.000Z", eval_students: { firstName: "David", lastName: "Brown" }, summary: "Britain started using machines and steam to make things faster. People moved to cities for factory work, but conditions were tough." },
		{ id: 507, question_id: 5, student_id: 7, content_score: 78, wording_score: 80, is_submitted: true, submitted_on: "2025-10-21T09:55:00.000Z", eval_students: { firstName: "Olivia", lastName: "Martin" }, summary: "Machines replaced hand tools, factories drew people to cities, and railways connected markets. The revolution improved output but also caused pollution and poor working conditions that reformers addressed." },
		{ id: 508, question_id: 5, student_id: 9, content_score: 55, wording_score: 58, is_submitted: true, submitted_on: "2025-10-21T13:30:00.000Z", eval_students: { firstName: "Ava", lastName: "Anderson" }, summary: "Steam machines in factories and trains changed the way people worked and travelled." },
		{ id: 509, question_id: 5, student_id: 8, content_score: 0, wording_score: 0, is_submitted: false, submitted_on: null, eval_students: { firstName: "Liam", lastName: "Taylor" }, summary: "" },
	],
};

export function getSummariesForAssignment(assignmentId) {
	const key = parseInt(assignmentId, 10);
	return DEMO_SUMMARIES_BY_ASSIGNMENT[key] || [];
}

// A single student's graded summary history across all assignments (for the
// student "Your Previous Grades" view). Defaults to John Doe (id 1).
// Which assignments a student has submitted, keyed by assignment id.
export function getStudentSubmissionMap(studentId = 1) {
	const map = {};
	Object.values(DEMO_SUMMARIES_BY_ASSIGNMENT)
		.flat()
		.filter((s) => s.student_id === studentId && s.is_submitted)
		.forEach((s) => {
			const c = parseFloat(s.content_score);
			const w = parseFloat(s.wording_score);
			map[s.question_id] = {
				overall:
					Number.isFinite(c) && Number.isFinite(w)
						? Math.round((c + w) / 2)
						: null,
				submittedOn: s.submitted_on,
			};
		});
	return map;
}

export function getStudentHistory(studentId = 1) {
	const titles = Object.fromEntries(DEMO_ASSIGNMENTS.map((a) => [a.id, a.question]));
	return Object.values(DEMO_SUMMARIES_BY_ASSIGNMENT)
		.flat()
		.filter((s) => s.student_id === studentId && s.is_submitted)
		.map((s) => ({
			id: s.id,
			// Carried through so the row can find the teacher's remark, which is
			// keyed by (student, assignment) rather than by summary id.
			studentId: s.student_id,
			assignmentId: s.question_id,
			assignment: titles[s.question_id] || `Assignment ${s.question_id}`,
			content_score: s.content_score,
			wording_score: s.wording_score,
			submitted_on: s.submitted_on,
		}))
		.sort((a, b) => new Date(b.submitted_on) - new Date(a.submitted_on));
}

// Canned AI improvement suggestions (replaces the OpenAI call in demo mode).
export const DEMO_AI_REMARKS = [
	"Include the main cause described in the passage, not just the effects.",
	"Use more precise vocabulary from the source text instead of general words.",
	"Combine short sentences to improve the flow and readability.",
	"Mention at least one specific consequence to strengthen the content score.",
	"Keep the summary objective — avoid adding opinions not in the original text.",
];

const CONTENT_TIPS = [
	"Cover more of the passage's key concepts — a few core ideas are missing.",
	"Mention at least one specific consequence to strengthen the content score.",
];
const WORDING_TIPS = [
	"Use more precise vocabulary from the source text instead of general words.",
	"Combine short sentences to improve the flow and readability.",
];
const REFINE_TIPS = [
	"Tighten the summary by removing any repeated ideas.",
	"A crisp opening sentence would make the summary even stronger.",
];
const GENERAL_TIP =
	"Keep the summary objective — avoid adding opinions not in the original text.";

// Suggestions tailored to the scores so the feedback reflects what to work
// on (weak content vs weak wording vs already-strong).
export function getSummaryRemarks(contentScore = 0, wordingScore = 0) {
	const bullets = [];
	if (contentScore < 75) bullets.push(...CONTENT_TIPS);
	if (wordingScore < 75) bullets.push(...WORDING_TIPS);
	if (bullets.length === 0) bullets.push(...REFINE_TIPS);
	bullets.push(GENERAL_TIP);
	return [...new Set(bullets)].slice(0, 5);
}

// Deterministic mock ML evaluation for a submitted summary (replaces /api/summaryview).
const SUMMARY_STOPWORDS = new Set([
	"the", "and", "that", "this", "with", "from", "they", "them", "their",
	"have", "has", "had", "are", "was", "were", "for", "into", "over", "than",
	"such", "also", "more", "which", "what", "when", "where", "while", "would",
	"could", "should", "about", "these", "those", "your", "you", "but", "not",
	"its", "it's", "out", "use", "used", "using", "make", "made", "many", "some",
]);

// Significant lowercase terms (4+ letters, no stopwords) for relevance scoring.
const keyTerms = (s) => {
	const matches = String(s || "").toLowerCase().match(/[a-z]{4,}/g) || [];
	return new Set(matches.filter((w) => !SUMMARY_STOPWORDS.has(w)));
};

// Deterministic mock of the ML evaluator (no Django/BERT). Wording reflects
// length/fluency; content reflects how many of the passage's key terms the
// summary actually captures, so a relevant summary scores higher than
// same-length filler.
export function evaluateSummary(summaryText = "", passageText = "") {
	const text = String(summaryText || "").trim();
	const words = text ? text.split(/\s+/).length : 0;
	if (words === 0) {
		return {
			content_score: 0,
			wording_score: 0,
			word_count: 0,
			matched_terms: [],
			missed_terms: [],
		};
	}

	const lengthFactor = Math.min(1, words / 45);
	const wordingScore = Math.round(60 + lengthFactor * 33); // 60–93

	const passageTerms = keyTerms(passageText);
	let contentScore;
	let matchedTerms = [];
	let missedTerms = [];
	if (passageTerms.size === 0) {
		// No passage to compare against — fall back to a length-based estimate.
		contentScore = Math.round(55 + lengthFactor * 40); // 55–95
	} else {
		const summaryTerms = keyTerms(text);
		let overlap = 0;
		for (const t of summaryTerms) if (passageTerms.has(t)) overlap++;
		const relevance = Math.min(1, overlap / Math.min(10, passageTerms.size));
		// Content is driven by relevance, nudged by length; clamp to 0–97.
		contentScore = Math.min(
			97,
			Math.round(48 + relevance * 44 + lengthFactor * 8)
		);
		// Which of the passage's key concepts the summary captured vs. missed,
		// so the student sees *why* the content score landed where it did.
		// Capped to keep the feedback focused rather than exhaustive.
		for (const t of passageTerms) {
			if (summaryTerms.has(t)) matchedTerms.push(t);
			else missedTerms.push(t);
		}
		matchedTerms = matchedTerms.slice(0, 8);
		missedTerms = missedTerms.slice(0, 8);
	}

	return {
		content_score: contentScore,
		wording_score: wordingScore,
		word_count: words,
		matched_terms: matchedTerms,
		missed_terms: missedTerms,
	};
}

// A generic off-topic paragraph — shares no key terms with any passage, so it
// deterministically scores low on content. Used for the "weak" sample.
const WEAK_SAMPLE_SUMMARY =
	"This is a short note about my weekend plans and some general thoughts. " +
	"I wrote a few sentences without really focusing on the given passage or its main ideas.";

// Produce a ready-made sample summary so a visitor can score instantly without
// typing. "strong" echoes the passage's opening sentences (high term overlap →
// high content score); "weak" is off-topic filler (low overlap → low score).
// Deterministic, so the resulting scores are reproducible and shareable.
export function getSampleSummary(assignmentId, quality = "strong") {
	if (quality === "weak") return WEAK_SAMPLE_SUMMARY;
	const assignment = DEMO_ASSIGNMENTS.find(
		(a) => String(a.id) === String(assignmentId)
	);
	const passage = assignment?.eval_text?.text || "";
	// First two sentences of the source, lightly reworded into a summary opener.
	const sentences = passage.match(/[^.!?]+[.!?]+/g) || [];
	const gist = sentences.slice(0, 2).join(" ").trim();
	return gist ? `In summary, ${gist.charAt(0).toLowerCase()}${gist.slice(1)}` : "";
}

// A lightweight, deterministic readability read on a piece of writing: shorter
// sentences and fewer long words read more clearly. Returns a plain label the
// student UI can show alongside the scores. Not a formal grade level — just a
// quick "how dense is this" signal derived from sentence and word length.
export function getReadability(text) {
	const t = String(text || "").trim();
	const words = t ? t.split(/\s+/).filter(Boolean) : [];
	if (words.length === 0) return { label: "—", avgSentenceLength: 0 };
	const sentences = (t.match(/[^.!?]+[.!?]*/g) || [t]).filter((s) =>
		s.trim()
	);
	const avgSentenceLength = Math.round(words.length / sentences.length);
	const longWords = words.filter(
		(w) => w.replace(/[^A-Za-z]/g, "").length >= 8
	).length;
	const longWordPct = longWords / words.length;
	let label;
	if (avgSentenceLength <= 14 && longWordPct < 0.2) label = "Clear";
	else if (avgSentenceLength <= 22 && longWordPct < 0.32) label = "Moderate";
	else label = "Dense";
	return { label, avgSentenceLength };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mission Control + AI Insights helpers — derived from the fixtures above so
// the dashboard stays deterministic.
// ─────────────────────────────────────────────────────────────────────────────

const ALL_SUBMISSIONS = Object.values(DEMO_SUMMARIES_BY_ASSIGNMENT).flat();

// Shift the whole fixture timeline so the newest submission is always ~2
// days ago. Every relative gap is preserved, so dates in the submissions
// table, history page, drawer, and score trend all read as recent no
// matter when the demo is viewed (they were frozen in 2025 and drifted
// stale). Deadlines are already computed relative to now.
{
	const DAY = 24 * 60 * 60 * 1000;
	const times = ALL_SUBMISSIONS.filter((s) => s.submitted_on).map((s) =>
		new Date(s.submitted_on).getTime()
	);
	if (times.length) {
		const delta =
			Math.round((Date.now() - 2 * DAY - Math.max(...times)) / DAY) * DAY;
		const shift = (iso) =>
			iso ? new Date(new Date(iso).getTime() + delta).toISOString() : iso;
		ALL_SUBMISSIONS.forEach((s) => {
			s.submitted_on = shift(s.submitted_on);
		});
		DEMO_ASSIGNMENTS.forEach((a) => {
			a.created_at = shift(a.created_at);
		});
	}
}

const _submittedTimes = ALL_SUBMISSIONS
	.filter((s) => s.is_submitted && s.submitted_on)
	.map((s) => new Date(s.submitted_on).getTime());

// 2 days after the latest fixture submission so "this week" / "last week"
// windows always contain real data.
export const DEMO_NOW = new Date(
	(_submittedTimes.length ? Math.max(..._submittedTimes) : Date.now()) +
		2 * 24 * 60 * 60 * 1000
);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Rolling 7-day windows ending now (not calendar weeks): right after a
// weekend a calendar "this week" could be empty, making the dashboard
// read "0 submissions this week" despite days-old activity.
export function getWeeklyBuckets(weeks = 6) {
	const buckets = [];
	for (let i = weeks - 1; i >= 0; i--) {
		const end = new Date(DEMO_NOW.getTime() - i * WEEK_MS);
		const start = new Date(end.getTime() - WEEK_MS);
		buckets.push({
			label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
			start,
			end,
		});
	}
	return buckets;
}

export function getSubmissionsByWeek(weeks = 6) {
	return getWeeklyBuckets(weeks).map((b) => {
		const count = ALL_SUBMISSIONS.filter(
			(s) =>
				s.is_submitted &&
				s.submitted_on &&
				new Date(s.submitted_on) >= b.start &&
				new Date(s.submitted_on) < b.end
		).length;
		return { label: b.label, value: count };
	});
}

export function getAvgScoreByWeek(weeks = 6) {
	return getWeeklyBuckets(weeks).map((b) => {
		const inRange = ALL_SUBMISSIONS.filter(
			(s) =>
				s.is_submitted &&
				s.submitted_on &&
				new Date(s.submitted_on) >= b.start &&
				new Date(s.submitted_on) < b.end
		);
		if (inRange.length === 0) return { label: b.label, value: 0 };
		const avg =
			inRange.reduce((sum, s) => sum + (s.content_score + s.wording_score) / 2, 0) /
			inRange.length;
		return { label: b.label, value: Math.round(avg) };
	});
}

export function getKpiSnapshot() {
	const enrolled = DEMO_STUDENTS.filter((s) => s.enrolled).length;
	const submitted = ALL_SUBMISSIONS.filter((s) => s.is_submitted);
	const totalPossible = DEMO_ASSIGNMENTS.length * enrolled;
	const completion = totalPossible
		? Math.round((submitted.length / totalPossible) * 100)
		: 0;

	const avgScore = submitted.length
		? Math.round(
				submitted.reduce(
					(sum, s) => sum + (s.content_score + s.wording_score) / 2,
					0
				) / submitted.length
		  )
		: 0;

	const submissionsWeekly = getSubmissionsByWeek(6);
	const avgWeekly = getAvgScoreByWeek(6);
	const lastIdx = submissionsWeekly.length - 1;
	const submissionsThisWeek = submissionsWeekly[lastIdx]?.value || 0;
	const submissionsWoW =
		submissionsThisWeek - (submissionsWeekly[lastIdx - 1]?.value || 0);
	const avgThisWeek = avgWeekly[lastIdx]?.value || 0;
	const avgPrevWeek = avgWeekly[lastIdx - 1]?.value || 0;
	const avgWoW = avgThisWeek && avgPrevWeek ? avgThisWeek - avgPrevWeek : 0;

	return {
		assignments: DEMO_ASSIGNMENTS.length,
		students: DEMO_STUDENTS.length,
		enrolled,
		completion,
		avgScore,
		submissionsThisWeek,
		submissionsWoW,
		avgWoW,
		avgWeekly: avgWeekly.map((b) => b.value),
		submissionsWeekly: submissionsWeekly.map((b) => b.value),
		weekLabels: submissionsWeekly.map((b) => b.label),
	};
}

export function getNeedsAttention() {
	const items = [];

	for (const student of DEMO_STUDENTS) {
		const history = ALL_SUBMISSIONS.filter((s) => s.student_id === student.id);
		const submitted = history
			.filter((s) => s.is_submitted)
			.sort((a, b) => new Date(b.submitted_on) - new Date(a.submitted_on));
		const missed = history.filter((s) => !s.is_submitted);

		if (submitted.length >= 2) {
			const recent =
				submitted.slice(0, 2).reduce(
					(sum, s) => sum + (s.content_score + s.wording_score) / 2,
					0
				) / 2;
			if (recent < 68) {
				items.push({
					studentId: student.id,
					student: `${student.firstName} ${student.lastName}`,
					reason: "Low recent scores",
					detail: `Last 2 avg: ${Math.round(recent)}/100`,
					severity: "high",
					action: "Schedule 1:1 review",
				});
				continue;
			}
		}

		if (missed.length >= 1 && student.enrolled) {
			const missedTitles = missed
				.map((m) => DEMO_ASSIGNMENTS.find((a) => a.id === m.question_id)?.textTitle)
				.filter(Boolean);
			items.push({
				studentId: student.id,
				student: `${student.firstName} ${student.lastName}`,
				reason: `${missed.length} missing submission${missed.length > 1 ? "s" : ""}`,
				detail: missedTitles.join(", "),
				severity: missed.length > 1 ? "high" : "medium",
				action: "Send reminder",
			});
			continue;
		}

		if (submitted.length >= 4) {
			const last2 =
				submitted.slice(0, 2).reduce(
					(sum, s) => sum + (s.content_score + s.wording_score) / 2,
					0
				) / 2;
			const prior2 =
				submitted.slice(2, 4).reduce(
					(sum, s) => sum + (s.content_score + s.wording_score) / 2,
					0
				) / 2;
			if (last2 - prior2 <= -8) {
				items.push({
					studentId: student.id,
					student: `${student.firstName} ${student.lastName}`,
					reason: "Declining trend",
					detail: `${Math.round(prior2)} → ${Math.round(last2)} (-${Math.round(prior2 - last2)})`,
					severity: "medium",
					action: "Check engagement",
				});
			}
		}
	}

	const order = { high: 0, medium: 1, low: 2 };
	return items.sort(
		(a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9)
	);
}

export function getActivityFeed(limit = 12) {
	const events = [];
	for (const s of ALL_SUBMISSIONS) {
		if (!s.is_submitted || !s.submitted_on) continue;
		const assignment = DEMO_ASSIGNMENTS.find((a) => a.id === s.question_id);
		const score = Math.round((s.content_score + s.wording_score) / 2);
		const type = score >= 88 ? "highlight" : score < 65 ? "alert" : "submission";
		const message =
			type === "alert"
				? `Scored ${score}/100 — flagged for review`
				: type === "highlight"
				? `Top score ${score}/100`
				: `Submitted summary, scored ${score}/100`;
		events.push({
			id: `sub-${s.id}`,
			type,
			ts: s.submitted_on,
			student: `${s.eval_students.firstName} ${s.eval_students.lastName}`,
			studentId: s.student_id,
			assignment: assignment?.textTitle || `Assignment ${s.question_id}`,
			message,
			score,
		});
	}
	const sorted = events.sort((a, b) => new Date(b.ts) - new Date(a.ts));

	// The fixture dates are frozen in time, which made "Live activity" read
	// "9 months ago". Re-anchor: newest event happened minutes ago, and the
	// fixture month of history is compressed ~30x so the feed reads like an
	// active class (minutes → hours → a day ago). Order is preserved.
	const newest = sorted.length ? new Date(sorted[0].ts).getTime() : 0;
	const FRESH_OFFSET_MS = 12 * 60 * 1000;
	const COMPRESS = 30;
	const now = Date.now();

	return sorted.slice(0, limit).map((e) => ({
		...e,
		ts: new Date(
			now - FRESH_OFFSET_MS - (newest - new Date(e.ts).getTime()) / COMPRESS
		).toISOString(),
	}));
}

// AI gap analysis per assignment.
export const DEMO_AI_INSIGHTS = {
	1: {
		summary:
			"Most students named fossil fuels as the cause. Common gap: connecting emissions to specific consequences like sea-level rise.",
		commonErrors: [
			{ error: "Only mentioned warming, not consequences", count: 4 },
			{ error: "Treated weather and climate as the same", count: 3 },
			{ error: "Vocabulary too informal ('it gets hotter')", count: 2 },
		],
		suggestion: "Re-teach cause → effect chains using diagram-based prompts.",
	},
	2: {
		summary:
			"Inputs and outputs are well captured. 60% omitted the role of chloroplasts and chlorophyll.",
		commonErrors: [
			{ error: "Skipped chlorophyll / chloroplast", count: 5 },
			{ error: "Didn't mention oxygen as a by-product", count: 2 },
			{ error: "Used vague language ('plants eat sun')", count: 2 },
		],
		suggestion: "Add a vocabulary checklist: chloroplast, chlorophyll, glucose.",
	},
	3: {
		summary:
			"Strong understanding of the loop. Most students missed condensation as a distinct step.",
		commonErrors: [
			{ error: "Compressed evaporation + condensation", count: 4 },
			{ error: "Didn't mention precipitation forms (rain/snow)", count: 2 },
			{ error: "Said 'sky' instead of 'atmosphere'", count: 2 },
		],
		suggestion: "Use the 4-step framework: evaporate → condense → precipitate → collect.",
	},
	4: {
		summary:
			"Geographic and historical scope is captured. Modern legacy is underweighted in 50% of summaries.",
		commonErrors: [
			{ error: "Skipped modern legal / political influence", count: 3 },
			{ error: "Treated Rome as just an army story", count: 3 },
			{ error: "Didn't mention engineering (roads, aqueducts)", count: 2 },
		],
		suggestion: "Connect ancient Rome to modern systems students recognize (laws, roads).",
	},
	5: {
		summary:
			"Students captured the shift to factories and the rise of cities. Social consequences — child labour, pollution, reform — were underrepresented in 60% of responses.",
		commonErrors: [
			{ error: "Omitted social/reform consequences", count: 5 },
			{ error: "Didn't explain why Britain led the revolution", count: 4 },
			{ error: "Confused Industrial Revolution with invention of steam alone", count: 2 },
		],
		suggestion:
			"Use a cause → change → consequence framework: why Britain? → what changed? → who was affected and how?",
	},
};

export function getInsightsForAssignment(assignmentId) {
	const key = parseInt(assignmentId, 10);
	const base = DEMO_AI_INSIGHTS[key];
	if (!base) return null;
	// Rank the gaps biggest-first so the most widespread problem leads, and
	// derive a headline "top gap" with the share of the class it affects.
	const enrolled = DEMO_STUDENTS.filter((s) => s.enrolled).length || 1;
	const commonErrors = [...base.commonErrors].sort((a, b) => b.count - a.count);
	const top = commonErrors[0];
	const topGap = top
		? {
				error: top.error,
				count: top.count,
				pct: Math.min(100, Math.round((top.count / enrolled) * 100)),
		  }
		: null;
	return { ...base, commonErrors, topGap };
}

export function getClassProgressByAssignment() {
	return DEMO_ASSIGNMENTS.map((a) => {
		const subs = ALL_SUBMISSIONS.filter(
			(s) => s.question_id === a.id && s.is_submitted
		);
		const avg = subs.length
			? Math.round(
					subs.reduce((sum, s) => sum + (s.content_score + s.wording_score) / 2, 0) /
						subs.length
			  )
			: null;
		const submitted = subs.length;
		const total = DEMO_STUDENTS.filter((s) => s.enrolled).length;
		return {
			assignmentId: a.id,
			label: a.textTitle,
			avg,
			submitted,
			total,
			completionPct: total ? Math.round((submitted / total) * 100) : 0,
		};
	});
}

export function getSmartSummary() {
	const kpis = getKpiSnapshot();
	const needs = getNeedsAttention();
	const highlights = [];

	if (kpis.avgWoW > 0) {
		highlights.push({
			tone: "positive",
			text: `Class average is up ${kpis.avgWoW} points week-over-week.`,
		});
	} else if (kpis.avgWoW < 0) {
		highlights.push({
			tone: "warning",
			text: `Class average dropped ${Math.abs(kpis.avgWoW)} points this week.`,
		});
	} else if (kpis.submissionsThisWeek > 0) {
		highlights.push({
			tone: "neutral",
			text: `Class average held steady at ${kpis.avgScore}/100.`,
		});
	}

	if (needs.length > 0) {
		const high = needs.filter((n) => n.severity === "high").length;
		highlights.push({
			tone: needs.length > 3 ? "warning" : "neutral",
			text: `${needs.length} student${needs.length > 1 ? "s" : ""} flagged for attention${
				high ? ` (${high} high priority)` : ""
			}.`,
		});
	}

	if (kpis.submissionsThisWeek > 0) {
		highlights.push({
			tone: kpis.submissionsWoW >= 0 ? "positive" : "neutral",
			text: `${kpis.submissionsThisWeek} new submission${
				kpis.submissionsThisWeek > 1 ? "s" : ""
			} this week (${kpis.submissionsWoW >= 0 ? "+" : ""}${kpis.submissionsWoW} vs last week).`,
		});
	} else {
		highlights.push({
			tone: "neutral",
			text: "No new submissions this week — consider a check-in.",
		});
	}

	return {
		headline: `Class average: ${kpis.avgScore}/100`,
		subhead: `${kpis.completion}% completion across ${kpis.assignments} assignment${
			kpis.assignments > 1 ? "s" : ""
		}`,
		highlights,
		// Stamped fresh per call so the card never claims a months-old insight.
		generatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
	};
}

// Everything an assignment detail page needs, in one call.
export function getAssignmentDetail(id) {
	const assignment = DEMO_ASSIGNMENTS.find(
		(a) => String(a.id) === String(id)
	);
	if (!assignment) return null;
	const roster = DEMO_SUMMARIES_BY_ASSIGNMENT[assignment.id] || [];
	const submissions = roster
		.filter((s) => s.is_submitted)
		.map((s) => {
			const c = parseFloat(s.content_score);
			const w = parseFloat(s.wording_score);
			return {
				id: s.id,
				student: `${s.eval_students.firstName} ${s.eval_students.lastName}`,
				studentId: s.student_id,
				submittedOn: s.submitted_on,
				content: Math.round(c),
				wording: Math.round(w),
				overall: Math.round((c + w) / 2),
			};
		})
		.sort((a, b) => b.overall - a.overall);
	const missing = roster
		.filter((s) => !s.is_submitted)
		.map((s) => `${s.eval_students.firstName} ${s.eval_students.lastName}`);
	const avg = submissions.length
		? Math.round(
				submissions.reduce((t, s) => t + s.overall, 0) / submissions.length
		  )
		: null;
	return {
		id: assignment.id,
		question: assignment.question,
		description: assignment.description,
		textTitle: assignment.textTitle,
		text: assignment.eval_text.text,
		deadline: assignment.deadline,
		submissions,
		missing,
		total: roster.length,
		avg,
		contentScores: submissions.map((s) => s.content),
		wordingScores: submissions.map((s) => s.wording),
	};
}

// Everything the printable class report needs, in one call.
export function getClassReport() {
	const matrix = getCohortMatrix();
	const kpis = getKpiSnapshot();
	const assignments = DEMO_ASSIGNMENTS.map((a) => {
		const subs = (DEMO_SUMMARIES_BY_ASSIGNMENT[a.id] || []).filter(
			(s) => s.is_submitted
		);
		const avg = subs.length
			? Math.round(
					subs.reduce(
						(t, s) => t + (s.content_score + s.wording_score) / 2,
						0
					) / subs.length
			  )
			: null;
		return {
			id: a.id,
			title: a.textTitle,
			question: a.question,
			submitted: subs.length,
			total: matrix.rows.length,
			avg,
		};
	});
	const students = matrix.rows.map((r) => ({
		studentId: r.studentId,
		student: r.student,
		submitted: r.cells.filter((c) => c.score !== null).length,
		total: r.cells.length,
		avg: r.avg,
	}));
	return { kpis, assignments, students };
}

export function getCohortMatrix() {
	const rows = DEMO_STUDENTS.filter((s) => s.enrolled).map((student) => {
		const cells = DEMO_ASSIGNMENTS.map((assignment) => {
			const sub = ALL_SUBMISSIONS.find(
				(s) => s.student_id === student.id && s.question_id === assignment.id
			);
			if (!sub || !sub.is_submitted) {
				return { assignmentId: assignment.id, score: null, status: "missing" };
			}
			return {
				assignmentId: assignment.id,
				score: Math.round((sub.content_score + sub.wording_score) / 2),
				status: "submitted",
			};
		});
		const scored = cells.filter((c) => c.score !== null);
		const avg = scored.length
			? Math.round(scored.reduce((sum, c) => sum + c.score, 0) / scored.length)
			: null;
		return {
			studentId: student.id,
			student: `${student.firstName} ${student.lastName}`,
			cells,
			avg,
		};
	});
	return {
		columns: DEMO_ASSIGNMENTS.map((a) => ({ id: a.id, label: a.textTitle })),
		rows,
	};
}

export function getStudentProfile(studentId) {
	const id = parseInt(studentId, 10);
	const student = DEMO_STUDENTS.find((s) => s.id === id);
	if (!student) return null;

	const all = ALL_SUBMISSIONS.filter((s) => s.student_id === id);
	const enriched = all.map((s) => {
		const a = DEMO_ASSIGNMENTS.find((a) => a.id === s.question_id);
		return {
			id: s.id,
			assignmentId: s.question_id,
			assignmentTitle: a?.textTitle || `Assignment ${s.question_id}`,
			isSubmitted: !!s.is_submitted,
			submittedOn: s.submitted_on,
			contentScore: s.content_score,
			wordingScore: s.wording_score,
			avg: s.is_submitted ? Math.round((s.content_score + s.wording_score) / 2) : null,
		};
	});

	const submitted = enriched.filter((s) => s.isSubmitted);
	submitted.sort((a, b) => new Date(a.submittedOn) - new Date(b.submittedOn));

	const trajectory = submitted.map((s) => ({
		label: s.assignmentTitle,
		submittedOn: s.submittedOn,
		content: s.contentScore,
		wording: s.wordingScore,
		avg: s.avg,
	}));

	const classAvgs = DEMO_ASSIGNMENTS.map((a) => {
		const peers = ALL_SUBMISSIONS.filter(
			(s) => s.question_id === a.id && s.is_submitted
		);
		if (peers.length === 0) return null;
		return Math.round(
			peers.reduce(
				(sum, s) => sum + (s.content_score + s.wording_score) / 2,
				0
			) / peers.length
		);
	});

	const recent = submitted.slice(-2);
	const recentAvg = recent.length
		? recent.reduce((sum, s) => sum + s.avg, 0) / recent.length
		: null;

	let suggestion;
	if (submitted.length === 0) {
		suggestion = "No submissions yet — send a check-in.";
	} else if (recentAvg < 65) {
		suggestion =
			"Schedule a 1:1 — recent scores are below the class average. Focus on vocabulary and structure.";
	} else if (recentAvg < 75) {
		suggestion =
			"Pair with a peer mentor for the next assignment. Strengths in summarizing, gaps in precision.";
	} else if (recentAvg >= 88) {
		suggestion = "Top performer — consider a stretch task or peer mentoring role.";
	} else {
		suggestion = "Steady performer. Encourage richer vocabulary on the next submission.";
	}

	const overallAvg = submitted.length
		? Math.round(submitted.reduce((sum, s) => sum + s.avg, 0) / submitted.length)
		: null;

	return {
		student,
		trajectory,
		classAvgs,
		assignmentLabels: DEMO_ASSIGNMENTS.map((a) => a.textTitle),
		submissions: enriched.sort(
			(a, b) => new Date(b.submittedOn || 0) - new Date(a.submittedOn || 0)
		),
		suggestion,
		missingCount: enriched.filter((s) => !s.isSubmitted).length,
		submittedCount: submitted.length,
		overallAvg,
	};
}

export function getSearchableEntries() {
	const pages = [
		{ type: "page", title: "Overview", subtitle: "Dashboard", path: "/" },
		{
			type: "page",
			title: "Assignments",
			subtitle: "Manage assignments",
			path: "/assignments",
		},
		{ type: "page", title: "Students", subtitle: "Roster", path: "/students" },
		{ type: "page", title: "Account", subtitle: "Your profile", path: "/account" },
		{
			type: "page",
			title: "Settings",
			subtitle: "Preferences & notifications",
			path: "/settings",
		},
	];
	const students = DEMO_STUDENTS.map((s) => ({
		type: "student",
		title: `${s.firstName} ${s.lastName}`,
		subtitle: `Grade ${s.grade}${s.enrolled ? "" : " · not enrolled"}`,
		studentId: s.id,
		path: "/students",
	}));
	const assignments = DEMO_ASSIGNMENTS.map((a) => ({
		type: "assignment",
		title: a.textTitle,
		subtitle: a.question,
		assignmentId: a.id,
		// Straight to the assignment's detail page.
		path: `/assignments/${a.id}`,
	}));
	const actions = [
		{
			type: "action",
			title: "Send weekly digest to parents",
			subtitle: "Compose summary email",
			actionId: "send-digest",
		},
		{
			type: "action",
			title: "Export class report (PDF)",
			subtitle: "Snapshot of this week",
			actionId: "export-report",
		},
		{
			type: "action",
			title: "Switch role to Student",
			subtitle: "Preview the student dashboard",
			actionId: "switch-role",
		},
	];
	return [...pages, ...students, ...assignments, ...actions];
}
