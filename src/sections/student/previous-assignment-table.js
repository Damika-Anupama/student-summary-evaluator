import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import {
	Box,
	Card,
	Chip,
	Collapse,
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
import ChatBubbleLeftEllipsisIcon from "@heroicons/react/24/solid/ChatBubbleLeftEllipsisIcon";
import { Scrollbar } from "src/components/scrollbar";
import { SortableHeader } from "src/components/sortable-header";
import { scorePalette } from "src/utils/score-buckets";
import { remarkId } from "src/demo/remarks";

const scoreColor = (score) => scorePalette(Number(score));

const COLUMN_COUNT = 6;

export const PreviousAssignmentTable = (props) => {
	const {
		count = 0,
		items = [],
		onPageChange = () => {},
		onRowsPerPageChange,
		page = 0,
		rowsPerPage = 0,
		sort = { field: null, dir: "asc" },
		onSort,
		remarks,
	} = props;

	// Only one remark is expanded at a time — they are short, and a single
	// open row keeps the table's rhythm readable.
	const [expanded, setExpanded] = useState(null);

	const remarkFor = (row) =>
		remarks?.get?.(remarkId(row.studentId, row.assignmentId));

	return (
		<Card>
			<Scrollbar>
				<Box sx={{ minWidth: 800 }}>
					<Table>
						<TableHead>
							<TableRow>
								<SortableHeader
									field="assignment"
									label="Assignment"
									sort={sort}
									onSort={onSort}
								/>
								<SortableHeader
									field="submitted"
									label="Submitted"
									sort={sort}
									onSort={onSort}
								/>
								<SortableHeader
									field="content"
									label="Content"
									align="center"
									sort={sort}
									onSort={onSort}
								/>
								<SortableHeader
									field="wording"
									label="Wording"
									align="center"
									sort={sort}
									onSort={onSort}
								/>
								<SortableHeader
									field="overall"
									label="Overall"
									align="center"
									sort={sort}
									onSort={onSort}
								/>
								<TableCell align="center">Teacher</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{items.map((row) => {
								const overall = Math.round(
									(Number(row.content_score) + Number(row.wording_score)) / 2
								);
								const remark = remarkFor(row);
								const panelId = `remark-panel-${row.id}`;
								const isOpen = expanded === row.id;
								return (
									<Fragment key={row.id}>
										<TableRow hover>
											<TableCell>
												<Typography variant="subtitle2">{row.assignment}</Typography>
											</TableCell>
											<TableCell>
												{row.submitted_on
													? format(new Date(row.submitted_on), "dd/MM/yyyy")
													: "—"}
											</TableCell>
											<TableCell align="center">
												<Chip
													size="small"
													color={scoreColor(row.content_score)}
													label={`${row.content_score}%`}
												/>
											</TableCell>
											<TableCell align="center">
												<Chip
													size="small"
													color={scoreColor(row.wording_score)}
													label={`${row.wording_score}%`}
												/>
											</TableCell>
											<TableCell align="center">
												<Typography variant="subtitle2">{overall}%</Typography>
											</TableCell>
											<TableCell align="center">
												{remark ? (
													<Chip
														size="small"
														variant="outlined"
														color="primary"
														label={isOpen ? "Hide remark" : "Remark"}
														aria-expanded={isOpen}
														aria-controls={panelId}
														onClick={() =>
															setExpanded(isOpen ? null : row.id)
														}
														icon={
															<Box
																sx={{ width: 16, height: 16, ml: 0.75 }}
																aria-hidden="true"
															>
																<ChatBubbleLeftEllipsisIcon />
															</Box>
														}
														sx={{
															fontWeight: 600,
															"&:focus-visible": {
																outline: (t) =>
																	`2px solid ${t.palette.primary.main}`,
																outlineOffset: 1,
															},
														}}
													/>
												) : (
													<Typography color="text.secondary" variant="body2">
														—
													</Typography>
												)}
											</TableCell>
										</TableRow>
										{remark && (
											<TableRow>
												<TableCell
													colSpan={COLUMN_COUNT}
													sx={{ py: 0, border: 0 }}
												>
													<Collapse in={isOpen} timeout="auto" unmountOnExit>
														<Box
															id={panelId}
															sx={{
																my: 1.5,
																p: 2,
																borderRadius: 1,
																borderLeft: (t) =>
																	`3px solid ${t.palette.primary.main}`,
																backgroundColor: (t) =>
																	alpha(t.palette.primary.main, 0.07),
															}}
														>
															<Stack spacing={0.5}>
																<Typography
																	variant="overline"
																	sx={{
																		letterSpacing: 1,
																		fontSize: 10,
																		color: "primary.main",
																	}}
																>
																	Feedback from {remark.author}
																</Typography>
																<Typography variant="body2">
																	{remark.text}
																</Typography>
															</Stack>
														</Box>
													</Collapse>
												</TableCell>
											</TableRow>
										)}
									</Fragment>
								);
							})}
							{items.length === 0 && (
								<TableRow>
									<TableCell colSpan={COLUMN_COUNT}>
										<Typography align="center" color="text.secondary" sx={{ py: 3 }}>
											No graded summaries yet.
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

PreviousAssignmentTable.propTypes = {
	count: PropTypes.number,
	items: PropTypes.array,
	onPageChange: PropTypes.func,
	onRowsPerPageChange: PropTypes.func,
	page: PropTypes.number,
	rowsPerPage: PropTypes.number,
	sort: PropTypes.shape({
		field: PropTypes.string,
		dir: PropTypes.oneOf(["asc", "desc"]),
	}),
	onSort: PropTypes.func,
	// Map of `${studentId}:${assignmentId}` → remark, from useRemarks().
	remarks: PropTypes.instanceOf(Map),
};
