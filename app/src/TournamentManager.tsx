import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { hashCode } from './access'
import TournamentForm from './TournamentForm'
import TournamentImport from './TournamentImport'
import PlayerManager from './PlayerManager'
import StandingsTable from './StandingsTable'
import MatchPreparation from './MatchPreparation'
import RunningMatch from './RunningMatch'
import KnockoutBoard, { KnockoutConfirmation } from './KnockoutBoard'
import TournamentCompletion from './TournamentCompletion'
import { finishKnockoutMatch, knockoutStartError, startKnockout, startKnockoutMatch } from './knockout'
import MatchHistory from './MatchHistory'
import { MatchInfo } from './MatchPresentation'
import { abortMatch, finishMatch, startMatch } from './matches'
import type { ActiveTournament } from './matches'
import type { Lineup } from './lineup'
import { createWhistle } from './whistle'
import type { Player } from './players'
import { downloadBackup } from './tournament-backup'
import { assertPreparation, formatBerlinTime, planTimes, startPreliminary } from './tournament'
import type { Tournament, TournamentSettings } from './tournament'
import { assertCurrentTournament, claimWhistle, loadTournaments, readTournament, saveTournament, updateTournament } from './tournament-storage'
import './TournamentManager.css'

type View =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'import' }
  | { kind: 'unlock'; tournament: Tournament }
  | { kind: 'details'; tournament: Tournament }
  | { kind: 'edit'; tournament: Tournament }
  | { kind: 'players'; tournament: Tournament }
  | { kind: 'start'; tournament: Tournament }
  | { kind: 'match'; tournament: Tournament }
  | { kind: 'live'; tournament: ActiveTournament }
  | { kind: 'knockout-start'; tournament: Tournament }
  | { kind: 'knockout'; tournament: Tournament; celebrate?: boolean }

function readList(): { tournaments: Tournament[]; error: string } {
  try {
    return { tournaments: loadTournaments(), error: '' }
  } catch (error) {
    return {
      tournaments: [],
      error: error instanceof Error ? error.message : 'Die Turniere konnten nicht geladen werden.',
    }
  }
}

