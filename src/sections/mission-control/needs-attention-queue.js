import PropTypes from "prop-types";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Skeleton,
	Stack,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Scrollbar } from "src/components/scrollbar";
import { useSnackbar } from "src/contexts/snackbar-context";

const severityMap = {
	high: { color: "error.main", label: "High" },
	medium: { color: "warning.main", label: "Medium" },
	low: { color: "info.main", label: "Low" },
};

function initials(name) {
	return name
		.split(/\s+/)
		.map((p) => p[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export const NeedsAttentionQueue = ({ items = [], loading, onStudentClick, sx }) => {
	const { show } = useSnackbar();
	const theme = useTheme();
	const highCount = items.filter((i) => i.severity === "high").length;

	return (
		<Card sx={{ ...sx, display: "flex", flexDirection: "column" }}>
			<CardHeader
				title={
					<Stack direction="row" alignItems="center" spacing={1}>
						<Typography component="span" variant="h6">Needs attention</Typography>
						{!loading && items.length > 0 && (
							<Chip
								size="small"
								label={items.length}
								sx={{
									height: 20,
									fontWeight: 700,
									backgroundColor: highCount
										? alpha(theme.palette.error.main, 0.15)
										: alpha(theme.palette.warning.main, 0.15),
									color: highCount ? "error.main" : "warning.main",
								}}
							/>
						)}
					</Stack>
				}
				subheader={
					loading
						? "Scanning the cohort…"
						: items.length === 0
						? "Everyone is on track this week"
						: `${highCount} high priority`
				}
			/>
			<Box sx={{ flex: 1, position: "relative", minHeight: 320 }}>
				<Scrollbar sx={{ position: "absolute", inset: 0 }}>
					<CardContent sx={{ pt: 0 }}>
						{loading ? (
							<Stack spacing={1.5}>
								{[0, 1, 2].map((i) => (
									<Skeleton key={i} variant="rounded" height={68} />
								))}
							</Stack>
						) : items.length === 0 ? (
							<Stack spacing={1} alignItems="center" sx={{ py: 4 }}>
								<Typography variant="body2" color="text.secondary">
									Nothing to flag right now.
								</Typography>
							</Stack>
						) : (
							<Stack spacing={1.25}>
								{items.map((item) => {
									const sev = severityMap[item.severity] || severityMap.medium;
									const [palKey, palShade] = sev.color.split(".");
									const accent =
										theme.palette[palKey]?.[palShade] || theme.palette.warning.main;
									const clickable = typeof onStudentClick === "function";
									return (
										<Box
											key={`${item.studentId}-${item.reason}`}
											role={clickable ? "button" : undefined}
											tabIndex={clickable ? 0 : undefined}
											aria-label={
												clickable
													? `Open ${item.student}'s profile`
													: undefined
											}
											sx={{
												p: 1.5,
												borderRadius: 1.5,
												border: `1px solid ${alpha(accent, 0.25)}`,
												backgroundColor: alpha(accent, 0.06),
												cursor: clickable ? "pointer" : "default",
												transition: "all 0.15s",
												"&:hover": clickable
													? {
															backgroundColor: alpha(accent, 0.1),
															borderColor: alpha(accent, 0.4),
													  }
													: {},
												"&:focus-visible": {
													outline: `2px solid ${theme.palette.primary.main}`,
													outlineOffset: 1,
												},
											}}
											onClick={() =>
												clickable && onStudentClick(item.studentId)
											}
											onKeyDown={(e) => {
												if (
													clickable &&
													(e.key === "Enter" || e.key === " ")
												) {
													e.preventDefault();
													onStudentClick(item.studentId);
												}
											}}
										>
											<Stack direction="row" spacing={1.5} alignItems="center">
												<Avatar
													sx={{
														width: 36,
														height: 36,
														backgroundColor: alpha(accent, 0.18),
														color: accent,
														fontSize: 13,
														fontWeight: 700,
													}}
												>
													{initials(item.student)}
												</Avatar>
												<Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.5}>
													<Stack
														direction="row"
														alignItems="center"
														justifyContent="space-between"
														spacing={1}
													>
														<Typography
															variant="subtitle2"
															noWrap
															sx={{ fontWeight: 600, minWidth: 0 }}
														>
															{item.student}
														</Typography>
														<Button
															size="small"
															variant="text"
															sx={{
																minWidth: 0,
																flexShrink: 0,
																whiteSpace: "nowrap",
																color: accent,
																fontWeight: 600,
																textTransform: "none",
																"&:hover": {
																	backgroundColor: alpha(accent, 0.1),
																},
															}}
															onClick={(e) => {
																e.stopPropagation();
																show(
																	`${item.action} — noted for ${item.student}.`,
																	"success"
																);
															}}
														>
															{item.action}
														</Button>
													</Stack>
													<Stack
														direction="row"
														alignItems="center"
														spacing={1}
														sx={{ minWidth: 0 }}
													>
														<Chip
															size="small"
															label={item.reason}
															sx={{
																height: 18,
																fontSize: 10,
																fontWeight: 600,
																flexShrink: 0,
																backgroundColor: alpha(accent, 0.18),
																color: accent,
															}}
														/>
														<Typography
															variant="caption"
															color="text.secondary"
															noWrap
															title={item.detail}
														>
															{item.detail}
														</Typography>
													</Stack>
												</Stack>
											</Stack>
										</Box>
									);
								})}
							</Stack>
						)}
					</CardContent>
				</Scrollbar>
			</Box>
		</Card>
	);
};

NeedsAttentionQueue.propTypes = {
	items: PropTypes.array,
	loading: PropTypes.bool,
	onStudentClick: PropTypes.func,
	sx: PropTypes.object,
};
