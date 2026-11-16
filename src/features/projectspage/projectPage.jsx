
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GetProjectsByUserId, InsertProject } from '../../api/projects.js'
import { checkAllDeployments } from '../../api/deploymentChecks.js'

const emptyProject = {
  projectName: '',
  description: '',
  deploymentUrl: '',
  provider: '',
}

async function readResponse(response) {
  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      result.message || 'The project request could not be completed.'
    )
  }

  return result
}

function ProjectPage() {
  const { userId } = useParams()

  const [formData, setFormData] = useState(emptyProject)
  const [projects, setProjects] = useState([])
  const [healthChecks, setHealthChecks] = useState([])
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [notice, setNotice] = useState('')
  const [healthError, setHealthError] = useState('')

  // Load projects belonging to the current user
  const loadProjects = useCallback(async () => {
    if (!userId) {
      setNotice('Your account information is missing. Please sign in again.')
      setIsLoading(false)
      return
    }

    try {
      const result = await readResponse(
        await GetProjectsByUserId(userId)
      )

      setProjects(
        Array.isArray(result) ? result : result.projects ?? []
      )
    } catch (error) {
      setNotice(
        error instanceof TypeError
          ? 'Could not reach the server. Make sure the backend is running.'
          : error.message
      )
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Run health checks for all projects
  const loadHealthChecks = useCallback(async () => {
    if (!userId) return

    setIsChecking(true)
    setHealthError('')

    try {
      const result = await checkAllDeployments(userId)

      setHealthChecks(Array.isArray(result) ? result : [])
    } catch (error) {
      console.error('Health check failed:', error)
      setHealthError('Unable to retrieve deployment health checks.')
    } finally {
      setIsChecking(false)
    }
  }, [userId])

  // Load projects and health checks when the page opens
  useEffect(() => {
    loadProjects()
    loadHealthChecks()
  }, [loadProjects, loadHealthChecks])

  // Update form fields
  function updateField(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  // Add a new project
  async function handleSubmit(event) {
    event.preventDefault()

    setNotice('')
    setIsSaving(true)

    try {
      await readResponse(
        await InsertProject({
          user_id: userId,
          project_name: formData.projectName,
          description: formData.description,
          deployment_url: formData.deploymentUrl,
          provider: formData.provider,
        })
      )

      setFormData(emptyProject)
      setNotice('Project added successfully.')

      await loadProjects()
      await loadHealthChecks()
    } catch (error) {
      setNotice(
        error instanceof TypeError
          ? 'Could not reach the server. Make sure the backend is running.'
          : error.message
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Find the latest health check for a project
  function getProjectHealth(projectId) {
    return healthChecks.find(
      (check) => check.project_id === projectId
    )
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="projects-heading">

        {/* Introduction */}
        <div className="auth-intro">
          <p className="eyebrow">PROJECT MONITORING</p>
          <h1 id="projects-heading">Your projects</h1>
          <p className="subheading">
            Keep track of every deployment in one place.
          </p>
        </div>

        {/* Add project form */}
        <form className="auth-form" onSubmit={handleSubmit}>

          <label className="form-field">
            <span>Project name</span>
            <input
              name="projectName"
              placeholder="Project name"
              value={formData.projectName}
              onChange={updateField}
              required
            />
          </label>

          <label className="form-field">
            <span>Description</span>
            <input
              name="description"
              placeholder="What is this project?"
              value={formData.description}
              onChange={updateField}
            />
          </label>

          <label className="form-field">
            <span>Deployment URL</span>
            <input
              name="deploymentUrl"
              type="url"
              placeholder="https://example.com"
              value={formData.deploymentUrl}
              onChange={updateField}
              required
            />
          </label>

          <label className="form-field">
            <span>Provider</span>
            <input
              name="provider"
              placeholder="e.g. Vercel, AWS"
              value={formData.provider}
              onChange={updateField}
            />
          </label>

          <button
            className="submit-button"
            type="submit"
            disabled={isSaving || !userId}
          >
            {isSaving ? 'Adding project…' : 'Add project'}
            <span aria-hidden="true">→</span>
          </button>

          <p className="form-notice" aria-live="polite">
            {notice}
          </p>
        </form>

        {/* Project list */}
        <section className="project-list" aria-label="Project list">

          <div className="project-list-header">
            <h2 id="project-list-heading">Projects</h2>

            <button
              type="button"
              className="text-button"
              onClick={loadHealthChecks}
              disabled={isChecking || projects.length === 0}
            >
              {isChecking ? 'Checking…' : 'Check all'}
            </button>
          </div>

          {healthError && (
            <p className="form-notice" role="alert">
              {healthError}
            </p>
          )}

          {isLoading ? (
            <p>Loading projects…</p>
          ) : projects.length === 0 ? (
            <p>No projects yet. Add your first project above.</p>
          ) : (
            <ul>
              {projects.map((project) => {
                const health = getProjectHealth(project.id)

                return (
                  <li key={project.id}>

                    <button
                      type="button"
                      className="text-button"
                      onClick={() => navigate(`/projects/${encodeURIComponent(userId)}/${encodeURIComponent(project.id)}`)}
                    >
                      {project.project_name} →
                    </button>

                    {project.description && (
                      <p>{project.description}</p>
                    )}

                    {project.deployment_url && (
                      <a
                        href={project.deployment_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {project.deployment_url}
                      </a>
                    )}

                    <div className="project-health">

                      <p>
                        Status:{' '}
                        <strong>
                          {health
                            ? health.status
                            : isChecking
                              ? 'Checking…'
                              : 'Not checked'}
                        </strong>
                      </p>

                      <p>
                        Response time:{' '}
                        {health
                          ? `${health.response_time_ms} ms`
                          : '—'}
                      </p>

                      <p>
                        HTTP status:{' '}
                        {health?.http_status_code ?? '—'}
                      </p>

                      <p>
                        Last checked:{' '}
                        {health?.checked_at
                          ? new Date(health.checked_at).toLocaleString()
                          : '—'}
                      </p>

                    </div>

                  </li>
                )
              })}
            </ul>
          )}
        </section>

      </section>

      <footer className="page-footer">
        A clearer view of work in progress.
      </footer>
    </main>
  )
}

export default ProjectPage
