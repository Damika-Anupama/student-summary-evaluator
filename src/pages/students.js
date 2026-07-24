import { useCallback, useMemo, useRef, useState } from "react";
import Head from "next/head";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import {
	Box,
	Button,
	Card,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	Stack,
	SvgIcon,
	TextField,
	Typography,
	Unstable_Grid2 as Grid,
} from "@mui/material";
import { useSnackbar } from "src/contexts/snackbar-context";

function exportStudentsCsv(students) {
	const header = ["Name", "Email", "Grade", "Status", "City", "State"];
	const rows = students.map((s) => [
		s.name,
		s.email,
		s.grade != null ? `Grade ${s.grade}` : "",
		s.enrolled ? "Enrolled" : "Not enrolled",
		s.address?.city ?? "",
		s.address?.state ?? "",
	]);
	downloadCsv(toCsv([header, ...rows]), "students.csv");
}
import { useSelection } from "src/hooks/use-selection";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StudentsTable } from "src/sections/student/students-table";
import { StudentsSearch } from "src/sections/student/students-search";
import { applyPagination } from "src/utils/apply-pagination";
import { sortStudents } from "src/utils/sort-students";
import { parseStudentsCsv } from "src/utils/parse-students-csv";
import { toCsv } from "src/utils/to-csv";
import { downloadCsv } from "src/utils/download-csv";
import { DEMO_STUDENTS } from "src/demo/demo-data";
import { STUDENTS_KEY, createRecord, mergeOverlay } from "src/demo/local-store";
import { useDemoOverlay } from "src/hooks/use-demo-overlay";

const useStudents = (data, page, rowsPerPage) => {
	return useMemo(() => {
		return applyPagination(data, page, rowsPerPage);
	}, [data, page, rowsPerPage]);
};

const useStudentIds = (students) => {
	return useMemo(() => {
		return students.map((student) => student.id);
	}, [students]);
};

const EMPTY_FORM = { firstName: "", lastName: "", email: "", grade: "10" };

