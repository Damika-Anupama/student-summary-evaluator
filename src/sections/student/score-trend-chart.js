import { useMemo } from "react";
import PropTypes from "prop-types";
import {
	Card,
	CardContent,
	CardHeader,
	Chip,
	Stack,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Chart } from "src/components/chart";
import { buildScoreTrend } from "src/utils/score-trend";

const Stat = ({ label, value, suffix = "/100" }) => (
	<div>
		<Typography variant="overline" color="text.secondary" sx={{ display: "block" }}>
			{label}
		</Typography>
		<Typography variant="h6" component="p" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
			{value != null ? value : "—"}
			{value != null && suffix ? (
				<Typography component="span" variant="body2" color="text.secondary">
					{" "}
					{suffix}
				</Typography>
			) : null}
		</Typography>
	</div>
);

const useChartOptions = (labels, yMin, theme) => ({
	chart: {
		background: "transparent",
		toolbar: { show: false },
		animations: { enabled: false },
	},
	colors: [
		theme.palette.primary.main,
		alpha(theme.palette.info.main, 0.6),
		alpha(theme.palette.warning.main, 0.6),
	],
	stroke: {
		curve: "smooth",
		width: [3, 2, 2],
		dashArray: [0, 4, 4],
	},
	markers: {
		size: [4, 0, 0],
		strokeWidth: 2,
		hover: { sizeOffset: 2 },
	},
	fill: { opacity: 1, type: "solid" },
	grid: {
		borderColor: theme.palette.divider,
		strokeDashArray: 3,
		yaxis: { lines: { show: true } },
		xaxis: { lines: { show: false } },
	},
	legend: {
		show: true,
		position: "top",
		horizontalAlign: "right",
		labels: { colors: theme.palette.text.secondary },
	},
	xaxis: {
		categories: labels,
		labels: {
			style: { colors: theme.palette.text.secondary, fontSize: "11px" },
		},
		axisBorder: { color: theme.palette.divider },
		axisTicks: { color: theme.palette.divider },
	},
	yaxis: {
		min: yMin,
		max: 100,
		tickAmount: 5,
		labels: {
			style: { colors: theme.palette.text.secondary, fontSize: "11px" },
		},
	},
	tooltip: {
		theme: theme.palette.mode,
		y: { formatter: (v) => (v != null ? `${v}/100` : "—") },
	},
	theme: { mode: theme.palette.mode },
});

export const ScoreTrendChart = ({ rows = [], sx }) => {
	const theme = useTheme();
	const trend = useMemo(() => buildScoreTrend(rows), [rows]);
	const chartOptions = useChartOptions(trend.labels, trend.yMin, theme);

	let deltaChip = null;
	if (trend.delta !== null) {
		const deltaColor =
			trend.delta === 0
				? theme.palette.info.main
				: trend.delta > 0
				? theme.palette.success.main
				: theme.palette.error.main;
		const deltaLabel =
			trend.delta === 0
				? "Holding steady"
				: trend.delta > 0
				? `▲ ${trend.delta} since first summary`
				: `▼ ${Math.abs(trend.delta)} since first summary`;
		deltaChip = (
			<Chip
				size="small"
				label={deltaLabel}
				sx={{
					fontWeight: 700,
					mt: 0.5,
					backgroundColor: alpha(deltaColor, 0.15),
					color: deltaColor,
				}}
			/>
		);
	}

	return (
		<Card sx={sx}>
			<CardHeader
				title="Score trend"
				subheader="How your scores have moved across graded summaries"
				action={deltaChip}
			/>
			<CardContent>
				{trend.overall.length === 0 ? (
					<Typography color="text.secondary" variant="body2" sx={{ py: 4 }}>
						Submit your first summary to start tracking your progress.
					</Typography>
				) : (
					<>
						<Stack direction="row" spacing={4} sx={{ mb: 2 }}>
							<Stat label="Personal best" value={trend.best} />
							<Stat label="Average" value={trend.average} />
							<Stat label="Summaries" value={trend.overall.length} suffix="" />
						</Stack>
						<Chart
							height={280}
							options={chartOptions}
							series={[
								{ name: "Overall", data: trend.overall },
								{ name: "Content", data: trend.content },
								{ name: "Wording", data: trend.wording },
							]}
							type="line"
							width="100%"
						/>
					</>
				)}
			</CardContent>
		</Card>
	);
};

ScoreTrendChart.propTypes = {
	rows: PropTypes.array,
	sx: PropTypes.object,
};