export default function TournamentManager() {
  const [list, setList] = useState(readList)
  const [view, setView] = useState<View>({ kind: 'list' })
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [notice, setNotice] = useState('')
  const [starting, setStarting] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const codeInput = useRef<HTMLInputElement>(null)
  const [whistle] = useState(createWhistle)
  const [audioError, setAudioError] = useState('')
  const [audioBusy, setAudioBusy] = useState(false)
  const audioPending = useRef(false)
  const mounted = useRef(false)
  const phaseStartPending = useRef(false)
  const headingTarget = (view.kind === 'live' || view.kind === 'knockout') && view.tournament.activeMatch ?
    view.tournament.activeMatch.id : view

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      void whistle.close().catch((error: unknown) => console.error('Audio konnte nicht geschlossen werden.', error))
    }
  }, [whistle])

  useEffect(() => {
    heading.current?.focus()
  }, [headingTarget])

  useEffect(() => {
    if (error && !checking) codeInput.current?.focus()
  }, [error, checking])

  function backToList() {
    setCode('')
    setError('')
    setNotice('')
    setView({ kind: 'list' })
    setList(readList())
  }

  async function open(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (view.kind !== 'unlock' || checking) return
    if (!code.trim()) {
      setError('Bitte den Turnier-Zugangscode eingeben.')
      return
    }
    setChecking(true)
    setError('')
    try {
      const tournament = readTournament(view.tournament.id)
      if (await hashCode(code) !== tournament.codeHash) {
        setError('Der Turniercode ist nicht korrekt.')
        setCode('')
        return
      }
      assertCurrentTournament(tournament)
      setCode('')
      setView(tournament.phase === 'knockout' ? { kind: 'knockout', tournament } : tournament.activeMatch ?
        { kind: 'live', tournament: { ...tournament, activeMatch: tournament.activeMatch } } :
        { kind: 'details', tournament })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Das Turnier konnte nicht geöffnet werden.')
    } finally {
      setChecking(false)
    }
  }

  async function save(settings: TournamentSettings, newCode: string) {
    const existing = view.kind === 'edit' ? view.tournament : undefined
    if (existing) assertPreparation(existing)
    let codeHash: string
    try {
      codeHash = newCode ? await hashCode(newCode) : existing?.codeHash ?? ''
    } catch {
      throw new Error('Der Turniercode konnte nicht verarbeitet werden. Bitte einen aktuellen Browser über HTTPS oder localhost nutzen.')
    }
    const tournament: Tournament = {
      version: existing && existing.version >= 3 ? existing.version : 2,
      ...(existing && existing.version >= 3 ? { activeMatch: null } : {}),
      ...(existing && existing.version >= 4 ? { completedMatches: [] } : {}),
      ...(existing?.version === 5 ? { knockout: null } : {}),
      id: existing?.id ?? crypto.randomUUID(),
      revision: (existing?.revision ?? 0) + 1,
      phase: 'preparation',
      settings,
      codeHash,
      players: existing?.players ?? [],
    }
    await saveTournament(tournament, existing?.revision ?? null)
    setView({ kind: 'details', tournament })
  }

  async function savePlayers(players: Player[]) {
    if (view.kind !== 'players') throw new Error('Bitte das Turnier erneut öffnen.')
    assertPreparation(view.tournament)
    const tournament: Tournament = { ...view.tournament, version: view.tournament.version >= 3 ? view.tournament.version : 2, players, revision: view.tournament.revision + 1 }
    await saveTournament(tournament, view.tournament.revision)
    setView({ kind: 'players', tournament })
  }

  async function confirmStart() {
    if (view.kind !== 'start' || starting) return
    setError('')
    setStarting(true)
    try {
      const tournament = startPreliminary(view.tournament)
      await saveTournament(tournament, view.tournament.revision)
      setView({ kind: 'details', tournament })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Das Turnier konnte nicht gestartet werden. Bitte erneut versuchen.')
    } finally {
      setStarting(false)
    }
  }

  function exportBackup(tournament: Tournament) {
    setError('')
    try {
      assertCurrentTournament(tournament)
      downloadBackup(tournament)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Die JSON-Sicherung konnte nicht heruntergeladen werden.')
    }
  }

  function prepareMatch(tournament: Tournament) {
    setError('')
    try {
      assertCurrentTournament(tournament)
      if (tournament.phase !== 'preliminary') throw new Error('Partien können nur in der Vorrunde vorbereitet werden.')
      setView(tournament.activeMatch ?
        { kind: 'live', tournament: { ...tournament, activeMatch: tournament.activeMatch } } :
        { kind: 'match', tournament })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Die Partievorbereitung konnte nicht geöffnet werden.')
    }
  }

  async function activateAudio(test = false) {
    if (audioPending.current) return
    audioPending.current = true
    setAudioBusy(true)
    setAudioError('')
    try {
      await whistle.activate()
      if (test && mounted.current) whistle.play()
    } catch (error) {
      if (mounted.current) setAudioError(error instanceof Error ? error.message : 'Audio konnte nicht aktiviert werden.')
    } finally {
      audioPending.current = false
      if (mounted.current) setAudioBusy(false)
    }
  }

  async function beginMatch(lineup: Lineup) {
    if (view.kind !== 'match') throw new Error('Bitte das Turnier erneut öffnen.')
    setError('')
    void activateAudio()
    const tournament = await updateTournament(view.tournament, (current) => startMatch(current, lineup))
    setView({ kind: 'live', tournament })
  }

  async function endMatch() {
    if (view.kind !== 'live' && view.kind !== 'knockout') throw new Error('Bitte das Turnier erneut öffnen.')
    const tournament = await updateTournament(view.tournament, abortMatch)
    setError('')
    setView({ kind: tournament.phase === 'knockout' ? 'knockout' : 'match', tournament })
  }

  async function saveResult(white: string, black: string) {
    if ((view.kind !== 'live' && view.kind !== 'knockout') || !view.tournament.activeMatch) throw new Error('Bitte das Turnier erneut öffnen.')
    const matchId = view.tournament.activeMatch.id
    const tournament = await updateTournament(view.tournament,
      (current) => current.phase === 'knockout' ? finishKnockoutMatch(current, matchId, white, black) :
        finishMatch(current, matchId, white, black))
    setError('')
    setAudioError('')
    setView(tournament.phase === 'knockout' ?
      { kind: 'knockout', tournament, celebrate: tournament.knockout?.results.length === 4 } :
      { kind: 'match', tournament })
  }

  function showKnockout(tournament: Tournament, confirm = false) {
    setError('')
    try {
      assertCurrentTournament(tournament)
      if (confirm) {
        const error = knockoutStartError(tournament)
        if (error) throw new Error(error)
      } else if (tournament.phase !== 'knockout') throw new Error('Die K.-o.-Phase wurde noch nicht gestartet.')
      setView({ kind: confirm ? 'knockout-start' : 'knockout', tournament })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Die K.-o.-Phase konnte nicht geöffnet werden.')
    }
  }

  async function confirmKnockout() {
    if (view.kind !== 'knockout-start' || phaseStartPending.current) return
    phaseStartPending.current = true
    setStarting(true)
    setError('')
    try {
      const tournament = await updateTournament(view.tournament, startKnockout)
      setView({ kind: 'knockout', tournament })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Die K.-o.-Phase konnte nicht gespeichert werden.')
    } finally { phaseStartPending.current = false; setStarting(false) }
  }

  async function beginKnockoutMatch() {
    if (view.kind !== 'knockout') throw new Error('Bitte das Turnier erneut öffnen.')
    setError('')
    void activateAudio()
    const tournament = await updateTournament(view.tournament, (current) => startKnockoutMatch(current))
    setView({ kind: 'knockout', tournament })
  }

  async function notifyExpiry(tournament: Tournament) {
    if (!tournament.activeMatch) throw new Error('Es ist keine Partie mehr offen.')
    const result = await claimWhistle(tournament.id, tournament.activeMatch.id)
    setView((current) => {
      if ((current.kind !== 'live' && current.kind !== 'knockout') ||
          current.tournament.id !== result.tournament.id ||
          current.tournament.activeMatch?.id !== result.tournament.activeMatch.id ||
          current.tournament.revision > result.tournament.revision) return current
      return current.kind === 'knockout' ? { kind: 'knockout', tournament: result.tournament } :
        { kind: 'live', tournament: result.tournament }
    })
    return result.claimed
  }

  const expanded = view.kind !== 'list' && view.kind !== 'unlock'
  const completed = 'tournament' in view && view.tournament.knockout?.results.length === 4
  const title = view.kind === 'list' ? 'Deine Turniere.' :
    view.kind === 'create' ? 'Neues Turnier' :
    view.kind === 'import' ? 'JSON-Sicherung importieren' :
    view.kind === 'edit' ? 'Turnier bearbeiten' :
    view.kind === 'players' ? 'Spielende verwalten' :
    view.kind === 'start' ? 'Vorrunde starten?' :
    view.kind === 'knockout-start' ? 'K.-o.-Phase starten?' :
    view.kind === 'knockout' ? completed ? 'Turnier abgeschlossen' : 'K.-o.-Phase' :
    view.kind === 'match' ? 'Partie vorbereiten' :
    view.kind === 'live' ? 'Vorrundenpartie' :
    view.kind === 'unlock' ? 'Turnier öffnen' : view.tournament.settings.name

  return (
    <section className={`entry-card${expanded ? ' tournament-workspace' : ''}${view.kind === 'match' || view.kind === 'live' || view.kind === 'knockout' ? ' match-workspace' : ''}`} aria-labelledby="entry-title">
      <div className="card-stripe" aria-hidden="true" />
      <div className="card-content">
        <p className="card-eyebrow">{completed ? 'TURNIERABSCHLUSS' : view.kind === 'details' ?
          view.tournament.phase === 'knockout' ? 'K.-O.-PHASE' :
            view.tournament.phase === 'preliminary' ? 'VORRUNDE' : 'VORBEREITUNG' : 'EUER NÄCHSTES MATCH'}</p>
        <h2 id="entry-title" ref={heading} tabIndex={-1}>{title}</h2>
        {(view.kind === 'live' || view.kind === 'knockout') && error && <p className="error-message" role="alert">{error}</p>}
        {(view.kind === 'match' || view.kind === 'live' || view.kind === 'knockout') && audioError && <p className="error-message" role="alert">{audioError}</p>}
        {view.kind === 'list' && (
          <>
            <p className="card-description">Turnier vorbereiten oder mit eurem Turniercode wieder öffnen.</p>
            <p className="storage-note">Nur in diesem Browser gespeichert. Nicht im Privatmodus verwenden.
              Regelmäßig eine JSON-Sicherung herunterladen und sicher aufbewahren.</p>
            {notice && <p role="status">{notice}</p>}
            {list.error ? (
              <div role="alert" className="error-message">
                <p>{list.error}</p>
                <button className="secondary-button" type="button" onClick={() => setList(readList())}>Erneut laden</button>
              </div>
            ) : list.tournaments.length ? (
              <ul className="tournament-list">
                {list.tournaments.map((tournament) => (
                  <li key={tournament.id}>
                    <span><strong>{tournament.settings.name}</strong>
                      <time dateTime={tournament.settings.startsAt}>{formatBerlinTime(tournament.settings.startsAt)}</time></span>
                    <button className="secondary-button" type="button"
                      aria-label={`${tournament.settings.name} öffnen`}
                      onClick={() => {
                        setCode('')
                        setError('')
                        setView({ kind: 'unlock', tournament })
                      }}>Öffnen</button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <span className="empty-symbol" aria-hidden="true">🏆</span>
                <h3>Die Arena ist bereit.</h3>
                <p>Lege euer erstes Turnier an.</p>
              </div>
            )}
            <div className="form-actions">
              <button className="action-button" type="button" disabled={Boolean(list.error)}
                onClick={() => setView({ kind: 'create' })}>Turnier anlegen</button>
              <button className="secondary-button" type="button" disabled={Boolean(list.error)}
                onClick={() => setView({ kind: 'import' })}>JSON-Sicherung importieren</button>
            </div>
          </>
        )}
        {view.kind === 'import' && (
          <TournamentImport onCancel={backToList} onImported={() => {
            backToList()
            setNotice('Turnier importiert. Zum Öffnen bitte den Turniercode aus der Sicherung eingeben.')
          }} />
        )}
        {view.kind === 'unlock' && (
          <form className="tournament-unlock" onSubmit={open} noValidate aria-busy={checking}>
            <p className="card-description">{view.tournament.settings.name} · {formatBerlinTime(view.tournament.settings.startsAt)}</p>
            <label htmlFor="tournament-code">Turnier-Zugangscode</label>
            <input id="tournament-code" ref={codeInput} type="password" autoComplete="off"
              autoCapitalize="none" spellCheck={false} value={code} disabled={checking}
              aria-invalid={Boolean(error)} aria-describedby={error ? 'tournament-code-error' : undefined}
              onChange={(event) => { setCode(event.target.value); setError('') }} />
            {error && <p className="error-message" id="tournament-code-error" role="alert">{error}</p>}
            <div className="form-actions">
              <button className="action-button" type="submit" disabled={checking}>{checking ? 'Wird geprüft ...' : 'Turnier öffnen'}</button>
              <button className="secondary-button" type="button" disabled={checking} onClick={backToList}>Zur Turnierauswahl</button>
            </div>
          </form>
        )}
        {(view.kind === 'create' || view.kind === 'edit') && (
          <TournamentForm
            tournament={view.kind === 'edit' ? view.tournament : undefined}
            onSave={save}
            onCancel={() => view.kind === 'edit' ? setView({ kind: 'details', tournament: view.tournament }) : backToList()}
          />
        )}
        {view.kind === 'players' && (
          <PlayerManager players={view.tournament.players ?? []} onSave={savePlayers}
            onBack={() => setView({ kind: 'details', tournament: view.tournament })} />
        )}
        {view.kind === 'match' && (
          <MatchPreparation tournament={view.tournament}
            onStart={beginMatch}
            onBack={() => setView({ kind: 'details', tournament: view.tournament })} />
        )}
        {(view.kind === 'live' || view.kind === 'knockout') && view.tournament.activeMatch &&
          <RunningMatch key={view.tournament.activeMatch.id} tournament={{ ...view.tournament, activeMatch: view.tournament.activeMatch }}
          whistle={whistle} audioBusy={audioBusy} onTestAudio={() => void activateAudio(true)}
          onAudioError={setAudioError} onWhistle={() => notifyExpiry(view.tournament)}
          onCheckCurrent={() => assertCurrentTournament(view.tournament)}
          onAbort={endMatch} onSave={saveResult} onExport={() => exportBackup(view.tournament)}
          onBack={() => { setError(''); setView({ kind: 'details', tournament: view.tournament }) }} />}
        {view.kind === 'knockout' && completed && <TournamentCompletion tournament={view.tournament}
          celebrate={Boolean(view.celebrate)} onExport={() => exportBackup(view.tournament)}
          onBack={() => { setError(''); setView({ kind: 'details', tournament: view.tournament }) }} />}
        {view.kind === 'knockout' && !completed && !view.tournament.activeMatch && <KnockoutBoard tournament={view.tournament}
          onStart={beginKnockoutMatch} onExport={() => exportBackup(view.tournament)}
          onBack={() => { setError(''); setView({ kind: 'details', tournament: view.tournament }) }} />}
        {view.kind === 'knockout-start' && (
          <div className="start-confirmation">
            <KnockoutConfirmation tournament={view.tournament} />
            {error && <p className="error-message" role="alert">{error}</p>}
            <div className="form-actions">
              <button className="action-button" type="button" disabled={starting} onClick={() => void confirmKnockout()}>
                {starting ? 'Wird gestartet ...' : 'K.-o.-Phase verbindlich starten'}</button>
              <button className="secondary-button" type="button" disabled={starting}
                onClick={() => { setError(''); setView({ kind: 'details', tournament: view.tournament }) }}>Abbrechen</button>
            </div>
          </div>
        )}
        {view.kind === 'start' && (
          <div className="start-confirmation">
            <p className="card-description">{view.tournament.settings.name} · {view.tournament.players?.length ?? 0} Spielende</p>
            <p>Einstellungen, Punktevergabe, Dauer, Turniercode und Spielende werden mit dem Start festgeschrieben.
              Danach beginnt die Vorrunde. Es erfolgt kein automatischer Wechsel zur K.-o.-Phase.</p>
            {error && <p className="error-message" role="alert">{error}</p>}
            <div className="form-actions">
              <button className="action-button" type="button" disabled={starting} onClick={() => void confirmStart()}>
                {starting ? 'Wird gestartet ...' : 'Vorrunde verbindlich starten'}</button>
              <button className="secondary-button" type="button" disabled={starting} onClick={() => {
                setError('')
                setView({ kind: 'details', tournament: view.tournament })
              }}>Abbrechen</button>
            </div>
          </div>
        )}
        {view.kind === 'details' && (
          <>
            <p className="card-description">{view.tournament.phase === 'preparation' ?
              'Einstellungen und Spielende können vor dem Turnierstart geändert werden.' :
              completed ? 'Das Turnier ist abgeschlossen. Beide Wertungen und alle Ergebnisse bleiben unverändert.' :
              view.tournament.phase === 'knockout' ? 'Der Vorrundenstand ist eingefroren. Teams, Einstellungen und Spielende stehen fest.' :
              'Die Vorrunde läuft. Einstellungen, Turniercode und Spielende sind gesperrt.'}</p>
            <p>{view.tournament.players?.length ?? 0} Spielende angemeldet.</p>
            {view.tournament.phase !== 'preparation' ? <>
              <StandingsTable tournament={view.tournament}
                onPrepare={() => view.tournament.phase === 'knockout' ? showKnockout(view.tournament) : prepareMatch(view.tournament)}
                prepareLabel={completed ? 'Turnierabschluss anzeigen' : view.tournament.phase === 'knockout' ? 'K.-o.-Phase anzeigen' :
                  view.tournament.activeMatch ? 'Offene Partie anzeigen' : 'Partie vorbereiten'} />
              {view.tournament.phase === 'preliminary' && <>
                <button className="secondary-button" type="button" disabled={Boolean(knockoutStartError(view.tournament))}
                  aria-describedby="knockout-requirement" onClick={() => showKnockout(view.tournament, true)}>K.-o.-Phase starten</button>
                <p className="form-note" id="knockout-requirement">{knockoutStartError(view.tournament) ??
                  'Die besten acht bilden vier feste Teams. Der Wechsel ist unumkehrbar.'}</p>
              </>}
              <MatchHistory tournament={view.tournament} />
              <MatchInfo tournament={view.tournament}>
                <details>
                  <summary>Weitere Turnierinfos</summary>
                  <TournamentInformation tournament={view.tournament} />
                </details>
              </MatchInfo>
            </> : <TournamentInformation tournament={view.tournament} />}
            {error && <p className="error-message" role="alert">{error}</p>}
            {view.tournament.phase === 'preparation' && (view.tournament.players?.length ?? 0) < 4 && (
              <p className="form-note" id="start-requirement">Für den Turnierstart sind mindestens vier Spielende erforderlich.</p>
            )}
            <div className="form-actions">
              {view.tournament.phase === 'preparation' && (
                <>
              <button className="action-button" type="button"
                onClick={() => setView({ kind: 'players', tournament: view.tournament })}>Spielende verwalten</button>
              <button className="action-button" type="button"
                onClick={() => setView({ kind: 'edit', tournament: view.tournament })}>Einstellungen bearbeiten</button>
                  <button className="action-button" type="button" disabled={(view.tournament.players?.length ?? 0) < 4}
                    aria-describedby={(view.tournament.players?.length ?? 0) < 4 ? 'start-requirement' : undefined}
                    onClick={() => { setError(''); setView({ kind: 'start', tournament: view.tournament }) }}>Turnier starten</button>
                </>
              )}
              <button className="secondary-button" type="button"
                onClick={() => exportBackup(view.tournament)}>JSON-Sicherung herunterladen</button>
              <button className="secondary-button" type="button" onClick={backToList}>Zur Turnierauswahl</button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function TournamentInformation({ tournament }: { tournament: Tournament }) {
  return (
    <>
      <dl className="tournament-details">
        <div><dt>Start (Europe/Berlin)</dt><dd>{formatBerlinTime(tournament.settings.startsAt)}</dd></div>
        <div><dt>Spielort</dt><dd>{tournament.settings.location}</dd></div>
        <div className="full-width"><dt>Beschreibung</dt><dd className="description">{tournament.settings.description || 'Keine Beschreibung angegeben.'}</dd></div>
        <div><dt>Dauer je Partie</dt><dd>{tournament.settings.matchMinutes} Minuten</dd></div>
        <div><dt>Punkte</dt><dd>Sieg: {tournament.settings.winPoints} · Niederlage: {tournament.settings.lossPoints}</dd></div>
        <div><dt>Geplante Vorrunde</dt><dd>{tournament.settings.preliminaryMinutes} Minuten</dd></div>
        <div><dt>Geplante K.-o.-Phase</dt><dd>{tournament.settings.knockoutMinutes} Minuten</dd></div>
      </dl>
      <Schedule tournament={tournament} />
    </>
  )
}

function Schedule({ tournament }: { tournament: Tournament }) {
  const { startsAt, preliminaryMinutes, knockoutMinutes } = tournament.settings
  const plan = planTimes(startsAt, preliminaryMinutes, knockoutMinutes)
  if (!plan) throw new Error('Die gespeicherte Zeitplanung ist ungültig.')
  return (
    <aside className="schedule-preview" aria-label="Zeitplanung">
      <h3>Zeitplanung</h3>
      <dl>
        <div><dt>Geplanter K.-o.-Beginn</dt><dd>{formatBerlinTime(plan.knockout)}</dd></div>
        <div><dt>Geplantes Turnierende</dt><dd>{formatBerlinTime(plan.end)}</dd></div>
      </dl>
      <p>Nur zur Planung. Kein automatischer Start oder Phasenwechsel.</p>
    </aside>
  )
}
