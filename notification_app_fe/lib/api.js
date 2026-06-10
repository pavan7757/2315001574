const API_BASE = 'http://4.224.186.213/evaluation-service/notifications';

function buildUrl({ limit = 100, page = 1, notification_type } = {}) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('page', String(page));
  if (notification_type) {
    params.set('notification_type', notification_type);
  }
  return `${API_BASE}?${params.toString()}`;
}

function getAuthHeaders() {
  const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
  if (!token) return { Accept: 'application/json' };
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchNotifications({ limit = 100, page = 1, notificationType } = {}) {
  const url = buildUrl({ limit, page, notification_type: notificationType });
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Failed to fetch notifications (status ${response.status})`);
  }
  const data = await response.json();
  if (!Array.isArray(data.notifications)) {
    throw new Error('Unexpected response format');
  }
  return data.notifications;
}

export function computePriority(notification) {
  const weights = { Placement: 3, Result: 2, Event: 1 };
  const weight = weights[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp.replace(' ', 'T') + 'Z').getTime();
  return weight * 1_000_000_000_000 + timestamp;
}

export function sortByPriority(notifications) {
  return [...notifications].sort((a, b) => {
    const aScore = computePriority(a);
    const bScore = computePriority(b);
    if (bScore !== aScore) return bScore - aScore;
    return new Date(b.Timestamp) - new Date(a.Timestamp);
  });
}
