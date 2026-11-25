import { createHash, webcrypto } from 'node:crypto'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentProps } from 'react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RunningMatch from './RunningMatch'
import TournamentManager from './TournamentManager'
import { startMatch } from './matches'
import type { Tournament } from './tournament'
import { readTournament, saveTournament } from './tournament-storage'
import { avatars } from './players'

const audio = vi.hoisted(() => ({
  activate: vi.fn(async () => {}), play: vi.fn(), ready: vi.fn(() => true), close: vi.fn(async () => {}),
}))
vi.mock('./whistle', () => ({ createWhistle: () => audio }))
const now = Date.parse('2026-11-25T12:00:00.000Z')
const lineup = { whiteAttack: 'p-0', whiteDefence: 'p-1', blackAttack: 'p-2', blackDefence: 'p-3' }

function fixture(): Tournament {
  return {
    version: 2, id: 'timer-cup', revision: 1, phase: 'preliminary',
    codeHash: createHash('sha256').update('fixture-cup').digest('hex'),
    settings: {
      name: 'Timercup', location: 'Office', description: '', startsAt: new Date(now).toISOString(),
      matchMinutes: 1, preliminaryMinutes: 120, knockoutMinutes: 60, winPoints: 3, lossPoints: 1,
    },
    players: ['Alex', 'Bea', 'Chris', 'Dana'].map((nickname, index) => ({ id: `p-${index}`, nickname, avatar: avatars[index].emoji })),
  }
}

function running(overrides: Partial<ComponentProps<typeof RunningMatch>> = {}) {
  const props = {
    tournament: startMatch(fixture(), lineup, now), whistle: audio, audioBusy: false,
    onTestAudio: vi.fn(), onAudioError: vi.fn(), onWhistle: vi.fn(async () => true),
    onAbort: vi.fn(async () => {}), onCheckCurrent: vi.fn(), onBack: vi.fn(), onExport: vi.fn(),
    ...overrides,
  }
  return { ...render(<RunningMatch {...props} />), ...props }
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('crypto', webcrypto)
  vi.clearAllMocks()
  audio.activate.mockResolvedValue(undefined)
  audio.play.mockImplementation(() => {})
  audio.ready.mockReturnValue(true)
  audio.close.mockResolvedValue(undefined)
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() })
})
afterEach(() => { vi.useRealTimers() })

describe('Laufende Partie', () => {
  it.each(['interval', 'focus'])('zeigt Ablauf nach %s ohne Negativzeit oder Pfiff-Sturm', async (trigger) => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const props = running()
    expect(screen.getByRole('timer')).toHaveTextContent('01:00')
    for (const button of within(screen.getByRole('group', { name: 'Kickertisch' })).getAllByRole('button')) {
      expect(button).toBeDisabled()
    }
    if (trigger === 'interval') await act(async () => { await vi.advanceTimersByTimeAsync(60_000) })
    else {
      vi.setSystemTime(now + 3_600_000)
      await act(async () => { fireEvent.focus(window) })
    }
    expect(screen.getByRole('timer')).toHaveTextContent('00:00')
    expect(screen.getByRole('status')).toHaveTextContent('Zeit abgelaufen')
    expect(screen.getByRole('button', { name: 'Ergebnis eingeben' })).toBeVisible()
    expect(props.onWhistle).toHaveBeenCalledOnce()
    expect(audio.play).toHaveBeenCalledOnce()
    await act(async () => { await vi.advanceTimersByTimeAsync(120_000) })
    expect(audio.play).toHaveBeenCalledOnce()
  })

  it('stellt die urspruengliche Restzeit wieder her und pfeift bei abgelaufenem Wiederoeffnen nicht', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(now + 30_000)
    const first = running()
    expect(screen.getByRole('timer')).toHaveTextContent('00:30')
    first.unmount()
    vi.setSystemTime(now + 120_000)
    const reopened = running({ tournament: first.tournament })
    expect(screen.getByRole('timer')).toHaveTextContent('00:00')
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(reopened.onWhistle).not.toHaveBeenCalled()
    expect(audio.play).not.toHaveBeenCalled()
  })

  it('prueft den fruehen Ergebnisweg und erlaubt 7:5 erst nach dem unveraenderten Endzeitpunkt', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now)
    const user = userEvent.setup()
    const props = running()
    const original = structuredClone(props.tournament)
    await user.click(screen.getByRole('button', { name: '10 Tore erreicht' }))
    await user.type(screen.getByLabelText('Tore Weiß'), '7')
    await user.type(screen.getByLabelText('Tore Schwarz'), '5')
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(screen.getByRole('alert')).toHaveTextContent('10 Tore')
    vi.setSystemTime(now + 60_000)
    await act(async () => { fireEvent.focus(window) })
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(screen.getByRole('region', { name: 'Ergebnisprüfung' })).toHaveTextContent('Weiß 7 : 5 Schwarz')
    expect(screen.getByRole('button', { name: 'Ergebnis verbindlich speichern – folgt in Story 1.8' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Ergebnis ändern' }))
    expect(screen.getByLabelText('Tore Weiß')).toHaveValue(7)
    await user.click(screen.getByRole('button', { name: 'Zur Partie' }))
    expect(screen.getByRole('timer')).toHaveTextContent('00:00')
    expect(props.tournament).toEqual(original)
  })

  it('behaelt Ergebnisentwurf und Partie beim abgebrochenen Dialog sowie bei Speicherfehlern', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now)
    const user = userEvent.setup()
    const onAbort = vi.fn(async () => { throw new Error('Nicht gespeichert. Bitte erneut versuchen.') })
    const props = running({ onAbort })
    await user.click(screen.getByRole('button', { name: '10 Tore erreicht' }))
    await user.type(screen.getByLabelText('Tore Weiß'), '10')
    await user.type(screen.getByLabelText('Tore Schwarz'), '9')
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    expect(screen.getByRole('heading', { name: 'Partie wirklich abbrechen?' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Weiter spielen' }))
    expect(onAbort).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Tore Weiß')).toHaveValue(10)
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    await user.click(screen.getByRole('button', { name: 'Partie verbindlich abbrechen' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Nicht gespeichert')
    expect(screen.getByRole('timer')).toHaveTextContent('01:00')
    expect(props.tournament.activeMatch.endsAt).toBe(new Date(now + 60_000).toISOString())
    await user.click(screen.getByRole('button', { name: 'Weiter spielen' }))
    expect(screen.getByLabelText('Tore Schwarz')).toHaveValue(9)
  })

  it('meldet einen fehlgeschlagenen Pfiff ohne Zeitablauf oder Ergebniszugang zu verbergen', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    audio.play.mockImplementationOnce(() => { throw new Error('Audio blockiert') })
    const props = running()
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000) })
    expect(props.onAudioError).toHaveBeenCalledWith('Audio blockiert')
    expect(screen.getByRole('timer')).toHaveTextContent('00:00')
    expect(screen.getByRole('button', { name: 'Ergebnis eingeben' })).toBeVisible()
    await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
    expect(audio.play).toHaveBeenCalledOnce()
  })

  it('zeigt bei einer fehlgeschlagenen Pfiffreservierung einen Fehler und spielt keinen Ton', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const props = running({ onWhistle: vi.fn(async () => { throw new Error('Speicher gesperrt') }) })
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000) })
    expect(props.onAudioError).toHaveBeenCalledWith('Speicher gesperrt')
    expect(audio.play).not.toHaveBeenCalled()
  })
})

