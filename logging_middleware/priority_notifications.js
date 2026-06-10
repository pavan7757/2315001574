const { logInfo, logWarn, logError } = require('./logger');

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';
const WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function getWeight(type) {
  return WEIGHTS[type] || 0;
}

function parseTimestamp(value) {
  const date = new Date(value.replace(' ', 'T') + 'Z');
  return Number.isNaN(date.getTime()) ? null : date;
}

function computePriority(notification) {
  const createdAt = parseTimestamp(notification.Timestamp);
  if (!createdAt) {
    return { score: 0, timestampMs: 0 };
  }

  const weight = getWeight(notification.Type);
  const timestampMs = createdAt.getTime();
  const score = weight * 1_000_000_000_000 + timestampMs;
  return { score, timestampMs };
}

function getAuthToken() {
  const explicitToken = process.argv.find((arg) => arg.startsWith('--token='));
  if (explicitToken) {
    return explicitToken.split('=')[1];
  }
  return process.env.AUTH_TOKEN || null;
}

async function fetchNotifications() {
  const token = getAuthToken();
  logInfo(`Fetching notifications from API: ${API_URL}`);
  const headers = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    logInfo('Using provided authorization token to access protected route.');
  }
  try {
    const response = await fetch(API_URL, { headers });
    if (!response.ok) {
      throw new Error(`Unexpected API response status ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data.notifications)) {
      throw new Error('Invalid API response format: expected notifications array');
    }
    return data.notifications;
  } catch (error) {
    logError(`Failed to fetch notifications: ${error.message}`);
    throw error;
  }
}

function getTopNotifications(notifications, limit = 10) {
  logInfo(`Computing top ${limit} notifications using weight + recency priority`);
  return notifications
    .map((notification) => {
      const { score, timestampMs } = computePriority(notification);
      return { ...notification, priorityScore: score, timestampMs };
    })
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return b.timestampMs - a.timestampMs;
    })
    .slice(0, limit);
}

function printTopNotifications(topNotifications) {
  logInfo(`Top ${topNotifications.length} priority notifications:`);
  console.table(
    topNotifications.map((notification, index) => ({
      Rank: index + 1,
      ID: notification.ID,
      Type: notification.Type,
      Message: notification.Message,
      Timestamp: notification.Timestamp,
      Score: notification.priorityScore,
    }))
  );
}

async function run() {
  try {
    const notifications = await fetchNotifications();
    if (notifications.length === 0) {
      logWarn('No notifications returned by the API.');
      return;
    }
    const topNotifications = getTopNotifications(notifications, 10);
    printTopNotifications(topNotifications);
  } catch (error) {
    logError('Priority inbox computation failed.');
    process.exit(1);
  }
}

run();
