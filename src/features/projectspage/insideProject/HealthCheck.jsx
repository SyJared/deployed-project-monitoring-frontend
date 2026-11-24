import { useEffect, useState } from 'react'
import { getHealthCheckById } from '../../../api/deploymentChecks.js'

function HealthCheck({ projectId }) {
  const [healthCheck, setHealthCheck] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrentRequest = true

    async function loadHealthCheck() {
      setIsLoading(true)
      setError('')

      try {
        const result = await getHealthCheckById(projectId)
        if (isCurrentRequest) setHealthCheck(result)
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(requestError instanceof TypeError
            ? 'Could not reach the server. Make sure the backend is running.'
            : requestError.message || 'Unable to fetch health check data.')
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false)
      }
    }

    if (projectId) loadHealthCheck()
    else {
      setError('A project is required to show its health check.')
      setIsLoading(false)
    }

    return () => { isCurrentRequest = false }
  }, [projectId])

  if (isLoading) return <section className="project-detail-section" aria-live="polite"><h2>Latest health check</h2><p>Loading latest health check…</p></section>
  if (error) return <section className="project-detail-section" role="status"><h2>Latest health check</h2><p className="project-detail-error">{error}</p></section>
  if (!healthCheck) return <section className="project-detail-section"><h2>Latest health check</h2><p>No health check data is available.</p></section>

  const normalizedStatus = String(healthCheck.status ?? '').toLowerCase()
  const statusClass = ['healthy', 'up', 'online'].includes(normalizedStatus)
    ? ''
    : ['down', 'unhealthy', 'offline', 'error'].includes(normalizedStatus)
      ? 'is-bad'
      : 'is-neutral'

  return (
    <section className="project-detail-section" aria-labelledby="health-check-heading">
      <h2 id="health-check-heading">Latest health check</h2>
      <dl>
        <div>
          <dt>Status</dt>
          <dd className={`project-detail-status ${statusClass}`}>{healthCheck.status ?? 'N/A'}</dd>
        </div>
        <div>
          <dt>HTTP status</dt>
          <dd>{healthCheck.http_status_code ?? 'N/A'}</dd>
        </div>
        <div>
          <dt>Response time</dt>
          <dd>{healthCheck.response_time_ms != null ? `${healthCheck.response_time_ms} ms` : 'N/A'}</dd>
        </div>
        <div>
          <dt>Checked at</dt>
          <dd>{healthCheck.checked_at ? new Date(healthCheck.checked_at).toLocaleString() : 'N/A'}</dd>
        </div>
        <div>
          <dt>Error</dt>
          <dd className={healthCheck.error_message ? 'project-detail-error' : ''}>{healthCheck.error_message || 'None'}</dd>
        </div>
        <div>
          <dt>Check ID</dt>
          <dd>{healthCheck.id ?? 'N/A'}</dd>
        </div>
        <div>
          <dt>Project ID</dt>
          <dd>{healthCheck.project_id ?? 'N/A'}</dd>
        </div>
      </dl>
    </section>
  )
}

export default HealthCheck