describe('Spielstart in der Turnierverwaltung', () => {
  it('wartet auf Speicherung, verhindert Doppelklick, startet trotz Audiofehler und setzt erst nach bestaetigtem Abbruch zurueck', async () => {
    const user = userEvent.setup()
    const tournament = fixture()
    await saveTournament(tournament, null)
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Partie vorbereiten' }))
    for (const [label, name] of [
      ['Weiß Angriff', 'Alex'], ['Weiß Verteidigung', 'Bea'], ['Schwarz Angriff', 'Chris'], ['Schwarz Verteidigung', 'Dana'],
    ]) {
      await user.click(screen.getByRole('button', { name: `${label}: frei` }))
      await user.click(screen.getByRole('button', { name: `${name} auswählen` }))
    }
    let release: (() => void) | undefined
    const hold = navigator.locks.request(`seal-kickerturnier:tournament:${tournament.id}`, () =>
      new Promise<void>((resolve) => { release = resolve }))
    await Promise.resolve()
    audio.activate.mockRejectedValueOnce(new Error('Audio blockiert'))
    await user.dblClick(screen.getByRole('button', { name: 'Spiel starten' }))
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(readTournament(tournament.id).activeMatch).toBeUndefined()
    expect(screen.getByRole('button', { name: 'Wird gestartet ...' })).toBeDisabled()
    expect(audio.activate).toHaveBeenCalledOnce()
    const releaseLock = release
    if (!releaseLock) throw new Error('Testsperre fehlt.')
    await act(async () => { releaseLock(); await hold })
    expect(await screen.findByRole('timer')).toHaveTextContent('01:00')
    expect(screen.getByRole('alert')).toHaveTextContent('Audio blockiert')
    const started = readTournament(tournament.id)
    expect(started.activeMatch?.lineup).toEqual(lineup)
    await user.click(screen.getByRole('button', { name: 'Zur Turnierübersicht' }))
    expect(screen.queryByRole('button', { name: 'Partie vorbereiten' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Offene Partie anzeigen' }))
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    await user.click(screen.getByRole('button', { name: 'Weiter spielen' }))
    expect(readTournament(tournament.id)).toEqual(started)
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    await user.click(screen.getByRole('button', { name: 'Partie verbindlich abbrechen' }))
    expect(readTournament(tournament.id).activeMatch).toBeNull()
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Weiß Angriff: frei' })).toBeVisible()
  })

  it('oeffnet eine gespeicherte Partie nach Codeeingabe direkt statt eine neue Aufstellung anzubieten', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now)
    const user = userEvent.setup()
    const tournament = startMatch(fixture(), lineup, now)
    await saveTournament(tournament, null)
    vi.setSystemTime(now + 30_000)
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup{Enter}')
    expect(await screen.findByRole('timer')).toHaveTextContent('00:30')
    expect(screen.queryByRole('button', { name: 'Spiel starten' })).not.toBeInTheDocument()
    expect(readTournament(tournament.id).activeMatch?.endsAt).toBe(tournament.activeMatch.endsAt)
  })
})
