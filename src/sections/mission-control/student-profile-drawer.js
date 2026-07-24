import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import axios from "axios";
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import LightBulbIcon from "@heroicons/react/24/solid/LightBulbIcon";
import ChatBubbleLeftEllipsisIcon from "@heroicons/react/24/solid/ChatBubbleLeftEllipsisIcon";
import ArrowTopRightOnSquareIcon from "@heroicons/react/24/solid/ArrowTopRightOnSquareIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import { useSnackbar } from "src/contexts/snackbar-context";
import { useRemarks } from "src/hooks/use-remarks";
import { SEEDED_REMARKS, remarkId, saveRemark } from "src/demo/remarks";
import {
	Avatar,
	Box,
	Button,
	Chip,
	Divider,
	Drawer,
	IconButton,
	LinearProgress,
	Skeleton,
	Stack,
	SvgIcon,
	TextField,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Chart } from "src/components/chart";
import { Scrollbar } from "src/components/scrollbar";
import { scorePalette } from "src/utils/score-buckets";
import { format } from "date-fns";

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
function scoreColor(score, theme) {
	if (score === null || score === undefined) return theme.palette.text.disabled;
	return theme.palette[scorePalette(score)].main;
}

const useTrajectoryOptions = (theme, categories) => ({
	chart: {
		background: "transparent",
		toolbar: { show: false },
		zoom: { enabled: false },
	},
	colors: [theme.palette.primary.main, theme.palette.warning.main],
	dataLabels: { enabled: false },
	grid: {
		borderColor: theme.palette.divider,
		strokeDashArray: 3,
	},
	legend: {
		position: "top",
		horizontalAlign: "left",
		fontSize: "12px",
		markers: { width: 8, height: 8, radius: 4 },
	},
	stroke: { curve: "smooth", width: [3, 2], dashArray: [0, 4] },
	xaxis: {
		categories,
		labels: {
			style: { colors: theme.palette.text.secondary, fontSize: "11px" },
		},
		axisBorder: { color: theme.palette.divider },
		axisTicks: { color: theme.palette.divider },
	},
	yaxis: {
		min: 0,
		max: 100,
		labels: {
			style: { colors: theme.palette.text.secondary, fontSize: "11px" },
		},
	},
	tooltip: { theme: theme.palette.mode },
	theme: { mode: theme.palette.mode },
	markers: { size: [5, 3], strokeWidth: 0 },
});

