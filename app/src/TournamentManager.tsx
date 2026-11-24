import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { hashCode } from './access'
import TournamentForm from './TournamentForm'
import { formatBerlinTime, planTimes } from './tournament'
import type { Tournament, TournamentSettings } from './tournament'
import { loadTournaments, readTournament, saveTournament } from './tournament-storage'
import './TournamentManager.css'

type View =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'unlock'; tournament: Tournament }
  | { kind: 'details'; tournament: Tournament }
  | { kind: 'edit'; tournament: Tournament }

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
    let codeHash: string
    try {
      codeHash = newCode ? await hashCode(newCode) : existing?.codeHash ?? ''
    } catch {
      throw new Error('Der Turniercode konnte nicht verarbeitet werden. Bitte einen aktuellen Browser über HTTPS oder localhost nutzen.')
    }
    const tournament: Tournament = {
      version: 1,
      id: existing?.id ?? crypto.randomUUID(),
      revision: (existing?.revision ?? 0) + 1,
      phase: 'preparation',
      settings,
      codeHash,
    }
    saveTournament(tournament, existing?.revision ?? null)
    setView({ kind: 'details', tournament })
  }

  const expanded = view.kind === 'create' || view.kind === 'edit' || view.kind === 'details'
  const title = view.kind === 'list' ? 'Deine Turniere.' :
    view.kind === 'create' ? 'Neues Turnier' :
    view.kind === 'edit' ? 'Turnier bearbeiten' :
    view.kind === 'unlock' ? 'Turnier öffnen' : view.tournament.settings.name

  return (
    <section className={`entry-card${expanded ? ' tournament-workspace' : ''}`} aria-labelledby="entry-title">
      <div className="card-stripe" aria-hidden="true" />
      <div className="card-content">
        <p className="card-eyebrow">{view.kind === 'details' ? 'VORBEREITUNG' : 'EUER NÄCHSTES MATCH'}</p>
        <h2 id="entry-title" ref={heading} tabIndex={-1}>{title}</h2>
        {view.kind === 'list' && (
          <>
            <p className="card-description">Turnier vorbereiten oder mit eurem Turniercode wieder öffnen.</p>
            <p className="storage-note">Nur in diesem Browser gespeichert. Nicht im Privatmodus verwenden.
              JSON-Sicherung und Geräteübertragung folgen in Story 1.3.</p>
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
            <button className="action-button" type="button" disabled={Boolean(list.error)}
              onClick={() => setView({ kind: 'create' })}>Turnier anlegen</button>
          </>
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
        {view.kind === 'details' && (
          <>
            <p className="card-description">Einstellungen können vor dem Turnierstart geändert werden.
              Spielende und Turnierstart folgen in späteren Stories.</p>
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
            <div className="form-actions">
              <button className="action-button" type="button"
                onClick={() => setView({ kind: 'edit', tournament: view.tournament })}>Einstellungen bearbeiten</button>
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
