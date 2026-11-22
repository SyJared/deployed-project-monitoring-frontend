import { useEffect, useState } from 'react'
import { getHeartbeatStatus } from '../../../api/heartbeat.js'
import './heartbeatStatus.css'

const REFRESH_MS = 15000

const DIAGNOSIS = {
  Healthy: {
    tone: 'ok',
    label: 'Healthy',
    message: 'The app is running and the monitor can reach it.'
  },
  AppRunningButUnreachable: {
    tone: 'warn',
    label: 'Unreachable',
    message: 'The app is reporting in, but the monitor cannot reach its URL. Check DNS, firewall, or hosting settings.'
  },
  AppLikelyDown: {
    tone: 'bad',
    label: 'Likely down',
    message: 'The app has stopped reporting and its URL is not responding.'
  },
  SdkNotReporting: {
    tone: 'warn',
    label: 'Not reporting',
    message: 'The URL responds, but the app has stopped sending heartbeats. The SDK may have been stopped, or a cached page may be serving.'
  },
  NoSdkData: {
    tone: 'neutral',
    label: 'Not set up',
    message: 'No heartbeats received yet. Install the SDK in your app and call startHeartbeat() to see runtime data here.'
  },
  Unknown: {
    tone: 'neutral',
    label: 'Unknown',
    message: 'There is not enough data yet to tell whether the app is healthy.'
  }
}

// The API returns UTC. A timestamp without a zone marker would otherwise be read as local time.
function parseServerDate(value) {
  if (!value) return null
  const text = String(value)
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)
  const date = new Date(hasZone ? text : `${text}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateTime(date) {
  return date ? date.toLocaleString() : 'N/A'
}

function formatAgo(date, now) {
  if (!date) return 'Never'
  const seconds = Math.max(0, Math.round((now - date.getTime()) / 1000))
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatDuration(totalSeconds) {
  const seconds = Number(totalSeconds)
  if (!Number.isFinite(seconds) || seconds < 0) return 'N/A'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${Math.floor(seconds % 60)}s`
  return `${Math.floor(seconds)}s`
}

function formatMetric(value, unit) {
  const number = Number(value)
  return value == null || !Number.isFinite(number) ? '—' : `${number.toFixed(1)} ${unit}`
}

function HeartbeatStatus({ projectId }) {
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(projectId))
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => Date.now())

  // Load now, then refresh quietly in the background (no loading flicker).
  useEffect(() => {
    if (!projectId) return

    let isCurrentRequest = true

    async function loadHeartbeat() {
      try {
        const result = await getHeartbeatStatus(projectId)
        if (!isCurrentRequest) return
        setStatus(result)
        setError('')
      } catch (requestError) {
        if (!isCurrentRequest) return
        setError(requestError instanceof TypeError
          ? 'Could not reach the server. Make sure the backend is running.'
          : requestError.message || 'Unable to fetch heartbeat status.')
      } finally {
        if (isCurrentRequest) setIsLoading(false)
      }
    }

    loadHeartbeat()
    const refreshTimer = setInterval(() => {
      if (!document.hidden) loadHeartbeat()
    }, REFRESH_MS)

    return () => {
      isCurrentRequest = false
      clearInterval(refreshTimer)
    }
  }, [projectId])

  // Keeps the "12s ago" labels moving between refreshes.
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(clock)
  }, [])

  const diagnosis = status ? (DIAGNOSIS[status.diagnosis] ?? DIAGNOSIS.Unknown) : null
  const lastHeartbeat = status ? parseServerDate(status.last_heartbeat_at) : null
  const runningVersions = Array.isArray(status?.running_versions) ? status.running_versions : []
  const instances = Array.isArray(status?.instances) ? status.instances : []
  const hasData = status && status.state !== 'NoData'

  return (
    <section className="heartbeat" aria-labelledby="heartbeat-heading">
      <div className="heartbeat-header">
        <h2 id="heartbeat-heading">App heartbeat</h2>
        {diagnosis && (
          <span className={`heartbeat-badge heartbeat-badge--${diagnosis.tone}`} aria-live="polite">
            {diagnosis.label}
          </span>
        )}
      </div>

      {!projectId ? (
        <p role="status">A project is required to show its heartbeat.</p>
      ) : isLoading ? (
        <p aria-live="polite">Loading heartbeat…</p>
      ) : !status ? (
        <p role="status">{error}</p>
      ) : (
        <>
          {error && (
            <p className="heartbeat-note" role="status">
              Could not refresh ({error}) Showing the last result.
            </p>
          )}

          <p className="heartbeat-message">{diagnosis.message}</p>

          {status.version_drift && (
            <p className="heartbeat-alert" role="alert">
              <strong>Version mismatch.</strong> The app reports {runningVersions.join(', ') || 'an unknown version'},
              but the latest deployment is {status.latest_deployed_version ?? 'unknown'}.
              The deploy may be incomplete, or the old build may still be running.
            </p>
          )}

          {status.possible_crash_loop && (
            <p className="heartbeat-alert" role="alert">
              <strong>Possible crash loop.</strong> Several instances started and stopped within the last 15 minutes.
              The app may be crashing and restarting.
            </p>
          )}

          {hasData && (
            <dl>
              <div>
                <dt>Last heartbeat</dt>
                <dd>
                  {formatAgo(lastHeartbeat, now)}
                  {lastHeartbeat && <span className="heartbeat-muted"> ({formatDateTime(lastHeartbeat)})</span>}
                </dd>
              </div>
              <div>
                <dt>Running instances</dt>
                <dd>{status.alive_instances ?? 0}</dd>
              </div>
              <div>
                <dt>Running version</dt>
                <dd>{runningVersions.length > 0 ? runningVersions.join(', ') : 'Not reported'}</dd>
              </div>
              <div>
                <dt>Latest deployed version</dt>
                <dd>{status.latest_deployed_version ?? 'No deployments recorded'}</dd>
              </div>
              <div>
                <dt>Starts in the last 15 min</dt>
                <dd>{status.recent_starts ?? 0}</dd>
              </div>
            </dl>
          )}

          {instances.length > 0 && (
            <>
              <h3 id="heartbeat-instances-heading">Instances</h3>
              <div
                className="heartbeat-table-wrapper"
                role="region"
                aria-labelledby="heartbeat-instances-heading"
                tabIndex={0}
              >
                <table className="heartbeat-table">
                  <thead>
                    <tr>
                      <th scope="col">Instance</th>
                      <th scope="col">State</th>
                      <th scope="col">Version</th>
                      <th scope="col">Uptime</th>
                      <th scope="col">Memory</th>
                      <th scope="col">CPU</th>
                      <th scope="col">Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instances.map((instance) => (
                      <tr key={instance.instance_id}>
                        <td><code>{String(instance.instance_id).slice(0, 8)}</code></td>
                        <td>
                          <span className={`heartbeat-dot ${instance.is_alive ? 'heartbeat-dot--alive' : ''}`} aria-hidden="true" />
                          {instance.is_alive ? 'Alive' : 'Stopped'}
                        </td>
                        <td>{instance.version ?? '—'}</td>
                        <td>{formatDuration(instance.uptime_seconds)}</td>
                        <td>{formatMetric(instance.memory_mb, 'MB')}</td>
                        <td>{formatMetric(instance.cpu_percent, '%')}</td>
                        <td>{formatAgo(parseServerDate(instance.last_heartbeat_at), now)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default HeartbeatStatus