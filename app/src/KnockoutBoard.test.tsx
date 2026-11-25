import { createHash, webcrypto } from 'node:crypto'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TournamentManager from './TournamentManager'
import type { Tournament } from './tournament'
import { finishMatch, startMatch } from './matches'
import { finishKnockoutMatch, startKnockout, startKnockoutMatch } from './knockout'
import { readTournament, saveTournament } from './tournament-storage'
import { avatars } from './players'

const audio = vi.hoisted(() => ({ activate: vi.fn(async () => {}), play: vi.fn(), ready: () => true, close: vi.fn(async () => {}) }))
vi.mock('./whistle', () => ({ createWhistle: () => audio }))
const now = Date.parse('2026-11-25T15:00:00.000Z')
function fixture(): Tournament {
  const tournament: Tournament = {
    version: 2, id: 'knockout-ui', revision: 1, phase: 'preliminary',
    codeHash: createHash('sha256').update('fixture-cup').digest('hex'),
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
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
})
afterEach(() => { vi.useRealTimers() })

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Finalcup öffnen' }))
  await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup{Enter}')
}

describe('Vertraute K.-o.-Bedienung', () => {
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
    const plan = await screen.findByRole('region', { name: 'K.-o.-Spielplan' })
    expect(plan).toBeVisible()
    expect(screen.getAllByRole('table', { hidden: true })).toHaveLength(1)
    const table = screen.getByRole('table', { hidden: true })
    expect(table).not.toBeVisible()
    await user.click(screen.getByText('Vorrundenstand und Ergebnisse'))
    expect(table).toBeVisible()
    expect(within(table).getAllByRole('columnheader')).toHaveLength(9)
    expect(within(table).getAllByRole('row')).toHaveLength(11)
    expect(within(table).getByRole('rowheader', { name: 'Zoe' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Spielergebnisse' })).toHaveTextContent('Weiß 7 : 5 Schwarz')
    await user.click(screen.getByText('Vorrundenstand und Ergebnisse'))
    expect(table).not.toBeVisible()
    expect(plan).toBeVisible()
    expect(readTournament(tournament.id)).toEqual(tournament)
    if (state === 'running') expect(screen.getByRole('timer')).toHaveTextContent('01:00')
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
      await user.click(await screen.findByRole('button', { name: 'Zur Turnierübersicht' }))
    }
    expect(await screen.findByRole('button', { name: 'K.-o.-Phase starten' })).toBeDisabled()
    expect(screen.getByText(count === 7 ? /acht/ : /offene Partie/)).toBeVisible()
  })

  it('bestaetigt Top 8, behaelt den Stand bei Abbruch/Schreibfehler und friert nach doppelter Bestaetigung einmal ein', async () => {
    const user = userEvent.setup()
    const original = fixture()
    await saveTournament(original, null)
    render(<TournamentManager />)
    await open(user)
    await user.click(await screen.findByRole('button', { name: 'K.-o.-Phase starten' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(8)
    expect(screen.getByText(/unumkehrbar/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(readTournament(original.id)).toEqual(original)
    await user.click(screen.getByRole('button', { name: 'K.-o.-Phase starten' }))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(screen.getByRole('button', { name: 'K.-o.-Phase verbindlich starten' }))
    expect(screen.getByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(readTournament(original.id)).toEqual(original)
    await user.dblClick(screen.getByRole('button', { name: 'K.-o.-Phase verbindlich starten' }))
    expect(await screen.findByRole('region', { name: 'K.-o.-Begegnung vorbereiten' })).toBeVisible()
    expect(readTournament(original.id).revision).toBe(original.revision + 1)
    expect(readTournament(original.id).knockout?.standings).toHaveLength(10)
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
    await user.click(await screen.findByRole('button', { name: 'K.-o.-Phase starten' }))
    await user.click(screen.getByRole('button', { name: 'K.-o.-Phase verbindlich starten' }))
    await user.click(await screen.findByRole('button', { name: 'Spiel starten' }))
    expect(await screen.findByRole('timer')).toHaveTextContent('01:00')
    expect(screen.getByText('Vorrundenstand und Ergebnisse')).toBeVisible()
    const started = readTournament('knockout-ui')
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    await user.click(screen.getByRole('button', { name: 'Weiter spielen' }))
    expect(readTournament(started.id)).toEqual(started)
    await user.click(screen.getByRole('button', { name: 'Partie abbrechen' }))
    await user.click(screen.getByRole('button', { name: 'Partie verbindlich abbrechen' }))
    expect(await screen.findByRole('heading', { name: 'Halbfinale 1: Team A gegen Team D' })).toBeVisible()
    expect(readTournament(started.id).knockout?.results).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Spiel starten' }))
    expect(await screen.findByRole('timer')).toHaveTextContent('01:00')
    expect(readTournament(started.id).activeMatch?.id).not.toBe(started.activeMatch?.id)
    first.unmount()
    vi.setSystemTime(now + 30_000)
    render(<TournamentManager />)
    await open(user)
    expect(await screen.findByRole('timer')).toHaveTextContent('00:30')
    expect(screen.getByText('Vorrundenstand und Ergebnisse')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '10 Tore erreicht' }))
    expect(screen.getByLabelText(/^Tore Team A/)).toHaveAccessibleName(/Anton.*Hugo/)
    await user.type(screen.getByLabelText(/^Tore Team A/), '7')
    await user.type(screen.getByLabelText(/^Tore Team D/), '5')
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(screen.getByRole('alert')).toHaveTextContent('10 Tore')
    vi.setSystemTime(now + 60_000)
    await act(async () => { fireEvent.focus(window) })
    expect(audio.play).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(screen.getByRole('button', { name: 'Ergebnis verbindlich speichern' }))
    expect(screen.getByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(readTournament(started.id).knockout?.results).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Ergebnis ändern' }))
    expect(screen.getByLabelText(/^Tore Team A/)).toHaveValue(7)
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    await user.dblClick(screen.getByRole('button', { name: 'Ergebnis verbindlich speichern' }))
    expect(await screen.findByRole('heading', { name: 'Halbfinale 2: Team B gegen Team C' })).toBeVisible()
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(readTournament(started.id).knockout?.results).toHaveLength(1)
  })

  it('fuehrt den kompletten Spielplan durch und bleibt nach dem Finale dauerhaft ohne neue Startaktion', async () => {
    const user = userEvent.setup()
    const original = fixture()
    await saveTournament(original, null)
    const first = render(<TournamentManager />)
    await open(user)
    await user.click(await screen.findByRole('button', { name: 'K.-o.-Phase starten' }))
    await user.click(screen.getByRole('button', { name: 'K.-o.-Phase verbindlich starten' }))
    for (const [firstScore, secondScore] of [['10', '9'], ['9', '10'], ['10', '0'], ['0', '10']]) {
      await user.click(await screen.findByRole('button', { name: 'Spiel starten' }))
      await user.click(await screen.findByRole('button', { name: '10 Tore erreicht' }))
      const inputs = screen.getAllByRole('spinbutton')
      await user.type(inputs[0], firstScore)
      await user.type(inputs[1], secondScore)
      await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
      await user.click(screen.getByRole('button', { name: 'Ergebnis verbindlich speichern' }))
    }
    expect(await screen.findByRole('heading', { name: 'K.-o.-Phase abgeschlossen' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Spiel starten' })).not.toBeInTheDocument()
    const saved = readTournament(original.id)
    expect(saved.knockout?.results).toHaveLength(4)
    expect(saved.completedMatches).toEqual(original.completedMatches)
    expect(audio.play).not.toHaveBeenCalled()
    await user.click(screen.getByText('Vorrundenstand und Ergebnisse'))
    expect(screen.getByRole('region', { name: 'Spielergebnisse' })).toHaveTextContent('Weiß 7 : 5 Schwarz')
    const frozenRows = within(screen.getAllByRole('table')[0]).getAllByRole('row')
    expect(within(frozenRows[1]).getAllByRole('cell').at(-1)).toHaveTextContent('3')
    first.unmount()
    render(<TournamentManager />)
    await open(user)
    expect(await screen.findByRole('heading', { name: 'K.-o.-Phase abgeschlossen' })).toBeVisible()
    expect(readTournament(original.id)).toEqual(saved)
  })
})
