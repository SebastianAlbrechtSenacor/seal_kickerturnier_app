import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWhistle } from './whistle'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Lokaler Schiedsrichterpfiff', () => {
  it('meldet fehlende Audio-Unterstuetzung statt einen Pfiff zu behaupten', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const whistle = createWhistle()
    await expect(whistle.activate()).rejects.toThrow('keine Audioausgabe')
    await expect(whistle.play()).rejects.toThrow('nicht aktiviert')
  })

  it('gibt eine blockierte Aktivierung als Fehler weiter', async () => {
    vi.stubGlobal('AudioContext', class {
      state = 'suspended'
      async resume() { throw new DOMException('Audio blockiert', 'NotAllowedError') }
    })
    const whistle = createWhistle()
    await expect(whistle.activate()).rejects.toThrow('Audio blockiert')
    await expect(whistle.play()).rejects.toThrow('nicht aktiviert')
  })

  it('beendet auch eine haengende Aktivierung mit sichtbarer Fehlermeldung', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('AudioContext', class {
      state = 'suspended'
      resume() { return new Promise<void>(() => {}) }
    })
    const whistle = createWhistle()
    const result = expect(whistle.activate()).rejects.toThrow('Audioaktivierung blockiert')
    await vi.advanceTimersByTimeAsync(3000)
    await result
  })

  it('meldet eine fehlende Datei und spielt danach dieselbe lokale Aufnahme für beide Pfiffe', async () => {
    const bytes = new ArrayBuffer(16)
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValue({ ok: true, arrayBuffer: async () => bytes })
    vi.stubGlobal('fetch', fetch)
    const recording = {}
    const decode = vi.fn(async () => recording)
    const nodes = Array.from({ length: 2 }, () => ({
      buffer: null, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), onended: () => {},
    }))
    let index = 0
    const close = vi.fn()
    const destination = {}
    vi.stubGlobal('AudioContext', class {
      state = 'suspended'
      destination = destination
      async resume() { this.state = 'running' }
      decodeAudioData = decode
      createBufferSource() { return nodes[index++] }
      async close() { this.state = 'closed'; close() }
    })
    const whistle = createWhistle()
    await whistle.activate()
    await expect(whistle.play()).rejects.toThrow('konnte nicht geladen')
    await whistle.play()
    await whistle.play()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(`${import.meta.env.BASE_URL}match-whistle.mp3`, expect.any(Object))
    expect(decode).toHaveBeenCalledExactlyOnceWith(bytes)
    for (const node of nodes) {
      expect(node.buffer).toBe(recording)
      expect(node.connect).toHaveBeenCalledWith(destination)
      expect(node.start).toHaveBeenCalledOnce()
      node.onended()
      expect(node.disconnect).toHaveBeenCalledOnce()
    }
    await whistle.close()
    expect(close).toHaveBeenCalledOnce()
    await expect(whistle.play()).rejects.toThrow('nicht aktiviert')
  })
})
