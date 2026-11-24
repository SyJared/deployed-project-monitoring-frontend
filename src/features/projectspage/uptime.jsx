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
    return <section className="project-detail-section" aria-live="polite"><h2>Uptime</h2><p>Loading uptime...</p></section>
  }

  if (error) {
    return <section className="project-detail-section" role="status"><h2>Uptime</h2><p>{error}</p></section>
  }

  if (!uptime) return null

  const percentage = Number(uptime.uptime_percentage)
  const formattedPercentage = Number.isFinite(percentage)
    ? `${percentage}%`
    : 'N/A'

  return (
    <section className="project-detail-section" aria-labelledby="uptime-heading">
      <h2 id="uptime-heading">Uptime</h2>
      <div className="project-detail-uptime"><strong>{formattedPercentage}</strong><span>Uptime</span></div>
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
