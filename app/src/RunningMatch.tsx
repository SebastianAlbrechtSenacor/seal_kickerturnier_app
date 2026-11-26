import { useEffect, useRef, useState } from 'react'
import { formatCountdown, remainingSeconds, resultError } from './matches'
import type { ActiveTournament } from './matches'
import type { Whistle } from './whistle'
import { LineupPitch, MatchInfo } from './MatchPresentation'
import StandingsTable from './StandingsTable'
import { KnockoutArchive, KnockoutPlan } from './KnockoutBoard'
import { nextKnockoutFixture } from './knockout'
import { WorkspaceNavigation } from './WorkspaceNavigation'
import WorkspaceDialog from './WorkspaceDialog'
import MatchHistory from './MatchHistory'
import type { ReactNode } from 'react'
import './RunningMatch.css'

interface Props {
  tournament: ActiveTournament
  whistle: Whistle
  onActivateAudio?: () => void
  audioError?: string
  onAudioError: (message: string) => void
  onWhistle: () => Promise<boolean>
  onAbort: () => Promise<void>
  onSave: (white: string, black: string) => Promise<void>
  onBack: () => void
  onExport: () => void
  tournamentInfo?: ReactNode
}

export default function RunningMatch({ tournament, whistle, onActivateAudio, audioError, onAudioError, onWhistle,
  onAbort, onSave, onBack, onExport, tournamentInfo }: Props) {
  const match = tournament.activeMatch
  const fixture = tournament.knockout ? nextKnockoutFixture(tournament.knockout) : null
  const labels = { white: fixture ? `Team ${fixture.first.id}` : 'Weiß', black: fixture ? `Team ${fixture.second.id}` : 'Schwarz' }
  const [now, setNow] = useState(Date.now)
  const [entry, setEntry] = useState(false)
  const [white, setWhite] = useState('')
  const [black, setBlack] = useState('')
  const [confirmAbort, setConfirmAbort] = useState(false)
  const [pending, setPending] = useState<'save' | 'abort' | null>(null)
  const busy = pending !== null
  const [error, setError] = useState('')
  const actionPending = useRef(false)
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
    else if (entry) entryHeading.current?.focus()
  }, [confirmAbort, entry])

  async function commit(action: 'save' | 'abort') {
    if (actionPending.current) return
    if (action === 'save') {
      const problem = resultError(white, black, Date.now() >= Date.parse(match.endsAt))
      if (problem) { setError(problem); return }
    }
    actionPending.current = true
    setPending(action)
    setError('')
    try {
      if (action === 'save') await onSave(white, black)
      else await onAbort()
    } catch (error) {
      setError(error instanceof Error ? error.message :
        action === 'save' ? 'Das Ergebnis konnte nicht gespeichert werden.' : 'Die Partie konnte nicht abgebrochen werden.')
    } finally {
      actionPending.current = false
      setPending(null)
    }
  }

  const team = (color: 'white' | 'black') =>
    [match.lineup[`${color}Defence`], match.lineup[`${color}Attack`]]
      .map((id) => tournament.players?.find((person) => person.id === id))

  return (
    <>
      <p className="card-description pitch-description">Offene Partie · Die Aufstellung bleibt gesperrt. Verlassen oder Neuladen stoppt die Zeit nicht.</p>
      <div className="match-layout pitch-workspace running-layout"
        onClickCapture={expired ? undefined : onActivateAudio}
        onKeyDownCapture={(event) => {
          if (!expired && (event.key === 'Enter' || event.key === ' ')) onActivateAudio?.()
        }}>
        {tournament.knockout ? <KnockoutPlan tournament={tournament} /> :
          <StandingsTable compact tournament={tournament} headingAction={
            <WorkspaceDialog inline label="Vollständige Vorrundentabelle" title="Vorrundentabelle">
              <StandingsTable tournament={tournament} showHeading={false} />
            </WorkspaceDialog>
          } />}
        <section className="lineup-panel" aria-label="Laufende Partie">
          <div className="pitch-header running-status">
          <h3>{fixture ? `${fixture.title}: ${labels.white} gegen ${labels.black}` : 'Partie läuft'}</h3>
          <div className={`match-clock${expired ? ' is-expired' : ''}`}>
            <span>RESTZEIT</span>
            <div role="timer" aria-label="Restzeit" aria-live="off">{formatCountdown(seconds)}</div>
          </div>
          </div>
          <LineupPitch players={tournament.players ?? []} lineup={match.lineup} teamLabels={fixture ? labels : undefined} />
          <div className="running-actions">
          {expired && <p role="status" className="expiry-message">Zeit abgelaufen! Bei Gleichstand entscheidet das nächste Tor. Noch kein Ergebnis gespeichert.</p>}
          {confirmAbort ? (
            <section className="match-result" aria-label="Abbruch bestätigen">
              <h3 ref={abortHeading} tabIndex={-1}>Partie wirklich abbrechen?</h3>
              <p>{fixture ? 'Ohne Ergebnis beenden. Dieselbe Begegnung mit denselben Teams bleibt neu startbar.' :
                'Ohne Ergebnis und ohne Punkte beenden. Die nächste Aufstellung beginnt leer.'}</p>
              <div className="form-actions">
                <button className="action-button" type="button" disabled={busy} onClick={() => void commit('abort')}>
                  {pending === 'abort' ? 'Wird abgebrochen ...' : 'Partie verbindlich abbrechen'}</button>
                <button className="secondary-button" type="button" disabled={busy}
                  onClick={() => { setConfirmAbort(false); setError('') }}>Weiter spielen</button>
              </div>
            </section>
          ) : entry ? (
            <form className="match-result" aria-label="Ergebniseingabe" noValidate onSubmit={(event) => {
              event.preventDefault()
              void commit('save')
            }}>
              <h3 ref={entryHeading} tabIndex={-1}>Ergebnis eingeben</h3>
              <p id="score-rule">{expired ? 'Kein Unentschieden.' : 'Vor Ablauf muss genau ein Team 10 Tore erreicht haben.'}</p>
              <div className="score-inputs">
                {(['white', 'black'] as const).map((side) => <label key={side}>Tore {labels[side]}
                  {fixture && <span aria-hidden="true"> ({team(side).map((player) => player?.avatar).join(' + ')})</span>}
                  {fixture && <span id={`score-team-${side}`} className="sr-only">
                    {team(side).map((player) => player?.nickname).join(' und ')}
                  </span>}
                  <input type="number" min="0" max="10" step="1" inputMode="numeric"
                    aria-label={`Tore ${labels[side]}`}
                    aria-describedby={`score-rule${fixture ? ` score-team-${side}` : ''}${error ? ' score-error' : ''}`}
                    value={side === 'white' ? white : black} disabled={busy} onChange={(event) => {
                      (side === 'white' ? setWhite : setBlack)(event.target.value)
                      setError('')
                    }} />
                </label>)}
              </div>
              <div className="form-actions">
                <button className="action-button" type="submit" disabled={busy}>
                  {pending === 'save' ? 'Wird gespeichert ...' : 'Ergebnis speichern'}</button>
                <button className="secondary-button" type="button" disabled={busy} onClick={() => { setEntry(false); setError('') }}>Zur Partie</button>
              </div>
            </form>
          ) : (
            <div className="form-actions">
              <button className="action-button" type="button" onClick={() => { setEntry(true); setError('') }}>
                {expired ? 'Ergebnis eingeben' : '10 Tore erreicht'}</button>
            </div>
          )}
          {error && <p id="score-error" className="error-message" role="alert">{error}</p>}
          {!confirmAbort && <button className="secondary-button match-abort" type="button" disabled={busy}
            onClick={() => { setConfirmAbort(true); setError('') }}>Partie abbrechen</button>}
          {audioError && <p className="error-message" role="alert">{audioError}</p>}
          </div>
        </section>
      </div>
      <MatchInfo tournament={tournament}>
        <div className="match-info-actions">
          {tournament.knockout ? <KnockoutArchive tournament={tournament} /> :
            <WorkspaceDialog inline label="Vollständiger Ergebnisverlauf" title="Ergebnisverlauf">
              <MatchHistory tournament={tournament} />
            </WorkspaceDialog>}
          {tournamentInfo}
        </div>
        <WorkspaceNavigation>
          <button className="secondary-button" type="button" disabled={busy} onClick={onBack}>Turnier verlassen</button>
          <button className="secondary-button" type="button" disabled={busy} onClick={onExport}>JSON-Sicherung herunterladen</button>
        </WorkspaceNavigation>
      </MatchInfo>
    </>
  )
}
