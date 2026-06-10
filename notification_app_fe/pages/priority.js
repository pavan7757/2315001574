import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { fetchNotifications, sortByPriority } from '../lib/api';
import NotificationCard from '../components/NotificationCard';

const STORAGE_KEY = 'campus_notifications_viewed_ids';
const TYPES = ['All', 'Placement', 'Result', 'Event'];
const TOP_N_OPTIONS = [5, 10, 15, 20];

export default function PriorityPage() {
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
  const [topN, setTopN] = useState(10);
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

  const sortedNotifications = useMemo(() => sortByPriority(notifications), [notifications]);
  const filteredNotifications = useMemo(() => {
    return sortedNotifications.filter((item) => typeFilter === 'All' || item.Type === typeFilter).slice(0, topN);
  }, [sortedNotifications, typeFilter, topN]);

  const handleView = (id) => {
    setViewedIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  return (
    <main className="container">
      <Box className="header-row" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Priority Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The top notifications are ordered by weight (Placement &gt; Result &gt; Event) and recency.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} className="link-grid">
          <Button component={Link} href="/" variant="outlined">
            All Notifications
          </Button>
          <Button component={Link} href="/priority" variant="contained">
            Priority Inbox
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle1">Priority controls</Typography>
            <Typography variant="body2" color="text.secondary">
              Choose the number of results and type filter to focus on the most important unread messages.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', maxWidth: 480 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Top N</InputLabel>
              <Select value={topN} label="Top N" onChange={(event) => setTopN(event.target.value)}>
                {TOP_N_OPTIONS.map((value) => (
                  <MenuItem key={value} value={value}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={(event) => setTypeFilter(event.target.value)}>
                {TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {loading && (
        <Box textAlign="center" py={8}>
          <CircularProgress />
          <Typography mt={2}>Loading priority notifications...</Typography>
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1">Showing {filteredNotifications.length} of top {topN}</Typography>
            <Typography variant="body2" color="text.secondary">
              Viewed notifications are less prominent. Click to mark a notification as viewed.
            </Typography>
          </Paper>

          {filteredNotifications.length === 0 ? (
            <Alert severity="info">No notifications match the current filter.</Alert>
          ) : (
            filteredNotifications.map((notification) => (
              <Box key={notification.ID} onClick={() => handleView(notification.ID)}>
                <NotificationCard notification={notification} viewed={viewedIds.includes(notification.ID)} />
              </Box>
            ))
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            The priority ranking is computed using a combination of notification type weight and timestamp recency.
          </Typography>
        </Box>
      )}
    </main>
  );
}
