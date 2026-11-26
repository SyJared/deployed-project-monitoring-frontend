import { clearSession, getToken } from './session'

let handleUnauthorized = () => window.location.assign('/login?expired=1')
let isRedirecting = false

// Lets tests (or the app) decide what happens when the server rejects the session.
export function setUnauthorizedHandler(handler) {
  handleUnauthorized = handler
  isRedirecting = false
}

// Like fetch, but sends the signed-in user's token. A 401 means the token is missing,
// invalid or expired, so the session is cleared and the user is sent to sign in again.
export async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers)

  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401 && !isRedirecting) {
    isRedirecting = true // several requests can fail at once; only redirect one time
    clearSession()
    handleUnauthorized()
  }

  return response
}