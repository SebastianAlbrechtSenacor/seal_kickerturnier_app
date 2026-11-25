import { hashCode } from './access'
import { isTournament } from './tournament'
import type { Tournament } from './tournament'
import { saveTournament } from './tournament-storage'

const format = 'seal-kickerturnier-backup'
const tournamentKeys = ['version', 'id', 'revision', 'phase', 'settings', 'codeHash', 'players']
const settingsKeys = [
  'name', 'startsAt', 'location', 'description', 'matchMinutes',
  'preliminaryMinutes', 'knockoutMinutes', 'winPoints', 'lossPoints',
]

function hasOnlyKeys(value: object, keys: string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key))
}

function isSupportedTournament(value: unknown): value is Tournament {
  return isTournament(value) && hasOnlyKeys(value, tournamentKeys) &&
    hasOnlyKeys(value.settings, settingsKeys)
}

export function serializeBackup(tournament: Tournament): string {
  if (!isSupportedTournament(tournament)) {
    throw new Error('Dieses Turnier hat ein ungültiges oder unbekanntes Format und kann nicht exportiert werden.')
  }
  return JSON.stringify({ format, version: 1, tournament }, null, 2)
}

export function parseBackup(text: string): Tournament {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch (cause) {
    throw new Error('Importfehler: Die Datei enthält kein gültiges JSON.', { cause })
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
      !('format' in value) || value.format !== format ||
      !('version' in value) || value.version !== 1 ||
      !hasOnlyKeys(value, ['format', 'version', 'tournament']) ||
      !('tournament' in value) || !isSupportedTournament(value.tournament)) {
    throw new Error('Importfehler: Unbekanntes Sicherungsformat, unbekannte Version oder ungültige Turnierdaten. Es wurde nichts verändert.')
  }
  return value.tournament
}

export async function restoreBackup(
  incoming: Tournament,
  existing: Tournament | null,
  code: string,
): Promise<void> {
  if (!isSupportedTournament(incoming) || (existing && existing.id !== incoming.id)) {
    throw new Error('Importfehler: Ungültige Turnierdaten. Es wurde nichts verändert.')
  }
  if (existing && await hashCode(code) !== existing.codeHash) {
    throw new Error('Der bestehende Turniercode ist nicht korrekt. Es wurde nichts ersetzt.')
  }
  const tournament = {
    ...incoming,
    // Never resurrect an old revision and accidentally validate stale tabs.
    revision: existing ? existing.revision + 1 : incoming.revision,
  }
  await saveTournament(tournament, existing?.revision ?? null)
}

export function readBackupFile(file: File): Promise<Tournament> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Importfehler: Die Datei konnte nicht gelesen werden. Bitte erneut auswählen.'))
    reader.onabort = () => reject(new Error('Importfehler: Das Lesen der Datei wurde abgebrochen.'))
    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') throw new Error('Importfehler: Die Datei enthält keinen lesbaren Text.')
        resolve(parseBackup(reader.result))
      } catch (error) {
        reject(error)
      }
    }
    reader.readAsText(file, 'UTF-8')
  })
}

export function downloadBackup(tournament: Tournament): void {
  const blob = new Blob([serializeBackup(tournament)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `kickerturnier-${encodeURIComponent(tournament.id)}.json`
  document.body.append(link)
  try {
    link.click()
  } finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}
