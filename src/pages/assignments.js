import Head from "next/head";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Skeleton,
	Stack,
	SvgIcon,
	Typography,
	Unstable_Grid2 as Grid,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { AssignmentCard } from "src/sections/assignments/assignment-card";
import { AssignmentsSearch } from "src/sections/assignments/assignments-search";
import { CreateAssignmentBtn } from "src/sections/assignments/create-assignment-btn";
import { AddStudentsModal } from "src/sections/assignments/add-students";
import { DeleteAssignmentModal } from "src/sections/assignments/delete-assignment";
import { EditAssignmentModal } from "src/sections/assignments/edit-assignment";
import { useState, useEffect } from "react";
import { ViewAssignmentModal } from "src/sections/assignments/view-assignment";
import { useSnackbar } from "src/contexts/snackbar-context";
import { toCsv } from "src/utils/to-csv";
import { downloadCsv } from "src/utils/download-csv";
import { DEMO_ASSIGNMENTS } from "src/demo/demo-data";
import { ASSIGNMENTS_KEY, mergeOverlay, readOverlay } from "src/demo/local-store";
import { rosterIdsFor } from "src/demo/roster";
import axios from "axios";

function exportAssignmentsCsv(assignments) {
	const header = ["Title", "Prompt", "Students", "Created"];
	const rows = assignments.map((a) => [
		a.title,
		a.description,
		a.studentIds.length,
		a.createdAt,
	]);
	downloadCsv(toCsv([header, ...rows]), "assignments.csv");
}

// API record -> the shape AssignmentCard renders.
const toCardShape = (assignment) => {
	const evalText = assignment.eval_text || {};
	return {
		id: assignment.id,
		createdAt: assignment.created_at
			? new Date(assignment.created_at).toLocaleDateString("en-GB")
			: "",
		description: assignment.question,
		title: evalText.title || assignment.textTitle || "",
		text: evalText.text || "",
		deadline: assignment.deadline,
		// The roster, not the submission count the API reports: the chip on the
		// card and the students modal have to agree, and only the roster is
		// something the visitor can change. `assignment` has already been through
		// mergeOverlay, so a saved roster is on the record by the time we get here.
		studentIds: rosterIdsFor(assignment),
	};
};

const AssignmentCardSkeleton = () => (
	<Card sx={{ height: "100%" }}>
		<CardContent>
			<Skeleton variant="text" width="70%" height={32} />
			<Skeleton variant="text" width="100%" />
			<Skeleton variant="text" width="85%" />
			<Stack direction="row" spacing={1} sx={{ mt: 2 }}>
				<Skeleton variant="rounded" width={72} height={30} />
				<Skeleton variant="rounded" width={72} height={30} />
			</Stack>
		</CardContent>
		<Box sx={{ px: 2, pb: 2 }}>
			<Skeleton variant="text" width="50%" />
		</Box>
	</Card>
);

const Page = () => {
	const { show } = useSnackbar();
	const [assignments, setAssignments] = useState([]);
	const [openStudentsModal, setOpenStudentsModal] = useState(false);
	const [studentsAssignment, setStudentsAssignment] = useState(null);
	const [openViewModal, setOpenViewModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);

	const [viewID, setViewID] = useState(1);
	const [deleteID, setDeleteID] = useState(null);
	const [editAssignment, setEditAssignment] = useState(null);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	// The API serves the fixtures; anything the visitor created, edited or
	// deleted lives in the browser overlay. Merging the two here is what makes
	// those changes outlive the lambda that first handled them.
	//
	// localStorage is read inside this callback rather than during render, so
	// the first client render still matches the server.
	const getAssignments = async () => {
		setLoading(true);
		let served = DEMO_ASSIGNMENTS;
		try {
			const res = await axios.get("/api/assignments");
			if (res.status === 200) served = res.data.assignments;
		} catch (err) {
			// A cold or failing demo API must not take the visitor's own
			// assignments down with it — fall back to the bundled fixtures.
			console.error(err);
		}
		try {
			const merged = mergeOverlay(served, readOverlay(ASSIGNMENTS_KEY));
			setAssignments(merged.map(toCardShape));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getAssignments();
	}, []);

	const q = search.trim().toLowerCase();
	const visibleAssignments = q
		? assignments.filter((a) =>
				[a.title, a.description].join(" ").toLowerCase().includes(q)
		  )
		: assignments;

	const handleImport = () =>
		show("Bulk import is available in the full version.", "info");
	const handleExportAssignments = () => {
		exportAssignmentsCsv(visibleAssignments);
		show("Assignments exported to CSV.", "success");
	};

	return (
		<>
			<Head>
				<title>Assignments | Summary Evaluation System</title>
			</Head>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					py: 8,
				}}
			>
				<Container maxWidth="xl">
					<Stack spacing={3}>
						<Stack direction="row" justifyContent="space-between" spacing={4}>
							<Stack spacing={1}>
								<Typography component="h1" variant="h4">Assignments</Typography>
								<Stack alignItems="center" direction="row" spacing={1}>
									<Button
										color="inherit"
										startIcon={
											<SvgIcon fontSize="small">
												<ArrowUpOnSquareIcon />
											</SvgIcon>
										}
										onClick={handleImport}
									>
										Import
									</Button>
									<Button
										color="inherit"
										startIcon={
											<SvgIcon fontSize="small">
												<ArrowDownOnSquareIcon />
											</SvgIcon>
										}
										onClick={handleExportAssignments}
									>
										Export
									</Button>
								</Stack>
							</Stack>
							<div>
								<CreateAssignmentBtn getAssignments={getAssignments} />
							</div>
						</Stack>
						<AssignmentsSearch
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						{loading ? (
							<Grid container spacing={3}>
								{[0, 1, 2, 3, 4, 5].map((i) => (
									<Grid xs={12} md={6} lg={4} key={i}>
										<AssignmentCardSkeleton />
									</Grid>
								))}
							</Grid>
						) : visibleAssignments.length === 0 ? (
							<Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
								{assignments.length === 0
									? "No assignments yet. Create one to get started."
									: "No assignments match your search."}
							</Typography>
						) : (
							<Grid container spacing={3}>
								{visibleAssignments.map((assignment) => (
									<Grid xs={12} md={6} lg={4} key={assignment.id}>
										<AssignmentCard
											assignment={assignment}
											setOpenStudentsModal={setOpenStudentsModal}
											setStudentsAssignment={setStudentsAssignment}
											setOpenDeleteModal={setOpenDeleteModal}
											setDeleteID={setDeleteID}
											setViewID={setViewID}
											setOpenViewModal={setOpenViewModal}
											setEditAssignment={setEditAssignment}
											setOpenEditModal={setOpenEditModal}
										/>
									</Grid>
								))}
							</Grid>
						)}
					</Stack>
				</Container>
				<AddStudentsModal
					assignment={studentsAssignment}
					openStudentsModal={openStudentsModal}
					setOpenStudentsModal={setOpenStudentsModal}
					getAssignments={getAssignments}
				/>
				<DeleteAssignmentModal
					openDeleteModal={openDeleteModal}
					setOpenDeleteModal={setOpenDeleteModal}
					deleteID={deleteID}
					getAssignments={getAssignments}
				/>
				<ViewAssignmentModal
					viewID={viewID}
					openViewModal={openViewModal}
					setOpenViewModal={setOpenViewModal}
				/>
				<EditAssignmentModal
					assignment={editAssignment}
					open={openEditModal}
					setOpen={setOpenEditModal}
					getAssignments={getAssignments}
				/>
			</Box>
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
