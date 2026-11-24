import { webcrypto } from 'node:crypto'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TournamentManager from './TournamentManager'
import { loadTournaments, readTournament, saveTournament } from './tournament-storage'
import { serializeBackup } from './tournament-backup'
import { hashCode } from './access'
import { draftFor, validateDraft } from './tournament'

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('crypto', webcrypto)
})

async function seed(name = 'Office Cup', code = 'fixture-cup') {
  const { settings } = validateDraft({
    ...draftFor(), name, location: `Ort von ${name}`, description: `Beschreibung von ${name}`,
    startsAtLocal: '2026-11-26T17:00', code,
  }, false)
  const tournament = {
    version: 1, id: crypto.randomUUID(), revision: 1, phase: 'preparation',
    settings, codeHash: await hashCode(code),
  }
  localStorage.setItem(`seal-kickerturnier:tournament:${tournament.id}`, JSON.stringify(tournament))
  return tournament.id
}

describe('Turniere vorbereiten', () => {
  it('legt ein Turnier mit Standardwerten an, oeffnet es sofort und behaelt es nach Neuladen', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Turnier anlegen' }))
    await user.type(screen.getByLabelText('Turniername'), 'Office Cup')
    await user.type(screen.getByLabelText('Datum und Startzeit (Europe/Berlin)'), '2026-11-26T17:00')
    await user.type(screen.getByLabelText('Spielort'), 'Eschborn')
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup')
    expect(screen.getByLabelText('Dauer je Partie (Minuten)')).toHaveValue(10)
    expect(screen.getByLabelText('Punkte je Sieg')).toHaveValue(3)
    expect(screen.getByLabelText('Punkte je Niederlage')).toHaveValue(1)
    const plan = within(screen.getByRole('complementary', { name: 'Zeitplanung' }))
    expect(plan.getByText('26.11.2026, 19:00')).toBeVisible()
    expect(plan.getByText('26.11.2026, 20:00')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Turnier speichern' }))
    expect(await screen.findByRole('heading', { name: 'Office Cup' })).toBeVisible()
    const [saved] = loadTournaments()
    expect(saved).toMatchObject({ version: 1, phase: 'preparation', settings: { name: 'Office Cup', matchMinutes: 10 } })
    expect(saved.codeHash).toBe(await hashCode('fixture-cup'))
    expect(localStorage.getItem(`seal-kickerturnier:tournament:${saved.id}`)).not.toContain('fixture-cup')
    unmount()
    render(<TournamentManager />)
    expect(screen.getByRole('button', { name: 'Office Cup öffnen' })).toBeVisible()
    expect(screen.queryByText('Eschborn')).not.toBeInTheDocument()
  })

  it('trennt zwei Turniere und prueft deren Codes bei jedem erneuten Oeffnen', async () => {
    const user = userEvent.setup()
    await seed('Cup A', 'fixture-a')
    await seed('Cup B', 'fixture-b')
    render(<TournamentManager />)
    expect(screen.queryByText('Ort von Cup A')).not.toBeInTheDocument()
    expect(screen.queryByText('Beschreibung von Cup B')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cup A öffnen' }))
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-b')
    await user.click(screen.getByRole('button', { name: 'Turnier öffnen' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht korrekt')
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-a')
    await user.keyboard('{Enter}')
    expect(await screen.findByText('Ort von Cup A')).toBeVisible()
    expect(screen.queryByText('Ort von Cup B')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zur Turnierauswahl' }))
    await user.click(screen.getByRole('button', { name: 'Cup B öffnen' }))
    expect(screen.getByLabelText('Turnier-Zugangscode')).toHaveValue('')
    expect(screen.queryByText('Ort von Cup B')).not.toBeInTheDocument()
  })

  it('speichert bearbeitete Einstellungen und ersetzt den Turniercode', async () => {
    const user = userEvent.setup()
    await seed()
    const { unmount } = render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Office Cup öffnen' }))
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Einstellungen bearbeiten' }))
    await user.clear(screen.getByLabelText('Geplante Vorrunde (Minuten)'))
    await user.type(screen.getByLabelText('Geplante Vorrunde (Minuten)'), '90')
    await user.clear(screen.getByLabelText('Punkte je Sieg'))
    await user.type(screen.getByLabelText('Punkte je Sieg'), '5')
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-new')
    expect(screen.getByText('26.11.2026, 18:30')).toBeVisible()
    expect(screen.getByText('26.11.2026, 19:30')).toBeVisible()
    expect(screen.getByLabelText('Dauer je Partie (Minuten)')).toHaveValue(10)
    await user.click(screen.getByRole('button', { name: 'Turnier speichern' }))
    await screen.findByRole('heading', { name: 'Office Cup' })
    unmount()
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Office Cup öffnen' }))
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht korrekt')
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-new{Enter}')
    expect(await screen.findByText('Sieg: 5 · Niederlage: 1')).toBeVisible()
    expect(screen.getByText('90 Minuten')).toBeVisible()
    expect(loadTournaments()[0].phase).toBe('preparation')
  })

  it('zeigt Feldfehler und behaelt bereits gueltige Eingaben', async () => {
    const user = userEvent.setup()
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Turnier anlegen' }))
    await user.type(screen.getByLabelText('Turniername'), 'Bleibt erhalten')
    await user.clear(screen.getByLabelText('Dauer je Partie (Minuten)'))
    await user.type(screen.getByLabelText('Dauer je Partie (Minuten)'), '0')
    await user.click(screen.getByRole('button', { name: 'Turnier speichern' }))
    expect(screen.getByLabelText('Dauer je Partie (Minuten)')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Spielort')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Turniername')).toHaveValue('Bleibt erhalten')
    expect(loadTournaments()).toEqual([])
  })

  it('meldet Speicherfehler, behaelt den Entwurf und erlaubt einen erneuten Versuch', async () => {
    const user = userEvent.setup()
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Turnier anlegen' }))
    await user.type(screen.getByLabelText('Turniername'), 'Nicht verlieren')
    await user.type(screen.getByLabelText('Datum und Startzeit (Europe/Berlin)'), '2026-11-26T17:00')
    await user.type(screen.getByLabelText('Spielort'), 'Office')
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(screen.getByRole('button', { name: 'Turnier speichern' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(screen.getByLabelText('Turniername')).toHaveValue('Nicht verlieren')
    expect(loadTournaments()).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Turnier speichern' }))
    expect(await screen.findByRole('heading', { name: 'Nicht verlieren' })).toBeVisible()
    expect(loadTournaments()).toHaveLength(1)
  })

  it('behaelt bei fehlgeschlagener Bearbeitung alte Daten und den Code bis zum erfolgreichen Wiederholen', async () => {
    const user = userEvent.setup()
    await seed()
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Office Cup öffnen' }))
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Einstellungen bearbeiten' }))
    await user.clear(screen.getByLabelText('Spielort'))
    await user.type(screen.getByLabelText('Spielort'), 'Neuer Spielort')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(screen.getByRole('button', { name: 'Turnier speichern' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(screen.getByLabelText('Spielort')).toHaveValue('Neuer Spielort')
    expect(loadTournaments()[0].settings.location).toBe('Ort von Office Cup')
    await user.click(screen.getByRole('button', { name: 'Turnier speichern' }))
    expect(await screen.findByText('Neuer Spielort')).toBeVisible()
    expect(loadTournaments()[0].codeHash).toBe(await hashCode('fixture-cup'))
  })

  it('meldet Lesefehler statt eine erfolgreiche leere Turnierauswahl zu zeigen', () => {
    vi.spyOn(Storage.prototype, 'key').mockImplementationOnce(() => { throw new Error('Blocked') })
    localStorage.setItem('unrelated-key', 'vorhanden')
    render(<TournamentManager />)
    expect(screen.getByRole('alert')).toHaveTextContent('nicht geladen')
    expect(screen.getByRole('button', { name: 'Turnier anlegen' })).toBeDisabled()
  })

  it('importiert eine Datei verlustfrei und verlangt anschliessend den Turniercode', async () => {
    const user = userEvent.setup()
    const id = await seed('Büro Cup 🏆')
    const backup = serializeBackup(readTournament(id))
    localStorage.clear()
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'JSON-Sicherung importieren' }))
    await user.upload(screen.getByLabelText('JSON-Sicherungsdatei'), new File([backup], 'cup.json', { type: 'application/json' }))
    expect(await screen.findByText('Büro Cup 🏆')).toBeVisible()
    expect(loadTournaments()).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Turnier importieren' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Turnier importiert')
    expect(screen.queryByText('Ort von Büro Cup 🏆')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Büro Cup 🏆 öffnen' }))
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup{Enter}')
    expect(await screen.findByText('Ort von Büro Cup 🏆')).toBeVisible()
  })

  it('verlangt bestehendes Passwort und Bestaetigung, bricht folgenlos ab und ersetzt erst danach', async () => {
    const user = userEvent.setup()
    const id = await seed()
    const current = readTournament(id)
    const incoming = {
      ...current, codeHash: await hashCode('imported-code'),
      settings: { ...current.settings, name: 'Sicherungsstand' },
    }
    const file = new File([serializeBackup(incoming)], 'cup.json', { type: 'application/json' })
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'JSON-Sicherung importieren' }))
    await user.upload(screen.getByLabelText('JSON-Sicherungsdatei'), file)
    expect(await screen.findByRole('button', { name: 'Turnier ersetzen' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(readTournament(id)).toEqual(current)
    await user.click(screen.getByRole('button', { name: 'JSON-Sicherung importieren' }))
    await user.upload(screen.getByLabelText('JSON-Sicherungsdatei'), file)
    await user.click(await screen.findByLabelText('Ich möchte den lokalen Stand unwiderruflich ersetzen.'))
    await user.type(screen.getByLabelText('Bestehender Turniercode'), 'imported-code')
    await user.click(screen.getByRole('button', { name: 'Turnier ersetzen' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht korrekt')
    expect(readTournament(id)).toEqual(current)
    await user.clear(screen.getByLabelText('Bestehender Turniercode'))
    await user.type(screen.getByLabelText('Bestehender Turniercode'), 'fixture-cup')
    await user.click(screen.getByRole('button', { name: 'Turnier ersetzen' }))
    await screen.findByRole('status')
    expect(readTournament(id)).toEqual({ ...incoming, revision: 2 })
    await user.click(screen.getByRole('button', { name: 'Sicherungsstand öffnen' }))
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'imported-code{Enter}')
    expect(await screen.findByRole('heading', { name: 'Sicherungsstand' })).toBeVisible()
  })

  it('zeigt Import- und Speicherfehler ohne Datenverlust und erlaubt erneuten Import', async () => {
    const user = userEvent.setup()
    const id = await seed()
    const current = readTournament(id)
    const incoming = { ...current, id: 'additional', settings: { ...current.settings, name: 'Zusätzlich' } }
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'JSON-Sicherung importieren' }))
    const input = screen.getByLabelText('JSON-Sicherungsdatei')
    await user.upload(input, new File(['{'], 'broken.json', { type: 'application/json' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('kein gültiges JSON')
    expect(readTournament(id)).toEqual(current)
    await user.upload(input, new File([serializeBackup(incoming)], 'good.json', { type: 'application/json' }))
    await screen.findByText('Zusätzlich')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError') })
    await user.click(screen.getByRole('button', { name: 'Turnier importieren' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht gespeichert')
    expect(loadTournaments()).toEqual([current])
    await user.click(screen.getByRole('button', { name: 'Turnier importieren' }))
    await screen.findByRole('status')
    expect(loadTournaments()).toHaveLength(2)
  })

  it('exportiert keinen veralteten Stand aus einem weiteren Tab', async () => {
    const user = userEvent.setup()
    const id = await seed()
    render(<TournamentManager />)
    await user.click(screen.getByRole('button', { name: 'Office Cup öffnen' }))
    await user.type(screen.getByLabelText('Turnier-Zugangscode'), 'fixture-cup{Enter}')
    await screen.findByRole('heading', { name: 'Office Cup' })
    const current = readTournament(id)
    await saveTournament({ ...current, revision: 2 }, 1)
    await user.click(screen.getByRole('button', { name: 'JSON-Sicherung herunterladen' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('zwischenzeitlich geändert')
  })
})
