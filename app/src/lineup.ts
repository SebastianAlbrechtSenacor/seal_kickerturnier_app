import type { Player } from './players'

export const positions = [
  { id: 'whiteDefence', label: 'Weiß Verteidigung', team: 'white' },
  { id: 'blackAttack', label: 'Schwarz Angriff', team: 'black' },
  { id: 'whiteAttack', label: 'Weiß Angriff', team: 'white' },
  { id: 'blackDefence', label: 'Schwarz Verteidigung', team: 'black' },
] as const

export type Position = typeof positions[number]['id']
export type Lineup = Record<Position, string | null>

export function emptyLineup(): Lineup {
  return { whiteAttack: null, whiteDefence: null, blackAttack: null, blackDefence: null }
}

export function isPosition(value: string | undefined): value is Position {
  return positions.some((position) => position.id === value)
}

export function assignPlayer(lineup: Lineup, position: Position, playerId: string, players: readonly Player[]): Lineup {
  if (!players.some((player) => player.id === playerId)) {
    throw new Error('Diese Person gehört nicht zum Turnier.')
  }
  if (positions.some((other) => other.id !== position && lineup[other.id] === playerId)) {
    throw new Error('Diese Person ist bereits auf einer anderen Position eingesetzt.')
  }
  return { ...lineup, [position]: playerId }
}

export function lineupError(lineup: Lineup, players: readonly Player[]): string | null {
  const ids = positions.map((position) => lineup[position.id])
  if (ids.some((id) => id !== null && !players.some((player) => player.id === id))) {
    return 'Die Aufstellung enthält eine unbekannte Person.'
  }
  const occupied = ids.filter((id) => id !== null)
  if (new Set(occupied).size !== occupied.length) return 'Jede Person darf nur eine Position belegen.'
  if (occupied.length !== positions.length) return 'Bitte alle vier Positionen mit verschiedenen Personen belegen.'
  return null
}
