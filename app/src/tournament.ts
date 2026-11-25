import { isPlayerList } from './players'
import type { Player } from './players'

export interface TournamentSettings {
  name: string
  startsAt: string
  location: string
  description: string
  matchMinutes: number
  preliminaryMinutes: number
  knockoutMinutes: number
  winPoints: number
  lossPoints: number
}

export interface Tournament {
  version: 1 | 2
  id: string
  revision: number
  phase: 'preparation'
  settings: TournamentSettings
  codeHash: string
  players?: Player[]
}

export interface TournamentDraft {
  name: string
  startsAtLocal: string
  location: string
  description: string
  matchMinutes: string
  preliminaryMinutes: string
  knockoutMinutes: string
  winPoints: string
  lossPoints: string
  code: string
}

export type DraftErrors = Partial<Record<keyof TournamentDraft, string>>

const localFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

export function toBerlinLocal(instant: string): string {
  const parts = localFormatter.formatToParts(new Date(instant))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value
  return `${part('year')?.padStart(4, '0')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`
}

export function parseBerlinLocal(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const wallTime = Date.parse(`${value}:00.000Z`)
  if (!Number.isFinite(wallTime) || new Date(wallTime).toISOString().slice(0, 16) !== value) return null

  // Offsets on either side also cover the Berlin daylight-saving transition.
  const offsets = new Set([-1, 0, 1].map((days) => {
    const sample = wallTime + days * 86_400_000
    return Date.parse(`${toBerlinLocal(new Date(sample).toISOString())}:00.000Z`) - sample
  }))
  const candidates = [...offsets]
    .map((offset) => wallTime - offset)
    .filter((instant) => toBerlinLocal(new Date(instant).toISOString()) === value)
  // For a repeated autumn wall time, select the earlier occurrence.
  return candidates.length ? new Date(Math.min(...candidates)).toISOString() : null
}

export function formatBerlinTime(instant: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(instant))
}

export function planTimes(startsAt: string, preliminaryMinutes: number, knockoutMinutes: number) {
  const knockout = Date.parse(startsAt) + preliminaryMinutes * 60_000
  const end = knockout + knockoutMinutes * 60_000
  if (!Number.isFinite(knockout) || !Number.isFinite(end) || Math.abs(end) > 8.64e15) return null
  return {
    knockout: new Date(knockout).toISOString(),
    end: new Date(end).toISOString(),
  }
}

export function draftFor(tournament?: Tournament): TournamentDraft {
  const settings = tournament?.settings
  return {
    name: settings?.name ?? '',
    startsAtLocal: settings ? toBerlinLocal(settings.startsAt) : '',
    location: settings?.location ?? '',
    description: settings?.description ?? '',
    matchMinutes: String(settings?.matchMinutes ?? 10),
    preliminaryMinutes: String(settings?.preliminaryMinutes ?? 120),
    knockoutMinutes: String(settings?.knockoutMinutes ?? 60),
    winPoints: String(settings?.winPoints ?? 3),
    lossPoints: String(settings?.lossPoints ?? 1),
    code: '',
  }
}

export function validateDraft(
  draft: TournamentDraft,
  editing: boolean,
): { settings: TournamentSettings; errors?: never } | { errors: DraftErrors; settings?: never } {
  const errors: DraftErrors = {}
  if (!draft.name.trim()) errors.name = 'Bitte einen Turniernamen eingeben.'
  if (!draft.location.trim()) errors.location = 'Bitte einen Spielort eingeben.'
  if ((!editing || draft.code !== '') && !draft.code.trim()) {
    errors.code = 'Bitte einen nicht leeren Turniercode eingeben.'
  }
  const startsAt = parseBerlinLocal(draft.startsAtLocal)
  if (!startsAt) errors.startsAtLocal = 'Bitte ein gültiges Datum mit Uhrzeit in Europe/Berlin eingeben.'
  for (const field of ['matchMinutes', 'preliminaryMinutes', 'knockoutMinutes'] as const) {
    if (!draft[field].trim() || !Number.isSafeInteger(Number(draft[field])) || Number(draft[field]) <= 0) {
      errors[field] = 'Bitte eine positive ganze Minutenzahl eingeben.'
    }
  }
  for (const field of ['winPoints', 'lossPoints'] as const) {
    if (!draft[field].trim() || !Number.isSafeInteger(Number(draft[field])) || Number(draft[field]) < 0) {
      errors[field] = 'Bitte eine ganze Punktzahl ab null eingeben.'
    }
  }
  if (!errors.winPoints && !errors.lossPoints && Number(draft.winPoints) <= Number(draft.lossPoints)) {
    errors.winPoints = 'Siegpunkte müssen größer als Niederlagenpunkte sein.'
  }
  if (startsAt && !errors.preliminaryMinutes && !errors.knockoutMinutes &&
      !planTimes(startsAt, Number(draft.preliminaryMinutes), Number(draft.knockoutMinutes))) {
    errors.knockoutMinutes = 'Diese Dauer überschreitet den darstellbaren Zeitbereich.'
  }
  if (Object.keys(errors).length || !startsAt) return { errors }
  return {
    settings: {
      name: draft.name.trim(),
      startsAt,
      location: draft.location.trim(),
      description: draft.description.trim(),
      matchMinutes: Number(draft.matchMinutes),
      preliminaryMinutes: Number(draft.preliminaryMinutes),
      knockoutMinutes: Number(draft.knockoutMinutes),
      winPoints: Number(draft.winPoints),
      lossPoints: Number(draft.lossPoints),
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isTournament(value: unknown): value is Tournament {
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2) || typeof value.id !== 'string' || !value.id ||
      !Number.isSafeInteger(value.revision) || Number(value.revision) < 1 ||
      value.phase !== 'preparation' || typeof value.codeHash !== 'string' ||
      !/^[a-f0-9]{64}$/.test(value.codeHash) || !isRecord(value.settings)) return false
  if ((value.version === 2 || 'players' in value) && !isPlayerList(value.players)) return false
  const settings = value.settings
  if (typeof settings.name !== 'string' || typeof settings.location !== 'string' ||
      typeof settings.description !== 'string' || typeof settings.startsAt !== 'string' ||
      !Number.isFinite(Date.parse(settings.startsAt)) ||
      new Date(settings.startsAt).toISOString() !== settings.startsAt) return false
  for (const field of ['matchMinutes', 'preliminaryMinutes', 'knockoutMinutes', 'winPoints', 'lossPoints'] as const) {
    if (typeof settings[field] !== 'number') return false
  }
  const result = validateDraft({
    name: settings.name, location: settings.location, description: settings.description,
    startsAtLocal: toBerlinLocal(settings.startsAt),
    matchMinutes: String(settings.matchMinutes),
    preliminaryMinutes: String(settings.preliminaryMinutes),
    knockoutMinutes: String(settings.knockoutMinutes),
    winPoints: String(settings.winPoints), lossPoints: String(settings.lossPoints), code: '',
  }, true)
  return !result.errors
}
