import PropTypes from "prop-types";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon";
import StarIcon from "@heroicons/react/24/solid/StarIcon";
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Skeleton,
	Stack,
	SvgIcon,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Scrollbar } from "src/components/scrollbar";
import { formatDistanceToNowStrict } from "date-fns";

const typeConfig = {
	submission: { color: "primary.main", icon: CheckCircleIcon, label: "Submitted" },
	highlight: { color: "success.main", icon: StarIcon, label: "Highlight" },
	alert: { color: "warning.main", icon: ExclamationTriangleIcon, label: "Needs review" },
};

export const ActivityFeed = ({ events = [], loading, onStudentClick, sx }) => {
	const theme = useTheme();

	return (
		<Card sx={{ ...sx, display: "flex", flexDirection: "column" }}>
			<CardHeader
				title="Live activity"
				subheader="Submissions and alerts across the class"
			/>
			<Box sx={{ flex: 1, position: "relative", minHeight: 320 }}>
				<Scrollbar sx={{ position: "absolute", inset: 0 }}>
					<CardContent sx={{ pt: 0 }}>
						{loading ? (
							<Stack spacing={2}>
								{[0, 1, 2, 3].map((i) => (
									<Stack key={i} direction="row" spacing={2} alignItems="center">
										<Skeleton variant="circular" width={32} height={32} />
										<Stack sx={{ flex: 1 }}>
											<Skeleton width="60%" height={18} />
											<Skeleton width="80%" height={14} />
										</Stack>
									</Stack>
								))}
							</Stack>
						) : events.length === 0 ? (
							<Typography color="text.secondary" variant="body2" sx={{ py: 4 }}>
								No activity yet.
							</Typography>
						) : (
							<Stack spacing={0}>
								{events.map((event, idx) => {
									const cfg = typeConfig[event.type] || typeConfig.submission;
									const [palKey, palShade] = cfg.color.split(".");
									const accent =
										theme.palette[palKey]?.[palShade] || theme.palette.primary.main;
									const Icon = cfg.icon;
									const ago = event.ts
										? formatDistanceToNowStrict(new Date(event.ts), {
												addSuffix: true,
										  })
										: "";
									const last = idx === events.length - 1;
									const clickable = typeof onStudentClick === "function";

									return (
										<Stack
											key={event.id}
											direction="row"
											spacing={2}
											role={clickable ? "button" : undefined}
											tabIndex={clickable ? 0 : undefined}
											aria-label={
												clickable
													? `View ${event.student}'s profile`
													: undefined
											}
											sx={{
												position: "relative",
												pb: last ? 0 : 2.5,
												pt: idx === 0 ? 1.5 : 0,
												borderRadius: 1,
												cursor: clickable ? "pointer" : "default",
												"&:hover": clickable
													? { "& .ev-msg": { color: "primary.main" } }
													: {},
												"&:focus-visible": clickable
													? {
															outline: (t) =>
																`2px solid ${t.palette.primary.main}`,
															outlineOffset: 2,
													  }
													: {},
											}}
											onClick={() =>
												clickable && onStudentClick(event.studentId)
											}
											onKeyDown={(e) => {
												if (
													clickable &&
													(e.key === "Enter" || e.key === " ")
												) {
													e.preventDefault();
													onStudentClick(event.studentId);
												}
											}}
										>
											{!last && (
												<Box
													sx={{
														position: "absolute",
														left: 15,
														top: 32,
														bottom: 0,
														width: "1px",
														backgroundColor: "divider",
													}}
												/>
											)}
											<Box
												sx={{
													width: 32,
													height: 32,
													borderRadius: "50%",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													backgroundColor: alpha(accent, 0.18),
													color: accent,
													flexShrink: 0,
													zIndex: 1,
												}}
											>
												<SvgIcon fontSize="small">
													<Icon />
												</SvgIcon>
											</Box>
											<Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.25}>
												<Stack
													direction="row"
													alignItems="center"
													spacing={1}
													flexWrap="wrap"
												>
													<Typography
														variant="subtitle2"
														className="ev-msg"
														sx={{
															fontWeight: 600,
															transition: "color 0.15s",
														}}
													>
														{event.student}
													</Typography>
													<Chip
														label={event.assignment}
														size="small"
														sx={{
															height: 18,
															fontSize: 10.5,
															backgroundColor: alpha(accent, 0.12),
															color: accent,
														}}
													/>
												</Stack>
												<Typography variant="body2" color="text.secondary">
													{event.message}
												</Typography>
												<Typography variant="caption" color="text.disabled">
													{ago}
												</Typography>
											</Stack>
										</Stack>
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

ActivityFeed.propTypes = {
	events: PropTypes.array,
	loading: PropTypes.bool,
	onStudentClick: PropTypes.func,
	sx: PropTypes.object,
};
