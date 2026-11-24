import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GetProjectsByUserId, InsertProject } from '../../api/projects.js'
import { checkAllDeployments } from '../../api/deploymentChecks.js'
import ApiKeyDialog from './apiKeyDialog.jsx'

const projectPageStyles = `
.project-page { min-height: 100vh; padding: 52px 24px 48px; background: #f4f7f5; color: #26372d; }
.project-page-content { width: min(1120px, 100%); margin: 0 auto; }
.project-page-header { display: flex; align-items: center; justify-content: space-between; gap: 32px; margin-bottom: 30px; }
.project-page-header h1 { margin: 0; color: #1d2a23; font-size: clamp(28px, 4vw, 36px); font-weight: 680; letter-spacing: -1.2px; line-height: 1.15; }
.project-page-header .eyebrow, .project-section-heading .eyebrow, .project-list-header .eyebrow { margin: 0 0 9px; color: #668071; font-size: 10px; font-weight: 700; letter-spacing: 1.25px; }
.project-page-header .subheading { margin: 9px 0 0; color: #718078; font-size: 14px; }
.project-page-summary { display: flex; flex: 0 0 auto; overflow: hidden; border: 1px solid #e1e9e4; border-radius: 10px; background: #fff; }
.project-page-summary div { display: grid; min-width: 112px; gap: 3px; padding: 15px 19px; }
.project-page-summary div + div { border-left: 1px solid #e8eeea; }
.project-page-summary strong { color: #294b38; font-size: 22px; line-height: 1; }
.project-page-summary span { color: #7c8982; font-size: 11px; }
.project-create-panel { padding: 23px 25px 20px; border: 1px solid #e1e9e4; border-radius: 12px; background: #fff; box-shadow: 0 3px 12px rgb(27 47 38 / 3%); }
.project-section-heading { margin-bottom: 19px; }
.project-section-heading .eyebrow { margin-bottom: 6px; }
.project-section-heading h2, .project-list-header h2 { margin: 0; color: #26372d; font-size: 18px; font-weight: 650; letter-spacing: -.35px; }
.project-section-heading > p:last-child { margin: 5px 0 0; color: #7b8881; font-size: 12px; }
.project-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: end; gap: 14px 16px; }
.project-form .form-field { min-width: 0; }
.project-form .form-field input { height: 42px; border-radius: 7px; }
.project-form .submit-button { width: 100%; min-height: 42px; margin: 0; border-radius: 7px; }
.project-form-notice { align-self: center; min-height: 15px; margin: 0; color: #37694b; font-size: 11px; }
.project-list { margin-top: 36px; }
.project-list-header { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 15px; }
.project-list-header .eyebrow { margin-bottom: 6px; }
.project-list-header h2 { display: flex; align-items: center; gap: 9px; font-size: 20px; }
.project-list-header h2 > span { display: inline-grid; min-width: 23px; height: 23px; padding: 0 6px; place-items: center; border-radius: 12px; background: #e7f0ea; color: #37694b; font-size: 11px; }
.project-refresh-button { display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 13px; border: 1px solid #dce6df; border-radius: 7px; background: #fff; color: #37694b; font-size: 12px; font-weight: 600; cursor: pointer; }
.project-refresh-button:hover:not(:disabled) { background: #f5f9f6; }
.project-refresh-button:disabled { opacity: .58; cursor: not-allowed; }
.project-refresh-button > span { font-size: 16px; }
.project-list > [role=alert] { padding: 11px 13px; border: 1px solid #f0d2ce; border-radius: 7px; background: #fff7f6; color: #a34439; font-size: 12px; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 310px), 1fr)); gap: 15px; margin: 0; padding: 0; list-style: none; }
.project-card { min-width: 0; padding: 18px; border: 1px solid #e1e9e4; border-radius: 10px; background: #fff; box-shadow: 0 2px 9px rgb(27 47 38 / 3%); transition: border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease; }
.project-card:hover { transform: translateY(-2px); border-color: #cddbd1; box-shadow: 0 8px 20px rgb(27 47 38 / 7%); }
.project-card-topline { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.project-status { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 20px; font-size: 10px; font-weight: 650; text-transform: capitalize; }
.project-status > span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.project-status.is-healthy { background: #eaf5ee; color: #287044; }
.project-status.is-down { background: #fff0ee; color: #b5463b; }
.project-status.is-pending { background: #f1f3f2; color: #65736b; }
.project-provider { max-width: 48%; overflow: hidden; color: #839088; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.project-card h3 { overflow: hidden; margin: 14px 0 5px; color: #26372d; font-size: 16px; font-weight: 650; letter-spacing: -.2px; text-overflow: ellipsis; white-space: nowrap; }
.project-description { overflow: hidden; min-height: 34px; margin: 0; color: #7b8881; font-size: 12px; line-height: 1.5; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.project-url { display: flex; align-items: center; justify-content: space-between; gap: 8px; overflow: hidden; margin-top: 13px; padding: 9px 10px; border-radius: 6px; background: #f5f8f6; color: #467354; font-size: 11px; text-decoration: none; }
.project-url > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.project-url:hover { background: #edf4ef; }
.project-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0 0; padding: 14px 0; border-top: 1px solid #edf1ee; border-bottom: 1px solid #edf1ee; }
.project-metrics > div { min-width: 0; }
.project-metrics dt { margin-bottom: 4px; color: #8a968f; font-size: 10px; }
.project-metrics dd { overflow: hidden; margin: 0; color: #394a40; font-size: 12px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.project-metric-checked { grid-column: 1 / -1; }
.project-metric-checked dd { color: #69776f; font-size: 11px; font-weight: 450; }
.project-open-button { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: 13px; padding: 4px 0 0; border: 0; background: transparent; color: #37694b; font-size: 11px; font-weight: 650; cursor: pointer; text-align: left; }
.project-open-button:hover { color: #244a33; }
.project-open-button > span { font-size: 15px; }
.project-empty-state { display: grid; justify-items: center; padding: 42px 20px; border: 1px dashed #d7e1da; border-radius: 10px; background: rgb(255 255 255 / 65%); text-align: center; }
.project-state-mark { display: grid; width: 38px; height: 38px; margin-bottom: 12px; place-items: center; border-radius: 11px; background: #eaf2ed; color: #37694b; font-size: 20px; }
.project-empty-state h3 { margin: 0; color: #34443b; font-size: 14px; }
.project-empty-state p { margin: 6px 0 0; color: #7b8881; font-size: 12px; }
.project-page-footer { margin: 35px auto 0; color: #98a29c; font-size: 11px; text-align: center; }
@media (max-width: 640px) { .project-page { padding: 32px 16px 28px; } .project-page-header { align-items: flex-start; flex-direction: column; gap: 18px; } .project-page-summary { width: 100%; } .project-page-summary div { flex: 1; } .project-create-panel { padding: 19px 17px; } .project-form { grid-template-columns: 1fr; gap: 13px; } .project-list { margin-top: 29px; } }
@media (prefers-reduced-motion: reduce) { .project-card { transition: none; } .project-card:hover { transform: none; } }
`

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
  // Holds the new API key only until the user confirms they saved it. Never persisted.
  const [newKey, setNewKey] = useState(null)
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
      const result = await readResponse(
        await InsertProject({
          user_id: userId,
          project_name: formData.projectName,
          description: formData.description,
          deployment_url: formData.deploymentUrl,
          provider: formData.provider,
        })
      )

      // The backend returns the API key only once, in this response.
      if (result.api_key) {
        setNewKey({
          apiKey: result.api_key,
          projectName: result.project?.project_name ?? formData.projectName,
        })
      }

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

  const healthyProjects = projects.filter((project) => {
    const status = getProjectHealth(project.id)?.status?.toLowerCase()
    return status === 'healthy' || status === 'up' || status === 'online'
  }).length

  return (
    <main className="project-page">
      <style>{projectPageStyles}</style>
      <div className="project-page-content">
        <header className="project-page-header">
          <div>
            <p className="eyebrow">PROJECT MONITORING</p>
            <h1 id="projects-heading">Your projects</h1>
            <p className="subheading">Keep track of every deployment in one place.</p>
          </div>
          <div className="project-page-summary" aria-label="Project summary">
            <div><strong>{projects.length}</strong><span>Total projects</span></div>
            <div><strong>{healthyProjects}</strong><span>Healthy</span></div>
          </div>
        </header>

        <section className="project-create-panel" aria-labelledby="create-project-heading">
          <div className="project-section-heading">
            <p className="eyebrow">GET STARTED</p>
            <h2 id="create-project-heading">Add a project</h2>
            <p>Connect a deployment to start monitoring its health.</p>
          </div>
          <form className="project-form" onSubmit={handleSubmit}>

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

          <p className="project-form-notice" aria-live="polite">
            {notice}
          </p>
        </form>
        </section>

        <section className="project-list" aria-labelledby="project-list-heading">
          <div className="project-list-header">
            <div>
              <p className="eyebrow">YOUR WORKSPACE</p>
              <h2 id="project-list-heading">Projects <span>{projects.length}</span></h2>
            </div>
            <button
              type="button"
              className="project-refresh-button"
              onClick={loadHealthChecks}
              disabled={isChecking || projects.length === 0}
            >
              <span aria-hidden="true">↻</span>{isChecking ? 'Checking…' : 'Check all'}
            </button>
          </div>

          {healthError && (
            <p className="form-notice" role="alert">
              {healthError}
            </p>
          )}

          {isLoading ? (
            <div className="project-empty-state" aria-live="polite"><span className="project-state-mark">…</span><p>Loading your projects</p></div>
          ) : projects.length === 0 ? (
            <div className="project-empty-state"><span className="project-state-mark">+</span><h3>No projects yet</h3><p>Add your first project above to start monitoring its deployment.</p></div>
          ) : (
            <ul className="project-grid">
              {projects.map((project) => {
                const health = getProjectHealth(project.id)
                const status = health?.status ?? (isChecking ? 'Checking' : 'Not checked')
                const normalizedStatus = status.toLowerCase()
                const statusClass = ['healthy', 'up', 'online'].includes(normalizedStatus)
                  ? 'is-healthy'
                  : ['down', 'unhealthy', 'offline', 'error'].includes(normalizedStatus)
                    ? 'is-down'
                    : 'is-pending'

                return (
                  <li className="project-card" key={project.id}>
                    <div className="project-card-topline">
                      <span className={`project-status ${statusClass}`}><span />{status}</span>
                      {project.provider && <span className="project-provider">{project.provider}</span>}
                    </div>
                    <h3>{project.project_name}</h3>
                    <p className="project-description">{project.description || 'No description provided.'}</p>
                    {project.deployment_url && (
                      <a className="project-url" href={project.deployment_url} target="_blank" rel="noreferrer">
                        <span>{project.deployment_url}</span><span aria-hidden="true">↗</span>
                      </a>
                    )}
                    <dl className="project-metrics">
                      <div><dt>Response</dt><dd>{health?.response_time_ms != null ? `${health.response_time_ms} ms` : '—'}</dd></div>
                      <div><dt>HTTP status</dt><dd>{health?.http_status_code ?? '—'}</dd></div>
                      <div className="project-metric-checked"><dt>Last checked</dt><dd>{health?.checked_at ? new Date(health.checked_at).toLocaleString() : '—'}</dd></div>
                    </dl>
                    <button type="button" className="project-open-button" onClick={() => navigate(`/projects/${encodeURIComponent(userId)}/${encodeURIComponent(project.id)}`)}>
                      View project <span aria-hidden="true">→</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
      <footer className="project-page-footer">A clearer view of work in progress.</footer>

      {newKey && (
        <ApiKeyDialog
          apiKey={newKey.apiKey}
          projectName={newKey.projectName}
          onClose={() => setNewKey(null)}
        />
      )}
    </main>
  )
}

export default ProjectPage
