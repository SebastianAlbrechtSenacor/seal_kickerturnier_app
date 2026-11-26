import { isTournament, withoutLegacyCode } from './tournament'
import type { Tournament } from './tournament'
import { changePreliminaryResult } from './matches'
import type { ActiveTournament, PreliminaryResultChange } from './matches'

const prefix = 'seal-kickerturnier:tournament:'

function storedTournament(raw: string, id: string): Tournament {
  const data: unknown = JSON.parse(raw)
  if (!isTournament(data) || data.id !== id) {
    throw new Error('Die gespeicherten Turnierdaten haben ein ungültiges oder unbekanntes Format.')
  }
  return withoutLegacyCode(data)
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

export function updatePreliminaryResult(tournament: Tournament, matchId: string, change: PreliminaryResultChange): Promise<Tournament> {
  return withTournamentLock(tournament.id, () => {
    const current = assertCurrentTournament(tournament)
    const next = changePreliminaryResult(current, matchId, change)
    writeTournament(next, current.revision, 'preliminary-result')
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

function writeTournament(tournament: Tournament, expectedRevision: number | null, operation: 'update' | 'restore' | 'preliminary-result'): void {
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
  if (operation === 'update' && current) {
    const previous = current.completedMatches ?? []
    const next = tournament.completedMatches ?? []
    if (JSON.stringify(next.slice(0, previous.length)) !== JSON.stringify(previous) ||
        next.length > previous.length + 1 ||
        (next.length > previous.length &&
          (current.phase !== 'preliminary' || !current.activeMatch || tournament.activeMatch !== null ||
            next.at(-1)?.id !== current.activeMatch.id || next.at(-1)?.corrected))) {
      throw new Error('Gespeicherte Ergebnisse sind unveränderlich. Bitte das Turnier erneut öffnen.')
    }
  }
  if (operation !== 'restore' && current?.knockout) {
    const previous = current.knockout.results
    const next = tournament.knockout
    if (!next || JSON.stringify(current.knockout.standings) !== JSON.stringify(next.standings) ||
        JSON.stringify(current.knockout.teams) !== JSON.stringify(next.teams) ||
        JSON.stringify(previous) !== JSON.stringify(next.results.slice(0, previous.length)) ||
        next.results.length > previous.length + 1 ||
        (next.results.length > previous.length && (!current.activeMatch || tournament.activeMatch !== null ||
          next.results.at(-1)?.id !== current.activeMatch.id))) {
      throw new Error('K.-o.-Teams, Vorrundenstand und gespeicherte Ergebnisse sind unveränderlich.')
    }
  }
  if (operation !== 'restore' && current && current.phase !== 'preparation' &&
      (tournament.phase === 'preparation' || (current.phase === 'knockout' && tournament.phase !== 'knockout') ||
       JSON.stringify(tournament.settings) !== JSON.stringify(current.settings) ||
       JSON.stringify(tournament.players) !== JSON.stringify(current.players))) {
    throw new Error('Das Turnier wurde bereits gestartet. Einstellungen und Spielende sind gesperrt.')
  }
  try {
    window.localStorage.setItem(`${prefix}${tournament.id}`, JSON.stringify(withoutLegacyCode(tournament)))
  } catch (cause) {
    throw new Error('Das Turnier konnte nicht gespeichert werden. Der Browserspeicher ist gesperrt oder voll. Deine Eingaben bleiben erhalten; bitte erneut versuchen.', { cause })
  }

}

export function assertCurrentTournament(tournament: Tournament): Tournament {
  const current = readTournament(tournament.id)
  if (current.revision !== tournament.revision) {
    throw new Error('Das Turnier wurde zwischenzeitlich geändert. Bitte den aktuellen Stand über die Turnierauswahl neu öffnen.')
  }
  return current
}
