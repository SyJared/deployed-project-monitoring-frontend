import { useEffect, useState } from 'react'
import { getDowntimeHistory } from '../../../api/deploymentChecks.js'

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—'
}

function DowntimeHistory({ projectId }) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrentRequest = true

    async function loadHistory() {
      setIsLoading(true)
      setError('')

      try {
        const result = await getDowntimeHistory(projectId)
        if (!Array.isArray(result)) {
          throw new Error('The server returned an invalid downtime history.')
        }
        if (isCurrentRequest) setEvents(result)
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(requestError instanceof TypeError
            ? 'Could not reach the server. Make sure the backend is running.'
            : requestError.message || 'Unable to fetch downtime history.')
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false)
      }
    }

    if (projectId) loadHistory()
    else {
      setError('A project is required to show downtime history.')
      setIsLoading(false)
    }

    return () => { isCurrentRequest = false }
  }, [projectId])

  return (
    <section className="project-detail-section" aria-labelledby="downtime-heading">
      <h2 id="downtime-heading">Downtime history</h2>
      {isLoading ? (
        <p aria-live="polite">Loading downtime history…</p>
      ) : error ? (
        <p role="status">{error}</p>
      ) : events.length === 0 ? (
        <p className="project-detail-empty">No downtime recorded for this project.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li className="project-detail-history-item" key={event.id}>
              <p><strong>Status:</strong> {event.status || 'Unknown'}</p>
              <p><strong>Started:</strong> {formatDate(event.started_at)}</p>
              <p><strong>Resolved:</strong> {event.resolved_at ? formatDate(event.resolved_at) : 'Ongoing'}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default DowntimeHistory
