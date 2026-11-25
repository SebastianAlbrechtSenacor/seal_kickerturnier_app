import { isTournament } from './tournament'
import type { Tournament } from './tournament'
import type { ActiveTournament } from './matches'

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

export async function saveTournament(
  tournament: Tournament,
  expectedRevision: number | null,
  operation: 'update' | 'restore' = 'update',
): Promise<void> {
  if (!isTournament(tournament)) throw new Error('Ungültige Turnierdaten können nicht gespeichert werden.')
  await withTournamentLock(tournament.id, () => {
    writeTournament(tournament, expectedRevision, operation)
  })
}

function withTournamentLock<T>(id: string, action: () => T): Promise<T> {
  if (!navigator.locks) {
    return Promise.reject(new Error('Dieser Browser unterstützt keine sicheren parallelen Speicherzugriffe. Bitte einen aktuellen Browser über HTTPS oder localhost verwenden. Es wurde nichts gespeichert.'))
  }
  return navigator.locks.request(`${prefix}${id}`, action)
}

export function updateTournament<T extends Tournament>(tournament: Tournament, update: (current: Tournament) => T): Promise<T> {
  return withTournamentLock(tournament.id, () => {
    assertCurrentTournament(tournament)
    const next = update(tournament)
    writeTournament(next, tournament.revision, 'update')
    return next
  })
}

export function claimWhistle(id: string, matchId: string): Promise<{ tournament: ActiveTournament; claimed: boolean }> {
  return withTournamentLock(id, () => {
    const tournament = readTournament(id)
    const match = tournament.activeMatch
    if (!match || match.id !== matchId) throw new Error('Die Partie wurde zwischenzeitlich geändert. Bitte das Turnier erneut öffnen.')
    if (Date.now() < Date.parse(match.endsAt)) throw new Error('Die Partie ist noch nicht abgelaufen.')
    if (match.whistleAttempted) return { tournament: { ...tournament, activeMatch: match }, claimed: false }
    const next: ActiveTournament = {
      ...tournament, revision: tournament.revision + 1, activeMatch: { ...match, whistleAttempted: true },
    }
    writeTournament(next, tournament.revision, 'update')
    return { tournament: next, claimed: true }
  })
}

function writeTournament(tournament: Tournament, expectedRevision: number | null, operation: 'update' | 'restore'): void {
  if (!isTournament(tournament)) throw new Error('Ungültige Turnierdaten können nicht gespeichert werden.')
  let raw: string | null
  try {
    raw = window.localStorage.getItem(`${prefix}${tournament.id}`)
  } catch (cause) {
    throw new Error('Der Browserspeicher ist gesperrt. Das Turnier wurde nicht gespeichert; deine Eingaben bleiben erhalten.', { cause })
  }
  const current = raw === null ? null : storedTournament(raw, tournament.id)
  if (expectedRevision === null ? current !== null : current?.revision !== expectedRevision) {
    throw new Error('Das Turnier wurde zwischenzeitlich geändert. Bitte den aktuellen Stand über die Turnierauswahl neu öffnen.')
  }
  if (expectedRevision !== null && tournament.revision !== expectedRevision + 1) {
    throw new Error('Ungültige Speicherrevision. Bitte das Turnier über die Turnierauswahl neu öffnen.')
  }
  if (operation === 'restore' && current?.activeMatch) {
    throw new Error('Dieses Turnier hat eine offene Partie. Bitte diese vor dem Ersetzen ausdrücklich abbrechen.')
  }
  if (operation === 'update' && current?.phase === 'preliminary' &&
      (tournament.phase !== 'preliminary' || tournament.codeHash !== current.codeHash ||
       JSON.stringify(tournament.settings) !== JSON.stringify(current.settings) ||
       JSON.stringify(tournament.players) !== JSON.stringify(current.players))) {
    throw new Error('Das Turnier wurde bereits gestartet. Einstellungen, Turniercode und Spielende sind gesperrt.')
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
