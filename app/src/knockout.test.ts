import { webcrypto } from 'node:crypto'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { finishKnockoutMatch, knockoutFixtures, knockoutLineup, knockoutPlacements, knockoutStartError, nextKnockoutFixture, startKnockout, startKnockoutMatch } from './knockout'
import { abortMatch, finishMatch, startMatch } from './matches'
import { isTournament } from './tournament'
import type { Tournament } from './tournament'
import { calculateStandings } from './standings'
import { claimWhistle, readTournament, saveTournament, updateTournament } from './tournament-storage'
import { parseBackup, restoreBackup, serializeBackup } from './tournament-backup'
import { avatars } from './players'

const now = Date.parse('2026-11-25T15:00:00.000Z')
const lineup = { whiteAttack: 'p-0', whiteDefence: 'p-1', blackAttack: 'p-2', blackDefence: 'p-3' }
function fixture(): Tournament {
  return {
    version: 2, id: 'knockout-test', revision: 1, phase: 'preliminary',
    settings: { name: 'K.-o.-Test', location: 'Office', description: '', startsAt: new Date(now).toISOString(),
      matchMinutes: 1, preliminaryMinutes: 120, knockoutMinutes: 60, winPoints: 3, lossPoints: 1 },
    players: ['Anton', 'Berta', 'Chris', 'Dana', 'Emil', 'Frida', 'Gabi', 'Hugo', 'Ina', 'Zoe']
      .map((nickname, index) => ({ id: `p-${index}`, nickname, avatar: avatars[index].emoji })),
  }
}
beforeEach(() => { localStorage.clear(); vi.stubGlobal('crypto', webcrypto) })
afterEach(() => { vi.useRealTimers() })

