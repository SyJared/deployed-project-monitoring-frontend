export async function getHeartbeatStatus(projectId) {
  const response = await fetch(`/api/sdk/heartbeat/${encodeURIComponent(projectId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch heartbeat status.')
  }
  return data
}