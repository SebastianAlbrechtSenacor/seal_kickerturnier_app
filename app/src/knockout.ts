import { completeMatch, createOpenMatch, isCompletedMatches } from './matches'
import type { ActiveTournament, CompletedMatch, OpenMatch } from './matches'
import { positions } from './lineup'
import type { Lineup } from './lineup'
import type { Player } from './players'
import { calculateStandings } from './standings'
import type { Standing } from './standings'
import { isTournament } from './tournament'
import type { Tournament } from './tournament'

export interface KnockoutTeam {
  id: 'A' | 'B' | 'C' | 'D'
  playerIds: [string, string]
}

export interface KnockoutState {
  standings: Standing[]
  teams: KnockoutTeam[]
  results: CompletedMatch[]
}

export interface KnockoutFixture {
  index: number
  title: string
  first?: KnockoutTeam
  second?: KnockoutTeam
  result?: CompletedMatch
}

export type ReadyFixture = KnockoutFixture & { first: KnockoutTeam; second: KnockoutTeam }

export function teamsFor(standings: readonly Standing[]): KnockoutTeam[] {
  if (standings.length < 8) throw new Error('Für die K.-o.-Phase sind mindestens acht Spielende erforderlich.')
  return (['A', 'B', 'C', 'D'] as const).map((id, index): KnockoutTeam =>
    ({ id, playerIds: [standings[index].player.id, standings[7 - index].player.id] }))
}

export function knockoutFixtures(state: KnockoutState): KnockoutFixture[] {
  const team = (id: KnockoutTeam['id']) => {
    const found = state.teams.find((item) => item.id === id)
    if (!found) throw new Error('Der gespeicherte K.-o.-Spielplan enthält ein unbekanntes Team.')
    return found
  }
  const first = [team('A'), team('D')]
  const second = [team('B'), team('C')]
  const outcome = (index: number, winner: boolean) => {
    const result = state.results[index]
    if (!result) return undefined
    const pair = index === 0 ? first : second
    return pair[Number((result.whiteGoals > result.blackGoals) !== winner)]
  }
  return [
    { index: 0, title: 'Halbfinale 1', first: first[0], second: first[1], result: state.results[0] },
    { index: 1, title: 'Halbfinale 2', first: second[0], second: second[1], result: state.results[1] },
    { index: 2, title: 'Spiel um Platz 3', first: outcome(0, false), second: outcome(1, false), result: state.results[2] },
    { index: 3, title: 'Finale', first: outcome(0, true), second: outcome(1, true), result: state.results[3] },
  ]
}

export function nextKnockoutFixture(state: KnockoutState): ReadyFixture | null {
  const fixture = knockoutFixtures(state)[state.results.length]
  if (!fixture) return null
  if (!fixture.first || !fixture.second) throw new Error('Die vorherigen K.-o.-Ergebnisse fehlen.')
  return { ...fixture, first: fixture.first, second: fixture.second }
}

export function knockoutLineup(fixture: ReadyFixture): Lineup {
  return {
    whiteDefence: fixture.first.playerIds[0], whiteAttack: fixture.first.playerIds[1],
    blackDefence: fixture.second.playerIds[0], blackAttack: fixture.second.playerIds[1],
  }
}

export function knockoutTeamName(team: KnockoutTeam, players: readonly Player[]): string {
  return `Team ${team.id} (${team.playerIds.map((id) => {
    const player = players.find((person) => person.id === id)
    if (!player) throw new Error('Das K.-o.-Team enthält unbekannte Spielende.')
    return `${player.avatar} ${player.nickname}`
  }).join(' + ')})`
}

export function knockoutStartError(tournament: Tournament): string | null {
  if (tournament.phase !== 'preliminary') return 'Die K.-o.-Phase kann nur aus der Vorrunde gestartet werden.'
  if (tournament.activeMatch) return 'Zuerst die offene Partie speichern oder ausdrücklich abbrechen.'
  if ((tournament.players?.length ?? 0) < 8) return 'Für die K.-o.-Phase sind mindestens acht Spielende erforderlich.'
  return null
}

