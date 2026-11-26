import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { hasMasterCode, hasMasterSession, rememberMasterSession, verifyMasterCode } from './access'
import TournamentManager from './TournamentManager'
import { WorkspaceHeaderTarget } from './workspace-header'
import './App.css'

function App() {
  const [unlocked, setUnlocked] = useState(hasMasterSession)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [headerTarget, setHeaderTarget] = useState<HTMLDivElement | null>(null)
  const codeInput = useRef<HTMLInputElement>(null)
  const configured = hasMasterCode()

  useEffect(() => {
    if (checking) return
    if (!unlocked) codeInput.current?.focus()
  }, [checking, unlocked])

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (checking) return
    if (!code.trim()) {
      setError('Bitte gib den Master-Zugangscode ein.')
      codeInput.current?.focus()
      return
    }

    setChecking(true)
    setError('')
    try {
      const valid = await verifyMasterCode(code)
      setCode('')
      if (valid) {
        if (rememberMasterSession()) {
          setUnlocked(true)
        } else {
          setError('Die Freigabe konnte nicht gespeichert werden. Bitte erlaube Cookies für diese Anwendung.')
        }
      } else {
        setError('Der Zugangscode ist nicht korrekt. Bitte versuche es erneut.')
      }
    } catch {
      setError('Der Zugang konnte nicht geprüft werden. Bitte nutze einen aktuellen Browser über HTTPS oder localhost.')
    } finally {
      setChecking(false)
    }
  }

  if (!unlocked) {
    return (
      <main className="access-gate">
        <form className="access-form" onSubmit={unlock} noValidate aria-busy={checking} aria-labelledby="access-title">
          <h1 className="access-title" id="access-title">Zugang</h1>
          <label htmlFor="master-code">Master-Zugangscode</label>
          <input
            id="master-code"
            name="master-code"
            ref={codeInput}
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={code}
            disabled={!configured || checking}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'access-error' : !configured ? 'access-configuration' : undefined}
            onChange={(event) => {
              setCode(event.target.value)
              setError('')
            }}
          />
          {error && <p className="error-message" id="access-error" role="alert">{error}</p>}
          {!configured && (
            <p className="error-message" id="access-configuration" role="alert">
              Der Master-Zugang ist noch nicht eingerichtet. Bitte die organisierende Person um Konfiguration bitten.
            </p>
          )}
          <button disabled={!configured || checking} type="submit">
            {checking ? 'Code wird geprüft ...' : 'Entsperren'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="wordmark">
          <span className="brand-icon" aria-hidden="true">K.</span>
          <span>OFFICE<span className="wordmark-accent">KICKER</span></span>
        </div>
        <div className="workspace-header-target" ref={setHeaderTarget} />
        <span className="location"><span aria-hidden="true" /> ESCHBORN EDITION</span>
      </header>

      <main className="arena">
        <section className="intro" aria-labelledby="arena-title">
          <p className="eyebrow"><span aria-hidden="true" /> WENIGER MEETINGS. MEHR MATCHES.</p>
          <h1 id="arena-title">KICKER<span>TURNIER</span></h1>
          <p className="intro-copy">Dein Team wechselt.<br /><strong>Dein Ehrgeiz bleibt.</strong></p>
          <div className="table-art" aria-hidden="true">
            <span className="table-label">LET&apos;S PLAY</span>
            <div className="pitch">
              <div className="pitch-circle" />
              <div className="goal goal-left" /><div className="goal goal-right" />
              <div className="rod rod-one"><i /><i /><i /></div>
              <div className="rod rod-two"><i /><i /><i /></div>
              <div className="rod rod-three"><i /><i /><i /></div>
              <div className="ball" />
            </div>
            <span className="art-caption">AM TISCH SIND WIR ALLE EIN TEAM.</span>
          </div>
          <ul className="game-facts" aria-label="Unser Turniermodus">
            <li><span>01</span> Wechselnde Teams</li>
            <li><span>02</span> Deine Punkte</li>
            <li><span>03</span> Ein großes Finale</li>
          </ul>
        </section>

        <WorkspaceHeaderTarget.Provider value={headerTarget}>
          <TournamentManager />
        </WorkspaceHeaderTarget.Provider>
      </main>

      <footer className="site-footer">
        <span>GUTE LEUTE. GUTE SPIELE.</span>
        <span>Office-Modus an. Alltag aus.</span>
      </footer>
    </div>
  )
}

export default App
