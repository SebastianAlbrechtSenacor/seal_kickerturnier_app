import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MatchPreparation from './MatchPreparation'
import { positions } from './lineup'
import type { Tournament } from './tournament'
import { avatars } from './players'

function fixture(): Tournament {
  return {
    version: 2, id: 'lineup-fixture', revision: 3, phase: 'preliminary', codeHash: 'a'.repeat(64),
    settings: {
      name: 'Aufstellungscup', startsAt: '2026-11-26T16:00:00.000Z', location: 'Office',
      description: '', matchMinutes: 10, preliminaryMinutes: 120, knockoutMinutes: 60, winPoints: 3, lossPoints: 1,
    },
    players: ['Alex', 'Bea', 'Chris', 'Dana', 'Emil'].map((nickname, index) => ({
      id: `player-${index}`, nickname, avatar: index === 4 ? '👩🏽‍💻' : avatars[index].emoji,
    })),
  }
}

const assignments = [
  { label: 'Weiß Angriff', nickname: 'Alex' },
  { label: 'Weiß Verteidigung', nickname: 'Bea' },
  { label: 'Schwarz Angriff', nickname: 'Chris' },
  { label: 'Schwarz Verteidigung', nickname: 'Dana' },
]

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() })
  Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: vi.fn(() => null) })
})

