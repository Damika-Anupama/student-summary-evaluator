import { useCallback, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Snackbar,
  Stack,
  TextField
} from '@mui/material';

export const SettingsPassword = () => {
  const [values, setValues] = useState({
    password: '',
    confirm: ''
  });
  const [toast, setToast] = useState(false);
  const [toastSeverity, setToastSeverity] = useState('success');
  const [toastMessage, setToastMessage] = useState('Password updated (demo)');
  const [error, setError] = useState('');

  const handleChange = useCallback(
    (event) => {
      setError('');
      setValues((prevState) => ({
        ...prevState,
        [event.target.name]: event.target.value
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (values.password.length < 8) {
        setError('Password must be at least 8 characters.');
        setToastSeverity('error');
        setToastMessage('Password must be at least 8 characters.');
        setToast(true);
        return;
      }
      if (values.password !== values.confirm) {
        setError('Passwords do not match.');
        setToastSeverity('error');
        setToastMessage('Passwords do not match.');
        setToast(true);
        return;
      }
      setError('');
      setToastSeverity('success');
      setToastMessage('Password updated (demo)');
      setToast(true);
      setValues({ password: '', confirm: '' });
    },
    [values]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          subheader="Update password"
          title="Password"
        />
        <Divider />
        <CardContent>
          <Stack
            spacing={3}
            sx={{ maxWidth: 400 }}
          >
            <TextField
              fullWidth
              label="Password"
              name="password"
              onChange={handleChange}
              type="password"
              value={values.password}
              error={Boolean(error)}
              helperText="At least 8 characters"
            />
            <TextField
              fullWidth
              label="Password (Confirm)"
              name="confirm"
              onChange={handleChange}
              type="password"
              value={values.confirm}
              error={Boolean(error)}
              helperText={error || ' '}
            />
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            Update
          </Button>
        </CardActions>
      </Card>
      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toastSeverity} variant="filled" onClose={() => setToast(false)}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </form>
  );
};
