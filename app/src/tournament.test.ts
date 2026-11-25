import { describe, expect, it } from 'vitest'
import { draftFor, isTournament, parseBerlinLocal, planTimes, startPreliminary, toBerlinLocal, validateDraft } from './tournament'
import type { Tournament, TournamentDraft } from './tournament'
import { avatars } from './players'

const validDraft = (): TournamentDraft => ({
  ...draftFor(), name: ' Office Cup ', location: ' Eschborn ', startsAtLocal: '2026-11-26T17:00', code: 'test-fixture',
})

describe('Manueller Turnierstart', () => {
  function preparation(count: number): Tournament {
    return {
      version: 2, id: 'start-fixture', revision: 1, phase: 'preparation', codeHash: 'a'.repeat(64),
      settings: validateDraft(validDraft(), false).settings!,
      players: avatars.slice(0, count).map((avatar, index) => ({
        id: `player-${index}`, nickname: `Person ${index}`, avatar: avatar.emoji,
      })),
    }
  }

  it.each([0, 1, 2, 3])('weist einen Start mit %i Spielenden ab', (count) => {
    expect(() => startPreliminary(preparation(count))).toThrow('mindestens vier')
  })

  it('startet mit vier Personen ohne Aenderung der Vorbereitungsdaten und verhindert erneuten Start', () => {
    const original = preparation(4)
    const started = startPreliminary(original)
    expect(started).toEqual({ ...original, revision: 2, phase: 'preliminary' })
    expect(original.phase).toBe('preparation')
    expect(isTournament(started)).toBe(true)
    expect(() => startPreliminary(started)).toThrow('bereits gestartet')
  })

  it('weist ungueltige Einstellungen und unmoegliche gespeicherte Vorrunden ab', () => {
    const original = preparation(4)
    expect(() => startPreliminary({ ...original, settings: { ...original.settings, winPoints: 0 } })).toThrow('ungültige Daten')
    expect(isTournament({ ...preparation(3), phase: 'preliminary' })).toBe(false)
    expect(isTournament({ ...original, version: 1, phase: 'preliminary' })).toBe(false)
  })
})

describe('Turniervalidierung und Zeitplanung', () => {
  it('uebernimmt gueltige Werte und trennt Planung von der Partiedauer', () => {
    const result = validateDraft(validDraft(), false)
    expect(result.errors).toBeUndefined()
    expect(result.settings).toMatchObject({
      name: 'Office Cup', location: 'Eschborn', startsAt: '2026-11-26T16:00:00.000Z',
      description: '', matchMinutes: 10, winPoints: 3, lossPoints: 1,
    })
    expect(planTimes(result.settings!.startsAt, 120, 60)).toEqual({
      knockout: '2026-11-26T18:00:00.000Z', end: '2026-11-26T19:00:00.000Z',
    })
    const changed = validateDraft({ ...validDraft(), preliminaryMinutes: '90' }, false)
    expect(planTimes(changed.settings!.startsAt, 90, 60)).toEqual({
      knockout: '2026-11-26T17:30:00.000Z', end: '2026-11-26T18:30:00.000Z',
    })
    expect(changed.settings!.matchMinutes).toBe(10)
  })

  it.each<[keyof TournamentDraft, string]>([
    ['name', '  '], ['location', ''], ['code', ' '],
    ['startsAtLocal', '2026-02-30T17:00'], ['startsAtLocal', ''],
    ['matchMinutes', '0'], ['matchMinutes', '1.5'],
    ['preliminaryMinutes', '-1'], ['knockoutMinutes', ''],
    ['winPoints', '-1'], ['lossPoints', '0.5'], ['winPoints', '1'],
    ['knockoutMinutes', '9007199254740991'],
  ])('weist ungueltige Eingabe fuer %s=%s feldbezogen ab', (field, value) => {
    expect(validateDraft({ ...validDraft(), [field]: value }, false).errors?.[field]).toBeTruthy()
  })

  it('behaelt den Code nur beim Bearbeiten mit exakt leerer Eingabe', () => {
    expect(validateDraft({ ...validDraft(), code: '' }, true).errors).toBeUndefined()
    expect(validateDraft({ ...validDraft(), code: '  ' }, true).errors?.code).toBeTruthy()
  })

  it('behandelt Sommerzeit, ungueltige Zeitumstellung und Tageswechsel unabhaengig vom Browserstandort', () => {
    expect(parseBerlinLocal('2026-07-01T17:00')).toBe('2026-07-01T15:00:00.000Z')
    expect(parseBerlinLocal('2026-03-29T02:30')).toBeNull()
    expect(parseBerlinLocal('2026-10-25T02:30')).toBe('2026-10-25T00:30:00.000Z')
    const plan = planTimes('2026-11-26T22:30:00.000Z', 120, 60)!
    expect(toBerlinLocal(plan.knockout)).toBe('2026-11-27T01:30')
    expect(toBerlinLocal(plan.end)).toBe('2026-11-27T02:30')
  })
})
