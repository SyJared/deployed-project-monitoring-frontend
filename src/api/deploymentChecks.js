import { authFetch } from '../jwt/http'
export async function checkAllDeployments(userId) {
  const response = await authFetch(`/api/monitoring/check-all/${userId}`,{
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userId)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Unable to check deployments.')
  };
  return data;
}
export async function getUptime(projectId, days) {
  const response = await authFetch(`/api/monitoring/uptime/${projectId}?days=${days}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch uptime data.');
  }
  return data;
}
export async function getHealthCheckById(projectId) {
  const response = await authFetch(`/api/monitoring/check/${projectId}`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch health check data.');
  }
  return data;
}

export async function getDowntimeHistory(projectId) {
  const response = await authFetch(`/api/monitoring/downtime/${projectId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch downtime history.');
  }
  return data;
}

export async function getOngoingDowntime(projectId) {
  const response = await authFetch(`/api/monitoring/downtime/${projectId}/ongoing`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch ongoing downtime.');
  }
  return data;
}