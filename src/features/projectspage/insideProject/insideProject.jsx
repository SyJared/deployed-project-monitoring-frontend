import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GetProjectsByUserId } from '../../../api/projects.js'
import DowntimeHistory from './DowntimeHistory.jsx'
import DeploymentHistory from './DeploymentHistory.jsx'
import HealthCheck from './HealthCheck.jsx'
import OngoingDowntime from './OngoingDowntime.jsx'
import Uptime from '../uptime.jsx'

function InsideProject() {
  const { userId, projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrentRequest = true

    async function loadProject() {
      try {
        const response = await GetProjectsByUserId(userId)
        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(result.message || 'Unable to load this project.')
        }

        const projects = Array.isArray(result) ? result : result.projects ?? []
        const selectedProject = projects.find(
          (item) => String(item.id) === String(projectId)
        )

        if (!selectedProject) {
          throw new Error('This project could not be found.')
        }

        if (isCurrentRequest) setProject(selectedProject)
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(requestError instanceof TypeError
            ? 'Could not reach the server. Make sure the backend is running.'
            : requestError.message)
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false)
      }
    }

    loadProject()
    return () => { isCurrentRequest = false }
  }, [userId, projectId])

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="project-heading">
        <button className="text-button" type="button" onClick={() => navigate(`/projects/${encodeURIComponent(userId)}`)}>
          ← Back to projects
        </button>

        {isLoading ? (
          <p aria-live="polite">Loading project…</p>
        ) : error ? (
          <p className="form-notice" role="alert">{error}</p>
        ) : (
          <>
            <div className="auth-intro">
              <p className="eyebrow">PROJECT MONITORING</p>
              <h1 id="project-heading">{project.project_name}</h1>
              {project.description && <p className="subheading">{project.description}</p>}
            </div>

            {project.deployment_url && (
              <p><a href={project.deployment_url} target="_blank" rel="noreferrer">{project.deployment_url}</a></p>
            )}

            <HealthCheck projectId={project.id} />
            <OngoingDowntime projectId={project.id} />
            <DowntimeHistory projectId={project.id} />
            <DeploymentHistory projectId={project.id} />
            <Uptime projectId={project.id} />
          </>
        )}
      </section>
      <footer className="page-footer">A clearer view of work in progress.</footer>
    </main>
  )
}

export default InsideProject
