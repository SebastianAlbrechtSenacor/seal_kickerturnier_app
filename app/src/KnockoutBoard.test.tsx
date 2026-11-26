import { webcrypto } from 'node:crypto'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TournamentManager from './TournamentManager'
import TournamentCompletion from './TournamentCompletion'
import { confettiFlight, confettiFrame, fallingProgress } from './completion-confetti'
import type { Tournament } from './tournament'
import { finishMatch, startMatch } from './matches'
import { finishKnockoutMatch, startKnockout, startKnockoutMatch } from './knockout'
import { readTournament, saveTournament, updatePreliminaryResult } from './tournament-storage'
import { avatars } from './players'

const audio = vi.hoisted(() => ({ activate: vi.fn(async () => {}), play: vi.fn(), ready: () => true, close: vi.fn(async () => {}) }))
vi.mock('./whistle', () => ({ createWhistle: () => audio }))
vi.mock('./completion-confetti', async (importOriginal) => ({
  ...await importOriginal<typeof import('./completion-confetti')>(),
  playConfetti: () => vi.fn(),
}))
const now = Date.parse('2026-11-25T15:00:00.000Z')
function fixture(): Tournament {
  const tournament: Tournament = {
    version: 2, id: 'knockout-ui', revision: 1, phase: 'preliminary',
    settings: { name: 'Finalcup', location: 'Office', description: '', startsAt: new Date(now).toISOString(),
      matchMinutes: 1, preliminaryMinutes: 120, knockoutMinutes: 60, winPoints: 3, lossPoints: 1 },
    players: ['Anton', 'Berta', 'Chris', 'Dana', 'Emil', 'Frida', 'Gabi', 'Hugo', 'Ina', 'Zoe']
      .map((nickname, index) => ({ id: `p-${index}`, nickname, avatar: avatars[index].emoji })),
  }
  const active = startMatch(tournament, { whiteAttack: 'p-0', whiteDefence: 'p-1', blackAttack: 'p-2', blackDefence: 'p-3' }, now - 60_000)
  return finishMatch(active, active.activeMatch.id, '7', '5', now)
}
beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('crypto', webcrypto)
  vi.clearAllMocks()
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() })
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
})
afterEach(() => { vi.useRealTimers() })

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Finalcup öffnen' }))
}

