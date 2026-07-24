import PropTypes from "prop-types";
import NextLink from "next/link";
import {
	Avatar,
	Box,
	Card,
	CardContent,
	CardHeader,
	Skeleton,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Scrollbar } from "src/components/scrollbar";
import { scorePalette } from "src/utils/score-buckets";

function initials(name) {
	return name
		.split(/\s+/)
		.map((p) => p[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

// Resolve the canonical score band (85/70/55, see src/utils/score-buckets)
// to a concrete theme colour — alpha() needs a real value, not a
// "success.main" token.
function colorForScore(score, theme) {
	if (score === null || score === undefined) return null;
	return theme.palette[scorePalette(score)].main;
}

function intensity(score) {
	if (score === null) return 0;
	return Math.min(1, Math.max(0.25, score / 100));
}

const CELL = 44;
const ROW_NAME = 180;

export const CohortHeatmap = ({ matrix, loading, onCellClick, sx }) => {
	const theme = useTheme();

	const columns = matrix?.columns || [];
	const rows = matrix?.rows || [];

	return (
		<Card sx={sx}>
			<CardHeader
				title="Cohort heatmap"
				subheader="Average score per student × assignment. Hover for detail, click to open the student profile."
			/>
			<CardContent sx={{ pt: 0 }}>
				{loading ? (
					<Stack spacing={1}>
						{[0, 1, 2, 3, 4].map((i) => (
							<Skeleton key={i} variant="rounded" height={CELL} />
						))}
					</Stack>
				) : rows.length === 0 ? (
					<Typography color="text.secondary" variant="body2" sx={{ py: 4 }}>
						No enrolled students yet.
					</Typography>
				) : (
					<Scrollbar>
						<Box sx={{ minWidth: ROW_NAME + (columns.length + 1) * CELL + 24 }}>
							{/* Diagonal headers: full labels fit above 44px columns,
							    instead of truncating to an ambiguous "The…". */}
							<Stack direction="row" sx={{ mb: 1, height: 72 }} alignItems="flex-end">
								<Box sx={{ width: ROW_NAME }} />
								{columns.map((col) => (
									<Tooltip
										key={col.id}
										title={`${col.label} — open analysis`}
										arrow
									>
										<Box
											sx={{
												width: CELL,
												height: "100%",
												position: "relative",
											}}
										>
											<Typography
												component={NextLink}
												href={`/assignments/${col.id}`}
												aria-label={`Open ${col.label} analysis`}
												variant="caption"
												color="text.secondary"
												sx={{
													fontWeight: 600,
													position: "absolute",
													bottom: 2,
													left: CELL / 2 - 4,
													transform: "rotate(-45deg)",
													transformOrigin: "0 50%",
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
													maxWidth: 92,
													textDecoration: "none",
													"&:hover": { color: "primary.main" },
													"&:focus-visible": {
														outline: `2px solid ${theme.palette.primary.main}`,
														outlineOffset: 1,
													},
												}}
											>
												{col.label}
											</Typography>
										</Box>
									</Tooltip>
								))}
								<Box
									sx={{
										width: CELL,
										textAlign: "center",
										px: 0.5,
									}}
								>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ fontWeight: 700 }}
									>
										Avg
									</Typography>
								</Box>
							</Stack>

							<Stack spacing={0.5}>
								{rows.map((row) => (
									<Stack
										key={row.studentId}
										direction="row"
										alignItems="center"
										sx={{
											borderRadius: 1,
											"&:hover": {
												backgroundColor: alpha(theme.palette.primary.main, 0.04),
											},
										}}
									>
										<Box
											role={onCellClick ? "button" : undefined}
											tabIndex={onCellClick ? 0 : undefined}
											aria-label={
												onCellClick ? `Open ${row.student}'s profile` : undefined
											}
											sx={{
												width: ROW_NAME,
												display: "flex",
												alignItems: "center",
												gap: 1.25,
												pr: 1,
												borderRadius: 1,
												cursor:
													typeof onCellClick === "function" ? "pointer" : "default",
												"&:focus-visible": {
													outline: `2px solid ${theme.palette.primary.main}`,
													outlineOffset: 1,
												},
											}}
											onClick={() =>
												typeof onCellClick === "function" &&
												onCellClick(row.studentId)
											}
											onKeyDown={(e) => {
												if (
													typeof onCellClick === "function" &&
													(e.key === "Enter" || e.key === " ")
												) {
													e.preventDefault();
													onCellClick(row.studentId);
												}
											}}
										>
											<Avatar
												sx={{
													width: 28,
													height: 28,
													fontSize: 11,
													fontWeight: 700,
													backgroundColor: alpha(
														theme.palette.primary.main,
														0.15
													),
													color: theme.palette.primary.main,
												}}
											>
												{initials(row.student)}
											</Avatar>
											<Typography
												variant="body2"
												sx={{
													fontWeight: 500,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{row.student}
											</Typography>
										</Box>
										{row.cells.map((cell, idx) => {
											const color = colorForScore(cell.score, theme);
											const op = intensity(cell.score);
											const isMissing = cell.score === null;
											const tooltipLabel = isMissing
												? `${columns[idx].label}: not submitted`
												: `${columns[idx].label}: ${cell.score}/100`;
											return (
												<Tooltip key={cell.assignmentId} title={tooltipLabel} arrow>
													<Box
														role={onCellClick ? "button" : undefined}
														tabIndex={onCellClick ? 0 : undefined}
														aria-label={
															onCellClick
																? `${row.student} — ${tooltipLabel}`
																: undefined
														}
														onClick={() =>
															typeof onCellClick === "function" &&
															onCellClick(row.studentId)
														}
														onKeyDown={(e) => {
															if (
																typeof onCellClick === "function" &&
																(e.key === "Enter" || e.key === " ")
															) {
																e.preventDefault();
																onCellClick(row.studentId);
															}
														}}
														sx={{
															width: CELL - 4,
															height: CELL - 4,
															mx: 0.25,
															borderRadius: 1,
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															fontSize: 12,
															fontWeight: 700,
															cursor:
																typeof onCellClick === "function"
																	? "pointer"
																	: "default",
															backgroundColor: isMissing
																? alpha(theme.palette.divider, 0.4)
																: alpha(color, op),
															color: isMissing
																? "text.disabled"
																: op > 0.55
																? "common.white"
																: color,
															border: isMissing
																? `1px dashed ${theme.palette.divider}`
																: "1px solid transparent",
															transition: "transform 0.1s",
															"&:hover": {
																transform: "scale(1.08)",
															},
															"&:focus-visible": {
																outline: `2px solid ${theme.palette.primary.main}`,
																outlineOffset: 1,
															},
														}}
													>
														{isMissing ? "—" : cell.score}
													</Box>
												</Tooltip>
											);
										})}
										<Box
											sx={{
												width: CELL - 4,
												height: CELL - 4,
												mx: 0.25,
												borderRadius: 1,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: 13,
												fontWeight: 700,
												backgroundColor: row.avg
													? alpha(colorForScore(row.avg, theme), 0.22)
													: alpha(theme.palette.divider, 0.4),
												color: row.avg
													? colorForScore(row.avg, theme)
													: "text.disabled",
											}}
										>
											{row.avg ?? "—"}
										</Box>
									</Stack>
								))}
							</Stack>

							<Stack
								direction="row"
								spacing={2}
								alignItems="center"
								flexWrap="wrap"
								useFlexGap
								sx={{ mt: 2.5, rowGap: 0.75 }}
							>
								<Typography variant="caption" color="text.secondary">
									Score scale:
								</Typography>
								{[
									{ label: "85-100", color: theme.palette.success.main },
									{ label: "70-84", color: theme.palette.info.main },
									{ label: "55-69", color: theme.palette.warning.main },
									{ label: "<55", color: theme.palette.error.main },
									{ label: "missing", missing: true },
								].map((legend) => (
									<Stack
										key={legend.label}
										direction="row"
										spacing={0.5}
										alignItems="center"
									>
										<Box
											sx={{
												width: 12,
												height: 12,
												borderRadius: 0.6,
												backgroundColor: legend.missing
													? alpha(theme.palette.divider, 0.4)
													: alpha(legend.color, 0.7),
												border: legend.missing
													? `1px dashed ${theme.palette.divider}`
													: "none",
											}}
										/>
										<Typography variant="caption" color="text.secondary">
											{legend.label}
										</Typography>
									</Stack>
								))}
							</Stack>
						</Box>
					</Scrollbar>
				)}
			</CardContent>
		</Card>
	);
};

CohortHeatmap.propTypes = {
	matrix: PropTypes.object,
	loading: PropTypes.bool,
	onCellClick: PropTypes.func,
	sx: PropTypes.object,
};
