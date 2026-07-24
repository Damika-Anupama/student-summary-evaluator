import PropTypes from "prop-types";
import SparklesIcon from "@heroicons/react/24/solid/SparklesIcon";
import ArrowTrendingUpIcon from "@heroicons/react/24/solid/ArrowTrendingUpIcon";
import ArrowTrendingDownIcon from "@heroicons/react/24/solid/ArrowTrendingDownIcon";
import InformationCircleIcon from "@heroicons/react/24/solid/InformationCircleIcon";
import {
	Box,
	Card,
	CardContent,
	Chip,
	Skeleton,
	Stack,
	SvgIcon,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { formatDistanceToNowStrict } from "date-fns";

const toneConfig = {
	positive: {
		color: "success.main",
		icon: ArrowTrendingUpIcon,
	},
	warning: {
		color: "warning.main",
		icon: ArrowTrendingDownIcon,
	},
	neutral: {
		color: "info.main",
		icon: InformationCircleIcon,
	},
};

export const SmartSummaryCard = ({ summary, loading, sx }) => {
	const theme = useTheme();
	const accent = theme.palette.primary.main;

	const headerBg = `linear-gradient(135deg, ${alpha(accent, 0.18)} 0%, ${alpha(
		theme.palette.secondary.main,
		0.12
	)} 100%)`;

	if (loading) {
		return (
			<Card sx={sx}>
				<CardContent sx={{ p: 4 }}>
					<Stack spacing={2}>
						<Skeleton width={140} height={24} />
						<Skeleton width="60%" height={40} />
						<Skeleton width="40%" height={24} />
						<Skeleton variant="rounded" height={80} />
					</Stack>
				</CardContent>
			</Card>
		);
	}

	if (!summary) {
		return (
			<Card sx={sx}>
				<CardContent sx={{ p: 4 }}>
					<Typography color="text.secondary" variant="body2">
						Summary is unavailable right now. Please refresh to try again.
					</Typography>
				</CardContent>
			</Card>
		);
	}

	const generatedAgo = summary.generatedAt
		? formatDistanceToNowStrict(new Date(summary.generatedAt), { addSuffix: true })
		: null;

	return (
		<Card
			sx={{
				...sx,
				background: headerBg,
				border: `1px solid ${alpha(accent, 0.2)}`,
				overflow: "hidden",
				position: "relative",
			}}
		>
			<Box
				aria-hidden
				sx={{
					position: "absolute",
					top: -60,
					right: -60,
					width: 220,
					height: 220,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${alpha(accent, 0.25)} 0%, transparent 70%)`,
					pointerEvents: "none",
				}}
			/>
			<CardContent sx={{ p: { xs: 3, md: 4 }, position: "relative" }}>
				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
					sx={{ mb: 1.5 }}
				>
					<Box
						sx={{
							width: 32,
							height: 32,
							borderRadius: 1.2,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: alpha(accent, 0.22),
							color: accent,
						}}
					>
						<SvgIcon fontSize="small">
							<SparklesIcon />
						</SvgIcon>
					</Box>
					<Typography variant="overline" sx={{ letterSpacing: 1.2 }}>
						Smart Summary
					</Typography>
					<Chip
						size="small"
						label="AI"
						sx={{
							ml: 0.5,
							height: 20,
							fontSize: 11,
							fontWeight: 600,
							backgroundColor: alpha(accent, 0.18),
							color: accent,
						}}
					/>
				</Stack>

				<Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
					{summary.headline}
				</Typography>
				<Typography color="text.secondary" sx={{ mb: 3 }}>
					{summary.subhead}
				</Typography>

				<Stack spacing={1.25}>
					{summary.highlights.map((h, idx) => {
						const tone = toneConfig[h.tone] || toneConfig.neutral;
						const Icon = tone.icon;
						return (
							<Stack
								key={idx}
								direction="row"
								spacing={1.5}
								alignItems="flex-start"
								sx={{
									p: 1.5,
									borderRadius: 1.5,
									backgroundColor: alpha(theme.palette.background.paper, 0.6),
									backdropFilter: "blur(4px)",
								}}
							>
								<SvgIcon
									fontSize="small"
									sx={{ color: tone.color, mt: 0.25 }}
								>
									<Icon />
								</SvgIcon>
								<Typography variant="body2" sx={{ flex: 1 }}>
									{h.text}
								</Typography>
							</Stack>
						);
					})}
				</Stack>

				{generatedAgo && (
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ display: "block", mt: 2.5, fontStyle: "italic" }}
					>
						Generated {generatedAgo}
					</Typography>
				)}
			</CardContent>
		</Card>
	);
};

SmartSummaryCard.propTypes = {
	summary: PropTypes.object,
	loading: PropTypes.bool,
	sx: PropTypes.object,
};
