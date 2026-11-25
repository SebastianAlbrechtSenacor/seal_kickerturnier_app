import { comparePlayerNames } from './players'
import type { Player } from './players'
import type { CompletedMatch } from './matches'
import type { TournamentSettings } from './tournament'

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

export function calculateStandings(
  players: readonly Player[],
  matches: readonly CompletedMatch[],
  points: Pick<TournamentSettings, 'winPoints' | 'lossPoints'>,
): Standing[] {
  const standings = initialStandings(players)
  const byId = new Map(standings.map((standing) => [standing.player.id, standing]))
  for (const match of matches) {
    for (const color of ['white', 'black'] as const) {
      const goals = color === 'white' ? match.whiteGoals : match.blackGoals
      const against = color === 'white' ? match.blackGoals : match.whiteGoals
      const won = goals > against
      for (const position of ['Attack', 'Defence'] as const) {
        const standing = byId.get(match.lineup[`${color}${position}`] ?? '')
        if (!standing) throw new Error('Ein gespeichertes Ergebnis enthält unbekannte Spielende.')
        standing.played++
        standing.wins += Number(won)
        standing.losses += Number(!won)
        standing.goalsFor += goals
        standing.goalsAgainst += against
        standing.goalDifference += goals - against
        standing.points += won ? points.winPoints : points.lossPoints
      }
    }
  }
  return standings.sort(compareStandings)
}
