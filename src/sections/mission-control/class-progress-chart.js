import PropTypes from "prop-types";
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Skeleton,
	Stack,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Chart } from "src/components/chart";

function barColor(avg, theme) {
	if (avg === null) return theme.palette.divider;
	if (avg >= 85) return theme.palette.success.main;
	if (avg >= 70) return theme.palette.info.main;
	if (avg >= 55) return theme.palette.warning.main;
	return theme.palette.error.main;
}

const useChartOptions = (categories, colors, theme) => ({
	chart: {
		background: "transparent",
		toolbar: { show: false },
		animations: { enabled: false },
	},
	colors,
	dataLabels: {
		enabled: true,
		formatter: (v) => (v != null ? `${v}` : "—"),
		style: { fontSize: "12px", fontWeight: 700, colors: ["#fff"] },
		dropShadow: { enabled: false },
	},
	fill: { opacity: 1, type: "solid" },
	grid: {
		borderColor: theme.palette.divider,
		strokeDashArray: 3,
		yaxis: { lines: { show: true } },
		xaxis: { lines: { show: false } },
	},
	legend: { show: false },
	plotOptions: {
		bar: {
			borderRadius: 5,
			columnWidth: "50%",
			distributed: true,
			dataLabels: { position: "center" },
		},
	},
	annotations: {
		yaxis: [
			{
				y: 70,
				borderColor: alpha(theme.palette.warning.main, 0.7),
				borderWidth: 2,
				strokeDashArray: 5,
				label: {
					text: "Target 70",
					position: "right",
					style: {
						color: theme.palette.warning.main,
						background: alpha(theme.palette.warning.main, 0.1),
						fontSize: "11px",
						fontWeight: 600,
					},
				},
			},
		],
	},
	xaxis: {
		categories,
		labels: {
			style: { colors: theme.palette.text.secondary, fontSize: "11px" },
			rotate: -15,
			rotateAlways: false,
		},
		axisBorder: { color: theme.palette.divider },
		axisTicks: { color: theme.palette.divider },
	},
	yaxis: {
		min: 0,
		max: 100,
		tickAmount: 5,
		labels: {
			style: { colors: theme.palette.text.secondary, fontSize: "11px" },
		},
	},
	tooltip: {
		theme: theme.palette.mode,
		y: { formatter: (v) => `${v}/100` },
	},
	theme: { mode: theme.palette.mode },
});

export const ClassProgressChart = ({ data = [], loading, sx }) => {
	const theme = useTheme();

	const labels = data.map((d) => d.label);
	const avgs = data.map((d) => d.avg ?? 0);
	const colors = data.map((d) => barColor(d.avg, theme));
	const chartOptions = useChartOptions(labels, colors, theme);
	const overallAvg =
		data.filter((d) => d.avg !== null).length > 0
			? Math.round(
					data.filter((d) => d.avg !== null).reduce((s, d) => s + d.avg, 0) /
						data.filter((d) => d.avg !== null).length
			  )
			: null;

	return (
		<Card sx={sx}>
			<CardHeader
				title="Class average by assignment"
				subheader="Mean score across all submitted work for each topic"
				action={
					!loading && overallAvg !== null ? (
						<Chip
							label={`Overall avg: ${overallAvg}/100`}
							size="small"
							sx={{
								fontWeight: 700,
								mt: 0.5,
								backgroundColor: alpha(barColor(overallAvg, theme), 0.15),
								color: barColor(overallAvg, theme),
							}}
						/>
					) : null
				}
			/>
			<CardContent>
				{loading ? (
					<Skeleton variant="rounded" height={280} />
				) : data.length === 0 ? (
					<Typography color="text.secondary" variant="body2" sx={{ py: 4 }}>
						No assignment data yet.
					</Typography>
				) : (
					<>
						<Chart
							height={280}
							options={chartOptions}
							series={[{ name: "Class average", data: avgs }]}
							type="bar"
							width="100%"
						/>
						<Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
							{data.map((d) => (
								<Stack key={d.assignmentId} direction="row" spacing={0.5} alignItems="center">
									<Box
										sx={{
											width: 8,
											height: 8,
											borderRadius: "50%",
											backgroundColor: barColor(d.avg, theme),
											flexShrink: 0,
										}}
									/>
									<Typography variant="caption" color="text.secondary">
										{d.label.split(" ").slice(0, 2).join(" ")}:{" "}
										<Box component="span" sx={{ fontWeight: 700, color: barColor(d.avg, theme) }}>
											{d.avg ?? "—"}
										</Box>
										{" "}
										<Box component="span" color="text.disabled">
											({d.submitted}/{d.total})
										</Box>
									</Typography>
								</Stack>
							))}
						</Stack>
					</>
				)}
			</CardContent>
		</Card>
	);
};

ClassProgressChart.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			assignmentId: PropTypes.number,
			label: PropTypes.string,
			avg: PropTypes.number,
			submitted: PropTypes.number,
			total: PropTypes.number,
		})
	),
	loading: PropTypes.bool,
	sx: PropTypes.object,
};
