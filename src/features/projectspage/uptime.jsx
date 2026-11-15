import { useEffect, useState } from 'react'
import { getUptime } from '../../api/deploymentChecks.js'

function Uptime({ projectId, days = 20 }) {
  const [uptime, setUptime] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(projectId))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId) {
      setUptime(null)
      setError('A project is required to show uptime.')
      setIsLoading(false)
      return
    }

    let isCurrentRequest = true
    setIsLoading(true)
    setError('')

    getUptime(projectId, days)
      .then((data) => {
        if (isCurrentRequest) setUptime(data)
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setUptime(null)
          setError(requestError.message || 'Unable to fetch uptime data.')
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [projectId, days])

  if (isLoading) {
    return <section aria-live="polite">Loading uptime...</section>
  }

  if (error) {
    return <section role="status">{error}</section>
  }

  if (!uptime) return null

  const percentage = Number(uptime.uptime_percentage)
  const formattedPercentage = Number.isFinite(percentage)
    ? `${percentage}%`
    : 'N/A'

  return (
    <section aria-labelledby="uptime-heading">
      <h2 id="uptime-heading">Uptime</h2>
      <p>{formattedPercentage}</p>
      <dl>
        <div>
          <dt>Requested period</dt>
          <dd>{uptime.requested_days ?? days} days</dd>
        </div>
        <div>
          <dt>Days checked</dt>
          <dd>{uptime.days_checked ?? 'N/A'}</dd>
        </div>
        <div>
          <dt>Successful checks</dt>
          <dd>{uptime.successful_checks ?? 'N/A'}</dd>
        </div>
        <div>
          <dt>Total checks</dt>
          <dd>{uptime.total_checks ?? 'N/A'}</dd>
        </div>
      </dl>
    </section>
  )
}
export default Uptime