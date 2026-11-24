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
  it('speichert getrennte versionierte Turniere und liest sie vollstaendig wieder ein', () => {
    localStorage.setItem('unrelated-key', 'nicht anfassen')
    const first = fixture()
    const second = fixture('fixture-b')
    saveTournament(first, null)
    saveTournament(second, null)
    expect(loadTournaments()).toEqual([first, second])
    expect(readTournament(first.id)).toEqual(first)
    expect(localStorage.getItem('unrelated-key')).toBe('nicht anfassen')
    expect(localStorage.getItem(`seal-kickerturnier:tournament:${first.id}`)).not.toContain('fixture-only')
  })

  it('behaelt bei Schreibfehlern den letzten gespeicherten Stand', () => {
    const first = fixture()
    saveTournament(first, null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })
    expect(() => saveTournament({ ...first, revision: 2, settings: { ...first.settings, name: 'Nicht gespeichert' } }, 1))
      .toThrow('nicht gespeichert')
    expect(readTournament(first.id)).toEqual(first)
  })

  it('meldet gesperrten Lesespeicher statt eine leere Turnierliste vorzutäuschen', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError') })
    expect(() => readTournament('fixture-a')).toThrow('nicht aus dem Browserspeicher gelesen')
    expect(() => saveTournament(fixture(), null)).toThrow('Browserspeicher ist gesperrt')
  })

  it('weist beschaedigte oder unbekannte gespeicherte Daten ohne Ueberschreiben ab', () => {
    const key = 'seal-kickerturnier:tournament:fixture-a'
    localStorage.setItem(key, '{"version":99}')
    expect(() => loadTournaments()).toThrow('beschädigt')
    expect(() => readTournament('fixture-a')).toThrow('unbekannte Version')
    expect(localStorage.getItem(key)).toBe('{"version":99}')
  })

  it('verhindert das Ueberschreiben eines bereits geaenderten Standes', () => {
    const first = fixture()
    saveTournament(first, null)
    const current = { ...first, revision: 2, settings: { ...first.settings, name: 'Aktueller Stand' } }
    saveTournament(current, 1)
    expect(() => saveTournament({ ...first, revision: 2 }, 1)).toThrow('zwischenzeitlich geändert')
    expect(readTournament(first.id)).toEqual(current)
  })
})
