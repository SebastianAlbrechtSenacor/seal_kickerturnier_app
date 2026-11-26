export const confettiEnd = 64_000
export const reducedMotion = '(prefers-reduced-motion: reduce)'
const colors = ['#ffc63c', '#ff874b', '#44d7d0', '#adff80', '#ff79c4', '#b9a2ff']
const cannonEnd = 20
const colorsInShadow = ['#cb822b', '#c47042', '#429d99', '#80ab59', '#bf639a', '#8d7fc1']

export function confettiFrame(seconds: number) {
  const firing = seconds < cannonEnd
  return { firing, cover: firing ? 1 : Math.max(0, 1 - (seconds - cannonEnd) / 0.8) }
}

export function confettiFlight(count: number, random = Math.random) {
  return Array.from({ length: count }, (_, i) => {
    const origin = i % 3
    const launch = i < 90 ? 0 : random() * cannonEnd
    // Particles entering late have a longer flight above the visible area, not a later launch.
    const arrival = i < 6 ? 56 + i * 0.3 : Math.max(launch + 2.4, 16 + 39 * random() ** 2.6)
    return {
      launch, arrival, duration: 4 + random() * 2,
      sourceX: [-0.04, 1.04, 0.5][origin],
      sourceY: origin === 2 ? 1.04 : 0.65,
      x: 0.04 + random() * 0.92,
      size: 5 + random() * 10,
      spin: 1.5 + random() * 5,
      color: colors[i % colors.length],
    }
  })
}

export function fallingProgress(particle: ReturnType<typeof confettiFlight>[number], seconds: number) {
  if (seconds < particle.launch) return null
  const progress = (seconds - particle.arrival) / particle.duration
  return progress >= -0.05 && progress <= 1 ? progress : null
}

export function playConfetti(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Die Konfetti-Animation ist in diesem Browser nicht verfügbar.')
  return animate(canvas, context)
}

function animate(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const particles = confettiFlight(2800)
  const tile = document.createElement('canvas')
  tile.width = tile.height = 192
  const texture = tile.getContext('2d')
  if (!texture) throw new Error('Das Konfetti-Muster konnte nicht erstellt werden.')
  texture.fillStyle = colorsInShadow[2]
  texture.fillRect(0, 0, tile.width, tile.height)
  for (let i = 0; i < 600; i++) {
    texture.fillStyle = colorsInShadow[i % colorsInShadow.length]
    texture.fillRect(Math.random() * tile.width, Math.random() * tile.height, 7 + Math.random() * 15, 5 + Math.random() * 10)
  }
  const pattern = context.createPattern(tile, 'repeat')
  if (!pattern) throw new Error('Das Konfetti-Muster konnte nicht wiederholt werden.')
  const backdrop = pattern

  const started = performance.now()
  let frame = 0
  function draw(now: number) {
    const seconds = (now - started) / 1000
    const { clientWidth: width, clientHeight: height } = canvas
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    context.clearRect(0, 0, width, height)
    const { firing, cover } = confettiFrame(seconds)
    if (cover) {
      context.globalAlpha = cover
      context.fillStyle = backdrop
      context.fillRect(0, 0, width, height)
      context.globalAlpha = 1
    }
    for (const particle of particles) {
      const age = seconds - particle.launch
      if (firing && age >= 0 && age < 2.4) {
        const progress = 1 - (1 - age / 2.4) ** 2
        drawPiece(particle, age, particle.sourceX + (particle.x - particle.sourceX) * progress,
          particle.sourceY * (1 - progress) - 0.24 * progress, width, height)
      }
      const fall = fallingProgress(particle, seconds)
      if (fall !== null) {
        drawPiece(particle, age, particle.x + Math.sin(age * 1.4) * 0.035, fall * 1.08 - 0.04, width, height)
      }
    }
    if (seconds * 1000 < confettiEnd) frame = requestAnimationFrame(draw)
  }
  function drawPiece(particle: typeof particles[number], age: number, x: number, y: number, width: number, height: number) {
    const { size, color, spin } = particle
    context.save()
    context.translate(x * width, y * height)
    context.rotate(age * spin)
    context.fillStyle = color
    context.fillRect(-size / 2, -size / 2, size, size * (0.25 + 0.9 * Math.abs(Math.cos(age * spin))))
    context.restore()
  }
  draw(started)
  return () => cancelAnimationFrame(frame)
}
