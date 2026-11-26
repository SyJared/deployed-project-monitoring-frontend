import { Navigate, useParams } from 'react-router-dom'
import { getUser, isSignedIn } from './session'

// Wraps pages that need a signed-in user.
// - Not signed in (or the session ran out): go to the sign-in page.
// - Signed in but the URL names another user: go to your own page instead.
// The server enforces all of this too; this just keeps people from landing on a broken page.
function RequireAuth({ children }) {
  const { userId } = useParams()

  if (!isSignedIn()) {
    // A leftover user without a usable token means the session expired.
    return <Navigate to={getUser() ? '/login?expired=1' : '/login'} replace />
  }

  const user = getUser()
  if (userId !== undefined && String(user.id) !== String(userId)) {
    return <Navigate to={`/projects/${encodeURIComponent(user.id)}`} replace />
  }

  return children
}

export default RequireAuth