import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, FolderKanban, LayoutDashboard, Search } from 'lucide-react'
import './header.css'

function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  let user = null
  try {
    user = JSON.parse(sessionStorage.getItem('user') || 'null')
  } catch {
    user = null
  }

  if (!location.pathname.startsWith('/projects') || !user?.id) return null

  function handleSignOut() {
    sessionStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <header className="project-header">
      <a className="brand" href="#projects-heading" aria-label="Fieldnote home">
        <span className="brand-mark" aria-hidden="true"><FolderKanban size={18} /></span>
        <span>Fieldnote</span>
      </a>

      <nav className="project-nav" aria-label="Main navigation">
        <a className="project-nav-link active" href="#projects-heading"><LayoutDashboard size={16} /> Overview</a>
        <a className="project-nav-link" href="#project-list-heading"><FolderKanban size={16} /> Projects</a>
      </nav>

      <div className="header-actions">
        <button className="icon-button search-button" type="button" aria-label="Search">
          <Search size={18} />
        </button>
        <div className="notification-wrap">
          <button
            className="icon-button notification-button"
            type="button"
            aria-label="Notifications, 2 unread"
            aria-expanded={notificationsOpen}
            aria-controls="notification-panel"
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell size={18} />
            <span className="notification-dot" aria-hidden="true" />
          </button>
          {notificationsOpen && (
            <section className="notification-panel" id="notification-panel" aria-label="Notifications">
              <div className="notification-panel-heading">
                <div><h2>Notifications</h2><p>You have 2 unread updates</p></div>
                <span className="notification-count">2</span>
              </div>
              <article className="notification-item unread">
                <span className="notification-status status-good" />
                <div><strong>Deployment check complete</strong><p>Your project health checks are up to date.</p><time>Just now</time></div>
              </article>
              <article className="notification-item unread">
                <span className="notification-status status-neutral" />
                <div><strong>Welcome to Fieldnote</strong><p>Add a deployment to start tracking uptime.</p><time>Today</time></div>
              </article>
              <button className="notification-footer" type="button" onClick={() => setNotificationsOpen(false)}>Close notifications <ChevronDown size={14} /></button>
            </section>
          )}
        </div>
        <span className="header-divider" aria-hidden="true" />
        <div className="header-user"><span className="user-avatar" aria-hidden="true">{String(user.id).slice(0, 1).toUpperCase()}</span><span className="user-label">Account</span></div>
        <button className="text-button signout-button" type="button" onClick={handleSignOut}>Sign out</button>
      </div>
    </header>
  )
}

export default Header
