import { createHash, webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { abortMatch, formatCountdown, remainingSeconds, resultError, startMatch } from './matches'
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
    codeHash: createHash('sha256').update('fixture-cup').digest('hex'),
    settings: {
      name: 'Matchtest', location: 'Office', description: '', startsAt: new Date(now).toISOString(),
      matchMinutes: 1, preliminaryMinutes: 120, knockoutMinutes: 60, winPoints: 3, lossPoints: 1,
    },
    players: avatars.slice(0, 4).map((avatar, index) => ({ id: `p-${index}`, nickname: `Person ${index}`, avatar: avatar.emoji })),
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
    await restoreBackup({ ...incoming, id: 'copied-match' }, null, '')
    expect(readTournament('copied-match').activeMatch).toEqual(started.activeMatch)
    await expect(restoreBackup(tournament, started, 'fixture-cup')).rejects.toThrow('offene Partie')
    expect(readTournament(tournament.id)).toEqual(started)
    const aborted = await updateTournament(started, abortMatch)
    await restoreBackup(tournament, aborted, 'fixture-cup')
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
