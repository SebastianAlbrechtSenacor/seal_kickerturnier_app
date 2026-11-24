import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadTournaments, readTournament, saveTournament } from './tournament-storage'
import { draftFor, validateDraft } from './tournament'
import type { Tournament } from './tournament'

function fixture(id = 'fixture-a'): Tournament {
  const { settings } = validateDraft({
    ...draftFor(), name: id, location: 'Office', startsAtLocal: '2026-11-26T17:00', code: 'fixture-only',
  }, false)
  return { version: 1, id, revision: 1, phase: 'preparation', settings: settings!, codeHash: 'a'.repeat(64) }
}

beforeEach(() => {
  localStorage.clear()
})

describe('Lokale Turnierspeicherung', () => {
  it('speichert getrennte versionierte Turniere und liest sie vollstaendig wieder ein', async () => {
    localStorage.setItem('unrelated-key', 'nicht anfassen')
    const first = fixture()
    const second = fixture('fixture-b')
    await saveTournament(first, null)
    await saveTournament(second, null)
    expect(loadTournaments()).toEqual([first, second])
    expect(readTournament(first.id)).toEqual(first)
    expect(localStorage.getItem('unrelated-key')).toBe('nicht anfassen')
    expect(localStorage.getItem(`seal-kickerturnier:tournament:${first.id}`)).not.toContain('fixture-only')
  })

  it('behaelt bei Schreibfehlern den letzten gespeicherten Stand', async () => {
    const first = fixture()
    await saveTournament(first, null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })
    await expect(saveTournament({ ...first, revision: 2, settings: { ...first.settings, name: 'Nicht gespeichert' } }, 1))
      .rejects.toThrow('nicht gespeichert')
    expect(readTournament(first.id)).toEqual(first)
  })

  it('meldet gesperrten Lesespeicher statt eine leere Turnierliste vorzutäuschen', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError') })
    expect(() => readTournament('fixture-a')).toThrow('nicht aus dem Browserspeicher gelesen')
    await expect(saveTournament(fixture(), null)).rejects.toThrow('Browserspeicher ist gesperrt')
  })

  it('weist beschaedigte oder unbekannte gespeicherte Daten ohne Ueberschreiben ab', () => {
    const key = 'seal-kickerturnier:tournament:fixture-a'
    localStorage.setItem(key, '{"version":99}')
    expect(() => loadTournaments()).toThrow('beschädigt')
    expect(() => readTournament('fixture-a')).toThrow('unbekannte Version')
    expect(localStorage.getItem(key)).toBe('{"version":99}')
  })

  it('verhindert das Ueberschreiben eines bereits geaenderten Standes', async () => {
    const first = fixture()
    await saveTournament(first, null)
    const current = { ...first, revision: 2, settings: { ...first.settings, name: 'Aktueller Stand' } }
    await saveTournament(current, 1)
    await expect(saveTournament({ ...first, revision: 2 }, 1)).rejects.toThrow('zwischenzeitlich geändert')
    expect(readTournament(first.id)).toEqual(current)
  })

  it('serialisiert gleichzeitige Schreibzugriffe und meldet den unterlegenen als Konflikt', async () => {
    const first = fixture()
    await saveTournament(first, null)
    const results = await Promise.allSettled([
      saveTournament({ ...first, revision: 2, settings: { ...first.settings, name: 'Tab A' } }, 1),
      saveTournament({ ...first, revision: 2, settings: { ...first.settings, name: 'Tab B' } }, 1),
    ])
    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected'])
    expect(results[1]).toMatchObject({ reason: new Error('Das Turnier wurde zwischenzeitlich geändert. Bitte den aktuellen Stand über die Turnierauswahl neu öffnen.') })
    expect(readTournament(first.id).settings.name).toBe('Tab A')
  })

  it('schreibt bei fehlender Web-Locks-Unterstuetzung nichts', async () => {
    Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined })
    await expect(saveTournament(fixture(), null)).rejects.toThrow('Dieser Browser unterstützt keine')
    expect(loadTournaments()).toEqual([])
  })
})
