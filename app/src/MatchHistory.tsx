import { useEffect, useId, useRef, useState } from 'react'
import { formatBerlinTime } from './tournament'
import type { Tournament } from './tournament'
import type { ReactNode } from 'react'
import { editablePreliminaryResults } from './matches'
import type { CompletedMatch, PreliminaryResultChange } from './matches'
import './WorkspaceDialog.css'
import './MatchHistory.css'

interface Props {
  tournament: Tournament
  recent?: boolean
  headingAction?: ReactNode
  onChangeResult?: (matchId: string, change: PreliminaryResultChange) => Promise<void>
}

export default function MatchHistory({ tournament, recent = false, headingAction, onChangeResult }: Props) {
  const matches = (tournament.completedMatches ?? []).slice(recent ? -3 : 0).reverse()
  const title = recent ? 'Letzte 3 Ergebnisse' : 'Spielergebnisse'
  const editable = recent && onChangeResult ? editablePreliminaryResults(tournament) : []
  const [editing, setEditing] = useState<CompletedMatch | null>(null)
  const [white, setWhite] = useState('')
  const [black, setBlack] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const confirmationHeading = useRef<HTMLHeadingElement>(null)
  const dialogTitle = useId()

  useEffect(() => {
    if (deleting) confirmationHeading.current?.focus()
  }, [deleting])

  function open(match: CompletedMatch, button: HTMLButtonElement) {
    opener.current = button
    setEditing(match)
    setWhite(String(match.whiteGoals))
    setBlack(String(match.blackGoals))
    setDeleting(false)
    setError('')
    dialog.current?.showModal()
  }

  function close(deleted = false) {
    dialog.current?.close()
    setEditing(null)
    const target = !deleted && opener.current?.isConnected ? opener.current : heading.current
    target?.focus({ preventScroll: true })
  }

  async function commit(change: PreliminaryResultChange) {
    if (!editing || !onChangeResult || pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      await onChangeResult(editing.id, change)
      close(change.kind === 'delete')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Das Ergebnis konnte nicht geändert werden.')
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  const label = <h3 ref={heading} tabIndex={recent ? -1 : undefined}>{title}</h3>
  return (
    <section className="match-history" aria-label={title}>
      {headingAction ? <div className="section-heading">{label}{headingAction}</div> : label}
      {matches.length === 0 ? <p className="form-note">Noch keine abgeschlossene Partie.</p> : (
        <ol className="match-history-list result-list" aria-label={title} tabIndex={0}>
          {matches.map((match, index) => (
            <li key={match.id} className={editable.includes(match) ? 'history-editable' : undefined}>
              <details className="history-result">
                <summary>
                  <strong className="history-score">Weiß {match.whiteGoals} : {match.blackGoals} Schwarz</strong>
                  {(['white', 'black'] as const).map((color) => (
                    <span className={`history-team history-${color}`} key={color}>
                      {(['Defence', 'Attack'] as const).map((position, index) => {
                        const player = tournament.players?.find((person) => person.id === match.lineup[`${color}${position}`])
                        if (!player) throw new Error('Ein gespeichertes Ergebnis enthält unbekannte Spielende.')
                        return <span key={position}>{index > 0 && ' + '}<span aria-hidden="true">{player.avatar} </span>{player.nickname}</span>
                      })}
                    </span>
                  ))}
                </summary>
                <time dateTime={match.finishedAt}>{formatBerlinTime(match.finishedAt)}</time>
              </details>
              {editable.includes(match) && <button className="history-edit" type="button" aria-haspopup="dialog"
                aria-label={`Ergebnis ${index + 1} bearbeiten: Weiß ${match.whiteGoals} : ${match.blackGoals} Schwarz`}
                onClick={(event) => open(match, event.currentTarget)}>
                <span aria-hidden="true">✎</span> Bearbeiten
              </button>}
            </li>
          ))}
        </ol>
      )}
      {recent && <dialog className="workspace-dialog" ref={dialog} aria-labelledby={dialogTitle}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return
          event.preventDefault()
          if (!pending.current) close()
        }}
        onCancel={(event) => { event.preventDefault(); if (!pending.current) close() }}>
        <header className="workspace-dialog-header">
          <h3 id={dialogTitle} ref={confirmationHeading} tabIndex={-1}>{deleting ? 'Vorrundenspiel löschen?' : 'Vorrundenergebnis bearbeiten'}</h3>
          <button type="button" className="secondary-button" disabled={busy} onClick={() => close()}>Abbrechen</button>
        </header>
        {editing && <div className="workspace-dialog-content">
          <p>Weiß {editing.whiteGoals} : {editing.blackGoals} Schwarz · {formatBerlinTime(editing.finishedAt)}</p>
          {(['white', 'black'] as const).map((side) => <p key={side}>
            {side === 'white' ? 'Weiß: ' : 'Schwarz: '}
            {(['Defence', 'Attack'] as const).map((position) =>
              tournament.players?.find(({ id }) => id === editing.lineup[`${side}${position}`])?.nickname).join(' + ')}
          </p>)}
          {deleting ? <>
            <p>Das Spiel und seine Wertung werden dauerhaft entfernt.</p>
            <button type="button" className="action-button" disabled={busy} onClick={() => void commit({ kind: 'delete' })}>
              {busy ? 'Wird gelöscht ...' : 'Spiel endgültig löschen'}
            </button>
          </> : <form noValidate onSubmit={(event) => {
            event.preventDefault()
            void commit({ kind: 'correct', white, black })
          }}>
            <div className="score-inputs">
              <label>Tore Weiß<input type="number" min="0" max="10" step="1" value={white} disabled={busy}
                onChange={(event) => { setWhite(event.target.value); setError('') }} /></label>
              <label>Tore Schwarz<input type="number" min="0" max="10" step="1" value={black} disabled={busy}
                onChange={(event) => { setBlack(event.target.value); setError('') }} /></label>
            </div>
            <div className="form-actions">
              <button type="submit" className="action-button" disabled={busy}>{busy ? 'Wird gespeichert ...' : 'Korrektur speichern'}</button>
              <button type="button" className="secondary-button" disabled={busy} onClick={() => { setDeleting(true); setError('') }}>Spiel löschen</button>
            </div>
          </form>}
          {error && <p className="error-message" role="alert">{error}</p>}
        </div>}
      </dialog>}
    </section>
  )
}
