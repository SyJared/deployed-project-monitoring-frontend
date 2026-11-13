import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../../../api/auth.js'
import './AuthPage.css'

function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [username, setUsername] = useState('')
  const isRegistering = mode === 'register'

  function switchMode(nextMode) {
    setMode(nextMode)
    setNotice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')

    const formData = new FormData(event.currentTarget)
    setIsSubmitting(true)

    try {
      if (isRegistering) {
        const result = await register({
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          email: formData.get('email'),
          username: formData.get('username'),
          password: formData.get('password'),
        })
        setMode('login')
        setUsername(result.username || formData.get('username'))
        setNotice('Account created successfully. Sign in with your username and password.')
      } else {
        const result = await login({ username: formData.get('username'), password: formData.get('password') })
        const user = result.user ?? result
        sessionStorage.setItem('user', JSON.stringify(user))
        const userId = user.id
        if (userId == null) {
          throw new Error('The login response did not include a user ID.')
        }
        navigate(`/projects/${encodeURIComponent(userId)}`, { replace: true })
      }
    } catch (error) {
      setNotice(error instanceof TypeError
        ? 'Could not reach the server. Make sure the backend is running.'
        : error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-heading">
        <div className="brand" aria-label="Fieldnote">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Fieldnote</span>
        </div>

        <div className="auth-intro">
          <p className="eyebrow">PROJECT MONITORING</p>
          <h1 id="auth-heading">{isRegistering ? 'Create your account' : 'Welcome back'}</h1>
          <p className="subheading">
            {isRegistering
              ? 'Set up your workspace to keep every project on track.'
              : 'Sign in to check in on your projects.'}
          </p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            className={isRegistering ? 'auth-tab active' : 'auth-tab'}
            type="button"
            role="tab"
            aria-selected={isRegistering}
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label className="form-field">
              <span>First name</span>
              <input autoComplete="given-name" name="first_name" placeholder="First name" required />
            </label>
          )}
          {isRegistering && (
            <label className="form-field">
              <span>Last name</span>
              <input autoComplete="family-name" name="last_name" placeholder="Last name" required />
            </label>
          )}
          {isRegistering ? (
            <label className="form-field">
              <span>Email address</span>
              <input autoComplete="email" name="email" placeholder="you@company.com" type="email" required />
            </label>
          ) : (
            <label className="form-field">
              <span>Username</span>
              <input autoComplete="username" name="username" placeholder="Enter your username" value={username} onChange={(event) => setUsername(event.target.value)} required />
            </label>
          )}
          {isRegistering && (
            <label className="form-field">
              <span>Username</span>
              <input autoComplete="username" name="username" placeholder="Choose a username" required />
            </label>
          )}
          <label className="form-field">
            <span>Password</span>
            <input
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              name="password"
              placeholder={isRegistering ? 'At least 8 characters' : 'Enter your password'}
              type="password"
              minLength={8}
              required
            />
          </label>

          {!isRegistering && (
            <div className="form-options">
              <label className="remember-option">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>
              <button className="text-button" type="button" onClick={() => setNotice('Contact your administrator to reset your password.')}>Forgot password?</button>
            </div>
          )}

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isRegistering ? 'Creating account…' : 'Signing in…') : isRegistering ? 'Create account' : 'Sign in'}
            <span aria-hidden="true">→</span>
          </button>
          <p className="form-notice" aria-live="polite">{notice}</p>
        </form>

        <p className="terms-note">
          By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
        </p>
      </section>
      <footer className="page-footer">A clearer view of work in progress.</footer>
    </main>
  )
}

export default AuthPage