describe('Vertraute K.-o.-Bedienung', () => {
  it('lässt nach der dichten Phase nur zuvor gestartete Teile von oben nachfallen', () => {
    let seed = 7
    const particles = confettiFlight(2800, () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32))
    expect(confettiFrame(0)).toEqual({ firing: true, cover: 1 })
    expect(confettiFrame(19.99)).toEqual({ firing: true, cover: 1 })
    expect(confettiFrame(20).firing).toBe(false)
    expect(confettiFrame(21)).toEqual({ firing: false, cover: 0 })
    expect(particles.every(({ launch }) => launch < 20)).toBe(true)
    const falling = (time: number) => particles.filter((particle) => fallingProgress(particle, time) !== null)
    expect(falling(24).length).toBeGreaterThan(falling(45).length)
    expect(falling(60).length).toBeGreaterThan(0)
    expect(falling(65)).toEqual([])
  })
  it.each(['ready', 'running', 'complete'])('zeigt die Vorrunde ausschliesslich im Archiv (%s)', async (state) => {
    const user = userEvent.setup()
    let tournament = startKnockout(fixture())
    if (state === 'running') tournament = startKnockoutMatch(tournament, now)
    if (state === 'complete') {
      for (let index = 0; index < 4; index++) {
        const active = startKnockoutMatch(tournament, now)
        tournament = finishKnockoutMatch(active, active.activeMatch.id, '10', '9', now)
      }
    }
    await saveTournament(tournament, null)
    render(<TournamentManager />)
    await open(user)
    if (state === 'complete') {
      await user.click(await screen.findByRole('button', { name: 'K.-o.-Spielplan und Ergebnisse' }))
      expect(within(screen.getByRole('dialog')).getByRole('region', { name: 'K.-o.-Spielplan' })).toBeVisible()
      await user.keyboard('{Escape}')
    } else {
      expect(await screen.findByRole('region', { name: 'K.-o.-Spielplan' })).toBeVisible()
    }
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    const archive = screen.getByRole('button', { name: 'Vorrundenstand und Ergebnisse' })
    await user.click(archive)
    const table = within(screen.getByRole('dialog')).getByRole('table')
    expect(table).toBeVisible()
    expect(within(table).getAllByRole('columnheader')).toHaveLength(9)
    expect(within(table).getAllByRole('row')).toHaveLength(11)
    expect(within(table).getByRole('rowheader', { name: 'Zoe' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Spielergebnisse' })).toHaveTextContent('Weiß 7 : 5 Schwarz')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(archive).toHaveFocus()
    expect(readTournament(tournament.id)).toEqual(tournament)
    if (state === 'running') expect(screen.getByRole('timer')).toHaveTextContent('01:00')
  })

  it('feiert erst nach gespeichertem Finale und oeffnet bestehende Abschluesse ohne Animation oder Schreibzugriff', async () => {
    const user = userEvent.setup()
    let tournament = startKnockout(fixture())
    for (let index = 0; index < 3; index++) {
      const active = startKnockoutMatch(tournament, now)
      tournament = finishKnockoutMatch(active, active.activeMatch.id, '10', '9', now)
    }
    const active = startKnockoutMatch(tournament, now)
    await saveTournament(active, null)
    const first = render(<TournamentManager />)
    await open(user)
    expect(await screen.findByRole('timer')).toHaveTextContent('01:00')
    expect(screen.queryByRole('heading', { name: 'Turnier abgeschlossen' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '10 Tore erreicht' }))
    await user.type(screen.getByLabelText(/^Tore Team A/), '9')
    await user.type(screen.getByLabelText(/^Tore Team B/), '10')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(screen.getByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(readTournament(active.id)).toEqual(active)
    expect(screen.queryByRole('region', { name: 'Turnierabschluss' })).not.toBeInTheDocument()
    expect(document.querySelector('.completion-confetti')).not.toBeInTheDocument()
    await user.dblClick(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(await screen.findByRole('heading', { name: 'Turnier abgeschlossen' })).toHaveFocus()
    const ranking = screen.getByRole('list', { name: 'K.-o.-Teamplatzierungen' })
    expect(within(ranking).getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
      '1. Platz · Team B', '2. Platz · Team A', '3. Platz · Team D', '4. Platz · Team C',
    ])
    expect(within(ranking).getByText('Berta')).toBeVisible()
    expect(within(ranking).getByText('Gabi')).toBeVisible()
    expect(document.querySelector('.completion-confetti')).toHaveAttribute('aria-hidden', 'true')
    const stop = screen.getByRole('button', { name: 'Konfetti stoppen' })
    stop.focus()
    await user.keyboard('{Enter}')
    expect(document.querySelector('.completion-confetti')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Siegerehrung' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'JSON-Sicherung herunterladen' })).toBeEnabled()
    const completed = readTournament(active.id)
    expect(completed.knockout?.results).toHaveLength(4)
    expect(completed.completedMatches).toEqual(active.completedMatches)
    await user.click(screen.getByRole('button', { name: 'Turnier verlassen' }))
    await open(user)
    expect(await screen.findByRole('heading', { name: 'Turnier abgeschlossen' })).toBeVisible()
    expect(document.querySelector('.completion-confetti')).not.toBeInTheDocument()
    first.unmount()
    const write = vi.spyOn(Storage.prototype, 'setItem').mockClear()
    render(<TournamentManager />)
    await open(user)
    expect(await screen.findByRole('heading', { name: 'Turnier abgeschlossen' })).toBeVisible()
    expect(document.querySelector('.completion-confetti')).not.toBeInTheDocument()
    expect(readTournament(active.id)).toEqual(completed)
    expect(write).not.toHaveBeenCalled()
    expect(audio.play).toHaveBeenCalledOnce()
  })

  it.each([false, true])('beendet die Feier bis Sekunde 65 oder überspringt sie bei reduzierter Bewegung (%s)', (reduce) => {
    vi.useRealTimers()
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', () => ({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    try {
      let completed = startKnockout(fixture())
      for (let index = 0; index < 4; index++) {
        const active = startKnockoutMatch(completed, now)
        completed = finishKnockoutMatch(active, active.activeMatch.id, '10', '9', now)
      }
      const { unmount } = render(<TournamentCompletion tournament={completed} celebrate onBack={vi.fn()} onExport={vi.fn()} />)
      const stop = () => screen.queryByRole('button', { name: 'Konfetti stoppen' })
      if (!reduce) {
        expect(stop()).toBeVisible()
        act(() => vi.advanceTimersByTime(60_000))
        expect(stop()).toBeVisible()
      }
      act(() => vi.advanceTimersByTime(5000))
      expect(stop()).not.toBeInTheDocument()
      expect(document.querySelector('.completion-confetti')).not.toBeInTheDocument()
      expect(screen.getByRole('list', { name: 'K.-o.-Teamplatzierungen' })).toBeVisible()
      unmount()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it.each([7, 10])('zeigt die Startsperre bei sieben Personen oder offener Vorrundenpartie (%i)', async (count) => {
    const user = userEvent.setup()
    let tournament = fixture()
    tournament = { ...tournament, players: tournament.players?.slice(0, count) }
    if (count === 10) {
      tournament = startMatch(tournament,
        { whiteAttack: 'p-0', whiteDefence: 'p-1', blackAttack: 'p-2', blackDefence: 'p-3' }, now)
    }
    await saveTournament(tournament, null)
    render(<TournamentManager />)
    await open(user)
    if (count === 10) {
      expect(await screen.findByRole('timer')).toBeVisible()
      expect(screen.queryByRole('button', { name: 'K.O. Runde starten' })).not.toBeInTheDocument()
    } else {
      expect(await screen.findByRole('button', { name: 'K.O. Runde starten' })).toBeDisabled()
      expect(screen.getByText(/acht/)).toBeVisible()
    }
  })

  it('bestaetigt Top 8, behaelt den Stand bei Abbruch/Schreibfehler und friert nach doppelter Bestaetigung einmal ein', async () => {
    const user = userEvent.setup()
    const preliminary = fixture()
    const matchId = preliminary.completedMatches![0].id
    await saveTournament(preliminary, null)
    const original = await updatePreliminaryResult(preliminary, matchId, { kind: 'correct', white: '5', black: '7' })
    render(<TournamentManager />)
    await open(user)
    const workspace = screen.getByRole('region', { name: original.settings.name })
    expect(workspace).toHaveAttribute('data-phase', 'preliminary')
    await user.click(screen.getByRole('button', { name: 'Weiß Angriff: frei' }))
    await user.click(screen.getByRole('button', { name: 'Anton auswählen' }))
    await user.click(await screen.findByRole('button', { name: 'K.O. Runde starten' }))
    const confirmation = within(screen.getByRole('dialog', { name: 'K.-o.-Phase starten?' }))
    expect(confirmation.getAllByRole('row')).toHaveLength(11)
    expect(confirmation.getAllByText('Qualifiziert', { exact: true })).toHaveLength(8)
    expect(within(confirmation.getByRole('list', { name: 'Feste K.-o.-Teams' })).getAllByRole('listitem')).toHaveLength(4)
    expect(confirmation.getByText(/unumkehrbar/)).toBeVisible()
    await user.click(confirmation.getByRole('button', { name: 'Abbrechen' }))
    expect(readTournament(original.id)).toEqual(original)
    expect(workspace).toHaveAttribute('data-phase', 'preliminary')
    expect(screen.getByRole('button', { name: 'Weiß Angriff: Anton' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'K.O. Runde starten' }))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(screen.getByRole('button', { name: 'K.-o.-Phase verbindlich starten' }))
    expect(screen.getByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(readTournament(original.id)).toEqual(original)
    expect(workspace).toHaveAttribute('data-phase', 'preliminary')
    await user.dblClick(screen.getByRole('button', { name: 'K.-o.-Phase verbindlich starten' }))
    expect(await screen.findByRole('region', { name: 'K.-o.-Begegnung vorbereiten' })).toBeVisible()
    expect(workspace).toHaveAttribute('data-phase', 'knockout')
    const frozen = readTournament(original.id)
    expect(frozen.revision).toBe(original.revision + 1)
    expect(frozen.knockout?.standings).toHaveLength(10)
    expect(frozen.knockout?.standings[0]).toMatchObject({ goalsFor: 7, points: 3 })
    await expect(updatePreliminaryResult(original, matchId, { kind: 'delete' })).rejects.toThrow('zwischenzeitlich geändert')
    await expect(updatePreliminaryResult(frozen, matchId, { kind: 'delete' })).rejects.toThrow('K.-o.-Start')
    expect(readTournament(original.id)).toEqual(frozen)
    const pitch = within(screen.getByRole('group', { name: 'Kickertisch' }))
    expect(pitch.getAllByRole('button')).toHaveLength(4)
    for (const button of pitch.getAllByRole('button')) {
      expect(button).toBeDisabled()
      expect(button).not.toHaveAccessibleName(/Angriff|Verteidigung|Weiß|Schwarz/)
    }
    expect(screen.queryByRole('button', { name: /auswählen/ })).not.toBeInTheDocument()
  })

  it('behaelt nach Abbruch dieselbe Begegnung, stellt nach Neuladen die Restzeit her und wendet Ablaufregeln auf Teams an', async () => {
    const user = userEvent.setup()
    await saveTournament(fixture(), null)
    const first = render(<TournamentManager />)
    await open(user)
    await user.click(await screen.findByRole('button', { name: 'K.O. Runde starten' }))
    await user.click(screen.getByRole('button', { name: 'K.-o.-Phase verbindlich starten' }))
    await user.click(await screen.findByRole('button', { name: 'Spiel starten' }))
    expect(await screen.findByRole('timer')).toHaveTextContent('01:00')
    expect(screen.getByRole('button', { name: 'Vorrundenstand und Ergebnisse' })).toBeVisible()
    const started = readTournament('knockout-ui')
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    await user.click(screen.getByRole('button', { name: 'Weiter spielen' }))
    expect(readTournament(started.id)).toEqual(started)
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    await user.click(screen.getByRole('button', { name: 'Partie verbindlich abbrechen' }))
    expect(await screen.findByRole('heading', { name: 'Halbfinale 1: Team A gegen Team D' })).toBeVisible()
    expect(readTournament(started.id).knockout?.results).toEqual([])
    expect(audio.play).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'Spiel starten' }))
    expect(await screen.findByRole('timer')).toHaveTextContent('01:00')
    expect(readTournament(started.id).activeMatch?.id).not.toBe(started.activeMatch?.id)
    first.unmount()
    vi.setSystemTime(now + 30_000)
    render(<TournamentManager />)
    await open(user)
    expect(await screen.findByRole('timer')).toHaveTextContent('00:30')
    expect(screen.getByRole('button', { name: 'Vorrundenstand und Ergebnisse' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: '10 Tore erreicht' }))
    expect(screen.getByLabelText(/^Tore Team A/)).toHaveAccessibleDescription(/Anton.*Hugo/)
    await user.type(screen.getByLabelText(/^Tore Team A/), '7')
    await user.type(screen.getByLabelText(/^Tore Team D/), '5')
    await user.click(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(screen.getByRole('alert')).toHaveTextContent('10 Tore')
    vi.setSystemTime(now + 60_000)
    await act(async () => { fireEvent.focus(window) })
    expect(audio.play).toHaveBeenCalledTimes(3)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(screen.getByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(readTournament(started.id).knockout?.results).toEqual([])
    expect(screen.getByLabelText(/^Tore Team A/)).toHaveValue(7)
    await user.dblClick(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    expect(await screen.findByRole('heading', { name: 'Halbfinale 2: Team B gegen Team C' })).toBeVisible()
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(readTournament(started.id).knockout?.results).toHaveLength(1)
    expect(audio.play).toHaveBeenCalledTimes(3)
  })

  it('fuehrt den kompletten Spielplan durch und bleibt nach dem Finale dauerhaft ohne neue Startaktion', async () => {
    const user = userEvent.setup()
    const original = fixture()
    await saveTournament(original, null)
    const first = render(<TournamentManager />)
    await open(user)
    await user.click(await screen.findByRole('button', { name: 'K.O. Runde starten' }))
    await user.click(screen.getByRole('button', { name: 'K.-o.-Phase verbindlich starten' }))
    for (const [firstScore, secondScore] of [['10', '9'], ['9', '10'], ['10', '0'], ['0', '10']]) {
      await user.click(await screen.findByRole('button', { name: 'Spiel starten' }))
      await user.click(await screen.findByRole('button', { name: '10 Tore erreicht' }))
      const inputs = screen.getAllByRole('spinbutton')
      await user.type(inputs[0], firstScore)
      await user.type(inputs[1], secondScore)
      await user.click(screen.getByRole('button', { name: 'Ergebnis speichern' }))
    }
    expect(await screen.findByRole('heading', { name: 'Turnier abgeschlossen' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Spiel starten' })).not.toBeInTheDocument()
    const saved = readTournament(original.id)
    expect(saved.knockout?.results).toHaveLength(4)
    expect(saved.completedMatches).toEqual(original.completedMatches)
    expect(audio.play).toHaveBeenCalledTimes(8)
    await user.click(screen.getByRole('button', { name: 'Vorrundenstand und Ergebnisse' }))
    expect(screen.getByRole('region', { name: 'Spielergebnisse' })).toHaveTextContent('Weiß 7 : 5 Schwarz')
    expect(screen.queryByRole('button', { name: /Ergebnis \d bearbeiten/ })).not.toBeInTheDocument()
    const frozenRows = within(screen.getAllByRole('table')[0]).getAllByRole('row')
    expect(within(frozenRows[1]).getAllByRole('cell').at(-1)).toHaveTextContent('3')
    first.unmount()
    render(<TournamentManager />)
    await open(user)
    expect(await screen.findByRole('heading', { name: 'Turnier abgeschlossen' })).toBeVisible()
    expect(readTournament(original.id)).toEqual(saved)
  })
})
