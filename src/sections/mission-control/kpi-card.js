import PropTypes from "prop-types";
import ArrowUpIcon from "@heroicons/react/24/solid/ArrowUpIcon";
import ArrowDownIcon from "@heroicons/react/24/solid/ArrowDownIcon";
import MinusIcon from "@heroicons/react/24/solid/MinusIcon";
import {
	Avatar,
	Box,
	Card,
	CardContent,
	Skeleton,
	Stack,
	SvgIcon,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Chart } from "src/components/chart";

const sparkOptions = (color, theme) => ({
	chart: {
		type: "line",
		sparkline: { enabled: true },
		animations: { enabled: false },
		background: "transparent",
	},
	stroke: { curve: "smooth", width: 2 },
	colors: [color],
	fill: {
		type: "gradient",
		gradient: {
			shade: theme.palette.mode === "dark" ? "dark" : "light",
			gradientToColors: [color],
			opacityFrom: 0.45,
			opacityTo: 0,
			stops: [0, 100],
		},
	},
	tooltip: { enabled: false },
	xaxis: { crosshairs: { show: false } },
	yaxis: { show: false },
});

export const KpiCard = (props) => {
	const {
		label,
		value,
		suffix,
		icon,
		iconColor = "primary.main",
		sparkline = [],
		delta,
		deltaSuffix = "",
		deltaLabel = "vs last week",
		invertDelta = false,
		loading = false,
		sx,
	} = props;
	const theme = useTheme();

	if (loading) {
		return (
			<Card sx={sx}>
				<CardContent>
					<Stack spacing={1}>
						<Skeleton width="50%" height={16} />
						<Skeleton width="40%" height={36} />
						<Skeleton variant="rounded" height={48} />
					</Stack>
				</CardContent>
			</Card>
		);
	}

	let deltaTone = "text.secondary";
	let DeltaIcon = MinusIcon;
	if (typeof delta === "number") {
		const isPositive = invertDelta ? delta < 0 : delta > 0;
		const isNegative = invertDelta ? delta > 0 : delta < 0;
		if (isPositive) {
			deltaTone = "success.main";
			DeltaIcon = ArrowUpIcon;
		} else if (isNegative) {
			deltaTone = "error.main";
			DeltaIcon = ArrowDownIcon;
		}
	}

	const sparkColorKey =
		typeof iconColor === "string" && iconColor.includes(".")
			? iconColor
			: "primary.main";
	const [palKey, palShade] = sparkColorKey.split(".");
	const sparkColor =
		theme.palette[palKey]?.[palShade] || theme.palette.primary.main;

	return (
		<Card sx={{ ...sx, overflow: "hidden" }}>
			<CardContent>
				<Stack
					direction="row"
					alignItems="flex-start"
					justifyContent="space-between"
					spacing={2}
				>
					<Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
						<Typography color="text.secondary" variant="overline">
							{label}
						</Typography>
						<Typography component="p" variant="h4" sx={{ fontWeight: 700 }}>
							{value}
							{suffix ? (
								<Typography
									component="span"
									variant="h6"
									sx={{ ml: 0.5, color: "text.secondary", fontWeight: 500 }}
								>
									{suffix}
								</Typography>
							) : null}
						</Typography>
						{typeof delta === "number" && (
							<Stack
								direction="row"
								alignItems="center"
								spacing={0.5}
								sx={{ color: deltaTone }}
							>
								<SvgIcon fontSize="inherit">
									<DeltaIcon />
								</SvgIcon>
								<Typography
									variant="body2"
									sx={{ color: deltaTone, fontWeight: 600 }}
								>
									{delta > 0 ? "+" : ""}
									{delta}
									{deltaSuffix}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{deltaLabel}
								</Typography>
							</Stack>
						)}
					</Stack>
					{icon && (
						<Avatar
							sx={{
								backgroundColor: alpha(sparkColor, 0.18),
								color: sparkColor,
								height: 44,
								width: 44,
							}}
						>
							<SvgIcon fontSize="small">{icon}</SvgIcon>
						</Avatar>
					)}
				</Stack>
				{sparkline && sparkline.length > 1 && (
					<Box sx={{ mt: 1.5, mx: -2, mb: -1, height: 60 }}>
						<Chart
							type="area"
							height={60}
							width="100%"
							options={sparkOptions(sparkColor, theme)}
							series={[{ name: label, data: sparkline }]}
						/>
					</Box>
				)}
			</CardContent>
		</Card>
	);
};

KpiCard.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	suffix: PropTypes.string,
	icon: PropTypes.node,
	iconColor: PropTypes.string,
	sparkline: PropTypes.arrayOf(PropTypes.number),
	delta: PropTypes.number,
	deltaSuffix: PropTypes.string,
	deltaLabel: PropTypes.string,
	invertDelta: PropTypes.bool,
	loading: PropTypes.bool,
	sx: PropTypes.object,
};
