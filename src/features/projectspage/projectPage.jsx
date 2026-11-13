import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GetProjectsByUserId, InsertProject } from '../../api/projects.js'

const emptyProject = {
  projectName: '',
  description: '',
  deploymentUrl: '',
  provider: '',
}

async function readResponse(response) {
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.message || 'The project request could not be completed.')
  }
  return result
}

function ProjectPage({ onSignOut }) {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(emptyProject)
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const user = JSON.parse(sessionStorage.getItem('user') || '{}')

  const loadProjects = useCallback(async () => {
    if (!userId) {
      setNotice('Your account information is missing. Please sign in again.')
      setIsLoading(false)
      return
    }

    try {
      const result = await readResponse(await GetProjectsByUserId(userId))
      setProjects(Array.isArray(result) ? result : result.projects ?? [])
    } catch (error) {
      setNotice(error instanceof TypeError
        ? 'Could not reach the server. Make sure the backend is running.'
        : error.message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    let isActive = true

    async function fetchProjects() {
      if (!userId) {
        setNotice('Your account information is missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        const result = await readResponse(await GetProjectsByUserId(userId))
        if (isActive) setProjects(Array.isArray(result) ? result : result.projects ?? [])
      } catch (error) {
        if (isActive) {
          setNotice(error instanceof TypeError
            ? 'Could not reach the server. Make sure the backend is running.'
            : error.message)
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    fetchProjects()
    return () => { isActive = false }
  }, [userId])

  function updateField(event) {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    setIsSaving(true)

    try {
      await readResponse(await InsertProject({
        user_id: userId,
        project_name: formData.projectName,
        description: formData.description,
        deployment_url: formData.deploymentUrl,
        provider: formData.provider,
      }))
      setFormData(emptyProject)
      setNotice('Project added successfully.')
      await loadProjects()
    } catch (error) {
      setNotice(error instanceof TypeError
        ? 'Could not reach the server. Make sure the backend is running.'
        : error.message)
    } finally {
      setIsSaving(false)
    }
  }

  function handleSignOut() {
    sessionStorage.removeItem('user')
    if (onSignOut) onSignOut()
    else navigate('/login', { replace: true })
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="projects-heading">
        <header className="project-header">
          <div className="brand" aria-label="Fieldnote projects">
            <span className="brand-mark" aria-hidden="true">F</span>
            <span>Fieldnote</span>
          </div>
          <button className="text-button" type="button" onClick={handleSignOut}>Sign out</button>
        </header>

        <div className="auth-intro">
          <p className="eyebrow">PROJECT MONITORING</p>
          <h1 id="projects-heading">Your projects</h1>
          <p className="subheading">Keep track of every deployment in one place.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Project name</span>
            <input name="projectName" placeholder="Project name" value={formData.projectName} onChange={updateField} required />
          </label>
          <label className="form-field">
            <span>Description</span>
            <input name="description" placeholder="What is this project?" value={formData.description} onChange={updateField} />
          </label>
          <label className="form-field">
            <span>Deployment URL</span>
            <input name="deploymentUrl" type="url" placeholder="https://example.com" value={formData.deploymentUrl} onChange={updateField} required />
          </label>
          <label className="form-field">
            <span>Provider</span>
            <input name="provider" placeholder="e.g. Vercel, AWS" value={formData.provider} onChange={updateField} />
          </label>
          <button className="submit-button" type="submit" disabled={isSaving || !userId}>
            {isSaving ? 'Adding project…' : 'Add project'}
            <span aria-hidden="true">→</span>
          </button>
          <p className="form-notice" aria-live="polite">{notice}</p>
        </form>

        <section className="project-list" aria-label="Project list">
          <h2>Projects</h2>
          {isLoading ? <p>Loading projects…</p> : projects.length === 0 ? (
            <p>No projects yet. Add your first project above.</p>
          ) : (
            <ul>
              {projects.map((project) => (
                <li key={project.id}>
                  <strong>{project.project_name}</strong>
                  {project.description && <p>{project.description}</p>}
                  {project.deployment_url && <a href={project.deployment_url} target="_blank" rel="noreferrer">{project.deployment_url}</a>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
      <footer className="page-footer">A clearer view of work in progress.</footer>
    </main>
  )
}

export default ProjectPage
