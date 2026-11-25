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
    expect(() => whistle.play()).toThrow('nicht aktiviert')
  })

  it('gibt eine blockierte Aktivierung als Fehler weiter', async () => {
    vi.stubGlobal('AudioContext', class {
      state = 'suspended'
      async resume() { throw new DOMException('Audio blockiert', 'NotAllowedError') }
    })
    const whistle = createWhistle()
    await expect(whistle.activate()).rejects.toThrow('Audio blockiert')
    expect(() => whistle.play()).toThrow('nicht aktiviert')
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

  it('plant einen begrenzten Pfiff und gibt danach Audionodes und Kontext frei', async () => {
    const gain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(), disconnect: vi.fn(),
    }
    const nodes = Array.from({ length: 2 }, () => ({
      type: '', frequency: { setValueCurveAtTime: vi.fn() },
      connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: () => {},
    }))
    let index = 0
    const close = vi.fn()
    vi.stubGlobal('AudioContext', class {
      state = 'suspended'
      currentTime = 20
      destination = {}
      async resume() { this.state = 'running' }
      createGain() { return gain }
      createOscillator() { return nodes[index++] }
      async close() { this.state = 'closed'; close() }
    })
    const whistle = createWhistle()
    await whistle.activate()
    whistle.play()
    for (const node of nodes) {
      expect(node.connect).toHaveBeenCalledWith(gain)
      expect(node.start).toHaveBeenCalledOnce()
      expect(node.stop).toHaveBeenCalledOnce()
      node.onended()
      expect(node.disconnect).toHaveBeenCalledOnce()
    }
    expect(gain.disconnect).toHaveBeenCalledOnce()
    await whistle.close()
    expect(close).toHaveBeenCalledOnce()
    expect(() => whistle.play()).toThrow('nicht aktiviert')
  })
})
