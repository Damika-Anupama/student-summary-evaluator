import { useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import PrinterIcon from "@heroicons/react/24/solid/PrinterIcon";
import ArrowLeftIcon from "@heroicons/react/24/solid/ArrowLeftIcon";
import ArrowDownTrayIcon from "@heroicons/react/24/solid/ArrowDownTrayIcon";
import {
	Box,
	Button,
	Container,
	Divider,
	Stack,
	SvgIcon,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "src/theme";
import { getClassReport } from "src/demo/demo-data";
import { scoreColor } from "src/utils/score-buckets";
import { studentsCsv, assignmentsCsv } from "src/utils/report-csv";
import { downloadCsv } from "src/utils/download-csv";

// The report is a paper document — always light, whatever the app
// theme, so printing never produces a dark page.
const lightTheme = createTheme("light");

const Stat = ({ label, value, suffix }) => (
	<Box sx={{ minWidth: 120 }}>
		<Typography variant="overline" color="text.secondary">
			{label}
		</Typography>
		<Typography component="p" variant="h5" sx={{ fontWeight: 700 }}>
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

const AvgCell = ({ avg }) => (
	<Typography
		variant="subtitle2"
		sx={{ color: avg != null ? scoreColor(avg) : "text.disabled" }}
	>
		{avg != null ? `${avg}/100` : "—"}
	</Typography>
);

const Page = ({ report }) => {
	const { kpis, assignments, students } = report;
	const [generatedOn, setGeneratedOn] = useState("");

	useEffect(() => {
		setGeneratedOn(
			new Date().toLocaleDateString("en-GB", {
				day: "numeric",
				month: "long",
				year: "numeric",
			})
		);
	}, []);

	return (
		<>
			<Head>
				<title>Class Report | Summary Evaluation System</title>
			</Head>
			<ThemeProvider theme={lightTheme}>
			<Box
				component="main"
				sx={{
					py: 4,
					minHeight: "100vh",
					backgroundColor: "background.default",
					color: "text.primary",
				}}
			>
				<Container maxWidth="md">
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
						sx={{ mb: 4, displayPrint: "none" }}
					>
						<Button
							component={NextLink}
							href="/"
							color="inherit"
							startIcon={
								<SvgIcon fontSize="small">
									<ArrowLeftIcon />
								</SvgIcon>
							}
						>
							Back to dashboard
						</Button>
						<Stack direction="row" spacing={1}>
							<Button
								color="inherit"
								startIcon={
									<SvgIcon fontSize="small">
										<ArrowDownTrayIcon />
									</SvgIcon>
								}
								onClick={() =>
									downloadCsv(studentsCsv(report), "students.csv")
								}
							>
								Students CSV
							</Button>
							<Button
								color="inherit"
								startIcon={
									<SvgIcon fontSize="small">
										<ArrowDownTrayIcon />
									</SvgIcon>
								}
								onClick={() =>
									downloadCsv(assignmentsCsv(report), "assignments.csv")
								}
							>
								Assignments CSV
							</Button>
							<Button
								variant="contained"
								startIcon={
									<SvgIcon fontSize="small">
										<PrinterIcon />
									</SvgIcon>
								}
								onClick={() => window.print()}
							>
								Print / Save as PDF
							</Button>
						</Stack>
					</Stack>

					<Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
						Class report
					</Typography>
					<Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
						Summary Evaluation System
						{generatedOn ? ` · Generated ${generatedOn}` : ""}
					</Typography>

					<Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
						<Stat label="Class average" value={kpis.avgScore} suffix="/100" />
						<Stat
							label="Enrolled"
							value={kpis.enrolled}
							suffix={`of ${kpis.students}`}
						/>
						<Stat label="Completion" value={`${kpis.completion}%`} />
						<Stat label="Assignments" value={kpis.assignments} />
					</Stack>

					<Divider sx={{ my: 3 }} />

					<Typography component="h2" variant="h6" sx={{ mb: 1 }}>
						Assignments
					</Typography>
					{/* Scroll within the card on narrow screens instead of
					    stretching the page; print output is unaffected. */}
					<Box sx={{ overflowX: "auto", mb: 4 }}>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>Topic</TableCell>
								<TableCell>Prompt</TableCell>
								<TableCell align="center">Submitted</TableCell>
								<TableCell align="right">Average</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{assignments.map((a) => (
								<TableRow key={a.id}>
									<TableCell sx={{ fontWeight: 600 }}>{a.title}</TableCell>
									<TableCell sx={{ color: "text.secondary" }}>
										{a.question}
									</TableCell>
									<TableCell align="center">
										{a.submitted}/{a.total}
									</TableCell>
									<TableCell align="right">
										<AvgCell avg={a.avg} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					</Box>

					<Typography component="h2" variant="h6" sx={{ mb: 1 }}>
						Students
					</Typography>
					<Box sx={{ overflowX: "auto" }}>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell align="center">Submitted</TableCell>
								<TableCell align="right">Average</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{students.map((s) => (
								<TableRow key={s.studentId}>
									<TableCell sx={{ fontWeight: 600 }}>{s.student}</TableCell>
									<TableCell align="center">
										{s.submitted}/{s.total}
									</TableCell>
									<TableCell align="right">
										<AvgCell avg={s.avg} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					</Box>

					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ display: "block", mt: 4 }}
					>
						Interactive demo — figures are generated from sample data.
					</Typography>
				</Container>
			</Box>
			</ThemeProvider>
		</>
	);
};

export const getStaticProps = async () => ({
	props: { report: JSON.parse(JSON.stringify(getClassReport())) },
});

export default Page;
