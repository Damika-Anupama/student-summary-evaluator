import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography
} from '@mui/material';
import { useSnackbar } from 'src/contexts/snackbar-context';
import { getInitials } from 'src/utils/get-initials';
import { useMockedUser } from 'src/hooks/use-mocked-user';

const LOCATION = {
  city: 'Colombo',
  country: 'Sri Lanka',
  timezone: 'GMT+5:30'
};

export const AccountProfile = () => {
  const { show } = useSnackbar();
  const mocked = useMockedUser();
  const user = { ...mocked, ...LOCATION };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Avatar
            src={user.avatar || undefined}
            sx={{
              height: 80,
              mb: 2,
              width: 80,
              fontSize: 28,
              bgcolor: 'primary.main'
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Typography
            gutterBottom
            variant="h5"
          >
            {user.name}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {user.jobTitle} · {user.city}, {user.country}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {user.timezone}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
        <Button
          fullWidth
          variant="text"
          onClick={() =>
            show('Photo upload is available in the full version.', 'info')
          }
        >
          Upload picture
        </Button>
      </CardActions>
    </Card>
  );
};
