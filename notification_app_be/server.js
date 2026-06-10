const express = require('express');
const { logInfo, logError } = require('../logging_middleware/logger');

const app = express();
const PORT = process.env.PORT || 4000;
const API_URL = 'http://4.224.186.213/evaluation-service/notifications';

function getAuthHeaders() {
  const token = process.env.AUTH_TOKEN;
  const headers = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

app.get('/notifications', async (req, res) => {
  const query = new URLSearchParams();
  query.set('limit', req.query.limit || '100');
  query.set('page', req.query.page || '1');
  if (req.query.notification_type) {
    query.set('notification_type', req.query.notification_type);
  }

  const url = `${API_URL}?${query.toString()}`;
  logInfo(`Proxy request to notifications API: ${url}`);

  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    const data = await response.json();

    if (!response.ok) {
      logError(`Upstream API error ${response.status}`);
      return res.status(response.status).json(data);
    }

    logInfo('Notifications fetched successfully');
    res.json(data);
  } catch (error) {
    logError(`Failed to fetch notifications: ${error.message}`);
    res.status(502).json({ error: 'Bad gateway' });
  }
});

app.listen(PORT, () => {
  logInfo(`Backend API server running on port ${PORT}`);
});
