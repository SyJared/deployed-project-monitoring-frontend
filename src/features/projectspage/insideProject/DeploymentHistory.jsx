import { useEffect, useState } from 'react'
import { getDeploymentHistory } from '../../../api/deployments.js'

function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function DeploymentHistory({ projectId }) {
  const [deployments, setDeployments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrentRequest = true

    async function loadDeployments() {
      setIsLoading(true)
      setError('')

      try {
        const result = await getDeploymentHistory(projectId)
        const records = Array.isArray(result) ? result : result.deployments
        if (!Array.isArray(records)) {
          throw new Error('The server returned an invalid deployment history.')
        }
        if (isCurrentRequest) setDeployments(records)
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(requestError instanceof TypeError
            ? 'Could not reach the server. Make sure the backend is running.'
            : requestError.message || 'Unable to fetch deployment history.')
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false)
      }
    }

    if (projectId) loadDeployments()
    else {
      setError('A project is required to show deployment history.')
      setIsLoading(false)
    }

    return () => { isCurrentRequest = false }
  }, [projectId])

  return (
    <section className="project-detail-section" aria-labelledby="deployment-history-heading">
      <h2 id="deployment-history-heading">Deployment history</h2>
      {isLoading ? (
        <p aria-live="polite">Loading deployment history…</p>
      ) : error ? (
        <p role="status">{error}</p>
      ) : deployments.length === 0 ? (
        <p className="project-detail-empty">No deployments recorded for this project.</p>
      ) : (
        <ul>
          {deployments.map((deployment, index) => (
            <li className="project-detail-history-item" key={deployment.id ?? `${deployment.created_at ?? deployment.deployed_at ?? 'deployment'}-${index}`}>
              <p><strong>Version:</strong> {deployment.version ?? 'N/A'}</p>
              <p><strong>Environment:</strong> {deployment.environment ?? 'N/A'}</p>
              <p><strong>Deployment ID:</strong> {deployment.deployment_id ?? 'N/A'}</p>
              <p><strong>Commit hash:</strong> {deployment.commit_hash ?? 'N/A'}</p>
              <p><strong>Deployed at:</strong> {formatDate(deployment.deployed_at)}</p>
              <p><strong>Received at:</strong> {formatDate(deployment.received_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default DeploymentHistory
