import { useCallback, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Snackbar,
  Stack,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { useLocalStorageState } from 'src/hooks/use-local-storage-state';

const DEFAULT_PREFS = {
  notifEmail: true,
  notifPush: true,
  notifText: false,
  notifPhone: true,
  msgEmail: true,
  msgPush: false,
  msgPhone: true
};

const NOTIFICATION_OPTIONS = [
  { key: 'notifEmail', label: 'Email' },
  { key: 'notifPush', label: 'Push Notifications' },
  { key: 'notifText', label: 'Text Messages' },
  { key: 'notifPhone', label: 'Phone calls' }
];

const MESSAGE_OPTIONS = [
  { key: 'msgEmail', label: 'Email' },
  { key: 'msgPush', label: 'Push Notifications' },
  { key: 'msgPhone', label: 'Phone calls' }
];

export const SettingsNotifications = () => {
  const [prefs, setPrefs] = useLocalStorageState(
    'notificationPrefs',
    DEFAULT_PREFS
  );
  const [toast, setToast] = useState(false);

  const toggle = useCallback(
    (key) => (event) => {
      const { checked } = event.target;
      setPrefs((prev) => ({ ...prev, [key]: checked }));
    },
    [setPrefs]
  );

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    setToast(true);
  }, []);

  const renderGroup = (title, options) => (
    <Stack spacing={1}>
      <Typography variant="h6">{title}</Typography>
      <Stack>
        {options.map(({ key, label }) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox checked={Boolean(prefs[key])} onChange={toggle(key)} />
            }
            label={label}
          />
        ))}
      </Stack>
    </Stack>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          subheader="Choices are saved on this device"
          title="Notifications"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={6} wrap="wrap">
            <Grid xs={12} sm={6} md={4}>
              {renderGroup('Notifications', NOTIFICATION_OPTIONS)}
            </Grid>
            <Grid md={4} sm={6} xs={12}>
              {renderGroup('Messages', MESSAGE_OPTIONS)}
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </CardActions>
      </Card>
      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(false)}>
          Notification preferences saved (demo)
        </Alert>
      </Snackbar>
    </form>
  );
};
