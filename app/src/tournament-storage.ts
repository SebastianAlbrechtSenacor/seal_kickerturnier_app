import { isTournament } from './tournament'
import type { Tournament } from './tournament'

const prefix = 'seal-kickerturnier:tournament:'

function storedTournament(raw: string, id: string): Tournament {
  const data: unknown = JSON.parse(raw)
  if (!isTournament(data) || data.id !== id) {
    throw new Error('Die gespeicherten Turnierdaten haben ein ungültiges oder unbekanntes Format.')
  }
  return data
}

export function loadTournaments(): Tournament[] {
  try {
    const storage = window.localStorage
    const tournaments: Tournament[] = []
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index)
      if (!key?.startsWith(prefix)) continue
      const raw = storage.getItem(key)
      if (raw === null) throw new Error('Turnierdaten wurden während des Ladens geändert.')
      tournaments.push(storedTournament(raw, key.slice(prefix.length)))
    }
    return tournaments.sort((a, b) =>
      a.settings.startsAt.localeCompare(b.settings.startsAt) || a.settings.name.localeCompare(b.settings.name, 'de'),
    )
  } catch (cause) {
    throw new Error('Die Turniere konnten nicht geladen werden. Der Browserspeicher ist nicht verfügbar oder gespeicherte Daten sind beschädigt. Es wurde nichts überschrieben.', { cause })
  }
}

export function readTournament(id: string): Tournament {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(`${prefix}${id}`)
  } catch (cause) {
    throw new Error('Das Turnier konnte nicht aus dem Browserspeicher gelesen werden.', { cause })
  }
  if (raw === null) throw new Error('Dieses Turnier ist nicht mehr vorhanden. Bitte die Turnierauswahl neu laden.')
  try {
    return storedTournament(raw, id)
  } catch (cause) {
    throw new Error('Die gespeicherten Turnierdaten sind beschädigt oder haben eine unbekannte Version. Sie wurden nicht verändert.', { cause })
  }
}

export async function saveTournament(tournament: Tournament, expectedRevision: number | null): Promise<void> {
  if (!isTournament(tournament)) throw new Error('Ungültige Turnierdaten können nicht gespeichert werden.')
  if (!navigator.locks) {
    throw new Error('Dieser Browser unterstützt keine sicheren parallelen Speicherzugriffe. Bitte einen aktuellen Browser über HTTPS oder localhost verwenden. Es wurde nichts gespeichert.')
  }
  await navigator.locks.request(`${prefix}${tournament.id}`, () => {
    writeTournament(tournament, expectedRevision)
  })
}

function writeTournament(tournament: Tournament, expectedRevision: number | null): void {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(`${prefix}${tournament.id}`)
  } catch (cause) {
    throw new Error('Der Browserspeicher ist gesperrt. Das Turnier wurde nicht gespeichert; deine Eingaben bleiben erhalten.', { cause })
  }
  if (expectedRevision === null ? raw !== null : raw === null || storedTournament(raw, tournament.id).revision !== expectedRevision) {
    throw new Error('Das Turnier wurde zwischenzeitlich geändert. Bitte den aktuellen Stand über die Turnierauswahl neu öffnen.')
  }
  if (expectedRevision !== null && tournament.revision !== expectedRevision + 1) {
    throw new Error('Ungültige Speicherrevision. Bitte das Turnier über die Turnierauswahl neu öffnen.')
  }
  try {
    window.localStorage.setItem(`${prefix}${tournament.id}`, JSON.stringify(tournament))
  } catch (cause) {
    throw new Error('Das Turnier konnte nicht gespeichert werden. Der Browserspeicher ist gesperrt oder voll. Deine Eingaben bleiben erhalten; bitte erneut versuchen.', { cause })
  }

}

export function assertCurrentTournament(tournament: Tournament): void {
  if (readTournament(tournament.id).revision !== tournament.revision) {
    throw new Error('Das Turnier wurde zwischenzeitlich geändert. Bitte den aktuellen Stand über die Turnierauswahl neu öffnen.')
  }
}
