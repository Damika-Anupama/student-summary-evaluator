import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart } from 'src/components/chart';


// Same score→color scale as the cohort heatmap and needs-attention queue,
// applied per bucket via its midpoint.
const bucketColor = (range, theme) => {
  const [lo, hi] = String(range).split('-').map(Number);
  const mid = (lo + hi) / 2;
  if (mid >= 85) return theme.palette.success.main;
  if (mid >= 70) return theme.palette.info.main;
  if (mid >= 55) return theme.palette.warning.main;
  return theme.palette.error.main;
};

const useChartOptions = (categories) => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: categories.map((c) => alpha(bucketColor(c, theme), 0.85)),
    dataLabels: {
      enabled: false
    },
    fill: {
      opacity: 1,
      type: 'solid'
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    legend: {
      show: false
    },
    plotOptions: {
      bar: {
        columnWidth: '40px',
        distributed: true,
        borderRadius: 4
      }
    },
    stroke: {
      colors: ['transparent'],
      show: true,
      width: 2
    },
    theme: {
      mode: theme.palette.mode
    },
    xaxis: {
      axisBorder: {
        color: theme.palette.divider,
        show: true
      },
      axisTicks: {
        color: theme.palette.divider,
        show: true
      },
      categories: categories,
      labels: {
        offsetY: 5,
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      labels: {
        // Counts of students — hide the fractional gridline labels.
        formatter: (value) =>
          Number.isInteger(value) ? `${value}` : '',
        offsetX: -10,
        style: {
          colors: theme.palette.text.secondary
        }
      }
    }
  };
};




export const Score = (props) => {
  const { chartSeries, sx, categories,title } = props;

  const chartOptions = useChartOptions(categories);

  return (
    <Card sx={sx}>
      <CardHeader title={title} subheader="Distribution across graded summaries" />
      <CardContent>
        <Chart
          height={350}
          options={chartOptions}
          series={chartSeries}
          type="bar"
          width="100%"
        />
      </CardContent>
    </Card>
  );
};

Score.propTypes = {
  chartSeries: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  title: PropTypes.string,
  sx: PropTypes.object
};
