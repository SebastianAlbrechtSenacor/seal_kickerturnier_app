import { createHash, webcrypto } from 'node:crypto'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fixtureCode = 'ui-test-code'
const hash = createHash('sha256').update(fixtureCode).digest('hex')

async function renderApp(configuredHash: string = hash) {
  vi.resetModules()
  vi.stubEnv('VITE_MASTER_CODE_HASH', configuredHash)
  const { default: App } = await import('./App')
  return render(<App />)
}

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto)
})

describe('Masterzugang', () => {
  it('zeigt nur die Zugangsmaske und meldet leere oder falsche Eingaben', async () => {
    const user = userEvent.setup()
    await renderApp()
    expect(screen.queryByRole('button', { name: 'Anwendung sperren' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Ab aufs Spielfeld/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('Bitte gib den Master-Zugangscode ein.')
    const input = screen.getByLabelText('Master-Zugangscode')
    await user.type(input, 'falsch')
    await user.click(screen.getByRole('button', { name: /Ab aufs Spielfeld/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht korrekt')
    expect(input).toHaveValue('')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveFocus()
    expect(screen.queryByRole('heading', { name: 'Deine Turniere.' })).not.toBeInTheDocument()
  })

  it('entsperrt per Tastatur, sperrt erneut und veraendert keine gespeicherten Turniere', async () => {
    const user = userEvent.setup()
    localStorage.setItem('test-tournament', '{"id":"bleibt-erhalten"}')
    const { unmount } = await renderApp()
    await user.click(screen.getByLabelText('Master-Zugangscode'))
    await user.keyboard(`${fixtureCode}{Enter}`)
    expect(await screen.findByRole('heading', { name: 'Deine Turniere.' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Deine Turniere.' })).toHaveFocus()
    expect(screen.queryByLabelText('Master-Zugangscode')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Anwendung sperren' }))
    expect(screen.getByLabelText('Master-Zugangscode')).toHaveValue('')
    expect(screen.queryByRole('heading', { name: 'Deine Turniere.' })).not.toBeInTheDocument()
    expect(localStorage.getItem('test-tournament')).toBe('{"id":"bleibt-erhalten"}')
    unmount()
    await renderApp()
    expect(screen.getByLabelText('Master-Zugangscode')).toBeVisible()
    localStorage.removeItem('test-tournament')
  })

  it('behandelt den Code gross-/kleinschreibungsabhaengig', async () => {
    const user = userEvent.setup()
    await renderApp()
    await user.type(screen.getByLabelText('Master-Zugangscode'), fixtureCode.toUpperCase())
    await user.click(screen.getByRole('button', { name: /Ab aufs Spielfeld/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nicht korrekt')
  })

  it.each(['', 'kein-sha256-pruefwert'])('bleibt bei ungueltiger Konfiguration gesperrt: %s', async (value) => {
    await renderApp(value)
    expect(screen.getByRole('alert')).toHaveTextContent('noch nicht eingerichtet')
    expect(screen.getByRole('button', { name: /Ab aufs Spielfeld/ })).toBeDisabled()
  })

  it('meldet eine fehlgeschlagene Browser-Codepruefung sichtbar', async () => {
    const user = userEvent.setup()
    await renderApp()
    vi.spyOn(webcrypto.subtle, 'digest').mockRejectedValueOnce(new Error('WebCrypto unavailable'))
    await user.type(screen.getByLabelText('Master-Zugangscode'), fixtureCode)
    await user.click(screen.getByRole('button', { name: /Ab aufs Spielfeld/ }))
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
    const form = screen.getByRole('button', { name: /Ab aufs Spielfeld/ }).closest('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(digest).toHaveBeenCalledTimes(1)
    release!()
    expect(await screen.findByRole('heading', { name: 'Deine Turniere.' })).toBeVisible()
  })
})
