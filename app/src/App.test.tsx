import { createHash, webcrypto } from 'node:crypto'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fixtureCode = 'ui-test-code'
const hash = createHash('sha256').update(fixtureCode).digest('hex')

function endMasterSession() {
  document.cookie = `seal_kickerturnier_master_session=; Path=${import.meta.env.BASE_URL}; Max-Age=0`
}

async function renderApp(configuredHash: string = hash) {
  vi.resetModules()
  vi.stubEnv('VITE_MASTER_CODE_HASH', configuredHash)
  const { default: App } = await import('./App')
  return render(<App />)
}

beforeEach(() => {
  history.replaceState(null, '', import.meta.env.BASE_URL)
  endMasterSession()
  localStorage.clear()
  vi.stubGlobal('crypto', webcrypto)
})

describe('Masterzugang', () => {
  it('zeigt nur die Zugangsmaske und meldet leere oder falsche Eingaben', async () => {
    const user = userEvent.setup()
    await renderApp()
    expect(screen.getByRole('heading', { name: 'Zugang' })).toBeVisible()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /KICKER\s*TURNIER/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Anwendung sperren' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Entsperren' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Bitte gib den Master-Zugangscode ein.')
    const input = screen.getByLabelText('Master-Zugangscode')
    await user.type(input, 'falsch')
    await user.click(screen.getByRole('button', { name: 'Entsperren' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht korrekt')
    expect(input).toHaveValue('')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveFocus()
    expect(screen.queryByRole('heading', { name: 'Deine Turniere.' })).not.toBeInTheDocument()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(document.cookie).toBe('')
  })

  it('entsperrt per Tastatur und behaelt die Freigabe beim erneuten Laden, aber nicht ohne Sitzungscookie', async () => {
    const user = userEvent.setup()
    localStorage.setItem('test-tournament', '{"id":"bleibt-erhalten"}')
    const { unmount } = await renderApp()
    await user.click(screen.getByLabelText('Master-Zugangscode'))
    await user.keyboard(`${fixtureCode}{Enter}`)
    expect(await screen.findByRole('heading', { name: 'Deine Turniere.' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Deine Turniere.' })).toHaveFocus()
    expect(screen.getByRole('banner')).toBeVisible()
    expect(screen.getByRole('contentinfo')).toBeVisible()
    expect(screen.getByRole('heading', { name: /KICKER\s*TURNIER/ })).toBeVisible()
    expect(screen.queryByLabelText('Master-Zugangscode')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Anwendung sperren' })).not.toBeInTheDocument()
    expect(document.cookie).not.toContain(fixtureCode)
    expect(localStorage.length).toBe(1)
    expect(sessionStorage.length).toBe(0)
    unmount()

    const reopened = await renderApp()
    expect(screen.getByRole('heading', { name: 'Deine Turniere.' })).toBeVisible()
    expect(screen.queryByLabelText('Master-Zugangscode')).not.toBeInTheDocument()
    reopened.unmount()

    endMasterSession()
    await renderApp()
    expect(screen.getByLabelText('Master-Zugangscode')).toBeVisible()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(localStorage.getItem('test-tournament')).toBe('{"id":"bleibt-erhalten"}')
  })

  it('meldet blockierte Cookies statt eine Sitzungsfreigabe vorzutaeuschen', async () => {
    const user = userEvent.setup()
    vi.spyOn(document, 'cookie', 'set').mockImplementation(() => {})
    await renderApp()
    await user.type(screen.getByLabelText('Master-Zugangscode'), `${fixtureCode}{Enter}`)
    expect(await screen.findByRole('alert')).toHaveTextContent('Bitte erlaube Cookies')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('behandelt den Code gross-/kleinschreibungsabhaengig', async () => {
    const user = userEvent.setup()
    await renderApp()
    await user.type(screen.getByLabelText('Master-Zugangscode'), fixtureCode.toUpperCase())
    await user.click(screen.getByRole('button', { name: 'Entsperren' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht korrekt')
  })

  it.each(['', 'kein-sha256-pruefwert'])('bleibt bei ungueltiger Konfiguration gesperrt: %s', async (value) => {
    await renderApp(value)
    expect(screen.getByRole('alert')).toHaveTextContent('noch nicht eingerichtet')
    expect(screen.getByRole('button', { name: 'Entsperren' })).toBeDisabled()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('meldet eine fehlgeschlagene Browser-Codepruefung sichtbar', async () => {
    const user = userEvent.setup()
    await renderApp()
    vi.spyOn(webcrypto.subtle, 'digest').mockRejectedValueOnce(new Error('WebCrypto unavailable'))
    await user.type(screen.getByLabelText('Master-Zugangscode'), fixtureCode)
    await user.click(screen.getByRole('button', { name: 'Entsperren' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('konnte nicht geprüft werden')
    expect(screen.queryByRole('heading', { name: 'Deine Turniere.' })).not.toBeInTheDocument()
  })

  it('verhindert einen zweiten Submit waehrend der Pruefung', async () => {
    await renderApp()
    const originalDigest = webcrypto.subtle.digest.bind(webcrypto.subtle)
    const pending = originalDigest('SHA-256', new TextEncoder().encode(fixtureCode))
    let release: (() => void) | undefined
    const digest = vi.spyOn(webcrypto.subtle, 'digest').mockImplementationOnce(() =>
      new Promise<ArrayBuffer>((resolve) => {
        release = () => { void pending.then(resolve) }
      }),
    )
    fireEvent.change(screen.getByLabelText('Master-Zugangscode'), { target: { value: fixtureCode } })
    const form = screen.getByRole('form', { name: 'Zugang' })
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(digest).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    release!()
    expect(await screen.findByRole('heading', { name: 'Deine Turniere.' })).toBeVisible()
  })
})
