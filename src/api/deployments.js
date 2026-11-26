import { authFetch } from '../jwt/http'

export async function getDeploymentHistory(projectId) {
  const response = await authFetch(`/api/sdk/deployments/${encodeURIComponent(projectId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch deployment history.')
  }
  return data
}