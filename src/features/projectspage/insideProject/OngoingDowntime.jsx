import { useEffect, useState } from 'react'
import { getOngoingDowntime } from '../../../api/deploymentChecks.js'

function OngoingDowntime({ projectId }) {
  const [downtime, setDowntime] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrentRequest = true

    async function loadOngoingDowntime() {
      setIsLoading(true)
      setError('')

      try {
        const result = await getOngoingDowntime(projectId)
        if (isCurrentRequest) setDowntime(result)
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(requestError instanceof TypeError
            ? 'Could not reach the server. Make sure the backend is running.'
            : requestError.message || 'Unable to fetch ongoing downtime.')
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false)
      }
    }

    if (projectId) loadOngoingDowntime()
    else {
      setError('A project is required to check ongoing downtime.')
      setIsLoading(false)
    }

    return () => { isCurrentRequest = false }
  }, [projectId])

  return (
    <section className="project-detail-section" aria-labelledby="ongoing-downtime-heading">
      <h2 id="ongoing-downtime-heading">Ongoing downtime</h2>
      {isLoading ? (
        <p aria-live="polite">Checking for ongoing downtime…</p>
      ) : error ? (
        <p role="status">{error}</p>
      ) : downtime ? (
        <dl>
          <div>
            <dt>Status</dt>
            <dd>{downtime.status ?? 'Unknown'}</dd>
          </div>
          <div>
            <dt>Started</dt>
            <dd>{downtime.started_at ? new Date(downtime.started_at).toLocaleString() : 'N/A'}</dd>
          </div>
          <div>
            <dt>Resolved</dt>
            <dd>{downtime.resolved_at ? new Date(downtime.resolved_at).toLocaleString() : 'Not resolved'}</dd>
          </div>
          <div>
            <dt>Downtime ID</dt>
            <dd>{downtime.id ?? 'N/A'}</dd>
          </div>
          <div>
            <dt>Project ID</dt>
            <dd>{downtime.project_id ?? 'N/A'}</dd>
          </div>
        </dl>
      ) : (
        <p className="project-detail-empty">No ongoing downtime found.</p>
      )}
    </section>
  )
}

export default OngoingDowntime