describe('K.-o.-Phase', () => {
  it.each([[true, true], [true, false], [false, true], [false, false]])(
    'leitet alle vier Plaetze aus Finale und Platzierungsspiel ab (%s, %s)', (finalFirst, bronzeFirst) => {
      let tournament = startKnockout(fixture())
      for (let index = 0; index < 4; index++) {
        expect(() => knockoutPlacements(tournament.knockout!)).toThrow('noch nicht abgeschlossen')
        const active = startKnockoutMatch(tournament, now)
        const firstWins = index < 2 || (index === 2 ? bronzeFirst : finalFirst)
        tournament = finishKnockoutMatch(active, active.activeMatch.id,
          firstWins ? '10' : '9', firstWins ? '9' : '10', now)
      }
      const before = structuredClone(tournament)
      expect(knockoutPlacements(tournament.knockout!).map((team) => team.id)).toEqual([
        finalFirst ? 'A' : 'B', finalFirst ? 'B' : 'A', bronzeFirst ? 'D' : 'C', bronzeFirst ? 'C' : 'D',
      ])
      expect(tournament).toEqual(before)
    })

  it('qualifiziert exakt die ersten acht ohne Mindestspielzahl und blockiert offene oder unzureichende Vorrunden', () => {
    const tournament = fixture()
    const started = startKnockout(tournament)
    expect(started.knockout?.standings).toHaveLength(10)
    expect(started.knockout?.teams).toEqual([
      { id: 'A', playerIds: ['p-0', 'p-7'] }, { id: 'B', playerIds: ['p-1', 'p-6'] },
      { id: 'C', playerIds: ['p-2', 'p-5'] }, { id: 'D', playerIds: ['p-3', 'p-4'] },
    ])
    expect(knockoutStartError({ ...tournament, players: tournament.players?.slice(0, 7) })).toContain('acht')
    expect(() => startKnockout({ ...tournament, phase: 'preparation' })).toThrow('Vorrunde')
    expect(() => startKnockout(startMatch(tournament, lineup, now))).toThrow('offene Partie')
    expect(() => startKnockout(started)).toThrow('Vorrunde')
    expect(() => startMatch(started, lineup, now)).toThrow('Vorrunde')
    expect(tournament.knockout).toBeUndefined()
  })

  it('spielt alle vier Begegnungen in fester Reihenfolge ohne die Vorrundenwertung zu veraendern', async () => {
    const preliminary = startMatch(fixture(), lineup, now)
    const original = finishMatch(preliminary, preliminary.activeMatch.id, '7', '5', now + 60_000)
    let tournament = startKnockout(original)
    const snapshot = structuredClone(tournament.knockout?.standings)
    const expectedPairs = [['A', 'D'], ['B', 'C'], ['D', 'B'], ['A', 'C']]
    const scores: [string, string][] = [['10', '9'], ['9', '10'], ['7', '5'], ['9', '10']]
    for (let index = 0; index < 4; index++) {
      const fixture = nextKnockoutFixture(tournament.knockout!)
      expect([fixture?.first.id, fixture?.second.id]).toEqual(expectedPairs[index])
      const started = startKnockoutMatch(tournament, now + 120_000 * (index + 1))
      expect(started.activeMatch.lineup).toEqual(knockoutLineup(fixture!))
      tournament = finishKnockoutMatch(started, started.activeMatch.id, ...scores[index],
        now + 120_000 * (index + 1) + (index === 2 ? 60_000 : 1000))
      expect(tournament.completedMatches).toEqual(original.completedMatches)
      expect(tournament.knockout?.standings).toEqual(snapshot)
      expect(calculateStandings(tournament.players ?? [], tournament.completedMatches ?? [], tournament.settings)).toEqual(snapshot)
      expect(isTournament(tournament)).toBe(true)
    }
    expect(knockoutFixtures(tournament.knockout!).map((fixture) => fixture.result?.whiteGoals)).toEqual([10, 9, 7, 9])
    expect(nextKnockoutFixture(tournament.knockout!)).toBeNull()
    expect(() => startKnockoutMatch(tournament)).toThrow('abgeschlossen')
    await restoreBackup(parseBackup(serializeBackup(tournament)), null)
    expect(readTournament(tournament.id)).toEqual(tournament)
  })

  it('speichert Phasenwechsel, Starts und Abbrueche atomar und verhindert parallele Aktionen', async () => {
    const original = fixture()
    await saveTournament(original, null)
    const fail = () => vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    fail()
    await expect(updateTournament(original, startKnockout)).rejects.toThrow('nicht gespeichert')
    expect(readTournament(original.id)).toEqual(original)
    const changes = await Promise.allSettled([updateTournament(original, startKnockout), updateTournament(original, startKnockout)])
    expect(changes.map((change) => change.status)).toEqual(['fulfilled', 'rejected'])
    const knockout = readTournament(original.id)
    fail()
    await expect(updateTournament(knockout, (current) => startKnockoutMatch(current, now))).rejects.toThrow('nicht gespeichert')
    expect(readTournament(original.id)).toEqual(knockout)
    const starts = await Promise.allSettled([0, 1].map(() => updateTournament(knockout, (current) => startKnockoutMatch(current, now))))
    expect(starts.map((change) => change.status)).toEqual(['fulfilled', 'rejected'])
    const active = readTournament(original.id)
    fail()
    await expect(updateTournament(active, abortMatch)).rejects.toThrow('nicht gespeichert')
    expect(readTournament(original.id)).toEqual(active)
    const aborted = await updateTournament(active, abortMatch)
    expect(aborted.knockout?.results).toEqual([])
    expect(nextKnockoutFixture(aborted.knockout!)?.index).toBe(0)
    const restarted = await updateTournament(aborted, (current) => startKnockoutMatch(current, now + 30_000))
    expect(restarted.activeMatch.id).not.toBe(active.activeMatch?.id)
    expect(restarted.activeMatch.lineup).toEqual(active.activeMatch?.lineup)
    expect(restarted.activeMatch.endsAt).toBe(new Date(now + 90_000).toISOString())
    await expect(updateTournament(active, abortMatch)).rejects.toThrow('zwischenzeitlich')
  })

  it('behaelt Ergebnisentwuerfe bei Fehlern und wertet mehrfache Bestaetigungen genau einmal', async () => {
    const active = startKnockoutMatch(startKnockout(fixture()), now)
    await saveTournament(active, null)
    const finish = (current: Tournament) => finishKnockoutMatch(current, active.activeMatch.id, '10', '9', now + 1000)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await expect(updateTournament(active, finish)).rejects.toThrow('nicht gespeichert')
    expect(readTournament(active.id)).toEqual(active)
    const results = await Promise.allSettled([updateTournament(active, finish), updateTournament(active, finish)])
    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected'])
    const completed = readTournament(active.id)
    expect(completed.knockout?.results).toHaveLength(1)
    expect(nextKnockoutFixture(completed.knockout!)?.index).toBe(1)
    const modified = structuredClone(completed)
    modified.revision++
    modified.knockout!.results[0].blackGoals = 8
    await expect(saveTournament(modified, completed.revision)).rejects.toThrow('unveränderlich')
    expect(() => finishKnockoutMatch(completed, active.activeMatch.id, '10', '9', now + 1000)).toThrow('zwischenzeitlich')
    expect(() => startMatch(completed, lineup)).toThrow('Vorrunde')
  })

  it('importiert alte offene K.-o.-Partien mit Pfiffstatus und sperrt das Ersetzen offener Zielturniere', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now + 60_000)
    const active = startKnockoutMatch(startKnockout(fixture()), now)
    const legacy = JSON.stringify({
      format: 'seal-kickerturnier-backup', version: 1,
      tournament: { ...active, codeHash: 'a'.repeat(64) },
    })
    await restoreBackup(parseBackup(legacy), null)
    expect(readTournament(active.id)).toEqual(active)
    expect(serializeBackup(readTournament(active.id))).not.toContain('codeHash')
    await expect(restoreBackup(fixture(), active)).rejects.toThrow('offene Partie')
    const claimed = await claimWhistle(active.id, active.activeMatch.id)
    expect(claimed.claimed).toBe(true)
    expect((await claimWhistle(active.id, active.activeMatch.id)).claimed).toBe(false)
    const finished = await updateTournament(claimed.tournament,
      (current) => finishKnockoutMatch(current, active.activeMatch.id, '7', '5'))
    expect(finished.knockout?.standings).toEqual(active.knockout?.standings)
    await restoreBackup(fixture(), finished)
    expect(readTournament(active.id).phase).toBe('preliminary')
  })

  it('weist manipulierte Snapshots, Teams, Reihenfolgen und doppelte phasenuebergreifende IDs ab', () => {
    const active = startKnockoutMatch(startKnockout(fixture()), now)
    const snapshot = structuredClone(active)
    snapshot.knockout!.standings[0].points++
    const teams = structuredClone(active)
    teams.knockout!.teams[0].playerIds.reverse()
    const wrongLineup = { ...active, activeMatch: { ...active.activeMatch, lineup } }
    const finished = finishKnockoutMatch(active, active.activeMatch.id, '10', '9', now + 1000)
    const wrongOrder = structuredClone(finished)
    wrongOrder.knockout!.results.push({ ...wrongOrder.knockout!.results[0], id: 'wrong-next-stage' })
    const duplicate = { ...finished, completedMatches: finished.knockout?.results }
    for (const invalid of [snapshot, teams, wrongLineup, wrongOrder, duplicate,
      { ...active, version: 4 }, { ...active, knockout: undefined }, { ...active, phase: 'preliminary' }]) {
      expect(isTournament(invalid)).toBe(false)
      expect(() => parseBackup(JSON.stringify({ format: 'seal-kickerturnier-backup', version: 1, tournament: invalid }))).toThrow('Importfehler')
    }
    expect(parseBackup(serializeBackup(fixture()))).toEqual(fixture())
  })
})
