import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import NextLink from "next/link";
import SparklesIcon from "@heroicons/react/24/solid/SparklesIcon";
import LightBulbIcon from "@heroicons/react/24/solid/LightBulbIcon";
import ArrowRightIcon from "@heroicons/react/24/solid/ArrowRightIcon";
import {
	Box,
	Button,
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

export const AssignmentInsightPanel = ({
	assignmentId,
	title,
	linkToDetail = false,
	sx,
}) => {
	const theme = useTheme();
	const [insight, setInsight] = useState(null);
	const [loading, setLoading] = useState(false);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		if (!assignmentId) return;
		let cancelled = false;
		setLoading(true);
		setNotFound(false);
		axios
			.get(`/api/dashboard/insights/${assignmentId}`)
			.then((res) => {
				if (!cancelled) setInsight(res.data.insight);
			})
			.catch(() => {
				if (!cancelled) {
					setInsight(null);
					setNotFound(true);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [assignmentId]);

	const accent = theme.palette.secondary.main;

	return (
		<Card sx={sx}>
			<CardHeader
				title={
					<Stack direction="row" spacing={1} alignItems="center">
						<Box
							sx={{
								width: 24,
								height: 24,
								borderRadius: 0.75,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: alpha(accent, 0.18),
								color: accent,
							}}
						>
							<SvgIcon fontSize="small">
								<SparklesIcon />
							</SvgIcon>
						</Box>
						<Typography component="span" variant="h6">AI insights</Typography>
						<Chip
							label="Beta"
							size="small"
							sx={{
								height: 18,
								fontSize: 10,
								fontWeight: 700,
								backgroundColor: alpha(accent, 0.18),
								color: accent,
							}}
						/>
					</Stack>
				}
				subheader={title ? `For: ${title}` : null}
				action={
					linkToDetail && assignmentId ? (
						<Button
							component={NextLink}
							href={`/assignments/${assignmentId}`}
							size="small"
							sx={{ textTransform: "none", mt: 0.5 }}
							endIcon={
								<SvgIcon fontSize="small">
									<ArrowRightIcon />
								</SvgIcon>
							}
						>
							Full analysis
						</Button>
					) : null
				}
			/>
			<CardContent sx={{ pt: 0 }}>
				{loading || (!insight && !notFound) ? (
					<Stack spacing={1.5}>
						<Skeleton variant="rounded" height={62} />
						<Skeleton variant="rounded" height={28} />
						<Skeleton variant="rounded" height={28} />
						<Skeleton variant="rounded" height={28} />
					</Stack>
				) : notFound || !insight ? (
					<Typography
						color="text.secondary"
						variant="body2"
						sx={{ py: 3, textAlign: "center" }}
					>
						No AI insights are available for this assignment yet.
					</Typography>
				) : (
					<Stack spacing={2}>
						<Box
							sx={{
								p: 1.5,
								borderRadius: 1.5,
								border: `1px solid ${alpha(accent, 0.25)}`,
								backgroundColor: alpha(accent, 0.06),
							}}
						>
							<Typography variant="body2">{insight.summary}</Typography>
							{insight.topGap && (
								<Typography
									variant="caption"
									sx={{
										display: "block",
										mt: 1,
										fontWeight: 600,
										color: accent,
									}}
								>
									Biggest gap: {insight.topGap.error} ·{" "}
									{insight.topGap.label}
								</Typography>
							)}
						</Box>

						<Box>
							<Typography
								variant="overline"
								color="text.secondary"
								sx={{ letterSpacing: 1.1 }}
							>
								Common gaps
							</Typography>
							<Stack spacing={0.75} sx={{ mt: 1 }}>
								{insight.commonErrors.map((err) => (
									<Stack
										key={err.error}
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										sx={{
											p: 1,
											pl: 1.5,
											borderRadius: 1,
											backgroundColor: alpha(theme.palette.divider, 0.25),
										}}
									>
										<Typography variant="body2">{err.error}</Typography>
										<Chip
											label={`${err.count} student${err.count > 1 ? "s" : ""}`}
											size="small"
											sx={{
												height: 20,
												fontSize: 11,
												fontWeight: 600,
												backgroundColor: alpha(theme.palette.warning.main, 0.18),
												color: "warning.main",
											}}
										/>
									</Stack>
								))}
							</Stack>
						</Box>

						<Box
							sx={{
								p: 1.5,
								borderRadius: 1.5,
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
										width: 24,
										height: 24,
										borderRadius: 0.75,
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
										sx={{ letterSpacing: 1.1, color: "success.main" }}
									>
										Suggested next step
									</Typography>
									<Typography variant="body2" sx={{ mt: 0.25 }}>
										{insight.suggestion}
									</Typography>
								</Box>
							</Stack>
						</Box>
					</Stack>
				)}
			</CardContent>
		</Card>
	);
};

AssignmentInsightPanel.propTypes = {
	assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	title: PropTypes.string,
	sx: PropTypes.object,
};
