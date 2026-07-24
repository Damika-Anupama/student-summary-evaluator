import Head from "next/head";
import NextLink from "next/link";
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Container,
	Stack,
	Typography,
	Unstable_Grid2 as Grid,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import {
	DEMO_ASSIGNMENTS,
	getStudentSubmissionMap,
} from "src/demo/demo-data";
import { deadlineStatus } from "src/utils/deadline";

const Page = (props) => {
	const { assignments, now } = props;

	return (
		<>
			<Head>
				<title>Assignments | Summary Evaluation System</title>
			</Head>
			<Box component="main" sx={{ flexGrow: 1, py: 8 }}>
				<Container maxWidth="xl">
					<Stack spacing={3}>
						<Stack spacing={1}>
							<Typography component="h1" variant="h4">Available Assignments</Typography>
							<Typography color="text.secondary" variant="body2">
								Read each passage and submit a summary to receive instant feedback.
							</Typography>
						</Stack>
						<Grid container spacing={3}>
							{assignments.map((assignment) => {
								const status = deadlineStatus(assignment.deadline, now);
								const done = assignment.submission;
								return (
									<Grid xs={12} md={6} lg={4} key={assignment.id}>
										<Card
											sx={{
												height: "100%",
												display: "flex",
												flexDirection: "column",
											}}
										>
											<CardContent sx={{ flexGrow: 1 }}>
												<Stack
													direction="row"
													justifyContent="space-between"
													alignItems="center"
													spacing={1}
													sx={{ mb: 1.5 }}
												>
													<Chip
														size="small"
														label={assignment.textTitle}
														color="primary"
														variant="outlined"
													/>
													{done ? (
														<Chip
															size="small"
															label={
																done.overall != null
																	? `Submitted · ${done.overall}/100`
																	: "Submitted"
															}
															color="success"
															sx={{ fontWeight: 600 }}
														/>
													) : (
														<Chip
															size="small"
															label={status.label}
															color={status.color}
															sx={{ fontWeight: 600 }}
														/>
													)}
												</Stack>
												<Typography gutterBottom variant="h6">
													{assignment.question}
												</Typography>
												<Typography color="text.secondary" variant="body2">
													{assignment.description}
												</Typography>
												<Typography
													color="text.secondary"
													variant="caption"
													sx={{ display: "block", mt: 2 }}
												>
													Due{" "}
													{new Date(assignment.deadline).toLocaleDateString(
														"en-GB",
														{ day: "numeric", month: "short", year: "numeric" }
													)}
												</Typography>
											</CardContent>
											<CardActions sx={{ p: 2, pt: 0 }}>
												<Button
													component={NextLink}
													href={`/dashboard-student?assignment=${assignment.id}`}
													variant={done ? "outlined" : "contained"}
													size="small"
													fullWidth
												>
													{done ? "Practice again" : "Start summary"}
												</Button>
											</CardActions>
										</Card>
									</Grid>
								);
							})}
						</Grid>
					</Stack>
				</Container>
			</Box>
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// Static with hourly ISR: deadline chips are day-granularity, so a
// build-time "now" refreshed every hour stays accurate while the page
// serves from the CDN (SSR here cost ~9s TTFB on cold starts).
export const getStaticProps = async () => {
	const now = Date.now();
	const submissions = getStudentSubmissionMap(1);
	const assignments = DEMO_ASSIGNMENTS.map((a) => ({
		id: a.id,
		question: a.question,
		description: a.description,
		textTitle: a.textTitle,
		deadline: a.deadline,
		submission: submissions[a.id] || null,
	}))
		// Unsubmitted work first (most urgent deadline on top), then
		// completed assignments.
		.sort((a, b) => {
			if (Boolean(a.submission) !== Boolean(b.submission)) {
				return a.submission ? 1 : -1;
			}
			return new Date(a.deadline) - new Date(b.deadline);
		});

	return { props: { assignments, now }, revalidate: 3600 };
};

export default Page;
