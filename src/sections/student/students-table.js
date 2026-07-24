import PropTypes from "prop-types";
import {
	Avatar,
	Box,
	Card,
	Checkbox,
	Chip,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Scrollbar } from "src/components/scrollbar";
import { SortableHeader } from "src/components/sortable-header";
import { getInitials } from "src/utils/get-initials";
import { useStudentDrawer } from "src/contexts/student-drawer-context";

export const StudentsTable = (props) => {
	const {
		count = 0,
		items = [],
		onDeselectAll,
		onDeselectOne,
		onPageChange = () => {},
		onRowsPerPageChange,
		onSelectAll,
		onSelectOne,
		page = 0,
		rowsPerPage = 0,
		selected = [],
		sort = { field: null, dir: "asc" },
		onSort,
	} = props;

	const selectedSome = selected.length > 0 && selected.length < items.length;
	const selectedAll = items.length > 0 && selected.length === items.length;
	const studentDrawer = useStudentDrawer();

	return (
		<Card>
			<Scrollbar>
				<Box sx={{ minWidth: 800 }}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selectedAll}
										indeterminate={selectedSome}
										onChange={(event) => {
											if (event.target.checked) {
												onSelectAll?.();
											} else {
												onDeselectAll?.();
											}
										}}
									/>
								</TableCell>
								<SortableHeader
									field="name"
									label="Name"
									sort={sort}
									onSort={onSort}
								/>
								<SortableHeader
									field="email"
									label="Email"
									sort={sort}
									onSort={onSort}
								/>
								<SortableHeader
									field="grade"
									label="Grade"
									sort={sort}
									onSort={onSort}
								/>
								<SortableHeader
									field="enrolled"
									label="Status"
									sort={sort}
									onSort={onSort}
								/>
								<SortableHeader
									field="location"
									label="Location"
									sort={sort}
									onSort={onSort}
								/>
							</TableRow>
						</TableHead>
						<TableBody>
							{items.map((student) => {
								const isSelected = selected.includes(student.id);
								return (
									<TableRow
										hover
										key={student.id}
										selected={isSelected}
										role="button"
										tabIndex={0}
										aria-label={`Open ${student.name}'s profile`}
										onClick={() => studentDrawer.open(parseInt(student.id, 10))}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												studentDrawer.open(parseInt(student.id, 10));
											}
										}}
										sx={{
											cursor: "pointer",
											"&:hover": {
												backgroundColor: (t) =>
													alpha(t.palette.primary.main, 0.06),
											},
											"&:focus-visible": {
												outline: (t) =>
													`2px solid ${t.palette.primary.main}`,
												outlineOffset: -2,
											},
										}}
									>
										<TableCell
											padding="checkbox"
											onClick={(e) => e.stopPropagation()}
										>
											<Checkbox
												checked={isSelected}
												onChange={(event) => {
													if (event.target.checked) {
														onSelectOne?.(student.id);
													} else {
														onDeselectOne?.(student.id);
													}
												}}
											/>
										</TableCell>
										<TableCell>
											<Stack alignItems="center" direction="row" spacing={2}>
												<Avatar
													sx={{
														width: 32,
														height: 32,
														fontSize: 12,
														bgcolor: (t) =>
															alpha(t.palette.primary.main, 0.15),
														color: "primary.main",
														fontWeight: 700,
													}}
												>
													{getInitials(student.name)}
												</Avatar>
												<Typography variant="subtitle2">
													{student.name}
												</Typography>
											</Stack>
										</TableCell>
										<TableCell>{student.email}</TableCell>
										<TableCell>
											{student.grade != null && (
												<Chip
													label={`Grade ${student.grade}`}
													size="small"
													sx={{ fontWeight: 600 }}
												/>
											)}
										</TableCell>
										<TableCell>
											<Chip
												label={student.enrolled ? "Enrolled" : "Not enrolled"}
												size="small"
												color={student.enrolled ? "success" : "default"}
												variant={student.enrolled ? "filled" : "outlined"}
												sx={{ fontWeight: 600 }}
											/>
										</TableCell>
										{/* Rows can come from persisted demo data, so a record
										    missing its address must not white-screen the page. */}
										<TableCell>
											{[student.address?.city, student.address?.state]
												.filter(Boolean)
												.join(", ")}
										</TableCell>
									</TableRow>
								);
							})}
							{items.length === 0 && (
								<TableRow>
									<TableCell colSpan={6}>
										<Typography
											align="center"
											color="text.secondary"
											sx={{ py: 3 }}
										>
											No students match your search.
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</Box>
			</Scrollbar>
			<TablePagination
				component="div"
				count={count}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
				page={page}
				rowsPerPage={rowsPerPage}
				rowsPerPageOptions={[5, 10, 25]}
			/>
		</Card>
	);
};

StudentsTable.propTypes = {
	count: PropTypes.number,
	items: PropTypes.array,
	onDeselectAll: PropTypes.func,
	onDeselectOne: PropTypes.func,
	onPageChange: PropTypes.func,
	onRowsPerPageChange: PropTypes.func,
	onSelectAll: PropTypes.func,
	onSelectOne: PropTypes.func,
	page: PropTypes.number,
	rowsPerPage: PropTypes.number,
	selected: PropTypes.array,
	sort: PropTypes.shape({
		field: PropTypes.string,
		dir: PropTypes.oneOf(["asc", "desc"]),
	}),
	onSort: PropTypes.func,
};
