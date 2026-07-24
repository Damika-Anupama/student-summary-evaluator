import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Container,
	Unstable_Grid2 as Grid,
	MenuItem,
	Skeleton,
	Stack,
	SvgIcon,
	TextField,
	Typography,
} from "@mui/material";
import RectangleStackIcon from "@heroicons/react/24/solid/RectangleStackIcon";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";
import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";
import ClipboardDocumentCheckIcon from "@heroicons/react/24/solid/ClipboardDocumentCheckIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon";

import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { Score } from "src/sections/overview/overview-score";
import { OverallScore } from "src/sections/overview/overview-total-score";
import { OverviewLatestOrders } from "src/sections/overview/overview-submissions";

import { SmartSummaryCard } from "src/sections/mission-control/smart-summary-card";
import { KpiCard } from "src/sections/mission-control/kpi-card";
import { ActivityFeed } from "src/sections/mission-control/activity-feed";
import { NeedsAttentionQueue } from "src/sections/mission-control/needs-attention-queue";
import { CohortHeatmap } from "src/sections/mission-control/cohort-heatmap";
import { ClassProgressChart } from "src/sections/mission-control/class-progress-chart";
import { AssignmentInsightPanel } from "src/sections/mission-control/assignment-insight-panel";
import { useStudentDrawer } from "src/contexts/student-drawer-context";
import { useSnackbar } from "src/contexts/snackbar-context";

import { Page as StudentPage } from "src/pages/dashboard-student";
import { DEMO_ASSIGNMENTS } from "src/demo/demo-data";
import { bucketByTens, bucketByRange } from "src/utils/score-buckets";

const SCORE_CATEGORIES = [
	"0-10",
	"10-20",
	"20-30",
	"30-40",
	"40-50",
	"50-60",
	"60-70",
	"70-80",
	"80-90",
	"90-100",
];

const taskProgress = (data) => {
	const total = data.summaries.length;
	if (!total) return 0;
	const complete = data.summaries.filter((s) => s.is_submitted).length;
	return ((complete / total) * 100).toFixed(1);
};

const getSubmissions = (data) =>
	data.summaries.map((item) => ({
		id: item.id || "",
		ref: item.question_id || "",
		student: { name: item.eval_students.firstName },
		submitAt: item.submitted_on,
		status: item.is_submitted ? "submit" : "pending",
	}));

const calculate = (values) => bucketByTens(values);

const getRangeValues = (values) => bucketByRange(values);

const CHART_HEIGHT = 350;

// Stand-in for a score histogram while its data is loading or after the
// fetch failed. Mirrors the loading-skeleton / centred-message pattern the
// mission-control cards already use, so a failed request reads as a failure
// instead of "nobody scored anything".
const ScoreChartFallback = ({ title, subheader, error, onRetry }) => (
	<Card sx={{ height: "100%" }}>
		<CardHeader title={title} subheader={subheader} />
		<CardContent>
			{error ? (
				<Stack
					spacing={1.5}
					alignItems="center"
					justifyContent="center"
					sx={{ height: CHART_HEIGHT, textAlign: "center" }}
				>
					<SvgIcon fontSize="large" sx={{ color: "error.main" }}>
						<ExclamationTriangleIcon />
					</SvgIcon>
					<Typography variant="body2" color="text.secondary">
						Score data for this assignment could not be loaded.
					</Typography>
					<Button size="small" sx={{ textTransform: "none" }} onClick={onRetry}>
						Try again
					</Button>
				</Stack>
			) : (
				<Skeleton variant="rounded" height={CHART_HEIGHT} />
			)}
		</CardContent>
	</Card>
);

ScoreChartFallback.propTypes = {
	title: PropTypes.string,
	subheader: PropTypes.string,
	error: PropTypes.bool,
	onRetry: PropTypes.func,
};

