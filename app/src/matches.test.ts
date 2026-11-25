import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { abortMatch, finishMatch, formatCountdown, remainingSeconds, resultError, startMatch } from './matches'
import { calculateStandings } from './standings'
import { isTournament } from './tournament'
import type { Tournament } from './tournament'
import { claimWhistle, readTournament, saveTournament, updateTournament } from './tournament-storage'
import { parseBackup, restoreBackup, serializeBackup } from './tournament-backup'
import { avatars } from './players'

const lineup = { whiteAttack: 'p-0', whiteDefence: 'p-1', blackAttack: 'p-2', blackDefence: 'p-3' }
const now = Date.parse('2026-11-25T12:00:00.000Z')

function fixture(): Tournament {
  return {
    version: 2, id: 'match-test', revision: 1, phase: 'preliminary',
    settings: {
      name: 'Matchtest', location: 'Office', description: '', startsAt: new Date(now).toISOString(),
      matchMinutes: 1, preliminaryMinutes: 120, knockoutMinutes: 60, winPoints: 3, lossPoints: 1,
    },
    players: avatars.slice(0, 5).map((avatar, index) => ({ id: `p-${index}`, nickname: `Person ${index}`, avatar: avatar.emoji })),
  }
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('crypto', webcrypto)
})
afterEach(() => { vi.useRealTimers() })