export const StudentProfileDrawer = ({ studentId, open, onClose }) => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [notFound, setNotFound] = useState(false);
	// Which submission's remark composer is open, and its unsaved text.
	const [editingKey, setEditingKey] = useState(null);
	const [draft, setDraft] = useState("");
	// The fixture remarks, from the API like the rest of the drawer's data.
	const [remarkSeed, setRemarkSeed] = useState(SEEDED_REMARKS);
	const theme = useTheme();
	const router = useRouter();
	const { show } = useSnackbar();

	// Seed plus anything already written, keyed by (student, assignment).
	const remarks = useRemarks(remarkSeed);

	const closeComposer = () => {
		setEditingKey(null);
		setDraft("");
	};

	const openComposer = (assignmentId) => {
		const key = remarkId(studentId, assignmentId);
		setEditingKey(key);
		setDraft(remarks.get(key)?.text ?? "");
	};

	const handleSaveRemark = (assignmentId) => {
		const saved = saveRemark({
			studentId,
			assignmentId,
			text: draft,
		});
		// Blank remarks are refused by the store rather than wiping feedback
		// the student may already have read.
		if (!saved) return;
		closeComposer();
		const name = profile?.student?.firstName;
		show(name ? `Remark saved for ${name}.` : "Remark saved.", "success");
	};

	// The submission a teacher most likely wants to comment on.
	const latestSubmission = profile?.submissions?.find((s) => s.isSubmitted);

	useEffect(() => {
		closeComposer();
		if (!open || !studentId) {
			setProfile(null);
			setNotFound(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		setNotFound(false);
		axios
			.get(`/api/students/${studentId}/profile`)
			.then((res) => {
				if (!cancelled) setProfile(res.data.profile);
			})
			.catch((err) => {
				if (!cancelled) {
					console.error("Failed to load profile", err);
					setNotFound(true);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		// Remarks are a separate, non-blocking read: the profile should still
		// render if this fails, falling back to the bundled fixtures.
		axios
			.get(`/api/remarks?studentId=${studentId}`)
			.then((res) => {
				if (!cancelled && Array.isArray(res.data?.remarks)) {
					setRemarkSeed(res.data.remarks);
				}
			})
			.catch(() => {
				if (!cancelled) setRemarkSeed(SEEDED_REMARKS);
			});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [studentId, open]);

	const trajectoryCategories =
		profile?.trajectory?.map((p) => p.label) ||
		profile?.assignmentLabels ||
		[];
	const trajectorySeries = profile
		? [
				{
					name: "This student",
					data: profile.trajectory.map((p) => p.avg),
				},
				{
					name: "Class average",
					data: profile.classAvgs.slice(0, profile.trajectory.length),
				},
		  ]
		: [];

	const chartOptions = useTrajectoryOptions(theme, trajectoryCategories);

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: "100%", sm: 460 },
					maxWidth: "100%",
				},
			}}
		>
			<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
				<Box
					sx={{
						p: 3,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						borderBottom: `1px solid ${theme.palette.divider}`,
					}}
				>
					<Typography variant="overline" sx={{ letterSpacing: 1.2 }}>
						Student profile
					</Typography>
					<IconButton onClick={onClose} size="small" aria-label="Close profile">
						<SvgIcon fontSize="small">
							<XMarkIcon />
						</SvgIcon>
					</IconButton>
				</Box>

				<Scrollbar sx={{ flex: 1 }}>
					<Box sx={{ p: 3 }}>
						{loading || (!profile && !notFound) ? (
							<Stack spacing={3}>
								<Stack direction="row" spacing={2} alignItems="center">
									<Skeleton variant="circular" width={64} height={64} />
									<Stack sx={{ flex: 1 }} spacing={1}>
										<Skeleton width="60%" height={28} />
										<Skeleton width="40%" height={18} />
									</Stack>
								</Stack>
								<Skeleton variant="rounded" height={120} />
								<Skeleton variant="rounded" height={220} />
								<Skeleton variant="rounded" height={140} />
							</Stack>
						) : notFound || !profile ? (
							<Stack
								spacing={1.5}
								alignItems="center"
								sx={{ py: 8, textAlign: "center" }}
							>
								<Box
									sx={{
										width: 56,
										height: 56,
										borderRadius: "50%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: alpha(theme.palette.text.primary, 0.06),
										color: "text.secondary",
									}}
								>
									<SvgIcon>
										<UserIcon />
									</SvgIcon>
								</Box>
								<Typography variant="subtitle1">
									No detailed profile yet
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ maxWidth: 280 }}
								>
									This student hasn’t accumulated graded summaries yet. Their
									profile will populate once they submit work.
								</Typography>
							</Stack>
						) : (
							<>
								<Stack direction="row" spacing={2.5} alignItems="center">
									<Avatar
										sx={{
											width: 64,
											height: 64,
											fontSize: 24,
											fontWeight: 700,
											backgroundColor: alpha(theme.palette.primary.main, 0.2),
											color: theme.palette.primary.main,
										}}
									>
										{initials(
											`${profile.student.firstName} ${profile.student.lastName}`
										)}
									</Avatar>
									<Stack sx={{ flex: 1, minWidth: 0 }}>
										<Typography variant="h5" sx={{ fontWeight: 700 }}>
											{profile.student.firstName} {profile.student.lastName}
										</Typography>
										<Typography variant="body2" color="text.secondary" noWrap>
											{profile.student.email}
										</Typography>
										<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
											<Chip
												label={`Grade ${profile.student.grade}`}
												size="small"
												sx={{
													height: 20,
													backgroundColor: alpha(
														theme.palette.primary.main,
														0.15
													),
													color: theme.palette.primary.main,
													fontWeight: 600,
												}}
											/>
											{!profile.student.enrolled && (
												<Chip
													label="Not enrolled"
													size="small"
													sx={{
														height: 20,
														backgroundColor: alpha(
															theme.palette.warning.main,
															0.15
														),
														color: theme.palette.warning.main,
													}}
												/>
											)}
										</Stack>
									</Stack>
								</Stack>

								<Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
									<StatTile
										label="Overall avg"
										value={
											profile.overallAvg != null ? `${profile.overallAvg}` : "—"
										}
										suffix={profile.overallAvg != null ? "/100" : ""}
										color={scoreColor(profile.overallAvg, theme)}
									/>
									<StatTile
										label="Submitted"
										value={profile.submittedCount}
										suffix={`/${profile.submittedCount + profile.missingCount}`}
										color={theme.palette.info.main}
									/>
									<StatTile
										label="Missing"
										value={profile.missingCount}
										color={
											profile.missingCount > 0
												? theme.palette.warning.main
												: theme.palette.success.main
										}
									/>
								</Stack>

								<Box
									sx={{
										mt: 3,
										p: 2,
										borderRadius: 2,
										border: `1px solid ${alpha(
											theme.palette.success.main,
											0.25
										)}`,
										backgroundColor: alpha(theme.palette.success.main, 0.06),
									}}
								>
									<Stack direction="row" spacing={1.5}>
										<Box
											sx={{
												width: 32,
												height: 32,
												borderRadius: 1,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												backgroundColor: alpha(
													theme.palette.success.main,
													0.18
												),
												color: theme.palette.success.main,
												flexShrink: 0,
											}}
										>
											<SvgIcon fontSize="small">
												<LightBulbIcon />
											</SvgIcon>
										</Box>
										<Box>
											<Typography
												variant="overline"
												sx={{ letterSpacing: 1.2, color: "success.main" }}
											>
												Suggested next step
											</Typography>
											<Typography variant="body2" sx={{ mt: 0.5 }}>
												{profile.suggestion}
											</Typography>
										</Box>
									</Stack>
								</Box>

								{profile.trajectory.length > 0 && (
									<Box sx={{ mt: 3 }}>
										<Typography variant="subtitle2" sx={{ mb: 1 }}>
											Score trajectory
										</Typography>
										<Chart
											type="line"
											height={220}
											options={chartOptions}
											series={trajectorySeries}
										/>
									</Box>
								)}

								<Divider sx={{ my: 3 }} />

								<Typography variant="subtitle2" sx={{ mb: 1.5 }}>
									Submissions
								</Typography>
								<Stack spacing={1}>
									{profile.submissions.map((s) => {
										const c = scoreColor(s.avg, theme);
										const key = remarkId(studentId, s.assignmentId);
										const remark = remarks.get(key);
										const editing = editingKey === key;
										return (
											<Box
												key={s.id}
												sx={{
													p: 1.5,
													borderRadius: 1.5,
													border: `1px solid ${theme.palette.divider}`,
													backgroundColor: alpha(
														theme.palette.background.default,
														0.5
													),
												}}
											>
												<Stack
													direction="row"
													alignItems="center"
													justifyContent="space-between"
													spacing={2}
												>
													<Box sx={{ minWidth: 0 }}>
														<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
															{s.assignmentTitle}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															{s.isSubmitted && s.submittedOn
																? `Submitted ${format(
																		new Date(s.submittedOn),
																		"MMM d, yyyy"
																  )}`
																: "Not submitted"}
														</Typography>
													</Box>
													{s.isSubmitted ? (
														<Stack direction="row" spacing={1} alignItems="center">
															<Box sx={{ textAlign: "right", minWidth: 100 }}>
																<Stack
																	direction="row"
																	spacing={0.5}
																	alignItems="baseline"
																>
																	<Typography
																		variant="caption"
																		color="text.secondary"
																	>
																		C
																	</Typography>
																	<Typography variant="body2">
																		{s.contentScore}
																	</Typography>
																	<Typography
																		variant="caption"
																		color="text.secondary"
																		sx={{ ml: 1 }}
																	>
																		W
																	</Typography>
																	<Typography variant="body2">
																		{s.wordingScore}
																	</Typography>
																</Stack>
																<LinearProgress
																	variant="determinate"
																	value={s.avg}
																	sx={{
																		mt: 0.5,
																		height: 4,
																		borderRadius: 1,
																		backgroundColor: alpha(c, 0.15),
																		"& .MuiLinearProgress-bar": {
																			backgroundColor: c,
																		},
																	}}
																/>
															</Box>
															<Chip
																label={s.avg}
																size="small"
																sx={{
																	fontWeight: 700,
																	minWidth: 40,
																	backgroundColor: alpha(c, 0.18),
																	color: c,
																}}
															/>
														</Stack>
													) : (
														<Chip
															label="Missing"
															size="small"
															sx={{
																backgroundColor: alpha(
																	theme.palette.warning.main,
																	0.15
																),
																color: theme.palette.warning.main,
																fontWeight: 600,
															}}
														/>
													)}
												</Stack>

												{s.isSubmitted && (
													<Box sx={{ mt: 1.25 }}>
														{remark && !editing && (
															<Box
																sx={{
																	p: 1.25,
																	mb: 1,
																	borderRadius: 1,
																	borderLeft: `3px solid ${theme.palette.primary.main}`,
																	backgroundColor: alpha(
																		theme.palette.primary.main,
																		0.07
																	),
																}}
															>
																<Typography
																	variant="overline"
																	sx={{
																		letterSpacing: 1,
																		fontSize: 10,
																		color: "primary.main",
																	}}
																>
																	Your remark
																</Typography>
																<Typography variant="body2">
																	{remark.text}
																</Typography>
															</Box>
														)}

														{editing ? (
															<Stack spacing={1}>
																<TextField
																	autoFocus
																	fullWidth
																	multiline
																	minRows={2}
																	size="small"
																	value={draft}
																	placeholder="What should they work on next?"
																	onChange={(e) => setDraft(e.target.value)}
																	onKeyDown={(e) => {
																		if (e.key === "Escape") {
																			e.stopPropagation();
																			closeComposer();
																		}
																		if (
																			e.key === "Enter" &&
																			(e.metaKey || e.ctrlKey)
																		) {
																			e.preventDefault();
																			handleSaveRemark(s.assignmentId);
																		}
																	}}
																	inputProps={{
																		maxLength: 500,
																		"aria-label": `Remark on ${s.assignmentTitle}`,
																	}}
																/>
																<Stack
																	direction="row"
																	spacing={1}
																	justifyContent="flex-end"
																>
																	<Button
																		size="small"
																		color="inherit"
																		onClick={closeComposer}
																	>
																		Cancel
																	</Button>
																	<Button
																		size="small"
																		variant="contained"
																		disabled={!draft.trim()}
																		onClick={() =>
																			handleSaveRemark(s.assignmentId)
																		}
																	>
																		Save remark
																	</Button>
																</Stack>
															</Stack>
														) : (
															<Button
																size="small"
																color="inherit"
																onClick={() => openComposer(s.assignmentId)}
																// Every row's button reads the same, so name
																// the assignment for anyone browsing by label.
																aria-label={`${
																	remark ? "Edit" : "Add"
																} remark on ${s.assignmentTitle}`}
																startIcon={
																	<SvgIcon fontSize="small">
																		<ChatBubbleLeftEllipsisIcon />
																	</SvgIcon>
																}
																sx={{
																	"&:focus-visible": {
																		outline: `2px solid ${theme.palette.primary.main}`,
																		outlineOffset: 1,
																	},
																}}
															>
																{remark ? "Edit remark" : "Add remark"}
															</Button>
														)}
													</Box>
												)}
											</Box>
										);
									})}
								</Stack>
							</>
						)}
					</Box>
				</Scrollbar>

				<Box
					sx={{
						p: 2,
						borderTop: `1px solid ${theme.palette.divider}`,
						display: "flex",
						gap: 1,
						backgroundColor: alpha(theme.palette.background.default, 0.7),
					}}
				>
					<Button
						fullWidth
						variant="outlined"
						disabled={!latestSubmission}
						startIcon={
							<SvgIcon fontSize="small">
								<ChatBubbleLeftEllipsisIcon />
							</SvgIcon>
						}
						onClick={() => openComposer(latestSubmission.assignmentId)}
					>
						Leave a remark
					</Button>
					<Button
						fullWidth
						variant="contained"
						endIcon={
							<SvgIcon fontSize="small">
								<ArrowTopRightOnSquareIcon />
							</SvgIcon>
						}
						onClick={() => {
							onClose();
							router.push("/students");
						}}
					>
						Full profile
					</Button>
				</Box>
			</Box>
		</Drawer>
	);
};

function StatTile({ label, value, suffix, color }) {
	return (
		<Box
			sx={{
				flex: 1,
				p: 1.5,
				borderRadius: 1.5,
				backgroundColor: (t) => alpha(t.palette.divider, 0.25),
				textAlign: "center",
			}}
		>
			<Typography
				variant="overline"
				color="text.secondary"
				sx={{ letterSpacing: 1, fontSize: 10 }}
			>
				{label}
			</Typography>
			<Stack
				direction="row"
				spacing={0.25}
				justifyContent="center"
				alignItems="baseline"
			>
				<Typography component="p" variant="h6" sx={{ color, fontWeight: 700 }}>
					{value}
				</Typography>
				{suffix && (
					<Typography variant="caption" color="text.secondary">
						{suffix}
					</Typography>
				)}
			</Stack>
		</Box>
	);
}

StatTile.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	suffix: PropTypes.string,
	color: PropTypes.string,
};

StudentProfileDrawer.propTypes = {
	studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};
