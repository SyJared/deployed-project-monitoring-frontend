import { useEffect, useRef, useState } from 'react'
import './ApiKeyDialog.css'

// The environment variable name users should store the key in.
const ENV_VAR_NAME = 'DPM_API_KEY'

// One-time reveal of a newly created API key.
// The key lives only in this component's props/state: it is never written to storage or the URL.
function ApiKeyDialog({ apiKey, projectName, onClose }) {
  const dialogRef = useRef(null)
  const keyInputRef = useRef(null)
  const isFinishedRef = useRef(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')

  // Open as a modal: focus is trapped inside and the page behind it is inert.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  // The key cannot be shown again, so warn before the tab is closed or refreshed.
  useEffect(() => {
    function warnBeforeLeaving(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [])

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text)
      setCopyMessage(`${label} copied.`)
    } catch {
      // Clipboard access can be blocked (insecure page, denied permission): select it for a manual copy.
      keyInputRef.current?.select()
      setCopyMessage('Could not copy automatically. The key is selected, so press Ctrl+C (Cmd+C on Mac).')
    }
  }

  function handleDone() {
    isFinishedRef.current = true
    dialogRef.current?.close()
    onClose()
  }

  // Escape must not dismiss the dialog, and a browser that closes it anyway
  // (for example on a second Escape press) gets it reopened until the key is acknowledged.
  function handleCancel(event) {
    event.preventDefault()
  }

  function handleClose() {
    const dialog = dialogRef.current
    if (!isFinishedRef.current && dialog && !dialog.open) dialog.showModal()
  }

  return (
    <dialog
      ref={dialogRef}
      className="api-key-dialog"
      aria-labelledby="api-key-title"
      aria-describedby="api-key-warning"
      onCancel={handleCancel}
      onClose={handleClose}
    >
      <h2 id="api-key-title">Save your API key</h2>

      {projectName && (
        <p className="api-key-project">
          For project <strong>{projectName}</strong>
        </p>
      )}

      <p id="api-key-warning" className="api-key-warning">
        <strong>This is the only time you will see this key.</strong> We store only a
        fingerprint of it, so we cannot show it again. If you lose it, you will need to create a new one.
      </p>

      <label className="api-key-field">
        <span>API key</span>
        <textarea
          ref={keyInputRef}
          value={apiKey}
          rows={2}
          readOnly
          spellCheck={false}
          autoComplete="off"
          onFocus={(event) => event.target.select()}
        />
      </label>

      <div className="api-key-actions">
        <button type="button" className="api-key-copy" onClick={() => copyText(apiKey, 'Key')}>
          Copy key
        </button>
        <button
          type="button"
          className="api-key-copy"
          onClick={() => copyText(`${ENV_VAR_NAME}=${apiKey}`, '.env line')}
        >
          Copy as {ENV_VAR_NAME}=…
        </button>
      </div>

      <p className="api-key-copy-message" role="status" aria-live="polite">
        {copyMessage}
      </p>

      <div className="api-key-steps">
        <p>
          Keep it in an environment variable in your app, never in your code or in git:
        </p>
        <pre><code>{`${ENV_VAR_NAME}=<your key>`}</code></pre>
        <p>
          Then pass it to the SDK with <code>apiKey: process.env.{ENV_VAR_NAME}</code>.
        </p>
      </div>

      <label className="api-key-confirm">
        <input
          type="checkbox"
          checked={hasSaved}
          onChange={(event) => setHasSaved(event.target.checked)}
        />
        <span>I have saved this key somewhere safe.</span>
      </label>

      <button
        type="button"
        className="submit-button"
        disabled={!hasSaved}
        onClick={handleDone}
      >
        Done
      </button>
    </dialog>
  )
}

export default ApiKeyDialog