describe('Gespeicherte offene Partie', () => {
  it('speichert einen eindeutigen Spielstart innerhalb der Schreibsperre und verhindert parallele Starts', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const tournament = fixture()
    await saveTournament(tournament, null)
    let release: (() => void) | undefined
    const hold = navigator.locks.request(`seal-kickerturnier:tournament:${tournament.id}`, () =>
      new Promise<void>((resolve) => { release = resolve }))
    await Promise.resolve()
    const first = updateTournament(tournament, (current) => startMatch(current, lineup))
    const second = updateTournament(tournament, (current) => startMatch(current, lineup))
    vi.setSystemTime(now + 30_000)
    if (!release) throw new Error('Testsperre wurde nicht erworben.')
    release()
    await hold
    const results = await Promise.allSettled([first, second])
    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected'])
    const stored = readTournament(tournament.id)
    expect(stored).toMatchObject({
      version: 3, revision: 2,
      activeMatch: { lineup, startedAt: new Date(now + 30_000).toISOString(), endsAt: new Date(now + 90_000).toISOString(), whistleAttempted: false },
    })
    expect(stored.activeMatch?.id).toBeTruthy()
    expect(tournament.activeMatch).toBeUndefined()
    expect(() => startMatch(stored, lineup)).toThrow('bereits')
    expect(() => startMatch(tournament, { ...lineup, blackAttack: 'p-0' })).toThrow('nur eine')
  })

  it('weist ungueltige Partiedaten auch in Sicherungen ab und liest alte Turniere weiterhin', () => {
    const tournament = fixture()
    const started = startMatch(tournament, lineup, now)
    expect(isTournament(tournament)).toBe(true)
    expect(isTournament(started)).toBe(true)
    expect(parseBackup(serializeBackup(started))).toEqual(started)
    expect(isTournament({ ...started, version: 2 })).toBe(false)
    const missing: Tournament = { ...started }
    delete missing.activeMatch
    expect(isTournament(missing)).toBe(false)
    const match = started.activeMatch!
    const invalid = [
      { ...match, unexpected: true },
      { ...match, id: '' },
      { ...match, whistleAttempted: 'yes' },
      { ...match, endsAt: new Date(now + 59_000).toISOString() },
      { ...match, startedAt: 'not-a-date' },
      { ...match, lineup: { ...lineup, blackAttack: 'p-0' } },
      { ...match, lineup: { ...lineup, blackAttack: 'unknown' } },
      { ...match, lineup: { ...lineup, extra: 'p-0' } },
    ]
    for (const activeMatch of invalid) {
      const bad = { ...started, activeMatch }
      expect(isTournament(bad)).toBe(false)
      expect(() => parseBackup(JSON.stringify({ format: 'seal-kickerturnier-backup', version: 1, tournament: bad }))).toThrow('Importfehler')
    }
    expect(() => startMatch({ ...tournament, settings: { ...tournament.settings, matchMinutes: Number.MAX_SAFE_INTEGER } }, lineup, now))
      .toThrow('Zeitbereich')
  })

  it('behaelt bei Schreibfehlern sowohl den Entwurf vor Start als auch die Partie vor Abbruch bei', async () => {
    const tournament = fixture()
    await saveTournament(tournament, null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await expect(updateTournament(tournament, (current) => startMatch(current, lineup, now))).rejects.toThrow('nicht gespeichert')
    expect(readTournament(tournament.id)).toEqual(tournament)
    const started = await updateTournament(tournament, (current) => startMatch(current, lineup, now))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await expect(updateTournament(started, abortMatch)).rejects.toThrow('nicht gespeichert')
    expect(readTournament(tournament.id)).toEqual(started)
    const aborted = await updateTournament(started, abortMatch)
    expect(aborted.activeMatch).toBeNull()
    await expect(updateTournament(started, abortMatch)).rejects.toThrow('zwischenzeitlich')
    expect(startMatch(aborted, lineup, now).activeMatch?.id).not.toBe(started.activeMatch?.id)
  })

  it('uebertraegt offene Partien, sperrt Ersetzen offener Zielturniere und erlaubt es nach Abbruch', async () => {
    const tournament = fixture()
    await saveTournament(tournament, null)
    const started = await updateTournament(tournament, (current) => startMatch(current, lineup, now))
    const incoming = parseBackup(serializeBackup(started))
    await restoreBackup({ ...incoming, id: 'copied-match' }, null)
    expect(readTournament('copied-match').activeMatch).toEqual(started.activeMatch)
    await expect(restoreBackup(tournament, started)).rejects.toThrow('offene Partie')
    expect(readTournament(tournament.id)).toEqual(started)
    const aborted = await updateTournament(started, abortMatch)
    await restoreBackup(tournament, aborted)
    expect(readTournament(tournament.id).activeMatch).toBeUndefined()
  })

  it('reserviert hoechstens einen automatischen Pfiff je Partie und schreibt vor Ablauf nichts', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const tournament = fixture()
    await saveTournament(tournament, null)
    const started = await updateTournament(tournament, (current) => startMatch(current, lineup))
    const id = started.activeMatch!.id
    await expect(claimWhistle(tournament.id, id)).rejects.toThrow('noch nicht abgelaufen')
    vi.setSystemTime(now + 60_000)
    const results = await Promise.all([claimWhistle(tournament.id, id), claimWhistle(tournament.id, id)])
    expect(results.map((result) => result.claimed)).toEqual([true, false])
    const latest = readTournament(tournament.id)
    expect(latest.revision).toBe(started.revision + 1)
    expect(latest.activeMatch?.whistleAttempted).toBe(true)
    await updateTournament(latest, abortMatch)
    await expect(claimWhistle(tournament.id, id)).rejects.toThrow('zwischenzeitlich')
  })
})

