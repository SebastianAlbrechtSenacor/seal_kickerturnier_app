import { describe, expect, it } from 'vitest'
import { compareStandings, initialStandings } from './standings'
import type { Standing } from './standings'

function row(nickname: string, values: Partial<Omit<Standing, 'player'>> = {}): Standing {
  return {
    player: { id: nickname, nickname, avatar: '🐶' },
    played: 0, wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    ...values,
  }
}

describe('Individuelle Rangfolge', () => {
  it.each([
    { criterion: 'Punkte vor Siegen', first: { points: 10, wins: 2 }, second: { points: 9, wins: 3 } },
    { criterion: 'Siege vor Tordifferenz', first: { wins: 3, goalDifference: -1 }, second: { wins: 2, goalDifference: 10 } },
    { criterion: 'Tordifferenz vor Toren', first: { goalDifference: 5, goalsFor: 6 }, second: { goalDifference: 4, goalsFor: 20 } },
    { criterion: 'Tore vor Namen', first: { goalsFor: 11 }, second: { goalsFor: 10 } },
  ])('sortiert absteigend nach $criterion', ({ first, second }) => {
    const standings = [row('Anton', second), row('Zara', first)].sort(compareStandings)
    expect(standings.map((standing) => standing.player.nickname)).toEqual(['Zara', 'Anton'])
  })

  it('sortiert bei gleichen Wertungsstaenden deutsche Namen aufsteigend', () => {
    const standings = ['Zoe', 'Berta', 'Änne', 'Anton'].map((name) => row(name)).sort(compareStandings)
    expect(standings.map((standing) => standing.player.nickname)).toEqual(['Änne', 'Anton', 'Berta', 'Zoe'])
  })

  it('initialisiert alle Statistiken bei null und veraendert die gespeicherte Spielendenreihenfolge nicht', () => {
    const players = [
      { id: 'z', nickname: 'Zoe', avatar: '🐶' },
      { id: 'a', nickname: 'Änne', avatar: '👩🏽‍💻' },
    ]
    const original = structuredClone(players)
    const standings = initialStandings(players)
    expect(standings).toEqual([
      { ...row('Änne'), player: players[1] },
      { ...row('Zoe'), player: players[0] },
    ])
    expect(players).toEqual(original)
  })
})
