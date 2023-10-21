import PropTypes from "prop-types";
import { format } from "date-fns";
import {
	Avatar,
	Box,
	Card,
	Checkbox,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from "@mui/material";
import { Scrollbar } from "src/components/scrollbar";
import { getInitials } from "src/utils/get-initials";

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
	} = props;

	const selectedSome = selected.length > 0 && selected.length < items.length;
	const selectedAll = items.length > 0 && selected.length === items.length;

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
								<TableCell>Name</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>Location</TableCell>
								<TableCell>Phone</TableCell>
								{/* <TableCell>Signed Up</TableCell> */}
							</TableRow>
						</TableHead>
						<TableBody>
							{items.map((student) => {
								const isSelected = selected.includes(student.id);
								const createdAt = format(student.createdAt, "dd/MM/yyyy");

								return (
									<TableRow hover key={student.id} selected={isSelected}>
										<TableCell padding="checkbox">
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
												{/* <Avatar src={student.avatar}>
													{getInitials(student.name)}
												</Avatar> */}
												<Typography variant="subtitle2">
													{student.name}
												</Typography>
											</Stack>
										</TableCell>
										<TableCell>{student.email}</TableCell>
										<TableCell>
											{student.address.city}, {student.address.state},{" "}
											{student.address.country}
										</TableCell>
										<TableCell>{student.phone}</TableCell>
										{/* <TableCell>{createdAt}</TableCell> */}
									</TableRow>
								);
							})}
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
};
