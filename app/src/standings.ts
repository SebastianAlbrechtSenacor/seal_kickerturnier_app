import { comparePlayerNames } from './players'
import type { Player } from './players'

export interface Standing {
  player: Player
  played: number
  wins: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export function compareStandings(first: Standing, second: Standing): number {
  return second.points - first.points ||
    second.wins - first.wins ||
    second.goalDifference - first.goalDifference ||
    second.goalsFor - first.goalsFor ||
    comparePlayerNames(first.player.nickname, second.player.nickname)
}

export function initialStandings(players: readonly Player[]): Standing[] {
  return players.map((player) => ({
    player, played: 0, wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
  })).sort(compareStandings)
}
