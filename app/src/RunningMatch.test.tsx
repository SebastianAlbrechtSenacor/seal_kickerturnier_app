import { webcrypto } from 'node:crypto'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentProps } from 'react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RunningMatch from './RunningMatch'
import TournamentManager from './TournamentManager'
import MatchPreparation from './MatchPreparation'
import { finishMatch, startMatch } from './matches'
import type { Tournament } from './tournament'
import { readTournament, saveTournament, updatePreliminaryResult, updateTournament } from './tournament-storage'
import { avatars } from './players'
import { parseBackup, serializeBackup } from './tournament-backup'

const audio = vi.hoisted(() => ({
  activate: vi.fn(async () => {}), play: vi.fn(), ready: vi.fn(() => true), close: vi.fn(async () => {}),
}))
vi.mock('./whistle', () => ({ createWhistle: () => audio }))
const now = Date.parse('2026-11-25T12:00:00.000Z')
const lineup = { whiteAttack: 'p-0', whiteDefence: 'p-1', blackAttack: 'p-2', blackDefence: 'p-3' }

function fixture(): Tournament {
  return {
    version: 2, id: 'timer-cup', revision: 1, phase: 'preliminary',
    settings: {
      name: 'Timercup', location: 'Office', description: '', startsAt: new Date(now).toISOString(),
      matchMinutes: 1, preliminaryMinutes: 120, knockoutMinutes: 60, winPoints: 3, lossPoints: 1,
    },
    players: ['Alex', 'Bea', 'Chris', 'Dana'].map((nickname, index) => ({ id: `p-${index}`, nickname, avatar: avatars[index].emoji })),
  }
}

function running(overrides: Partial<ComponentProps<typeof RunningMatch>> = {}) {
  const props = {
    tournament: startMatch(fixture(), lineup, now), whistle: audio,
    onAudioError: vi.fn(), onWhistle: vi.fn(async () => true),
    onAbort: vi.fn(async () => {}), onSave: vi.fn(async () => {}), onBack: vi.fn(), onExport: vi.fn(),
    ...overrides,
  }
  return { ...render(<RunningMatch {...props} />), ...props }
}

