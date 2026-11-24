import { webcrypto } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hashCode } from './access'
import { parseBackup, readBackupFile, restoreBackup, serializeBackup } from './tournament-backup'
import { loadTournaments, readTournament, saveTournament } from './tournament-storage'
import type { Tournament } from './tournament'

async function fixture(): Promise<Tournament> {
  return {
    version: 1, id: 'unicode-cup', revision: 1, phase: 'preparation',
    settings: {
      name: 'Büro Cup 🏆', startsAt: '2026-11-26T16:00:00.000Z',
      location: 'Großer Raum', description: 'Weiß & Schwarz\nfür alle 👩🏽‍💻',
      matchMinutes: 10, preliminaryMinutes: 120, knockoutMinutes: 60, winPoints: 3, lossPoints: 1,
    },
    codeHash: await hashCode('synthetic-backup-code'),
  }
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('crypto', webcrypto)
})

describe('JSON-Sicherungen', () => {
  it('uebertraegt alle aktuellen Turnierdaten verlustfrei ohne Zugangssitzung oder Klartext-Code', async () => {
    const original = await fixture()
    const text = serializeBackup(original)
    expect(text).not.toContain('synthetic-backup-code')
    expect(JSON.parse(text)).toEqual({ format: 'seal-kickerturnier-backup', version: 1, tournament: original })
    const restored = parseBackup(text)
    await restoreBackup(restored, null, '')
    expect(readTournament(original.id)).toEqual(original)
  })

  it.each([
    ['ungueltiges JSON', '{'],
    ['unbekannte Formatversion', '{"format":"seal-kickerturnier-backup","version":99}'],
    ['falsche Kennung', '{"format":"fremd","version":1}'],
  ])('weist %s ohne Aenderung des Datenbestands ab', async (_label, text) => {
    const original = await fixture()
    await saveTournament(original, null)
    expect(() => parseBackup(text)).toThrow('Importfehler')
    expect(readTournament(original.id)).toEqual(original)
  })

  it.each([
    { version: 99 },
    { phase: 'finished' },
    { revision: 0 },
    { codeHash: 'plaintext' },
    { players: [{ id: 'duplicate' }, { id: 'duplicate' }] },
    { masterCode: 'not-allowed' },
    { unlocked: true },
  ])('weist unbekannte oder ungueltige Turnierfelder ab: %j', async (changes) => {
    const tournament = { ...await fixture(), ...changes }
    expect(() => parseBackup(JSON.stringify({ format: 'seal-kickerturnier-backup', version: 1, tournament })))
      .toThrow('ungültige Turnierdaten')
  })

  it('weist fachlich widerspruechliche Einstellungen und unbekannte Felder ab', async () => {
    const original = await fixture()
    for (const settings of [
      { ...original.settings, winPoints: 1 },
      { ...original.settings, matchMinutes: 0 },
      { ...original.settings, startsAt: 'not-a-date' },
      { ...original.settings, secret: 'not-allowed' },
    ]) {
      expect(() => parseBackup(JSON.stringify({
        format: 'seal-kickerturnier-backup', version: 1, tournament: { ...original, settings },
      }))).toThrow('Importfehler')
    }
    expect(() => parseBackup(JSON.stringify({
      format: 'seal-kickerturnier-backup', version: 1, tournament: original, unlocked: true,
    }))).toThrow('Importfehler')
  })

  it('prueft den bestehenden Code und macht alte Revisionen nach Ersetzen nicht wieder gueltig', async () => {
    const original = await fixture()
    const current = { ...original, revision: 4, codeHash: await hashCode('current-code') }
    await saveTournament(current, null)
    await expect(restoreBackup(original, current, 'synthetic-backup-code')).rejects.toThrow('nicht korrekt')
    expect(readTournament(original.id)).toEqual(current)
    await restoreBackup(original, current, 'current-code')
    expect(readTournament(original.id)).toEqual({ ...original, revision: 5 })
    await expect(saveTournament({ ...original, revision: 5 }, 4)).rejects.toThrow('zwischenzeitlich')
  })

  it('verhindert konkurrierenden Import und unbeabsichtigtes Ersetzen eines neuen Zielturniers', async () => {
    const original = await fixture()
    await saveTournament(original, null)
    await expect(restoreBackup(original, null, '')).rejects.toThrow('zwischenzeitlich')
    const newer = { ...original, revision: 2 }
    await saveTournament(newer, 1)
    await expect(restoreBackup(original, original, 'synthetic-backup-code')).rejects.toThrow('zwischenzeitlich')
    expect(readTournament(original.id)).toEqual(newer)
  })

  it('laesst bei vollem Speicher alle Turniere unveraendert', async () => {
    const original = await fixture()
    await saveTournament(original, null)
    const before = loadTournaments()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await expect(restoreBackup(original, original, 'synthetic-backup-code')).rejects.toThrow('nicht gespeichert')
    expect(loadTournaments()).toEqual(before)
  })

  it('meldet Dateilesefehler ohne den lokalen Stand zu veraendern', async () => {
    const original = await fixture()
    await saveTournament(original, null)
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementationOnce(function (this: FileReader) {
      this.dispatchEvent(new ProgressEvent('error'))
    })
    await expect(readBackupFile(new File(['{}'], 'unreadable.json'))).rejects.toThrow('Datei konnte nicht gelesen')
    expect(readTournament(original.id)).toEqual(original)
  })
})
