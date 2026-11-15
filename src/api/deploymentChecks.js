export async function checkAllDeployments(userId) {
  const response = await fetch(`/api/monitoring/check-all/${userId}`,{
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
  const response = await fetch(`/api/monitoring/uptime/${projectId}?days=${days}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch uptime data.');
  }
  return data;
}