import PropTypes from 'prop-types';
import { BsEmojiSmile } from "react-icons/bs";
import { BsEmojiNeutralFill } from "react-icons/bs";
import {FaRegFaceSadCry } from "react-icons/fa6";
import ComputerDesktopIcon from '@heroicons/react/24/solid/DeviceTabletIcon'
import DeviceTabletIcon from '@heroicons/react/24/solid/DeviceTabletIcon';
import PhoneIcon from '@heroicons/react/24/solid/PhoneIcon';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  SvgIcon,
  Typography,
  useTheme
} from '@mui/material';
import { Chart } from 'src/components/chart';

const useChartOptions = (labels) => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent'
    },
    // Series order is [Low, Normal, Best] — color by severity so the
    // donut reads like the rest of the score visuals.
    colors: [
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.success.main
    ],
    dataLabels: {
      enabled: false
    },
    labels,
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        expandOnClick: false
      }
    },
    states: {
      active: {
        filter: {
          type: 'none'
        }
      },
      hover: {
        filter: {
          type: 'none'
        }
      }
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    },
    tooltip: {
      fillSeriesColor: false
    }
  };
};

const iconMap = {
  Best: (
    <SvgIcon>
      <BsEmojiSmile />
    </SvgIcon>
  ),
  Normal: (
    <SvgIcon>
      <BsEmojiNeutralFill />
    </SvgIcon>
  ),
  Low: (
    <SvgIcon>
      <FaRegFaceSadCry />
    </SvgIcon>
  )
};

export const OverallScore = (props) => {
  const { chartSeries, labels, sx } = props;
  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={sx}>
      <CardHeader title="Overall Score"/>
      <CardContent>
        <Chart
          height={300}
          options={chartOptions}
          series={chartSeries}
          type="donut"
          width="100%"
        />
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="center"
          spacing={2}
          sx={{ mt: 2 }}
        >
          {chartSeries.map((item, index) => {
            const label = labels[index];

            return (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {iconMap[label]}
                <Typography
                  component="p"
                  sx={{ my: 1 }}
                  variant="h6"
                >
                  {label}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                >
                  {item} {item === 1 ? "student" : "students"}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

OverallScore.propTypes = {
  chartSeries: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  sx: PropTypes.object
};