function withResults(count: number) {
  let tournament = fixture()
  for (let index = 0; index < count; index++) {
    const started = startMatch(tournament, lineup, now + index * 120_000)
    tournament = finishMatch(started, started.activeMatch.id, '10', String(index), now + index * 120_000 + 1000)
  }
  return tournament
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('crypto', webcrypto)
  vi.clearAllMocks()
  audio.activate.mockResolvedValue(undefined)
  audio.play.mockResolvedValue(undefined)
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
    await user.click(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(screen.getByRole('alert')).toHaveTextContent('10 Tore')
    expect(props.onSave).not.toHaveBeenCalled()
    vi.setSystemTime(now + 60_000)
    await act(async () => { fireEvent.focus(window) })
    await user.click(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(props.onSave).toHaveBeenCalledExactlyOnceWith('7', '5')
    expect(screen.queryByRole('region', { name: 'Ergebnisprüfung' })).not.toBeInTheDocument()
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
    audio.play.mockRejectedValueOnce(new Error('Audio blockiert'))
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

describe('Gespeicherte Ergebnisse in der Turnierverwaltung', () => {
  it('behaelt den Entwurf bei Schreibfehlern, sperrt Doppelsubmit und laedt erst nach Speicherung die leere naechste Aufstellung', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now + 60_000)
    const user = userEvent.setup()
    const started = startMatch(fixture(), lineup, now)
    await saveTournament(started, null)
    const { unmount } = render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    await user.click(await screen.findByRole('button', { name: 'Ergebnis eingeben' }))
    await user.type(screen.getByLabelText('Tore Weiß'), '7')
    await user.type(screen.getByLabelText('Tore Schwarz'), '5')
    expect(screen.getByLabelText('Tore Weiß')).toHaveValue(7)
    expect(readTournament(started.id)).toEqual(started)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(screen.getByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(readTournament(started.id)).toEqual(started)
    expect(screen.getByLabelText('Tore Schwarz')).toHaveValue(5)
    let release: (() => void) | undefined
    const hold = navigator.locks.request(`seal-kickerturnier:tournament:${started.id}`, () =>
      new Promise<void>((resolve) => { release = resolve }))
    await Promise.resolve()
    await user.dblClick(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(screen.getByRole('button', { name: 'Wird gespeichert ...' })).toBeDisabled()
    expect(screen.getByLabelText('Tore Weiß')).toBeDisabled()
    expect(readTournament(started.id)).toEqual(started)
    const releaseLock = release
    if (!releaseLock) throw new Error('Testsperre fehlt.')
    await act(async () => { releaseLock(); await hold })
    expect(await screen.findByRole('region', { name: 'Partieaufstellung' })).toBeVisible()
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeDisabled()
    for (const position of ['Weiß Angriff', 'Weiß Verteidigung', 'Schwarz Angriff', 'Schwarz Verteidigung']) {
      expect(screen.getByRole('button', { name: `${position}: frei` })).toBeVisible()
    }
    const saved = readTournament(started.id)
    expect(saved.completedMatches).toHaveLength(1)
    expect(saved.completedMatches?.[0]).toMatchObject({ id: started.activeMatch.id, whiteGoals: 7, blackGoals: 5 })
    const compactRows = within(screen.getByRole('table')).getAllByRole('row')
    expect(compactRows[1]).toHaveTextContent('Alex')
    expect(within(compactRows[1]).getAllByRole('cell').at(-1)).toHaveTextContent('3')
    expect(compactRows[3]).toHaveTextContent('Chris')
    expect(within(compactRows[3]).getAllByRole('cell').at(-1)).toHaveTextContent('1')
    expect(within(screen.getByRole('region', { name: 'Letzte 3 Ergebnisse' })).getAllByRole('listitem')).toHaveLength(1)
    unmount()
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    await user.click(screen.getByRole('button', { name: 'Vollständiger Ergebnisverlauf' }))
    expect(await screen.findByRole('region', { name: 'Spielergebnisse' })).toHaveTextContent('Weiß 7 : 5 Schwarz')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Schließen' }))
    await user.click(screen.getByRole('button', { name: 'Vollständige Vorrundentabelle' }))
    const tableDialog = screen.getByRole('dialog')
    const rows = within(tableDialog).getAllByRole('row')
    expect(within(rows[1]).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['1', '1', '1', '0', '7', '5', '2', '3'])
    await user.click(within(tableDialog).getByRole('button', { name: 'Schließen' }))
    expect(readTournament(started.id)).toEqual(saved)
    for (const [position, player] of [['Weiß Angriff', 'Alex'], ['Weiß Verteidigung', 'Bea'], ['Schwarz Angriff', 'Chris'], ['Schwarz Verteidigung', 'Dana']]) {
      await user.click(screen.getByRole('button', { name: `${position}: frei` }))
      await user.click(screen.getByRole('button', { name: `${player} auswählen` }))
    }
    await user.click(screen.getByRole('button', { name: 'Spiel starten' }))
    expect(await screen.findByRole('timer')).toHaveTextContent('01:00')
    expect(screen.queryByRole('button', { name: /Ergebnis \d bearbeiten/ })).not.toBeInTheDocument()
    const liveRows = within(screen.getByRole('table')).getAllByRole('row')
    expect(within(liveRows[1]).getAllByRole('cell').at(-1)).toHaveTextContent('3')
    expect(readTournament(started.id).completedMatches).toEqual(saved.completedMatches)
    expect(audio.play).toHaveBeenCalledOnce()
  })

  it('zeigt alle Ergebnisse in der Uebersicht, nur die letzten drei unter der Auswahltabelle und Turnierinfos aufklappbar', async () => {
    const user = userEvent.setup()
    await saveTournament(withResults(4), null)
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    await user.click(screen.getByRole('button', { name: 'Weiß Angriff: frei' }))
    await user.click(screen.getByRole('button', { name: 'Alex auswählen' }))
    const recentPanel = screen.getByRole('region', { name: 'Letzte 3 Ergebnisse' })
    await user.click(within(recentPanel).getByRole('button', { name: 'Vollständiger Ergebnisverlauf' }))
    const all = within(await screen.findByRole('region', { name: 'Spielergebnisse' })).getAllByRole('listitem')
    expect(all).toHaveLength(4)
    expect(all.map((item) => within(item).getByText(/Weiß 10 :/).textContent)).toEqual([
      'Weiß 10 : 3 Schwarz', 'Weiß 10 : 2 Schwarz', 'Weiß 10 : 1 Schwarz', 'Weiß 10 : 0 Schwarz',
    ])
    expect(all[0]).toHaveTextContent('Alex')
    expect(all[0]).toHaveTextContent('Dana')
    const finishedAt = within(all[0]).getByText(/25\.11\.2026/)
    expect(finishedAt).not.toBeVisible()
    await user.click(within(all[0]).getByText('Weiß 10 : 3 Schwarz'))
    expect(finishedAt).toBeVisible()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Schließen' }))
    expect(screen.queryByRole('complementary', { name: 'Zeitplanung' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Weitere Turnierinfos' }))
    expect(screen.getByRole('complementary', { name: 'Zeitplanung' })).toBeVisible()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Schließen' }))
    expect(screen.getByRole('button', { name: 'Weiß Angriff: Alex' })).toBeVisible()
    const recent = within(screen.getByRole('region', { name: 'Letzte 3 Ergebnisse' })).getAllByRole('listitem')
    expect(recent).toHaveLength(3)
    expect(recent[0]).toHaveTextContent('Weiß 10 : 3 Schwarz')
    expect(recent[2]).toHaveTextContent('Weiß 10 : 1 Schwarz')
    expect(screen.queryByText('Weiß 10 : 0 Schwarz')).not.toBeInTheDocument()
    expect(within(screen.getByRole('table')).getAllByRole('columnheader')).toHaveLength(3)
  })

  it.each([0, 2])('zeigt bei %s Ergebnissen keine kuenstlichen Partien', (count) => {
    render(<MatchPreparation tournament={withResults(count)} onStart={vi.fn()} onBack={vi.fn()}
      onExport={vi.fn()} onKnockout={vi.fn()} tournamentInfo={null} />)
    const history = within(screen.getByRole('region', { name: 'Letzte 3 Ergebnisse' }))
    expect(history.queryAllByRole('listitem')).toHaveLength(count)
    if (count === 0) expect(history.getByText('Noch keine abgeschlossene Partie.')).toBeVisible()
  })

  it('korrigiert und löscht eines der jüngsten drei Spiele mit Neuwertung, unveränderter Historie und JSON-Rundlauf', async () => {
    const user = userEvent.setup()
    const original = withResults(4)
    const matches = original.completedMatches!
    await saveTournament(original, null)
    const first = render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    const history = within(screen.getByRole('region', { name: 'Letzte 3 Ergebnisse' }))
    const edit = () => history.getByRole('button', { name: /^Ergebnis 1 bearbeiten/ })
    expect(history.getAllByRole('button', { name: /Ergebnis \d bearbeiten/ })).toHaveLength(3)
    expect(history.queryByRole('button', { name: /10 : 0/ })).not.toBeInTheDocument()
    await user.click(edit())
    const dialog = within(screen.getByRole('dialog', { name: 'Vorrundenergebnis bearbeiten' }))
    const white = dialog.getByLabelText('Tore Weiß')
    const black = dialog.getByLabelText('Tore Schwarz')
    expect(white).toHaveValue(10)
    expect(black).toHaveValue(3)
    await user.clear(white)
    await user.type(white, '3')
    await user.click(dialog.getByRole('button', { name: 'Korrektur speichern' }))
    expect(dialog.getByRole('alert')).toHaveTextContent('Gleichstand')
    expect(white).toHaveValue(3)
    expect(readTournament(original.id)).toEqual(original)
    await user.clear(white)
    await user.type(white, '2')
    await user.clear(black)
    await user.type(black, '9')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(dialog.getByRole('button', { name: 'Korrektur speichern' }))
    expect(dialog.getByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(white).toHaveValue(2)
    expect(readTournament(original.id)).toEqual(original)
    await user.click(dialog.getByRole('button', { name: 'Korrektur speichern' }))
    expect(await history.findByText('Weiß 2 : 9 Schwarz')).toBeVisible()
    expect(edit()).toHaveFocus()
    const corrected = readTournament(original.id)
    expect(corrected.completedMatches).toEqual([
      ...matches.slice(0, 3), { ...matches[3], whiteGoals: 2, blackGoals: 9, corrected: true },
    ])
    expect(parseBackup(serializeBackup(corrected))).toEqual(corrected)

    await user.click(screen.getByRole('button', { name: 'Vollständige Vorrundentabelle' }))
    let table = within(screen.getByRole('dialog', { name: 'Vorrundentabelle' }))
    expect(within(table.getByRole('row', { name: /Alex/ })).getAllByRole('cell').map((cell) => cell.textContent))
      .toEqual(['1', '4', '3', '1', '32', '12', '20', '10'])
    await user.click(table.getByRole('button', { name: 'Schließen' }))

    await user.click(edit())
    await user.click(dialog.getByRole('button', { name: 'Spiel löschen' }))
    let confirmation = within(screen.getByRole('dialog', { name: 'Vorrundenspiel löschen?' }))
    await user.click(confirmation.getByRole('button', { name: 'Abbrechen' }))
    expect(readTournament(original.id)).toEqual(corrected)
    await user.click(edit())
    await user.click(dialog.getByRole('button', { name: 'Spiel löschen' }))
    confirmation = within(screen.getByRole('dialog', { name: 'Vorrundenspiel löschen?' }))
    await user.click(confirmation.getByRole('button', { name: 'Spiel endgültig löschen' }))
    expect(await history.findByRole('button', { name: /Ergebnis 3 bearbeiten: Weiß 10 : 0/ })).toBeVisible()
    const deleted = readTournament(original.id)
    expect(deleted.completedMatches).toEqual(matches.slice(0, 3))
    expect(parseBackup(serializeBackup(deleted))).toEqual(deleted)

    first.unmount()
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    expect(screen.queryByText('Weiß 2 : 9 Schwarz')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Vollständige Vorrundentabelle' }))
    table = within(screen.getByRole('dialog', { name: 'Vorrundentabelle' }))
    expect(within(table.getByRole('row', { name: /Alex/ })).getAllByRole('cell').map((cell) => cell.textContent))
      .toEqual(['1', '3', '3', '0', '30', '3', '27', '9'])
  })

  it('schützt alte Ergebnisse und lehnt Löschungen aus veralteten Tabs sowie bei offener Partie ab', async () => {
    const user = userEvent.setup()
    const original = withResults(4)
    const matches = original.completedMatches!
    await saveTournament(original, null)
    await expect(updatePreliminaryResult(original, matches[0].id, { kind: 'delete' })).rejects.toThrow('letzten drei')
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    await user.click(screen.getByRole('button', { name: /^Ergebnis 1 bearbeiten/ }))
    const active = await updateTournament(original, (current) => startMatch(current, lineup, now + 480_000))
    await user.click(screen.getByRole('button', { name: 'Spiel löschen' }))
    await user.click(screen.getByRole('button', { name: 'Spiel endgültig löschen' }))
    expect(screen.getByRole('alert')).toHaveTextContent('zwischenzeitlich geändert')
    await expect(updatePreliminaryResult(active, matches[3].id, { kind: 'delete' })).rejects.toThrow('offene Partie')
    expect(readTournament(original.id)).toEqual(active)
  })

  it('pfeift nach dem Speichern der zehn Tore einmal und nicht erneut nach Zeitablauf', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now + 1000)
    const user = userEvent.setup()
    const started = startMatch(fixture(), lineup, now)
    await saveTournament(started, null)
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    await user.click(await screen.findByRole('button', { name: '10 Tore erreicht' }))
    await user.type(screen.getByLabelText('Tore Weiß'), '10')
    await user.type(screen.getByLabelText('Tore Schwarz'), '9')
    await user.click(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(await screen.findByRole('region', { name: 'Partieaufstellung' })).toBeVisible()
    const saved = readTournament(started.id)
    expect(saved.completedMatches?.[0]).toMatchObject({
      finishedAt: new Date(now + 1000).toISOString(), endsAt: started.activeMatch.endsAt,
      whiteGoals: 10, blackGoals: 9,
    })
    vi.setSystemTime(now + 120_000)
    await act(async () => { fireEvent.focus(window) })
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(audio.play).toHaveBeenCalledOnce()
    expect(readTournament(started.id)).toEqual(saved)
  })
})

describe('Spielstart in der Turnierverwaltung', () => {
  it('wartet auf Speicherung, verhindert Doppelklick, startet trotz Audiofehler und setzt erst nach bestaetigtem Abbruch zurueck', async () => {
    const user = userEvent.setup()
    const tournament = fixture()
    await saveTournament(tournament, null)
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
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
    audio.ready.mockReturnValue(false)
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
    await user.click(screen.getByRole('button', { name: 'Turnier verlassen' }))
    expect(screen.queryByRole('region', { name: 'Partieaufstellung' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Timercup öffnen' }))
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    await user.click(screen.getByRole('button', { name: 'Weiter spielen' }))
    expect(readTournament(tournament.id)).toEqual(started)
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    await user.click(screen.getByRole('button', { name: 'Partie verbindlich abbrechen' }))
    expect(readTournament(tournament.id).activeMatch).toBeNull()
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Weiß Angriff: frei' })).toBeVisible()
    expect(audio.play).not.toHaveBeenCalled()
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
    expect(await screen.findByRole('timer')).toHaveTextContent('00:30')
    expect(screen.queryByRole('button', { name: 'Spiel starten' })).not.toBeInTheDocument()
    expect(readTournament(tournament.id).activeMatch?.endsAt).toBe(tournament.activeMatch.endsAt)
    expect(audio.play).not.toHaveBeenCalled()
  })
})