describe('Verbindliche Ergebnisse', () => {
  it('wertet wechselnde Teams individuell aus und uebertraegt Verlauf plus offene Partie verlustfrei', async () => {
    const original = fixture()
    original.settings.winPoints = 5
    original.settings.lossPoints = 2
    const first = startMatch(original, lineup, now)
    const one = finishMatch(first, first.activeMatch.id, '7', '5', now + 60_000)
    const second = startMatch(one, { whiteAttack: 'p-1', whiteDefence: 'p-3', blackAttack: 'p-0', blackDefence: 'p-2' }, now + 120_000)
    const completed = finishMatch(second, second.activeMatch.id, '10', '9', now + 121_000)
    const standings = calculateStandings(completed.players ?? [], completed.completedMatches ?? [], completed.settings)
    expect(standings.map((standing) => standing.player.id)).toEqual(['p-1', 'p-0', 'p-3', 'p-2', 'p-4'])
    expect(standings.find((standing) => standing.player.id === 'p-0')).toMatchObject({
      played: 2, wins: 1, losses: 1, goalsFor: 16, goalsAgainst: 15, goalDifference: 1, points: 7,
    })
    expect(standings.find((standing) => standing.player.id === 'p-4')).toMatchObject({
      played: 0, wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    })
    const next = startMatch(completed, lineup, now + 180_000)
    const restored = parseBackup(serializeBackup(next))
    await restoreBackup(restored, null)
    expect(readTournament(next.id)).toEqual(next)
    expect(calculateStandings(restored.players ?? [], restored.completedMatches ?? [], restored.settings)).toEqual(standings)
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now + 240_000)
    const whistled = await claimWhistle(next.id, next.activeMatch.id)
    expect(whistled.tournament.completedMatches).toEqual(completed.completedMatches)
    const aborted = await updateTournament(whistled.tournament, abortMatch)
    expect(aborted).toMatchObject({ version: 4, completedMatches: completed.completedMatches, activeMatch: null })
    expect(original.completedMatches).toBeUndefined()
    expect(first.activeMatch).toBeTruthy()
    await restoreBackup(original, aborted)
    expect(readTournament(original.id).completedMatches).toBeUndefined()
  })

  it('weist widerspruechliche Ergebnisse und doppelte oder zugleich offene Partie-IDs ab', () => {
    const started = startMatch(fixture(), lineup, now)
    const valid = finishMatch(started, started.activeMatch.id, '7', '5', now + 60_000)
    const result = valid.completedMatches![0]
    const badMatches = [
      { ...result, whiteGoals: 5 }, { ...result, whiteGoals: -1 }, { ...result, blackGoals: 1.5 },
      { ...result, blackGoals: 11 }, { ...result, blackGoals: '2' },
      { ...result, finishedAt: new Date(now - 1).toISOString() },
      { ...result, finishedAt: new Date(now + 59_999).toISOString() },
      { ...result, finishedAt: '2026-11-25' }, { ...result, extra: true },
      { ...result, lineup: { ...lineup, whiteAttack: 'unknown' } },
      { ...result, lineup: { ...lineup, whiteAttack: 'p-1' } },
      { ...result, endsAt: new Date(now + 120_000).toISOString() },
    ]
    const invalid = [
      ...badMatches.map((match) => ({ ...valid, completedMatches: [match] })),
      { ...valid, completedMatches: [result, result] },
      { ...valid, activeMatch: started.activeMatch },
      { ...valid, version: 3 }, { ...valid, completedMatches: undefined },
      { ...valid, phase: 'preparation' },
    ]
    for (const tournament of invalid) {
      expect(isTournament(tournament)).toBe(false)
      expect(() => parseBackup(JSON.stringify({ format: 'seal-kickerturnier-backup', version: 1, tournament }))).toThrow('Importfehler')
    }
    expect(() => finishMatch(started, 'another-match', '10', '9', now)).toThrow('zwischenzeitlich')
  })

  it('behaelt bei Schreibfehlern die offene Partie und speichert bei paralleler Bestaetigung nur einmal', async () => {
    const started = startMatch(fixture(), lineup, now)
    await saveTournament(started, null)
    const finish = (current: Tournament) => finishMatch(current, started.activeMatch.id, '7', '5', now + 60_000)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await expect(updateTournament(started, finish)).rejects.toThrow('nicht gespeichert')
    expect(readTournament(started.id)).toEqual(started)
    const attempts = await Promise.allSettled([updateTournament(started, finish), updateTournament(started, finish)])
    expect(attempts.map((attempt) => attempt.status)).toEqual(['fulfilled', 'rejected'])
    const saved = readTournament(started.id)
    expect(saved.completedMatches).toHaveLength(1)
    expect(saved.activeMatch).toBeNull()
    await expect(saveTournament({ ...saved, revision: saved.revision + 1, completedMatches: [] }, saved.revision))
      .rejects.toThrow('unveränderlich')
    const changed = saved.completedMatches!.map((match) => ({ ...match, whiteGoals: 8 }))
    await expect(saveTournament({ ...saved, revision: saved.revision + 1, completedMatches: changed }, saved.revision))
      .rejects.toThrow('unveränderlich')
    const next = await updateTournament(saved, (current) => startMatch(current, lineup, now + 120_000))
    await expect(updateTournament(started, finish)).rejects.toThrow('zwischenzeitlich')
    expect(readTournament(started.id)).toEqual(next)
    expect(() => finishMatch(saved, started.activeMatch.id, '7', '5', now + 120_000)).toThrow('zwischenzeitlich')
  })

  it('prueft den Endzeitpunkt beim Abschluss innerhalb der Schreibsperre erneut', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(now + 59_000)
    const started = startMatch(fixture(), lineup, now)
    await saveTournament(started, null)
    expect(() => finishMatch(started, started.activeMatch.id, '7', '5')).toThrow('10 Tore')
    let release: (() => void) | undefined
    const hold = navigator.locks.request(`seal-kickerturnier:tournament:${started.id}`, () =>
      new Promise<void>((resolve) => { release = resolve }))
    await Promise.resolve()
    const finish = updateTournament(started, (current) => finishMatch(current, started.activeMatch.id, '7', '5'))
    vi.setSystemTime(now + 60_000)
    if (!release) throw new Error('Testsperre fehlt.')
    release()
    await hold
    const saved = await finish
    expect(saved.completedMatches?.[0].finishedAt).toBe(new Date(now + 60_000).toISOString())
    await expect(claimWhistle(saved.id, started.activeMatch.id)).rejects.toThrow('zwischenzeitlich')
  })

  it('weist nicht mehr exakt darstellbare individuelle Punktesummen ab', () => {
    const tournament = fixture()
    tournament.settings.winPoints = Number.MAX_SAFE_INTEGER
    const first = startMatch(tournament, lineup, now)
    const completed = finishMatch(first, first.activeMatch.id, '10', '1', now + 1000)
    const second = startMatch(completed, lineup, now + 2000)
    expect(() => finishMatch(second, second.activeMatch.id, '10', '1', now + 3000)).toThrow('Punktzahlen')
    expect(completed.completedMatches).toHaveLength(1)
  })
})

