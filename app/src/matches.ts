import { lineupError, positions } from './lineup'
import type { Lineup } from './lineup'
import type { Player } from './players'
import type { Tournament } from './tournament'
import { isTournament } from './tournament'

export interface OpenMatch {
  id: string
  lineup: Lineup
  startedAt: string
  endsAt: string
  whistleAttempted: boolean
}

export type ActiveTournament = Tournament & { activeMatch: OpenMatch }

export interface CompletedMatch extends OpenMatch {
  whiteGoals: number
  blackGoals: number
  finishedAt: string
  corrected?: true
}

export type PreliminaryResultChange =
  | { kind: 'correct'; white: string; black: string }
  | { kind: 'delete' }

function isInstant(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
}

export function isOpenMatch(value: unknown, players: readonly Player[], minutes: number): value is OpenMatch {
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
      Object.keys(value).some((key) => !['id', 'lineup', 'startedAt', 'endsAt', 'whistleAttempted'].includes(key)) ||
      !('id' in value) || typeof value.id !== 'string' || !value.id ||
      !('startedAt' in value) || !isInstant(value.startedAt) ||
      !('endsAt' in value) || !isInstant(value.endsAt) ||
      !('whistleAttempted' in value) || typeof value.whistleAttempted !== 'boolean' ||
      !('lineup' in value) || typeof value.lineup !== 'object' || value.lineup === null || Array.isArray(value.lineup)) return false
  const lineup = value.lineup
  if (Object.keys(lineup).length !== positions.length ||
      !('whiteAttack' in lineup) || typeof lineup.whiteAttack !== 'string' ||
      !('whiteDefence' in lineup) || typeof lineup.whiteDefence !== 'string' ||
      !('blackAttack' in lineup) || typeof lineup.blackAttack !== 'string' ||
      !('blackDefence' in lineup) || typeof lineup.blackDefence !== 'string') return false
  return lineupError({
    whiteAttack: lineup.whiteAttack, whiteDefence: lineup.whiteDefence,
    blackAttack: lineup.blackAttack, blackDefence: lineup.blackDefence,
  }, players) === null && Date.parse(value.endsAt) - Date.parse(value.startedAt) === minutes * 60_000
    && Date.parse(value.endsAt) > Date.parse(value.startedAt)
}

function isCompletedMatch(value: unknown, players: readonly Player[], minutes: number, allowCorrection: boolean): value is CompletedMatch {
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
      !('whiteGoals' in value) || typeof value.whiteGoals !== 'number' ||
      !('blackGoals' in value) || typeof value.blackGoals !== 'number' ||
      !('finishedAt' in value) || !isInstant(value.finishedAt)) return false
  if ('corrected' in value && (!allowCorrection || value.corrected !== true)) return false
  const { whiteGoals, blackGoals, finishedAt, ...details } = value
  const { corrected, ...match } = 'corrected' in details ? details : { ...details, corrected: undefined }
  return isOpenMatch(match, players, minutes) &&
    Date.parse(finishedAt) >= Date.parse(match.startedAt) &&
    resultError(String(whiteGoals), String(blackGoals), corrected === true || Date.parse(finishedAt) >= Date.parse(match.endsAt)) === null
}

export function isCompletedMatches(value: unknown, players: readonly Player[], minutes: number, allowCorrection = false): value is CompletedMatch[] {
  if (!Array.isArray(value)) return false
  const ids = new Set<string>()
  return value.every((match: unknown) => {
    if (!isCompletedMatch(match, players, minutes, allowCorrection) || ids.has(match.id)) return false
    ids.add(match.id)
    return true
  })
}

export function editablePreliminaryResults(tournament: Tournament): CompletedMatch[] {
  if (tournament.phase !== 'preliminary' || tournament.activeMatch || tournament.knockout) return []
  return tournament.completedMatches?.slice(-3) ?? []
}

