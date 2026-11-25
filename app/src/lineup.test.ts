import { describe, expect, it } from 'vitest'
import { assignPlayer, emptyLineup, lineupError, positions } from './lineup'
import type { Player } from './players'

const players: Player[] = ['Alex', 'Bea', 'Chris', 'Dana', 'Emil'].map((nickname, index) => ({
  id: `p-${index}`, nickname, avatar: ['🐶', '🐱', '🐭', '🐹', '🐰'][index],
}))

describe('Aufstellungsregeln', () => {
  it('erlaubt erst vier bekannte verschiedene Personen und veraendert den Ausgangsentwurf nicht', () => {
    const original = emptyLineup()
    let lineup = original
    for (const [index, position] of positions.entries()) {
      expect(lineupError(lineup, players)).toContain('alle vier')
      lineup = assignPlayer(lineup, position.id, players[index].id, players)
    }
    expect(lineupError(lineup, players)).toBeNull()
    expect(Object.values(original)).toEqual([null, null, null, null])
  })

  it('verhindert unbekannte Personen und doppelte Belegungen', () => {
    const lineup = assignPlayer(emptyLineup(), 'whiteAttack', players[0].id, players)
    expect(() => assignPlayer(lineup, 'blackAttack', players[0].id, players)).toThrow('bereits')
    expect(() => assignPlayer(lineup, 'whiteDefence', 'foreign', players)).toThrow('gehört nicht')
    expect(lineupError({ ...lineup, blackAttack: players[0].id }, players)).toContain('nur eine')
    expect(lineupError({ ...lineup, blackAttack: 'foreign' }, players)).toContain('unbekannte')
  })

  it('ersetzt eine Belegung durch eine freie Person und erlaubt die vorherige erneut', () => {
    const first = assignPlayer(emptyLineup(), 'whiteAttack', players[0].id, players)
    const replaced = assignPlayer(first, 'whiteAttack', players[4].id, players)
    const next = assignPlayer(replaced, 'whiteDefence', players[0].id, players)
    expect(next).toMatchObject({ whiteAttack: players[4].id, whiteDefence: players[0].id })
    expect(first.whiteAttack).toBe(players[0].id)
  })
})
