import { useCallback, useMemo, useState } from "react";
import Head from "next/head";
import {
	Box,
	Card,
	CardContent,
	Container,
	Stack,
	Typography,
	Unstable_Grid2 as Grid,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { PreviousAssignmentTable } from "src/sections/student/previous-assignment-table";
import { ScoreTrendChart } from "src/sections/student/score-trend-chart";
import { applyPagination } from "src/utils/apply-pagination";
import { sortHistory } from "src/utils/sort-history";
import { AssignmentSearch } from "src/sections/student/assignment-history-search";
import { getStudentHistory } from "src/demo/demo-data";
import { summarizeScores } from "src/utils/summarize-scores";
import { useRemarks } from "src/hooks/use-remarks";

const useHistory = (data, page, rowsPerPage) => {
	return useMemo(() => {
		return applyPagination(data, page, rowsPerPage);
	}, [data, page, rowsPerPage]);
};

const StatCard = ({ label, value, suffix }) => (
	<Card sx={{ height: "100%" }}>
		<CardContent>
			<Typography color="text.secondary" variant="overline">
				{label}
			</Typography>
			<Typography component="p" variant="h4" sx={{ fontWeight: 700 }}>
				{value}
				{suffix ? (
					<Typography
						component="span"
						variant="h6"
						sx={{ ml: 0.5, color: "text.secondary", fontWeight: 500 }}
					>
						{suffix}
					</Typography>
				) : null}
			</Typography>
		</CardContent>
	</Card>
);

const Page = (props) => {
	const [data] = useState(() => props.history);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState({ field: null, dir: "asc" });

	const handleSort = useCallback((field) => {
		setSort((prev) =>
			prev.field === field
				? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
				: { field, dir: "asc" }
		);
		setPage(0);
	}, []);

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		const matched = query
			? data.filter((row) =>
					String(row.assignment || "").toLowerCase().includes(query)
			  )
			: data;
		return sort.field ? sortHistory(matched, sort.field, sort.dir) : matched;
	}, [data, search, sort]);

	const rows = useHistory(filtered, page, rowsPerPage);

	const stats = useMemo(() => summarizeScores(data), [data]);

	// Whatever the teacher has written, on top of the seeded fixtures.
	const remarks = useRemarks();

	const handleSearchChange = useCallback((event) => {
		setSearch(event.target.value);
		setPage(0);
	}, []);

	const handlePageChange = useCallback((event, value) => {
		setPage(value);
	}, []);

	const handleRowsPerPageChange = useCallback((event) => {
		setRowsPerPage(event.target.value);
	}, []);

	return (
		<>
			<Head>
				<title>Your Previous Grades | Summary Evaluation System</title>
			</Head>
			<Box component="main" sx={{ flexGrow: 1, py: 8 }}>
				<Container maxWidth="xl">
					<Stack spacing={3}>
						<Stack direction="row" justifyContent="space-between" spacing={4}>
							<Stack spacing={1}>
								<Typography component="h1" variant="h4">Your Previous Grades</Typography>
								<Typography color="text.secondary" variant="body2">
									Content and wording scores from your graded summaries.
								</Typography>
							</Stack>
						</Stack>
						<Grid container spacing={3}>
							<Grid xs={12} sm={4}>
								<StatCard label="Average score" value={stats.avg} suffix="/100" />
							</Grid>
							<Grid xs={12} sm={4}>
								<StatCard label="Best score" value={stats.best} suffix="/100" />
							</Grid>
							<Grid xs={12} sm={4}>
								<StatCard label="Assignments graded" value={stats.graded} />
							</Grid>
						</Grid>
						<ScoreTrendChart rows={data} />
						<AssignmentSearch value={search} onChange={handleSearchChange} />
						<PreviousAssignmentTable
							count={filtered.length}
							items={rows}
							onPageChange={handlePageChange}
							onRowsPerPageChange={handleRowsPerPageChange}
							page={page}
							rowsPerPage={rowsPerPage}
							sort={sort}
							onSort={handleSort}
							remarks={remarks}
						/>
					</Stack>
				</Container>
			</Box>
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getStaticProps = async () => {
	return {
		props: {
			history: getStudentHistory(1),
		},
	};
};

export default Page;
