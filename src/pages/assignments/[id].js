import Head from "next/head";
import NextLink from "next/link";
import ArrowLeftIcon from "@heroicons/react/24/solid/ArrowLeftIcon";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Container,
	Stack,
	SvgIcon,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
	Unstable_Grid2 as Grid,
} from "@mui/material";
import { format } from "date-fns";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { useStudentDrawer } from "src/contexts/student-drawer-context";
import { Score } from "src/sections/overview/overview-score";
import { AssignmentInsightPanel } from "src/sections/mission-control/assignment-insight-panel";
import { Scrollbar } from "src/components/scrollbar";
import { getAssignmentDetail, DEMO_ASSIGNMENTS } from "src/demo/demo-data";
import { bucketByTens, scoreColor, scorePalette } from "src/utils/score-buckets";
import { deadlineStatus } from "src/utils/deadline";

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

const Stat = ({ label, value, suffix, color }) => (
	<Box sx={{ minWidth: 110 }}>
		<Typography variant="overline" color="text.secondary">
			{label}
		</Typography>
		<Typography component="p" variant="h5" sx={{ fontWeight: 700, color }}>
			{value}
			{suffix && (
				<Typography component="span" variant="body2" color="text.secondary">
					{" "}
					{suffix}
				</Typography>
			)}
		</Typography>
	</Box>
);

const Page = ({ detail, now }) => {
	const status = deadlineStatus(detail.deadline, now);
	const studentDrawer = useStudentDrawer();
	return (
		<>
			<Head>
				<title>{`${detail.textTitle} | Summary Evaluation System`}</title>
			</Head>
			<Box component="main" sx={{ flexGrow: 1, py: 6 }}>
				<Container maxWidth="xl">
					<Stack spacing={3}>
						<Box>
							<Button
								component={NextLink}
								href="/assignments"
								color="inherit"
								size="small"
								startIcon={
									<SvgIcon fontSize="small">
										<ArrowLeftIcon />
									</SvgIcon>
								}
							>
								All assignments
							</Button>
						</Box>
						<Stack spacing={1}>
							<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
								<Chip
									size="small"
									label={detail.textTitle}
									color="primary"
									variant="outlined"
								/>
								<Chip
									size="small"
									label={status.label}
									color={status.color}
									sx={{ fontWeight: 600 }}
								/>
							</Stack>
							<Typography component="h1" variant="h4">
								{detail.question}
							</Typography>
							<Typography color="text.secondary" variant="body2">
								{detail.description} · Due{" "}
								{format(new Date(detail.deadline), "d MMM yyyy")}
							</Typography>
						</Stack>

						<Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
							<Stat
								label="Class average"
								value={detail.avg ?? "—"}
								suffix={detail.avg != null ? "/100" : ""}
								color={detail.avg != null ? scoreColor(detail.avg) : undefined}
							/>
							<Stat
								label="Submitted"
								value={detail.submissions.length}
								suffix={`of ${detail.total}`}
							/>
							<Stat
								label="Missing"
								value={detail.missing.length}
								color={detail.missing.length ? "warning.main" : "success.main"}
							/>
						</Stack>

						<Card>
							<CardHeader
								title="Reading passage"
								subheader="What students summarize"
							/>
							<CardContent sx={{ pt: 0 }}>
								<Typography color="text.secondary" variant="body2">
									{detail.text}
								</Typography>
							</CardContent>
						</Card>

						<Grid container spacing={3}>
							<Grid xs={12} md={6}>
								<Score
									title="Content score"
									categories={SCORE_CATEGORIES}
									chartSeries={[
										{
											name: "Students",
											data: bucketByTens(detail.contentScores),
										},
									]}
									sx={{ height: "100%" }}
								/>
							</Grid>
							<Grid xs={12} md={6}>
								<Score
									title="Wording score"
									categories={SCORE_CATEGORIES}
									chartSeries={[
										{
											name: "Students",
											data: bucketByTens(detail.wordingScores),
										},
									]}
									sx={{ height: "100%" }}
								/>
							</Grid>
						</Grid>

						<AssignmentInsightPanel
							assignmentId={detail.id}
							title={detail.textTitle}
						/>

						<Card>
							<CardHeader
								title="Submissions"
								subheader={
									detail.missing.length
										? `Missing: ${detail.missing.join(", ")}`
										: "Everyone has submitted"
								}
							/>
							<Scrollbar>
								<Box sx={{ minWidth: 640 }}>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell>Student</TableCell>
												<TableCell>Submitted</TableCell>
												<TableCell align="center">Content</TableCell>
												<TableCell align="center">Wording</TableCell>
												<TableCell align="right">Overall</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{detail.submissions.map((s) => (
												<TableRow
													key={s.id}
													hover
													role="button"
													tabIndex={0}
													aria-label={`Open ${s.student}'s profile`}
													onClick={() => studentDrawer.open(s.studentId)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															studentDrawer.open(s.studentId);
														}
													}}
													sx={{
														cursor: "pointer",
														"&:focus-visible": {
															outline: (t) =>
																`2px solid ${t.palette.primary.main}`,
															outlineOffset: -2,
														},
													}}
												>
													<TableCell sx={{ fontWeight: 600 }}>
														{s.student}
													</TableCell>
													<TableCell>
														{format(new Date(s.submittedOn), "d MMM yyyy")}
													</TableCell>
													<TableCell align="center">{s.content}</TableCell>
													<TableCell align="center">{s.wording}</TableCell>
													<TableCell align="right">
														<Chip
															size="small"
															label={`${s.overall}/100`}
															color={scorePalette(s.overall)}
															sx={{ fontWeight: 700 }}
														/>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</Box>
							</Scrollbar>
						</Card>
					</Stack>
				</Container>
			</Box>
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getStaticPaths = async () => ({
	paths: DEMO_ASSIGNMENTS.map((a) => ({ params: { id: String(a.id) } })),
	fallback: false,
});

export const getStaticProps = async ({ params }) => {
	const detail = getAssignmentDetail(params.id);
	if (!detail) return { notFound: true };
	return {
		props: { detail: JSON.parse(JSON.stringify(detail)), now: Date.now() },
		revalidate: 3600,
	};
};

export default Page;
