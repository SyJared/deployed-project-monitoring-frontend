import { authFetch } from '../jwt/http'

// Same prefix as the SDKs heartbeat endpoint. If your GET lives somewhere else
// (for example /api/monitoring/heartbeat), change it here only.
const HEARTBEAT_URL = '/api/sdk/heartbeat'

async function request(url, options, fallbackMessage) {
  const response = await authFetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage)
  }
  return data
}

export function getHeartbeatStatus(projectId) {
  return request(
    `${HEARTBEAT_URL}/${encodeURIComponent(projectId)}`,
    { method: 'GET' },
    'Unable to fetch heartbeat status.'
  )
}

export function setHeartbeatEnabled(projectId, enabled) {
  return request(
    `${HEARTBEAT_URL}/${encodeURIComponent(projectId)}/enabled`,
    { method: 'PUT', body: JSON.stringify({ enabled }) },
    'Unable to change heartbeat monitoring.'
  )
}