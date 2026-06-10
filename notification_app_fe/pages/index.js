import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Divider, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { fetchNotifications } from '../lib/api';
import NotificationCard from '../components/NotificationCard';

const STORAGE_KEY = 'campus_notifications_viewed_ids';
const TYPES = ['All', 'Placement', 'Result', 'Event'];

export default function Home() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewedIds, setViewedIds] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications({ limit: 100, page: 1 });
        setNotifications(data);
      } catch (err) {
        setError(err.message || 'Unable to load notifications');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedIds));
  }, [viewedIds]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => typeFilter === 'All' || item.Type === typeFilter);
  }, [notifications, typeFilter]);

  const viewedList = filteredNotifications.filter((item) => viewedIds.includes(item.ID));
  const newList = filteredNotifications.filter((item) => !viewedIds.includes(item.ID));

  const handleView = (id) => {
    setViewedIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  return (
    <main className="container">
      <Box className="header-row" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Campus Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            All notifications are loaded from the evaluation API. Click a notification to mark it as viewed.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} className="link-grid">
          <Button component={Link} href="/priority" variant="contained">
            Priority Inbox
          </Button>
          <Button component={Link} href="/" variant="outlined">
            All Notifications
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle1">Filter notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              New notifications are highlighted and viewed notifications are faded.
            </Typography>
          </Box>
          <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} size="small">
            {TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </Stack>
      </Paper>

      {loading && (
        <Box textAlign="center" py={8}>
          <CircularProgress />
          <Typography mt={2}>Loading notifications...</Typography>
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
            <Paper sx={{ flex: 1, p: 2 }}>
              <Typography variant="h6" gutterBottom>New</Typography>
              <Typography variant="body2" color="text.secondary">
                {newList.length} unread notification{newList.length === 1 ? '' : 's'}.
              </Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2 }}>
              <Typography variant="h6" gutterBottom>Viewed</Typography>
              <Typography variant="body2" color="text.secondary">
                {viewedList.length} already viewed notification{viewedList.length === 1 ? '' : 's'}.
              </Typography>
            </Paper>
          </Stack>

          <Typography variant="h5" mb={2}>New Notifications</Typography>
          {newList.length === 0 ? (
            <Alert severity="info">No new notifications match this filter.</Alert>
          ) : (
            newList.map((notification) => (
              <Box key={notification.ID} onClick={() => handleView(notification.ID)}>
                <NotificationCard notification={notification} viewed={false} />
              </Box>
            ))
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" mb={2}>Viewed Notifications</Typography>
          {viewedList.length === 0 ? (
            <Alert severity="info">No notifications have been viewed yet.</Alert>
          ) : (
            viewedList.map((notification) => (
              <Box key={notification.ID} onClick={() => handleView(notification.ID)}>
                <NotificationCard notification={notification} viewed />
              </Box>
            ))
          )}
        </Box>
      )}
    </main>
  );
}