describe('Zeit und Ergebnisentwurf', () => {
  it('rundet die Restzeit auf und setzt sie nach Ablauf oder laengerem Ruhezustand auf null', () => {
    const end = new Date(now + 60_000).toISOString()
    expect(formatCountdown(remainingSeconds(end, now))).toBe('01:00')
    expect(formatCountdown(remainingSeconds(end, now + 59_001))).toBe('00:01')
    expect(formatCountdown(remainingSeconds(end, now + 60_000))).toBe('00:00')
    expect(formatCountdown(remainingSeconds(end, now + 3_600_000))).toBe('00:00')
  })

  it.each([
    ['10', '9', false, null], ['9', '10', false, null], ['7', '5', true, null],
    ['7', '5', false, '10 Tore'], ['0', '0', true, 'entscheidenden Tor'],
    ['', '1', true, 'ganze Tore'], ['-1', '1', true, 'ganze Tore'],
    ['1.5', '2', true, 'ganze Tore'], ['11', '2', true, 'ganze Tore'],
    ['NaN', '2', true, 'ganze Tore'],
  ] as const)('prueft %s:%s bei abgelaufen=%s', (white, black, expired, error) => {
    const actual = resultError(white, black, expired)
    if (error === null) expect(actual).toBeNull()
    else expect(actual).toContain(error)
  })
})
