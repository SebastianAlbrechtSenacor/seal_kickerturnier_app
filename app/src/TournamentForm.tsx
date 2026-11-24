import { useState } from 'react'
import type { FormEvent } from 'react'
import { draftFor, formatBerlinTime, parseBerlinLocal, planTimes, validateDraft } from './tournament'
import type { Tournament, TournamentDraft, TournamentSettings } from './tournament'

interface Props {
  tournament?: Tournament
  onSave: (settings: TournamentSettings, code: string) => Promise<void>
  onCancel: () => void
}

type FieldName = Exclude<keyof TournamentDraft, 'description'>

const fields: { name: FieldName; label: string; type: string; min?: number }[] = [
  { name: 'name', label: 'Turniername', type: 'text' },
  { name: 'startsAtLocal', label: 'Datum und Startzeit (Europe/Berlin)', type: 'datetime-local' },
  { name: 'location', label: 'Spielort', type: 'text' },
  { name: 'matchMinutes', label: 'Dauer je Partie (Minuten)', type: 'number', min: 1 },
  { name: 'preliminaryMinutes', label: 'Geplante Vorrunde (Minuten)', type: 'number', min: 1 },
  { name: 'knockoutMinutes', label: 'Geplante K.-o.-Phase (Minuten)', type: 'number', min: 1 },
  { name: 'winPoints', label: 'Punkte je Sieg', type: 'number', min: 0 },
  { name: 'lossPoints', label: 'Punkte je Niederlage', type: 'number', min: 0 },
  { name: 'code', label: 'Turnier-Zugangscode', type: 'password' },
]

export default function TournamentForm({ tournament, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(() => draftFor(tournament))
  const [errors, setErrors] = useState<Partial<Record<keyof TournamentDraft, string>>>({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const startsAt = parseBerlinLocal(draft.startsAtLocal)
  const preliminary = Number(draft.preliminaryMinutes)
  const knockout = Number(draft.knockoutMinutes)
  const plan = startsAt && Number.isSafeInteger(preliminary) && preliminary > 0 &&
    Number.isSafeInteger(knockout) && knockout > 0 ? planTimes(startsAt, preliminary, knockout) : null

  function change(name: keyof TournamentDraft, value: string) {
    setDraft((current) => ({ ...current, [name]: value }))
    setErrors({})
    setSaveError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const result = validateDraft(draft, Boolean(tournament))
    if (result.errors) {
      setErrors(result.errors)
      setSaveError('')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      await onSave(result.settings, draft.code)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Das Turnier konnte nicht gespeichert werden. Bitte erneut versuchen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="tournament-form" onSubmit={submit} noValidate aria-busy={saving}>
      <p className="form-note">Pflichtfelder bitte ausfüllen. Beschreibung ist optional.
        {tournament && ' Ein leerer Turniercode behält den bisherigen Code bei.'}</p>
      <fieldset disabled={saving}>
        <legend className="sr-only">Turniereinstellungen</legend>
        <div className="form-grid">
          {fields.map((field) => (
            <div className="form-field" key={field.name}>
              <label htmlFor={`tournament-${field.name}`}>{field.label}</label>
              <input
                id={`tournament-${field.name}`}
                name={field.name}
                type={field.type}
                value={draft[field.name]}
                required={field.name !== 'code' || !tournament}
                min={field.min}
                step={field.type === 'number' ? 1 : field.type === 'datetime-local' ? 60 : undefined}
                autoComplete={field.name === 'code' ? 'new-password' : 'off'}
                autoCapitalize={field.name === 'code' ? 'none' : undefined}
                spellCheck={field.name === 'code' ? false : undefined}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
                onChange={(event) => change(field.name, event.target.value)}
              />
              {errors[field.name] && <p className="error-message" id={`error-${field.name}`} role="alert">{errors[field.name]}</p>}
            </div>
          ))}
          <div className="form-field full-width">
            <label htmlFor="tournament-description">Beschreibung (optional)</label>
            <textarea id="tournament-description" rows={3} value={draft.description}
              onChange={(event) => change('description', event.target.value)} />
          </div>
        </div>
        <aside className="schedule-preview" aria-label="Zeitplanung" aria-live="polite">
          <h3>Zeitplanung</h3>
          {plan ? (
            <dl>
              <div><dt>Geplanter K.-o.-Beginn</dt><dd>{formatBerlinTime(plan.knockout)}</dd></div>
              <div><dt>Geplantes Turnierende</dt><dd>{formatBerlinTime(plan.end)}</dd></div>
            </dl>
          ) : <p>Datum und positive Phasendauern eingeben, um die Planung zu sehen.</p>}
          <p>Nur zur Planung: Start und Phasenwechsel bleiben manuell. Die Partiedauer ist unabhängig davon.</p>
        </aside>
        {saveError && <p className="error-message" role="alert">{saveError}</p>}
        <div className="form-actions">
          <button className="action-button" type="submit">{saving ? 'Wird gespeichert ...' : 'Turnier speichern'}</button>
          <button className="secondary-button" type="button" onClick={onCancel}>Abbrechen</button>
        </div>
      </fieldset>
    </form>
  )
}
