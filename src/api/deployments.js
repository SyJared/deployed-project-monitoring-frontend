export async function getDeploymentHistory(projectId) {
  const response = await fetch(`/api/sdk/deployments/${encodeURIComponent(projectId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch deployment history.')
  }
  return data
}