export function changePreliminaryResult(tournament: Tournament, matchId: string, change: PreliminaryResultChange): Tournament {
  if (!editablePreliminaryResults(tournament).some((match) => match.id === matchId)) {
    throw new Error('Nur die letzten drei Vorrundenergebnisse sind ohne offene Partie und vor dem K.-o.-Start bearbeitbar.')
  }
  const matches = tournament.completedMatches ?? []
  if (change.kind === 'delete') {
    return { ...tournament, revision: tournament.revision + 1, completedMatches: matches.filter((match) => match.id !== matchId) }
  }
  const problem = resultError(change.white, change.black, true)
  if (problem) throw new Error(problem)
  return {
    ...tournament, revision: tournament.revision + 1,
    completedMatches: matches.map((match) => match.id === matchId ?
      { ...match, whiteGoals: Number(change.white), blackGoals: Number(change.black), corrected: true } : match),
  }
}

export function finishMatch(tournament: Tournament, matchId: string, white: string, black: string, now = Date.now()): Tournament {
  const match = tournament.activeMatch
  if (tournament.phase !== 'preliminary' || !match || match.id !== matchId) {
    throw new Error('Die Partie wurde zwischenzeitlich geändert. Bitte das Turnier erneut öffnen.')
  }
  const completed = completeMatch(match, white, black, now)
  const next: Tournament = {
    ...tournament, version: tournament.version >= 4 ? tournament.version : 4, revision: tournament.revision + 1, activeMatch: null,
    completedMatches: [...(tournament.completedMatches ?? []), completed],
  }
  if (!isTournament(next)) throw new Error('Das Ergebnis kann nicht gespeichert werden: Die Turnierdaten oder berechneten Punktzahlen sind ungültig.')
  return next
}

export function completeMatch(match: OpenMatch, first: string, second: string, now: number): CompletedMatch {
  const problem = resultError(first, second, now >= Date.parse(match.endsAt))
  if (problem) throw new Error(problem)
  if (!Number.isFinite(now) || Math.abs(now) > 8.64e15 || now < Date.parse(match.startedAt)) {
    throw new Error('Der Abschlusszeitpunkt ist ungültig. Bitte die Geräteuhr prüfen.')
  }
  return { ...match, whiteGoals: Number(first), blackGoals: Number(second), finishedAt: new Date(now).toISOString() }
}

export function startMatch(tournament: Tournament, lineup: Lineup, now = Date.now()): ActiveTournament {
  if (tournament.phase !== 'preliminary') throw new Error('Partien können nur in der Vorrunde gestartet werden.')
  if (tournament.activeMatch) throw new Error('Es ist bereits eine Partie offen.')
  const problem = lineupError(lineup, tournament.players ?? [])
  if (problem) throw new Error(problem)
  return {
    ...tournament, version: tournament.version >= 4 ? tournament.version : 3, revision: tournament.revision + 1,
    activeMatch: createOpenMatch(lineup, tournament.settings.matchMinutes, now),
  }
}

export function createOpenMatch(lineup: Lineup, minutes: number, now: number): OpenMatch {
  const end = now + minutes * 60_000
  if (!Number.isFinite(now) || !Number.isFinite(end) || Math.abs(end) > 8.64e15 || Math.abs(now) > 8.64e15) {
    throw new Error('Diese Partiedauer überschreitet den darstellbaren Zeitbereich.')
  }
  return {
    id: crypto.randomUUID(), lineup: { ...lineup },
    startedAt: new Date(now).toISOString(), endsAt: new Date(end).toISOString(), whistleAttempted: false,
  }
}

export function abortMatch(tournament: Tournament): Tournament {
  if (!tournament.activeMatch) throw new Error('Es ist keine Partie mehr offen. Bitte das Turnier erneut öffnen.')
  return { ...tournament, version: tournament.version >= 4 ? tournament.version : 3, revision: tournament.revision + 1, activeMatch: null }
}

export function remainingSeconds(endsAt: string, now: number): number {
  return Math.max(0, Math.ceil((Date.parse(endsAt) - now) / 1000))
}

export function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

export function resultError(white: string, black: string, expired: boolean): string | null {
  if ([white, black].some((value) => !value.trim() || !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 10)) {
    return 'Bitte für beide Teams ganze Tore von 0 bis 10 eingeben.'
  }
  if (Number(white) === Number(black)) {
    return expired ? 'Gleichstand: Bitte bis zum nächsten entscheidenden Tor weiterspielen.' : 'Ein Unentschieden ist nicht zulässig.'
  }
  if (!expired && Math.max(Number(white), Number(black)) !== 10) {
    return 'Vor Zeitablauf muss genau ein Team 10 Tore erreicht haben.'
  }
  return null
}
