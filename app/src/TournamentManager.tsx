import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { hashCode } from './access'
import TournamentForm from './TournamentForm'
import TournamentImport from './TournamentImport'
import PlayerManager from './PlayerManager'
import StandingsTable from './StandingsTable'
import MatchPreparation from './MatchPreparation'
import type { Player } from './players'
import { downloadBackup } from './tournament-backup'
import { assertPreparation, formatBerlinTime, planTimes, startPreliminary } from './tournament'
import type { Tournament, TournamentSettings } from './tournament'
import { assertCurrentTournament, loadTournaments, readTournament, saveTournament } from './tournament-storage'
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

  useEffect(() => {
    heading.current?.focus()
  }, [view])

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
      setView({ kind: 'details', tournament })
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
      version: 2,
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
    const tournament: Tournament = { ...view.tournament, version: 2, players, revision: view.tournament.revision + 1 }
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
      setView({ kind: 'match', tournament })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Die Partievorbereitung konnte nicht geöffnet werden.')
    }
  }

  const expanded = view.kind !== 'list' && view.kind !== 'unlock'
  const title = view.kind === 'list' ? 'Deine Turniere.' :
    view.kind === 'create' ? 'Neues Turnier' :
    view.kind === 'import' ? 'JSON-Sicherung importieren' :
    view.kind === 'edit' ? 'Turnier bearbeiten' :
    view.kind === 'players' ? 'Spielende verwalten' :
    view.kind === 'start' ? 'Vorrunde starten?' :
    view.kind === 'match' ? 'Partie vorbereiten' :
    view.kind === 'unlock' ? 'Turnier öffnen' : view.tournament.settings.name

  return (
    <section className={`entry-card${expanded ? ' tournament-workspace' : ''}${view.kind === 'match' ? ' match-workspace' : ''}`} aria-labelledby="entry-title">
      <div className="card-stripe" aria-hidden="true" />
      <div className="card-content">
        <p className="card-eyebrow">{view.kind === 'details' ?
          view.tournament.phase === 'preliminary' ? 'VORRUNDE' : 'VORBEREITUNG' : 'EUER NÄCHSTES MATCH'}</p>
        <h2 id="entry-title" ref={heading} tabIndex={-1}>{title}</h2>
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
            onCheckCurrent={() => assertCurrentTournament(view.tournament)}
            onBack={() => setView({ kind: 'details', tournament: view.tournament })} />
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
              'Die Vorrunde läuft. Einstellungen, Turniercode und Spielende sind gesperrt.'}</p>
            <p>{view.tournament.players?.length ?? 0} Spielende angemeldet.</p>
            {view.tournament.phase === 'preliminary' && <StandingsTable players={view.tournament.players ?? []}
              onPrepare={() => prepareMatch(view.tournament)} />}
            <dl className="tournament-details">
              <div><dt>Start (Europe/Berlin)</dt><dd>{formatBerlinTime(view.tournament.settings.startsAt)}</dd></div>
              <div><dt>Spielort</dt><dd>{view.tournament.settings.location}</dd></div>
              <div className="full-width"><dt>Beschreibung</dt><dd className="description">{view.tournament.settings.description || 'Keine Beschreibung angegeben.'}</dd></div>
              <div><dt>Dauer je Partie</dt><dd>{view.tournament.settings.matchMinutes} Minuten</dd></div>
              <div><dt>Punkte</dt><dd>Sieg: {view.tournament.settings.winPoints} · Niederlage: {view.tournament.settings.lossPoints}</dd></div>
              <div><dt>Geplante Vorrunde</dt><dd>{view.tournament.settings.preliminaryMinutes} Minuten</dd></div>
              <div><dt>Geplante K.-o.-Phase</dt><dd>{view.tournament.settings.knockoutMinutes} Minuten</dd></div>
            </dl>
            <Schedule tournament={view.tournament} />
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