const Page = (props) => {
	const { show } = useSnackbar();
	// getStaticProps re-seeds the roster on every visit, so students added or
	// imported here used to vanish on the next navigation. The overlay holds
	// them instead.
	//
	// No hydration risk: useDemoOverlay renders the empty overlay first, on the
	// server and on the client's first pass alike, so this merge starts out
	// exactly equal to props.students and only then picks up saved additions.
	const overlay = useDemoOverlay(STUDENTS_KEY);
	const allStudents = useMemo(
		() => mergeOverlay(props.students, overlay),
		[props.students, overlay]
	);
	const [search, setSearch] = useState("");
	const [addOpen, setAddOpen] = useState(false);
	const [form, setForm] = useState(EMPTY_FORM);

	const handleExport = useCallback(() => {
		exportStudentsCsv(allStudents);
		show("Students exported to CSV.", "success");
	}, [allStudents, show]);

	const importInputRef = useRef(null);

	const handleImport = useCallback(() => {
		importInputRef.current?.click();
	}, []);

	const handleImportFile = useCallback(
		async (event) => {
			const file = event.target.files?.[0];
			event.target.value = "";
			if (!file) return;
			try {
				const { students: parsed, skipped } = parseStudentsCsv(
					await file.text()
				);
				if (!parsed.length) {
					show(
						"No students found — expected a CSV with a Name column (the exported format works).",
						"error"
					);
					return;
				}
				const stamped = parsed.map((s, i) => ({
					...s,
					id: `import-${Date.now()}-${i}`,
					createdAt: Date.now(),
				}));
				// Written newest-first, so createRecord is applied in reverse.
				for (const student of [...stamped].reverse()) {
					createRecord(STUDENTS_KEY, student);
				}
				setPage(0);
				show(
					`Imported ${stamped.length} student${stamped.length > 1 ? "s" : ""}${
						skipped ? ` (${skipped} row${skipped > 1 ? "s" : ""} skipped)` : ""
					}.`,
					"success"
				);
			} catch {
				show("Could not read that file. Please choose a CSV.", "error");
			}
		},
		[show]
	);

	const handleFormChange = useCallback((event) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}, []);

	const handleAddSubmit = useCallback(() => {
		const first = form.firstName.trim();
		const last = form.lastName.trim();
		if (!first || !last) {
			show("First and last name are required.", "error");
			return;
		}
		const newStudent = {
			id: `new-${Date.now()}`,
			name: `${first} ${last}`,
			email:
				form.email.trim() ||
				`${first}.${last}`.toLowerCase().replace(/\s+/g, "") + "@school.demo",
			grade: form.grade,
			enrolled: true,
			address: { city: "Colombo", state: "Western", country: "Sri Lanka" },
			createdAt: Date.now(),
		};
		createRecord(STUDENTS_KEY, newStudent);
		setForm(EMPTY_FORM);
		setAddOpen(false);
		setPage(0);
		show(`${newStudent.name} added to the roster.`, "success");
	}, [form, show]);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [sort, setSort] = useState({ field: null, dir: "asc" });

	const handleSort = useCallback((field) => {
		setSort((prev) =>
			prev.field === field
				? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
				: { field, dir: "asc" }
		);
		setPage(0);
	}, []);

	const data = useMemo(() => {
		const q = search.trim().toLowerCase();
		const filtered = q
			? allStudents.filter((s) =>
					[s.name, s.email, s.address?.city]
						.join(" ")
						.toLowerCase()
						.includes(q)
			  )
			: allStudents;
		return sort.field
			? sortStudents(filtered, sort.field, sort.dir)
			: filtered;
	}, [allStudents, search, sort]);

	const students = useStudents(data, page, rowsPerPage);
	const studentsIds = useStudentIds(students);
	const studentsSelection = useSelection(studentsIds);

	const handleSearch = useCallback((event) => {
		setSearch(event.target.value);
		setPage(0);
	}, []);

	const handlePageChange = useCallback((event, value) => {
		setPage(value);
	}, []);

	const handleRowsPerPageChange = useCallback((event) => {
		setRowsPerPage(event.target.value);
	}, []);

	const selectedCount = studentsSelection.selected.length;
	const handleExportSelected = useCallback(() => {
		const chosen = allStudents.filter((s) =>
			studentsSelection.selected.includes(s.id)
		);
		if (!chosen.length) return;
		exportStudentsCsv(chosen);
		show(
			`Exported ${chosen.length} selected student${
				chosen.length > 1 ? "s" : ""
			}.`,
			"success"
		);
	}, [allStudents, studentsSelection.selected, show]);

	return (
		<>
			<Head>
				<title>Students | Summary Evaluation System</title>
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
								<Typography component="h1" variant="h4">Students</Typography>
								<Stack alignItems="center" direction="row" spacing={1}>
									<input
										ref={importInputRef}
										type="file"
										accept=".csv,text/csv"
										hidden
										onChange={handleImportFile}
										aria-label="Import students from CSV"
									/>
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
										onClick={handleExport}
									>
										Export
									</Button>
								</Stack>
							</Stack>
							<div>
								<Button
									startIcon={
										<SvgIcon fontSize="small">
											<PlusIcon />
										</SvgIcon>
									}
									variant="contained"
									onClick={() => setAddOpen(true)}
								>
									Add
								</Button>
							</div>
						</Stack>
						<StudentsSearch value={search} onChange={handleSearch} />
						{selectedCount > 0 && (
							<Card
								sx={{
									p: 1.5,
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									bgcolor: "action.selected",
								}}
							>
								<Typography variant="subtitle2">
									{selectedCount} selected
								</Typography>
								<Stack direction="row" spacing={1}>
									<Button
										size="small"
										variant="contained"
										startIcon={
											<SvgIcon fontSize="small">
												<ArrowDownOnSquareIcon />
											</SvgIcon>
										}
										onClick={handleExportSelected}
									>
										Export selected
									</Button>
									<Button
										size="small"
										color="inherit"
										onClick={studentsSelection.handleDeselectAll}
									>
										Clear
									</Button>
								</Stack>
							</Card>
						)}
						<StudentsTable
							count={data.length}
							items={students}
							onDeselectAll={studentsSelection.handleDeselectAll}
							onDeselectOne={studentsSelection.handleDeselectOne}
							onPageChange={handlePageChange}
							onRowsPerPageChange={handleRowsPerPageChange}
							onSelectAll={studentsSelection.handleSelectAll}
							onSelectOne={studentsSelection.handleSelectOne}
							page={page}
							rowsPerPage={rowsPerPage}
							selected={studentsSelection.selected}
							sort={sort}
							onSort={handleSort}
						/>
					</Stack>
				</Container>
			</Box>

			<Dialog
				open={addOpen}
				onClose={() => setAddOpen(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					component: "form",
					onSubmit: (e) => {
						e.preventDefault();
						handleAddSubmit();
					},
				}}
			>
				<DialogTitle>Add student</DialogTitle>
				<DialogContent>
					<Box sx={{ pt: 1 }}>
						<Grid container spacing={2}>
							<Grid xs={12} sm={6}>
								<TextField
									autoFocus
									fullWidth
									required
									label="First name"
									name="firstName"
									value={form.firstName}
									onChange={handleFormChange}
								/>
							</Grid>
							<Grid xs={12} sm={6}>
								<TextField
									fullWidth
									required
									label="Last name"
									name="lastName"
									value={form.lastName}
									onChange={handleFormChange}
								/>
							</Grid>
							<Grid xs={12} sm={8}>
								<TextField
									fullWidth
									label="Email"
									name="email"
									placeholder="Auto-generated if left blank"
									value={form.email}
									onChange={handleFormChange}
								/>
							</Grid>
							<Grid xs={12} sm={4}>
								<TextField
									fullWidth
									select
									label="Grade"
									name="grade"
									value={form.grade}
									onChange={handleFormChange}
								>
									{["8", "9", "10", "11", "12"].map((g) => (
										<MenuItem key={g} value={g}>
											Grade {g}
										</MenuItem>
									))}
								</TextField>
							</Grid>
						</Grid>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button color="inherit" onClick={() => setAddOpen(false)}>
						Cancel
					</Button>
					<Button variant="contained" type="submit">
						Add student
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

const CITIES = [
	{ city: "Colombo", state: "Western" },
	{ city: "Kandy", state: "Central" },
	{ city: "Galle", state: "Southern" },
	{ city: "Negombo", state: "Western" },
	{ city: "Jaffna", state: "Northern" },
];

export const getStaticProps = async () => {
	// Map shared demo students into the table shape used by StudentsTable.
	const students = DEMO_STUDENTS.map((s, i) => {
		const loc = CITIES[i % CITIES.length];
		return {
			id: String(s.id),
			name: `${s.firstName} ${s.lastName}`,
			email: s.email,
			grade: s.grade,
			enrolled: s.enrolled,
			address: { city: loc.city, state: loc.state, country: "Sri Lanka" },
			createdAt: new Date(2025, 0, 10 + i * 5).getTime(),
		};
	});

	return {
		props: { students },
	};
};

export default Page;