describe('Partieaufstellung', () => {
  it('zeigt nur Rang, Spielende und Punkte und ordnet die Positionen in Tisch-Lesereihenfolge an', () => {
    render(<MatchPreparation tournament={fixture()} onCheckCurrent={vi.fn()} onBack={vi.fn()} />)
    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Rang', 'Spielende', 'Punkte',
    ])
    const first = within(table).getAllByRole('row')[1]
    expect(within(first).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['1', '0'])
    expect(within(first).getByRole('button', { name: 'Alex auswählen' })).toBeVisible()
    expect(within(screen.getByRole('group', { name: 'Kickertisch' })).getAllByRole('button')
      .map((button) => button.getAttribute('aria-label'))).toEqual([
      'Weiß Verteidigung: frei', 'Schwarz Angriff: frei', 'Weiß Angriff: frei', 'Schwarz Verteidigung: frei',
    ])
  })

  it('belegt per Klick und Tastatur, ersetzt und entfernt ohne Einfrieren und startet nur die ausdrueckliche Pruefung', async () => {
    const user = userEvent.setup()
    const tournament = fixture()
    const original = structuredClone(tournament)
    const check = vi.fn()
    render(<MatchPreparation tournament={tournament} onCheckCurrent={check} onBack={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Alex auswählen' }))
    expect(screen.getByRole('alert')).toHaveTextContent('zuerst eine Position')
    for (const { label, nickname } of assignments) {
      await user.click(screen.getByRole('button', { name: `${label}: frei` }))
      const person = screen.getByRole('button', { name: `${nickname} auswählen` })
      person.focus()
      await user.keyboard('{Enter}')
    }
    expect(screen.getByRole('button', { name: 'Alex auswählen – bereits eingesetzt' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Weiß Angriff: Alex' }))
    await user.click(screen.getByRole('button', { name: 'Emil auswählen' }))
    expect(screen.getByRole('button', { name: 'Weiß Angriff: Emil' })).toBeVisible()
    const replaced = screen.getByRole('button', { name: 'Weiß Angriff: Emil' })
    expect(within(replaced).getByText('👩🏽‍💻')).toBeVisible()
    expect(within(replaced).queryByText(avatars[0].emoji)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Alex auswählen' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Weiß Angriff leeren' }))
    expect(within(screen.getByRole('button', { name: 'Weiß Angriff: frei' })).queryByText('👩🏽‍💻')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Weiß Angriff: frei' }))
    await user.click(screen.getByRole('button', { name: 'Alex auswählen' }))
    await user.click(screen.getByRole('button', { name: 'Spiel starten' }))
    expect(check).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { name: 'Aufstellung prüfen' })).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Noch keine Partie gestartet')
    expect(screen.getByRole('button', { name: 'Spiel verbindlich starten – folgt in Story 1.7' })).toBeDisabled()
    expect(tournament).toEqual(original)
    await user.click(screen.getByRole('button', { name: 'Zur Aufstellung' }))
    expect(screen.getByRole('button', { name: 'Weiß Angriff: Alex' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Aufstellung leeren' }))
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeDisabled()
    for (const position of positions) {
      expect(screen.getByRole('button', { name: `${position.label}: frei` })).toBeVisible()
    }
  })

  it.each(['mouse', 'touch'])('ordnet per Pointer-Drag mit %s zu und laesst ungueltiges Ablegen unveraendert', (pointerType) => {
    render(<MatchPreparation tournament={fixture()} onCheckCurrent={vi.fn()} onBack={vi.fn()} />)
    const source = screen.getByRole('button', { name: 'Alex auswählen' })
    const target = screen.getByRole('button', { name: 'Schwarz Verteidigung: frei' })
    const point = { pointerId: 1, pointerType, button: 0, isPrimary: true }
    vi.mocked(document.elementFromPoint).mockReturnValue(target)
    fireEvent.pointerDown(source, { ...point, clientX: 20, clientY: 100 })
    fireEvent.pointerMove(source, { ...point, clientX: 300, clientY: 200 })
    fireEvent.pointerUp(source, { ...point, clientX: 300, clientY: 200 })
    expect(screen.getByRole('button', { name: 'Schwarz Verteidigung: Alex' })).toBeVisible()
    const other = screen.getByRole('button', { name: 'Bea auswählen' })
    fireEvent.click(screen.getByRole('button', { name: 'Weiß Angriff: frei' }))
    vi.mocked(document.elementFromPoint).mockReturnValue(null)
    fireEvent.pointerDown(other, { ...point, clientX: 20, clientY: 100 })
    fireEvent.pointerMove(other, { ...point, clientX: 300, clientY: 200 })
    fireEvent.pointerUp(other, { ...point, clientX: 300, clientY: 200 })
    fireEvent.click(other, { detail: 1 })
    expect(screen.getByRole('status')).toHaveTextContent('Außerhalb einer Position')
    expect(screen.getByRole('button', { name: 'Weiß Angriff: frei' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Schwarz Verteidigung: Alex' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Bea auswählen' })).toBeEnabled()
    fireEvent.pointerDown(other, { ...point, clientX: 20, clientY: 100 })
    fireEvent.pointerMove(other, { ...point, clientX: 300, clientY: 200 })
    fireEvent.pointerCancel(other, { ...point, clientX: 300, clientY: 200 })
    expect(screen.getByRole('status')).toHaveTextContent('Ziehen abgebrochen')
    fireEvent.click(other, { detail: 0 })
    expect(screen.getByRole('button', { name: 'Weiß Angriff: Bea' })).toBeVisible()
  })

  it('ersetzt auch beim Ziehen nur die Zielposition und weist einen veralteten Stand vor der Pruefung ab', async () => {
    const user = userEvent.setup()
    render(<MatchPreparation tournament={fixture()} onCheckCurrent={() => { throw new Error('Stand geändert. Bitte neu öffnen.') }} onBack={vi.fn()} />)
    for (const { label, nickname } of assignments) {
      await user.click(screen.getByRole('button', { name: `${label}: frei` }))
      await user.click(screen.getByRole('button', { name: `${nickname} auswählen` }))
    }
    const target = screen.getByRole('button', { name: 'Weiß Angriff: Alex' })
    const source = screen.getByRole('button', { name: 'Emil auswählen' })
    vi.mocked(document.elementFromPoint).mockReturnValue(target)
    fireEvent.pointerDown(source, { pointerId: 1, button: 0, clientX: 20, clientY: 100 })
    fireEvent.pointerMove(source, { pointerId: 1, clientX: 300, clientY: 200 })
    fireEvent.pointerUp(source, { pointerId: 1, clientX: 300, clientY: 200 })
    expect(screen.getByRole('button', { name: 'Weiß Angriff: Emil' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Alex auswählen' })).toBeEnabled()
    const table = screen.getByRole('table')
    expect(within(table).getByRole('button', { name: 'Dana auswählen – bereits eingesetzt' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Spiel starten' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Stand geändert')
    expect(screen.queryByRole('heading', { name: 'Aufstellung prüfen' })).not.toBeInTheDocument()
  })
})
