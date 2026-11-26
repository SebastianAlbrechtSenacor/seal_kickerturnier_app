import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { avatars, validatePlayerDraft } from './players'
import type { Player, PlayerErrors } from './players'
import { WorkspaceNavigation } from './WorkspaceNavigation'

interface Props {
  players: Player[]
  onSave: (players: Player[]) => Promise<void>
  onBack: () => void
}

type Action = { kind: 'add' } | { kind: 'edit' | 'remove'; player: Player }

export default function PlayerManager({ players, onSave, onBack }: Props) {
  const [action, setAction] = useState<Action | null>(null)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState(false)
  const full = players.length >= avatars.length

  async function savePlayer(player: Player) {
    const updated = action?.kind === 'edit' ?
      players.map((existing) => existing.id === player.id ? player : existing) : [...players, player]
    await onSave(updated)
    setAction(null)
  }

  async function remove() {
    if (action?.kind !== 'remove' || removing) return
    setError('')
    setRemoving(true)
    try {
      await onSave(players.filter((player) => player.id !== action.player.id))
      setAction(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Die Person konnte nicht entfernt werden.')
    } finally {
      setRemoving(false)
    }
  }

  if (action?.kind === 'add' || action?.kind === 'edit') {
    return <PlayerForm players={players} player={action.kind === 'edit' ? action.player : undefined}
      onSave={savePlayer} onCancel={() => setAction(null)} />
  }

  if (action?.kind === 'remove') {
    return (
      <div className="player-removal">
        <h3>Person entfernen?</h3>
        <p><strong>{action.player.avatar} {action.player.nickname}</strong> wird aus diesem Turnier entfernt.
          Der Avatar wird wieder frei.</p>
        {error && <p className="error-message" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="action-button" type="button" disabled={removing} onClick={() => void remove()}>
            {removing ? 'Wird entfernt ...' : 'Entfernen bestätigen'}</button>
          <button className="secondary-button" type="button" disabled={removing} onClick={() => setAction(null)}>Abbrechen</button>
        </div>
      </div>
    )
  }

  return (
    <div className="player-manager">
      <p className="card-description">{players.length} von {avatars.length} Plätzen belegt.
        Jede Person spielt mit eigenem Spitznamen und Emoji-Avatar.</p>
      {players.length ? (
        <ul className="player-list" aria-label="Angemeldete Spielende" tabIndex={0}>
          {players.map((player) => (
            <li key={player.id}>
              <span className="player-identity"><span className="player-avatar" aria-hidden="true">{player.avatar}</span>
                <strong>{player.nickname}</strong></span>
              <div className="player-actions">
                <button className="secondary-button" type="button" aria-label={`${player.nickname} bearbeiten`}
                  onClick={() => setAction({ kind: 'edit', player })}>Bearbeiten</button>
                <button className="secondary-button" type="button" aria-label={`${player.nickname} entfernen`}
                  onClick={() => { setError(''); setAction({ kind: 'remove', player }) }}>Entfernen</button>
              </div>
            </li>
          ))}
        </ul>
      ) : <p>Noch niemand angemeldet. Wer ist dabei?</p>}
      {full && <p role="status">Alle 64 Avatare sind belegt. Entferne eine Person, um einen Platz freizugeben.</p>}
      <div className="form-actions">
        <button className="action-button" type="button" disabled={full}
          onClick={() => setAction({ kind: 'add' })}>Person hinzufügen</button>
        <WorkspaceNavigation>
          <button className="secondary-button" type="button" onClick={onBack}>Zur Turnierübersicht</button>
        </WorkspaceNavigation>
      </div>
    </div>
  )
}

interface FormProps {
  players: Player[]
  player?: Player
  onSave: (player: Player) => Promise<void>
  onCancel: () => void
}

function PlayerForm({ players, player, onSave, onCancel }: FormProps) {
  const [nickname, setNickname] = useState(player?.nickname ?? '')
  const [avatar, setAvatar] = useState(player?.avatar ?? '')
  const [errors, setErrors] = useState<PlayerErrors>({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const occupied = new Set(players.filter((existing) => existing.id !== player?.id).map((existing) => existing.avatar))

  useEffect(() => { input.current?.focus() }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const result = validatePlayerDraft({ nickname, avatar }, players, player?.id)
    setErrors(result.errors ?? {})
    setSaveError('')
    if (result.errors) return
    setSaving(true)
    try {
      await onSave({ id: player?.id ?? crypto.randomUUID(), ...result.player })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Die Person konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="tournament-form player-form" onSubmit={submit} noValidate aria-busy={saving}>
      <h3>{player ? 'Person bearbeiten' : 'Person hinzufügen'}</h3>
      <fieldset disabled={saving}>
        <legend className="sr-only">Spielendendaten</legend>
        <label htmlFor="player-nickname">Spitzname</label>
        <input id="player-nickname" ref={input} value={nickname} autoComplete="off" required
          aria-invalid={Boolean(errors.nickname)} aria-describedby={errors.nickname ? 'player-name-error' : 'player-name-hint'}
          onChange={(event) => { setNickname(event.target.value); setErrors({}); setSaveError('') }} />
        <p className="form-note" id="player-name-hint">Eindeutig in diesem Turnier. Leerzeichen im Namen sind erlaubt.</p>
        {errors.nickname && <p className="error-message" id="player-name-error" role="alert">{errors.nickname}</p>}
        <fieldset className="avatar-fieldset" aria-describedby={errors.avatar ? 'player-avatar-error' : undefined}>
          <legend>Emoji-Avatar</legend>
          <p className="form-note">Einen freien Avatar auswählen. Ausgegraute Avatare sind bereits belegt.</p>
          <div className="avatar-palette">
            {avatars.map((option) => (
              <button key={option.emoji} className="avatar-option" type="button"
                aria-label={`Avatar ${option.label}${occupied.has(option.emoji) ? ' (belegt)' : ''}`}
                title={option.label} aria-pressed={avatar === option.emoji} disabled={occupied.has(option.emoji)}
                onClick={() => { setAvatar(option.emoji); setErrors({}); setSaveError('') }}>
                <span aria-hidden="true">{option.emoji}</span>
              </button>
            ))}
          </div>
          <p className="avatar-selection" aria-live="polite">
            {avatar ? `Ausgewählt: ${avatars.find((option) => option.emoji === avatar)?.label} ${avatar}` : 'Noch kein Avatar ausgewählt.'}
          </p>
          {errors.avatar && <p className="error-message" id="player-avatar-error" role="alert">{errors.avatar}</p>}
        </fieldset>
        {saveError && <p className="error-message" role="alert">{saveError}</p>}
        <div className="form-actions">
          <button className="action-button" type="submit" disabled={saving}>{saving ? 'Wird gespeichert ...' : 'Person speichern'}</button>
          <button className="secondary-button" type="button" disabled={saving} onClick={onCancel}>Abbrechen</button>
        </div>
      </fieldset>
    </form>
  )
}
