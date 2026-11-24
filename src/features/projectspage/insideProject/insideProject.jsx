import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GetProjectsByUserId } from '../../../api/projects.js'
import DowntimeHistory from './DowntimeHistory.jsx'
import DeploymentHistory from './DeploymentHistory.jsx'
import HealthCheck from './HealthCheck.jsx'
import HeartbeatStatus from './heartbeatStatus.jsx'
import OngoingDowntime from './OngoingDowntime.jsx'
import Uptime from '../uptime.jsx'

const detailStyles = `
.project-detail-page { width: min(1120px, calc(100% - 48px)); margin: 0 auto; padding: 30px 0 42px; color: #26372d; }
.project-detail-page, .project-detail-page * { box-sizing: border-box; }
.project-detail-nav { margin-bottom: 17px; }
.project-detail-back { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; background: none; color: #52715f; font-size: 12px; font-weight: 600; cursor: pointer; }
.project-detail-back:hover { color: #244a33; }
.project-detail-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding: 23px 25px; border: 1px solid #e1e9e4; border-radius: 12px; background: #fff; box-shadow: 0 3px 12px rgb(27 47 38 / 3%); }
.project-detail-kicker { margin: 0 0 7px; color: #668071; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; }
.project-detail-hero h1 { margin: 0; color: #1d2a23; font-size: clamp(24px, 4vw, 32px); font-weight: 680; letter-spacing: -1px; line-height: 1.2; overflow-wrap: anywhere; }
.project-detail-description { margin: 8px 0 0; color: #718078; font-size: 13px; line-height: 1.55; }
.project-detail-meta { display: grid; flex: 0 1 330px; gap: 9px; min-width: 0; }
.project-detail-provider { justify-self: end; padding: 5px 9px; border-radius: 20px; background: #edf4ef; color: #37694b; font-size: 10px; font-weight: 650; }
.project-detail-url { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; padding: 10px 12px; border-radius: 7px; background: #f5f8f6; color: #467354; font-size: 11px; text-decoration: none; }
.project-detail-url span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.project-detail-url:hover { background: #edf4ef; }
.project-detail-section-label { margin: 28px 0 12px; color: #668071; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; }
.project-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; align-items: start; }
.project-detail-section { min-width: 0; padding: 19px; border: 1px solid #e1e9e4; border-radius: 10px; background: #fff; box-shadow: 0 2px 9px rgb(27 47 38 / 3%); }
.project-detail-section > h2, .project-detail-section .heartbeat-header h2 { margin: 0 0 15px; color: #34443b; font-size: 15px; font-weight: 650; letter-spacing: -.2px; }
.project-detail-section > p { color: #718078; font-size: 12px; line-height: 1.55; }
.project-detail-section dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; margin: 0; }
.project-detail-section dl > div { min-width: 0; padding: 10px 11px; border-radius: 7px; background: #f6f8f7; }
.project-detail-section dt { margin-bottom: 5px; color: #839088; font-size: 10px; }
.project-detail-section dd { overflow-wrap: anywhere; margin: 0; color: #394a40; font-size: 12px; font-weight: 600; line-height: 1.45; }
.project-detail-section .project-detail-status { color: #287044; }
.project-detail-section .project-detail-status.is-bad { color: #b5463b; }
.project-detail-section .project-detail-status.is-neutral { color: #69776f; }
.project-detail-section .project-detail-error { color: #b5463b; }
.project-detail-section .heartbeat-header { margin-bottom: 11px; }
.project-detail-section .heartbeat-header h2 { margin: 0; }
.project-detail-section .heartbeat-message { color: #64736a; font-size: 12px; line-height: 1.6; }
.project-detail-section .heartbeat-alert { border-radius: 6px; }
.project-detail-section .heartbeat-table-wrapper { max-width: 100%; }
.project-detail-section ul { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.project-detail-history-item { min-width: 0; padding: 13px; border: 1px solid #e9eeeb; border-radius: 8px; background: #fbfcfb; }
.project-detail-history-item p { margin: 4px 0; color: #69776f; font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
.project-detail-history-item strong { color: #4d5e54; font-weight: 600; }
.project-detail-empty { margin: 0; padding: 12px; border-radius: 7px; background: #f6f8f7; color: #78867e; font-size: 12px; }
.project-detail-uptime { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 0 0 14px; padding: 13px 14px; border-radius: 8px; background: #edf4ef; }
.project-detail-uptime strong { color: #287044; font-size: 27px; letter-spacing: -.7px; }
.project-detail-uptime span { color: #718078; font-size: 11px; }
.project-detail-footer { width: min(1120px, calc(100% - 48px)); margin: 0 auto; padding: 0 0 22px; color: #98a29c; font-size: 11px; text-align: center; }
.project-detail-load, .project-detail-error-state { width: min(1120px, calc(100% - 48px)); margin: 0 auto; padding: 48px 20px; border: 1px solid #e1e9e4; border-radius: 10px; background: #fff; color: #718078; font-size: 13px; text-align: center; }
.project-detail-error-state { border-color: #f0d2ce; background: #fff7f6; color: #a34439; }
@media (max-width: 700px) { .project-detail-page { width: calc(100% - 32px); padding-top: 22px; } .project-detail-hero { flex-direction: column; padding: 19px; } .project-detail-meta { width: 100%; flex: auto; } .project-detail-provider { justify-self: start; } .project-detail-grid { grid-template-columns: 1fr; gap: 12px; } .project-detail-section { padding: 16px; } .project-detail-footer { width: calc(100% - 32px); } .project-detail-load, .project-detail-error-state { width: calc(100% - 32px); } }
@media (max-width: 420px) { .project-detail-section dl { grid-template-columns: 1fr; } }
`

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
    <>
      <style>{detailStyles}</style>
      <main className="project-detail-page">
        {isLoading ? (
          <p className="project-detail-load" aria-live="polite">Loading project…</p>
        ) : error ? (
          <p className="project-detail-error-state" role="alert">{error}</p>
        ) : (
          <>
            <nav className="project-detail-nav" aria-label="Breadcrumb">
              <button className="project-detail-back" type="button" onClick={() => navigate(`/projects/${encodeURIComponent(userId)}`)}>
                <span aria-hidden="true">←</span> Back to projects
              </button>
            </nav>
            <header className="project-detail-hero" aria-labelledby="project-heading">
              <div>
                <p className="project-detail-kicker">PROJECT MONITORING / PROJECT</p>
                <h1 id="project-heading">{project.project_name}</h1>
                {project.description && <p className="project-detail-description">{project.description}</p>}
              </div>
              <div className="project-detail-meta">
                {project.provider && <span className="project-detail-provider">{project.provider}</span>}
                {project.deployment_url && <a className="project-detail-url" href={project.deployment_url} target="_blank" rel="noreferrer"><span>{project.deployment_url}</span><span aria-hidden="true">↗</span></a>}
              </div>
            </header>
            <h2 className="project-detail-section-label">DEPLOYMENT HEALTH</h2>
            <div className="project-detail-grid">
              <HealthCheck projectId={project.id} />
              <Uptime projectId={project.id} />
            </div>
            <h2 className="project-detail-section-label">RUNTIME MONITORING</h2>
            <div className="project-detail-grid">
              <HeartbeatStatus key={project.id} projectId={project.id} />
              <OngoingDowntime projectId={project.id} />
            </div>
            <h2 className="project-detail-section-label">ACTIVITY</h2>
            <div className="project-detail-grid">
              <DowntimeHistory projectId={project.id} />
              <DeploymentHistory projectId={project.id} />
            </div>
          </>
        )}
      </main>
      <footer className="project-detail-footer">A clearer view of work in progress.</footer>
    </>
  )
}

export default InsideProject
