export interface Whistle {
  activate: () => Promise<void>
  play: () => void
  ready: () => boolean
  close: () => Promise<void>
}

export function createWhistle(): Whistle {
  let context: AudioContext | null = null
  return {
    async activate() {
      if (!window.AudioContext) throw new Error('Dieser Browser unterstützt keine Audioausgabe. Bitte die Zeit sichtbar beobachten.')
      if (!context || context.state === 'closed') context = new AudioContext()
      const audio = context
      let timeout: ReturnType<typeof setTimeout> | undefined
      try {
        await new Promise<void>((resolve, reject) => {
          timeout = setTimeout(() => reject(new Error('Audioaktivierung blockiert. Bitte Ton aktivieren / testen und die Geräte-Lautstärke prüfen.')), 3000)
          audio.resume().then(resolve, reject)
        })
        if (audio.state !== 'running') throw new Error('Audio ist nicht freigegeben. Bitte Ton aktivieren / testen.')
      } finally {
        clearTimeout(timeout)
      }
    },
    play() {
      if (!context || context.state !== 'running') throw new Error('Kein automatischer Pfiff: Audio ist nicht aktiviert. Bitte Ton aktivieren / testen.')
      const audio = context
      const gain = audio.createGain()
      const time = audio.currentTime
      gain.gain.setValueAtTime(0, time)
      gain.gain.linearRampToValueAtTime(0.06, time + 0.025)
      gain.gain.setValueAtTime(0.06, time + 0.65)
      gain.gain.linearRampToValueAtTime(0, time + 0.8)
      gain.connect(audio.destination)
      let remaining = 2
      for (const frequency of [2800, 3350]) {
        const oscillator = audio.createOscillator()
        oscillator.type = 'sine'
        oscillator.frequency.setValueCurveAtTime(
          Float32Array.from({ length: 128 }, (_, index) => frequency + 65 * Math.sin(index / 127 * Math.PI * 2 * 24)),
          time, 0.8,
        )
        oscillator.connect(gain)
        oscillator.onended = () => {
          oscillator.disconnect()
          if (--remaining === 0) gain.disconnect()
        }
        oscillator.start(time)
        oscillator.stop(time + 0.8)
      }
    },
    ready: () => context?.state === 'running',
    async close() {
      if (context && context.state !== 'closed') await context.close()
    },
  }
}