export function startKnockout(tournament: Tournament): Tournament {
  const error = knockoutStartError(tournament)
  if (error) throw new Error(error)
  const standings = structuredClone(calculateStandings(tournament.players ?? [], tournament.completedMatches ?? [], tournament.settings))
  const next: Tournament = {
    ...tournament, version: 5, revision: tournament.revision + 1, phase: 'knockout',
    activeMatch: null, completedMatches: tournament.completedMatches ?? [],
    knockout: { standings, teams: teamsFor(standings), results: [] },
  }
  if (!isTournament(next)) throw new Error('Die Turnierdaten sind ungültig. Die K.-o.-Phase wurde nicht gestartet.')
  return next
}

export function startKnockoutMatch(tournament: Tournament, now = Date.now()): ActiveTournament {
  if (tournament.phase !== 'knockout' || !tournament.knockout) throw new Error('Die K.-o.-Phase wurde noch nicht gestartet.')
  if (tournament.activeMatch) throw new Error('Es ist bereits eine Partie offen.')
  const fixture = nextKnockoutFixture(tournament.knockout)
  if (!fixture) throw new Error('Die K.-o.-Phase ist bereits abgeschlossen.')
  return {
    ...tournament, revision: tournament.revision + 1,
    activeMatch: createOpenMatch(knockoutLineup(fixture), tournament.settings.matchMinutes, now),
  }
}

export function finishKnockoutMatch(tournament: Tournament, matchId: string, first: string, second: string, now = Date.now()): Tournament {
  if (tournament.phase !== 'knockout' || !tournament.knockout || tournament.activeMatch?.id !== matchId) {
    throw new Error('Die Partie wurde zwischenzeitlich geändert. Bitte das Turnier erneut öffnen.')
  }
  const next: Tournament = {
    ...tournament, revision: tournament.revision + 1, activeMatch: null,
    knockout: { ...tournament.knockout, results: [...tournament.knockout.results, completeMatch(tournament.activeMatch, first, second, now)] },
  }
  if (!isTournament(next)) throw new Error('Das K.-o.-Ergebnis enthält ungültige Daten und wurde nicht gespeichert.')
  return next
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isKnockoutState(
  value: unknown, standings: Standing[], players: Player[], minutes: number, activeMatch: OpenMatch | null,
): value is KnockoutState {
  if (!isRecord(value) || Object.keys(value).length !== 3 ||
      standings.length < 8 || !Array.isArray(value.standings) || value.standings.length !== standings.length ||
      !Array.isArray(value.teams) || value.teams.length !== 4 ||
      !isCompletedMatches(value.results, players, minutes) || value.results.length > 4) return false
  const stats = ['played', 'wins', 'losses', 'goalsFor', 'goalsAgainst', 'goalDifference', 'points'] as const
  if (!value.standings.every((row: unknown, index: number) => {
    const expected = standings[index]
    return isRecord(row) && Object.keys(row).length === 8 && isRecord(row.player) &&
      Object.keys(row.player).length === 3 && row.player.id === expected.player.id &&
      row.player.nickname === expected.player.nickname && row.player.avatar === expected.player.avatar &&
      stats.every((key) => row[key] === expected[key])
  })) return false
  const teams = teamsFor(standings)
  if (!value.teams.every((item: unknown, index: number) =>
    isRecord(item) && Object.keys(item).length === 2 && item.id === teams[index].id &&
    Array.isArray(item.playerIds) && item.playerIds.length === 2 &&
    item.playerIds.every((id: unknown, person: number) => id === teams[index].playerIds[person]))) return false
  const state: KnockoutState = { standings, teams, results: [] }
  const matchesLineup = (match: OpenMatch) => {
    const fixture = nextKnockoutFixture(state)
    return fixture !== null && positions.every(({ id }) => match.lineup[id] === knockoutLineup(fixture)[id])
  }
  for (const match of value.results) {
    if (!matchesLineup(match)) return false
    state.results.push(match)
  }
  return activeMatch === null || (matchesLineup(activeMatch) && !state.results.some((match) => match.id === activeMatch.id))
}
