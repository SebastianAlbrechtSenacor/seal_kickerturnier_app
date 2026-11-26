import { useState } from 'react'
import type { FormEvent } from 'react'
import { formatBerlinTime } from './tournament'
import type { Tournament } from './tournament'
import { loadTournaments } from './tournament-storage'
import { readBackupFile, restoreBackup } from './tournament-backup'

interface Props {
  onImported: () => void
  onCancel: () => void
}

export default function TournamentImport({ onImported, onCancel }: Props) {
  const [preview, setPreview] = useState<{ incoming: Tournament; existing: Tournament | null; filename: string } | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function select(file: File | undefined) {
    setPreview(null)
    setConfirmed(false)
    setError('')
    if (!file) return
    setBusy(true)
    try {
      const incoming = await readBackupFile(file)
      const existing = loadTournaments().find((item) => item.id === incoming.id) ?? null
      setPreview({ incoming, existing, filename: file.name })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Importfehler: Die Sicherung konnte nicht gelesen werden.')
    } finally {
      setBusy(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!preview || busy || (preview.existing && !confirmed)) return
    setError('')
    setBusy(true)
    try {
      await restoreBackup(preview.incoming, preview.existing)
      onImported()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Importfehler: Das Turnier wurde nicht gespeichert.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="tournament-form" onSubmit={submit} aria-busy={busy}>
      <p className="storage-note">Eine JSON-Sicherung enthält ein vollständiges Turnier, aber keinen Mastercode
        und keine entsperrte Sitzung. Keine automatische Zusammenführung.</p>
      <fieldset disabled={busy}>
        <legend className="sr-only">JSON-Sicherung</legend>
        <label htmlFor="backup-file">JSON-Sicherungsdatei</label>
        <input id="backup-file" type="file" accept=".json,application/json"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            void select(file)
          }} />
        {preview && (
          <div className="schedule-preview">
            <h3>Importvorschau · {preview.filename}</h3>
            <p><strong>{preview.incoming.settings.name}</strong> · {formatBerlinTime(preview.incoming.settings.startsAt)}</p>
            {preview.existing ? (
              <>
                <p>Die ID ist bereits vorhanden: <strong>{preview.existing.settings.name}</strong>.
                  Der lokale Stand wird vollständig ersetzt.</p>
                <p className="replacement-warning">Achtung: Auch der gesamte lokale Ergebnisverlauf und die daraus berechnete Wertung
                  werden ersetzt. Die Sicherung enthält {(preview.incoming.completedMatches?.length ?? 0) + (preview.incoming.knockout?.results.length ?? 0)} abgeschlossene
                  Partien, der lokale Stand {(preview.existing.completedMatches?.length ?? 0) + (preview.existing.knockout?.results.length ?? 0)}.
                  Neuere Ergebnisse können dabei verloren gehen. Es wird nichts zusammengeführt.</p>
                <label className="replacement-confirmation">
                  <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
                  <span>Ich möchte den lokalen Stand einschließlich Ergebnisverlauf und Wertung unwiderruflich ersetzen.</span>
                </label>
              </>
            ) : <p>Wird als zusätzliches Turnier gespeichert.</p>}
          </div>
        )}
        {error && <p className="error-message" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="action-button" type="submit"
            disabled={!preview || Boolean(preview.existing && !confirmed)}>
            {busy ? 'Wird verarbeitet ...' : preview?.existing ? 'Turnier ersetzen' : 'Turnier importieren'}
          </button>
          <button className="secondary-button" type="button" onClick={onCancel}>Abbrechen</button>
        </div>
      </fieldset>
    </form>
  )
}