const Page = (props) => {
	const { assignments } = props;
	const studentDrawer = useStudentDrawer();
	const { show } = useSnackbar();

	const [assignmentID, setAssignmentID] = useState(assignments[0]?.id ?? 1);
	const [contentScores, setContentScores] = useState([]);
	const [wordingScores, setWordingScores] = useState([]);
	const [totalScores, setTotalScores] = useState([]);
	const [submissions, setSubmissions] = useState([]);

	const [scoresError, setScoresError] = useState(false);
	const [scoresLoading, setScoresLoading] = useState(true);
	const [scoresReloadKey, setScoresReloadKey] = useState(0);
	const retryScores = useCallback(() => setScoresReloadKey((k) => k + 1), []);

	const [overview, setOverview] = useState(null);
	const [overviewLoading, setOverviewLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		setOverviewLoading(true);
		axios
			.get("/api/dashboard/overview")
			.then((res) => {
				if (!cancelled) setOverview(res.data);
			})
			.catch(() => {
				// The cards below each render their own empty state when
				// `overview` stays null, so surface the failure once via the
				// snackbar rather than leaving it only in the console.
				if (!cancelled) show("Could not load the dashboard overview.", "error");
			})
			.finally(() => {
				if (!cancelled) setOverviewLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [show]);

	useEffect(() => {
		let cancelled = false;
		const fetchSummaryData = async () => {
			setScoresLoading(true);
			setScoresError(false);
			try {
				const res = await axios.get(
					"/api/dashboard/summaries/" + assignmentID
				);
				if (cancelled) return;
				const data = res.data;
				const graded = data.summaries.filter((s) => s.is_submitted);
				setContentScores(calculate(graded.map((s) => s.content_score)));
				setWordingScores(calculate(graded.map((s) => s.wording_score)));
				const totals = graded
					.map((s) => {
						const c = parseFloat(s.content_score);
						const w = parseFloat(s.wording_score);
						if (!isNaN(c) && !isNaN(w)) return (c + w) / 2;
						return 0;
					})
					.filter((v) => v > 0);
				setTotalScores(getRangeValues(totals));
				setSubmissions(getSubmissions(data));
			} catch (error) {
				// Without this the histograms silently rendered as empty bars,
				// which reads as "nobody scored anything" rather than "the
				// request failed".
				if (cancelled) return;
				setScoresError(true);
				setContentScores([]);
				setWordingScores([]);
				setTotalScores([]);
				setSubmissions([]);
				show("Could not load scores for this assignment.", "error");
			} finally {
				if (!cancelled) setScoresLoading(false);
			}
		};
		fetchSummaryData();
		return () => {
			cancelled = true;
		};
	}, [assignmentID, scoresReloadKey, show]);

	const handleSelectChange = (event) => {
		const selected = assignments.find((a) => a.question === event.target.value);
		setAssignmentID(selected?.id);
	};

	const activeAssignment = useMemo(
		() => assignments.find((a) => a.id === assignmentID),
		[assignments, assignmentID]
	);

	const kpis = overview?.kpis;
	const scoresUnavailable = scoresLoading || scoresError;
	const openStudent = (id) => studentDrawer.open(id);

	return (
		<>
			<Head>
				<title>Overview | Summary Evaluation System</title>
			</Head>
			<Box component="main" sx={{ flexGrow: 1, py: 4 }}>
				<Container maxWidth="xl">
					<Grid container spacing={3}>
						<Grid xs={12}>
							<SmartSummaryCard
								summary={overview?.summary}
								loading={overviewLoading}
							/>
						</Grid>

						<Grid xs={12} sm={6} lg={3}>
							<KpiCard
								label="Active assignments"
								value={kpis?.assignments ?? "—"}
								icon={<RectangleStackIcon />}
								iconColor="primary.main"
								loading={overviewLoading}
							/>
						</Grid>
						<Grid xs={12} sm={6} lg={3}>
							<KpiCard
								label="Enrolled students"
								value={kpis?.enrolled ?? "—"}
								suffix={
									kpis ? `/ ${kpis.students}` : ""
								}
								icon={<UsersIcon />}
								iconColor="success.main"
								loading={overviewLoading}
							/>
						</Grid>
						<Grid xs={12} sm={6} lg={3}>
							<KpiCard
								label="Class average"
								value={kpis?.avgScore ?? "—"}
								suffix="/100"
								icon={<AcademicCapIcon />}
								iconColor="info.main"
								sparkline={kpis?.avgWeekly}
								delta={kpis?.avgWoW ?? 0}
								loading={overviewLoading}
							/>
						</Grid>
						<Grid xs={12} sm={6} lg={3}>
							<KpiCard
								label="Submissions this week"
								value={kpis?.submissionsThisWeek ?? "—"}
								icon={<ClipboardDocumentCheckIcon />}
								iconColor="warning.main"
								sparkline={kpis?.submissionsWeekly}
								delta={kpis?.submissionsWoW ?? 0}
								loading={overviewLoading}
							/>
						</Grid>

						<Grid xs={12} lg={7}>
							<ActivityFeed
								events={overview?.activity || []}
								loading={overviewLoading}
								onStudentClick={openStudent}
								sx={{ height: "100%" }}
							/>
						</Grid>
						<Grid xs={12} lg={5}>
							<NeedsAttentionQueue
								items={overview?.needsAttention || []}
								loading={overviewLoading}
								onStudentClick={openStudent}
								sx={{ height: "100%" }}
							/>
						</Grid>

						<Grid xs={12} lg={6}>
							<ClassProgressChart
								data={overview?.classProgress || []}
								loading={overviewLoading}
								sx={{ height: "100%" }}
							/>
						</Grid>
						<Grid xs={12} lg={6}>
							<CohortHeatmap
								matrix={overview?.cohort}
								loading={overviewLoading}
								onCellClick={openStudent}
								sx={{ height: "100%" }}
							/>
						</Grid>

						<Grid xs={12}>
							<Box sx={{ mt: 1, mb: -1 }}>
								<TextField
									fullWidth
									select
									label="Assignment focus"
									helperText="Pick an assignment to see its score distribution and AI gap analysis"
									value={activeAssignment?.question || ""}
									onChange={handleSelectChange}
								>
									{assignments.map((a) => (
										<MenuItem key={a.id} value={a.question}>
											{a.question}
										</MenuItem>
									))}
								</TextField>
							</Box>
						</Grid>

						<Grid xs={12} lg={4}>
							{scoresUnavailable ? (
								<ScoreChartFallback
									title="Content score"
									subheader="Distribution across graded summaries"
									error={scoresError}
									onRetry={retryScores}
								/>
							) : (
								<Score
									title="Content score"
									categories={SCORE_CATEGORIES}
									chartSeries={[{ name: "Students", data: contentScores }]}
									sx={{ height: "100%" }}
								/>
							)}
						</Grid>
						<Grid xs={12} lg={4}>
							{scoresUnavailable ? (
								<ScoreChartFallback
									title="Wording score"
									subheader="Distribution across graded summaries"
									error={scoresError}
									onRetry={retryScores}
								/>
							) : (
								<Score
									title="Wording score"
									categories={SCORE_CATEGORIES}
									chartSeries={[{ name: "Students", data: wordingScores }]}
									sx={{ height: "100%" }}
								/>
							)}
						</Grid>
						<Grid xs={12} lg={4}>
							{scoresUnavailable ? (
								<ScoreChartFallback
									title="Overall Score"
									error={scoresError}
									onRetry={retryScores}
								/>
							) : (
								<OverallScore
									chartSeries={totalScores}
									labels={["Low", "Normal", "Best"]}
									sx={{ height: "100%" }}
								/>
							)}
						</Grid>

						<Grid xs={12}>
							<AssignmentInsightPanel
								assignmentId={assignmentID}
								title={activeAssignment?.textTitle}
								linkToDetail
							/>
						</Grid>

						<Grid xs={12}>
							<OverviewLatestOrders
								submissions={submissions}
								sx={{ height: "100%" }}
							/>
						</Grid>
					</Grid>
				</Container>
			</Box>
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

const TeacherOrStudent = (props) => {
	// Prerender the teacher view (the default persona) so "/" ships real
	// HTML instead of an empty shell — better first paint and SEO. Visitors
	// who chose the student role swap after mount.
	const [role, setRole] = useState("teacher");

	useEffect(() => {
		if (localStorage.getItem("userRole") === "student") {
			setRole("student");
		}
	}, []);

	if (role === "student") return <StudentPage />;
	return <Page {...props} />;
};

TeacherOrStudent.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// Fixture data only — statically generated so the page serves from the
// CDN instead of paying a serverless cold start on every request.
export const getStaticProps = async () => {
	const assignments = DEMO_ASSIGNMENTS.map((a) => ({
		id: a.id,
		question: a.question,
		description: a.description,
		textTitle: a.textTitle,
		createdBy_id: a.createdBy_id,
		created_at: a.created_at,
	}));

	return {
		props: {
			userType: "teacher",
			assignments: JSON.parse(JSON.stringify(assignments)),
		},
	};
};

export default TeacherOrStudent;
