// The signed-in session lives in sessionStorage: it ends when the tab closes.
// "user" is the key the header already used, so existing code keeps working.
const USER_KEY = 'user'
const TOKEN_KEY = 'auth_token'
const EXPIRES_KEY = 'auth_expires_at'

export function saveSession({ user, token, expiresAt }) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  sessionStorage.setItem(TOKEN_KEY, token)
  if (expiresAt) {
    sessionStorage.setItem(EXPIRES_KEY, String(expiresAt))
  } else {
    sessionStorage.removeItem(EXPIRES_KEY)
  }
}

export function clearSession() {
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EXPIRES_KEY)
}

export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

// Returns null when there is no token or it has passed its expiry time.
// This is only a convenience: the server decides whether a token is really valid.
export function getToken() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (!token) return null

  const expiresAt = Date.parse(sessionStorage.getItem(EXPIRES_KEY) ?? '')
  if (!Number.isNaN(expiresAt) && expiresAt <= Date.now()) return null

  return token
}

export function isSignedIn() {
  return Boolean(getToken()) && getUser()?.id != null
}