import { useEffect, useRef, useState } from 'react'
import { formatCountdown, remainingSeconds, resultError } from './matches'
import type { ActiveTournament } from './matches'
import type { Whistle } from './whistle'
import { LineupPitch, MatchInfo } from './MatchPresentation'
import StandingsTable from './StandingsTable'
import './RunningMatch.css'

interface Props {
  tournament: ActiveTournament
  whistle: Whistle
  audioBusy: boolean
  onTestAudio: () => void
  onAudioError: (message: string) => void
  onWhistle: () => Promise<boolean>
  onAbort: () => Promise<void>
  onCheckCurrent: () => void
  onBack: () => void
  onExport: () => void
}

export default function RunningMatch({ tournament, whistle, audioBusy, onTestAudio, onAudioError, onWhistle,
  onAbort, onCheckCurrent, onBack, onExport }: Props) {
  const match = tournament.activeMatch
  const [now, setNow] = useState(Date.now)
  const [entry, setEntry] = useState(false)
  const [preview, setPreview] = useState(false)
  const [white, setWhite] = useState('')
  const [black, setBlack] = useState('')
  const [confirmAbort, setConfirmAbort] = useState(false)
  const [aborting, setAborting] = useState(false)
  const [error, setError] = useState('')
  const abortPending = useRef(false)
  const mounted = useRef(false)
  const armed = useRef(now < Date.parse(match.endsAt))
  const attempted = useRef(false)
  const seconds = remainingSeconds(match.endsAt, now)
  const expired = seconds === 0
  const entryHeading = useRef<HTMLHeadingElement>(null)
  const abortHeading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    mounted.current = true
    const tick = () => setNow(Date.now())
    const interval = window.setInterval(tick, 250)
    window.addEventListener('focus', tick)
    document.addEventListener('visibilitychange', tick)
    tick()
    return () => {
      mounted.current = false
      window.clearInterval(interval)
      window.removeEventListener('focus', tick)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  useEffect(() => {
    if (!expired || !armed.current || attempted.current || match.whistleAttempted) return
    attempted.current = true
    void onWhistle().then((claimed) => {
      if (claimed && mounted.current) whistle.play()
    }).catch((error: unknown) => {
      if (mounted.current) onAudioError(error instanceof Error ? error.message : 'Der automatische Pfiff konnte nicht ausgelöst werden.')
    })
  }, [expired, match.whistleAttempted, onWhistle, onAudioError, whistle])

  useEffect(() => {
    if (confirmAbort) abortHeading.current?.focus()
    else if (entry || preview) entryHeading.current?.focus()
  }, [confirmAbort, entry, preview])

  function checkResult() {
    setError('')
    const problem = resultError(white, black, Date.now() >= Date.parse(match.endsAt))
    if (problem) { setError(problem); return }
    try {
      onCheckCurrent()
      setPreview(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Der Turnierstand konnte nicht geprüft werden.')
    }
  }

  async function abort() {
    if (abortPending.current) return
    abortPending.current = true
    setAborting(true)
    setError('')
    try {
      await onAbort()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Die Partie konnte nicht abgebrochen werden.')
    } finally {
      abortPending.current = false
      setAborting(false)
    }
  }

  const team = (color: 'white' | 'black') =>
    [match.lineup[`${color}Defence`], match.lineup[`${color}Attack`]]
      .map((id) => {
        const player = tournament.players?.find((person) => person.id === id)
        return `${player?.avatar} ${player?.nickname}`
      }).join(' + ')

  return (
    <>
      <p className="card-description">Gespeicherte offene Partie. Die Aufstellung ist gesperrt; Verlassen oder Sperren stoppt die Zeit nicht.</p>
      <div className="match-layout">
        <StandingsTable compact players={tournament.players ?? []} />
        <section className="lineup-panel" aria-label="Laufende Partie">
          <div className={`match-clock${expired ? ' is-expired' : ''}`}>
            <span>RESTZEIT</span>
            <div role="timer" aria-label="Restzeit" aria-live="off">{formatCountdown(seconds)}</div>
          </div>
          {expired && <p role="status" className="expiry-message">Zeit abgelaufen! Bei Gleichstand entscheidet das nächste Tor. Noch kein Ergebnis gespeichert.</p>}
          <button className="secondary-button audio-test" type="button" disabled={audioBusy}
            onClick={onTestAudio}>{audioBusy ? 'Audio wird aktiviert ...' : 'Ton aktivieren / testen'}</button>
          <p className="form-note">{whistle.ready() ? 'Audio aktiviert. Geräte-Lautstärke mit dem Testpfiff prüfen.' :
            'Ton nicht aktiviert. Der sichtbare Ablaufhinweis bleibt immer verfügbar.'}</p>
          <LineupPitch players={tournament.players ?? []} lineup={match.lineup} />
          {confirmAbort ? (
            <section className="match-result" aria-label="Abbruch bestätigen">
              <h3 ref={abortHeading} tabIndex={-1}>Partie wirklich abbrechen?</h3>
              <p>Ohne Ergebnis und ohne Punkte beenden. Die nächste Aufstellung beginnt leer.</p>
              <div className="form-actions">
                <button className="action-button" type="button" disabled={aborting} onClick={() => void abort()}>
                  {aborting ? 'Wird abgebrochen ...' : 'Partie verbindlich abbrechen'}</button>
                <button className="secondary-button" type="button" disabled={aborting}
                  onClick={() => { setConfirmAbort(false); setError('') }}>Weiter spielen</button>
              </div>
            </section>
          ) : preview ? (
            <section className="match-result" aria-label="Ergebnisprüfung">
              <h3 ref={entryHeading} tabIndex={-1}>Ergebnis prüfen</h3>
              <p><strong>Weiß {white} : {black} Schwarz</strong></p>
              <p>Weiß: {team('white')}</p><p>Schwarz: {team('black')}</p>
              <p role="status">Noch nicht gespeichert oder gewertet; folgt in Story 1.8.</p>
              <button className="action-button" type="button" disabled>Ergebnis verbindlich speichern – folgt in Story 1.8</button>
              <button className="secondary-button" type="button" onClick={() => setPreview(false)}>Ergebnis ändern</button>
            </section>
          ) : entry ? (
            <form className="match-result" aria-label="Ergebniseingabe" noValidate onSubmit={(event) => {
              event.preventDefault()
              checkResult()
            }}>
              <h3 ref={entryHeading} tabIndex={-1}>Ergebnis eingeben</h3>
              <p>{expired ? 'Kein Unentschieden: gegebenenfalls bis zum nächsten Tor weiterspielen.' : 'Vor Ablauf muss genau ein Team 10 Tore erreicht haben. Die Zeit läuft weiter.'}</p>
              <div className="score-inputs">
                <label>Tore Weiß<input type="number" min="0" max="10" step="1" inputMode="numeric" value={white}
                  onChange={(event) => { setWhite(event.target.value); setError('') }} /></label>
                <label>Tore Schwarz<input type="number" min="0" max="10" step="1" inputMode="numeric" value={black}
                  onChange={(event) => { setBlack(event.target.value); setError('') }} /></label>
              </div>
              <div className="form-actions">
                <button className="action-button" type="submit">Ergebnis prüfen</button>
                <button className="secondary-button" type="button" onClick={() => { setEntry(false); setError('') }}>Zur Partie</button>
              </div>
            </form>
          ) : (
            <div className="form-actions">
              <button className="action-button" type="button" onClick={() => { setEntry(true); setError('') }}>
                {expired ? 'Ergebnis eingeben' : '10 Tore erreicht'}</button>
            </div>
          )}
          {error && <p className="error-message" role="alert">{error}</p>}
          {!confirmAbort && <button className="secondary-button match-abort" type="button"
            onClick={() => { setConfirmAbort(true); setError('') }}>Partie abbrechen</button>}
        </section>
      </div>
      <MatchInfo tournament={tournament}>
        <p>Ergebnisse werden erst mit Story 1.8 gespeichert und gewertet. Bis dahin erlaubt nur bestätigter Abbruch eine neue Partie.</p>
        <div className="form-actions">
          <button className="secondary-button" type="button" disabled={aborting} onClick={onExport}>JSON-Sicherung herunterladen</button>
          <button className="secondary-button" type="button" disabled={aborting} onClick={onBack}>Zur Turnierübersicht</button>
        </div>
      </MatchInfo>
    </>
  )
}
