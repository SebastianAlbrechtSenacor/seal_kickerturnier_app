export interface Whistle {
  activate: () => Promise<void>
  play: () => Promise<void>
  ready: () => boolean
  close: () => Promise<void>
}

export function createWhistle(): Whistle {
  let context: AudioContext | null = null
  let recording: Promise<AudioBuffer> | undefined
  return {
    async activate() {
      if (!window.AudioContext) throw new Error('Dieser Browser unterstützt keine Audioausgabe. Bitte die Zeit sichtbar beobachten.')
      if (!context || context.state === 'closed') context = new AudioContext()
      const audio = context
      let timeout: ReturnType<typeof setTimeout> | undefined
      try {
        await new Promise<void>((resolve, reject) => {
          timeout = setTimeout(() => reject(new Error('Audioaktivierung blockiert. Der sichtbare Ablaufhinweis bleibt verfügbar.')), 3000)
          audio.resume().then(resolve, reject)
        })
        if (audio.state !== 'running') throw new Error('Audio ist nicht freigegeben. Der sichtbare Ablaufhinweis bleibt verfügbar.')
      } finally {
        clearTimeout(timeout)
      }
    },
    async play() {
      if (!context || context.state !== 'running') throw new Error('Kein automatischer Pfiff: Audio ist nicht aktiviert.')
      const audio = context
      recording ??= fetch(`${import.meta.env.BASE_URL}match-whistle.mp3`, { signal: AbortSignal.timeout(5000) })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          return response.arrayBuffer()
        })
        .then((bytes) => audio.decodeAudioData(bytes))
        .catch((cause: unknown) => {
          recording = undefined
          throw new Error('Die Pfiffaufnahme konnte nicht geladen oder gelesen werden.', { cause })
        })
      const buffer = await recording
      if (audio.state !== 'running') throw new Error('Kein automatischer Pfiff: Audio ist nicht aktiviert.')
      const source = audio.createBufferSource()
      source.buffer = buffer
      source.connect(audio.destination)
      source.onended = () => source.disconnect()
      source.start()
    },
    ready: () => context?.state === 'running',
    async close() {
      if (context && context.state !== 'closed') await context.close()
    },
  }
}
