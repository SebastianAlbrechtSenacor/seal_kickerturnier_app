import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Player } from './players'
import { assignPlayer, emptyLineup, isPosition, lineupError, positions } from './lineup'
import type { Position } from './lineup'
import StandingsTable from './StandingsTable'
import { formatBerlinTime } from './tournament'
import type { Tournament } from './tournament'
import './MatchPreparation.css'

interface Props {
  tournament: Tournament
  onCheckCurrent: () => void
  onBack: () => void
}

interface Drag {
  player: Player
  pointerId: number
  startX: number
  startY: number
  x: number
  y: number
  active: boolean
  over: Position | null
}

function positionAt(x: number, y: number): Position | null {
  const target = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-lineup-position]')
  return isPosition(target?.dataset.lineupPosition) ? target.dataset.lineupPosition : null
}

export default function MatchPreparation({ tournament, onCheckCurrent, onBack }: Props) {
  const players = tournament.players ?? []
  const [lineup, setLineup] = useState(emptyLineup)
  const [selected, setSelected] = useState<Position | null>(null)
  const [review, setReview] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('Noch keine Position belegt.')
  const [drag, setDrag] = useState<Drag | null>(null)
  const gesture = useRef<Drag | null>(null)
  const scrollFrame = useRef<number | null>(null)
  const suppressClick = useRef(false)
  const reviewHeading = useRef<HTMLHeadingElement>(null)
  const startButton = useRef<HTMLButtonElement>(null)
  const missing = positions.filter((position) => !lineup[position.id]).length

  useEffect(() => {
    if (review) reviewHeading.current?.focus()
  }, [review])

  useEffect(() => () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current)
  }, [])

  function assign(position: Position, player: Player) {
    try {
      setLineup(assignPlayer(lineup, position, player.id, players))
      setSelected(null)
      setError('')
      setNotice(`${player.nickname} spielt ${positions.find((item) => item.id === position)?.label}.`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Die Position konnte nicht belegt werden.')
    }
  }

  function pick(player: Player) {
    if (!selected) {
      setError('Bitte zuerst eine Position am Tisch auswählen oder die Person auf eine Position ziehen.')
      return
    }
    assign(selected, player)
  }

  function autoScroll() {
    const current = gesture.current
    if (!current?.active) return
    const delta = current.y < 56 ? -12 : current.y > window.innerHeight - 56 ? 12 : 0
    if (delta) {
      const before = window.scrollY
      window.scrollBy(0, delta)
      if (window.scrollY !== before) {
        current.over = positionAt(current.x, current.y)
        setDrag({ ...current })
      }
    }
    scrollFrame.current = requestAnimationFrame(autoScroll)
  }

  function pointerDown(event: PointerEvent<HTMLButtonElement>, player: Player) {
    if (event.button !== 0 || review || positions.some((position) => lineup[position.id] === player.id)) return
    if (gesture.current) return
    suppressClick.current = false
    gesture.current = {
      player, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: event.clientX, y: event.clientY, active: false, over: null,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return
    current.x = event.clientX
    current.y = event.clientY
    if (!current.active && Math.hypot(current.x - current.startX, current.y - current.startY) >= 6) {
      current.active = true
      setError('')
      scrollFrame.current = requestAnimationFrame(autoScroll)
    }
    if (current.active) {
      event.preventDefault()
      current.over = positionAt(current.x, current.y)
      setDrag({ ...current })
    }
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>, cancelled: boolean) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return
    gesture.current = null
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current)
    scrollFrame.current = null
    setDrag(null)
    if (!current.active) return
    suppressClick.current = true
    const target = cancelled ? null : positionAt(event.clientX, event.clientY)
    if (target) {
      assign(target, current.player)
    } else {
      setNotice(cancelled ? 'Ziehen abgebrochen. Die Aufstellung bleibt unverändert.' :
        'Außerhalb einer Position abgelegt. Die Aufstellung bleibt unverändert.')
    }
  }

  function checkLineup() {
    const problem = lineupError(lineup, players)
    setError('')
    if (problem) { setError(problem); return }
    try {
      onCheckCurrent()
      setReview(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Der Turnierstand konnte nicht geprüft werden. Bitte erneut öffnen.')
    }
  }

  return (
    <>
      <p className="card-description" id="lineup-instructions">
        Ziehe Name oder Avatar aus der Tabelle auf eine Position.
        Alternativ: Position anklicken oder antippen, dann eine freie Person auswählen.
      </p>
      <div className="match-layout">
        <StandingsTable compact players={players} renderPlayer={(player) => {
          const used = positions.find((position) => lineup[position.id] === player.id)
          return (
            <button type="button" className="lineup-player" disabled={Boolean(used) || review}
              aria-label={`${player.nickname} auswählen${used ? ' – bereits eingesetzt' : ''}`}
              aria-describedby="lineup-instructions"
              onClick={(event) => {
                if (event.detail !== 0 && suppressClick.current) return
                pick(player)
              }} onPointerDown={(event) => pointerDown(event, player)}
              onPointerMove={pointerMove} onPointerUp={(event) => finishDrag(event, false)}
              onPointerCancel={(event) => finishDrag(event, true)}
              onLostPointerCapture={(event) => finishDrag(event, true)}>
              <span><span aria-hidden="true">{player.avatar} </span>{player.nickname}</span>
              {used && <small>{used.label}</small>}
            </button>
          )
        }} />
        <section className="lineup-panel" aria-label="Partieaufstellung">
          {review ? (
            <>
              <h3 ref={reviewHeading} tabIndex={-1}>Aufstellung prüfen</h3>
              <p role="status">Noch keine Partie gestartet. Verbindlicher Start und Timer folgen in Story 1.7.</p>
              <dl className="lineup-review">
                {positions.map((position) => {
                  const player = players.find((person) => person.id === lineup[position.id])
                  return <div key={position.id}><dt>{position.label}</dt><dd>{player?.avatar} {player?.nickname}</dd></div>
                })}
              </dl>
              <button className="action-button" type="button" disabled>Spiel verbindlich starten – folgt in Story 1.7</button>
              <button className="secondary-button" type="button" onClick={() => {
                setReview(false)
                requestAnimationFrame(() => startButton.current?.focus())
              }}>Zur Aufstellung</button>
            </>
          ) : (
            <>
              <h3>Dein Tisch. Deine Aufstellung.</h3>
              <p id="lineup-progress">{missing ? `Noch ${missing} von 4 Positionen frei.` : 'Alle vier Positionen sind belegt. Auswahl bleibt bearbeitbar.'}</p>
              <div className="lineup-pitch" role="group" aria-label="Kickertisch">
                <span className="pitch-centre" aria-hidden="true" />
                {positions.map((position) => {
                  const player = players.find((person) => person.id === lineup[position.id])
                  return (
                    <div key={position.id} data-lineup-position={position.id}
                      className={`lineup-slot team-${position.team}${selected === position.id ? ' is-selected' : ''}${drag?.over === position.id ? ' is-drop-target' : ''}`}>
                      <button className="position-select" type="button" aria-pressed={selected === position.id}
                        aria-label={`${position.label}: ${player ? player.nickname : 'frei'}`}
                        onClick={() => {
                          setSelected(position.id)
                          setError('')
                          setNotice(`${position.label} ausgewählt. Jetzt eine freie Person aus der Tabelle wählen.`)
                        }}>
                        <span className="position-label">{position.label}</span>
                        {player ? <>
                          <span className="position-avatar" aria-hidden="true">{player.avatar}</span>
                          <span className="position-player">{player.nickname}</span>
                        </> : <span className="position-player">Hier ablegen oder auswählen</span>}
                      </button>
                      {player && <button className="position-remove" type="button" aria-label={`${position.label} leeren`}
                        onClick={() => {
                          setLineup({ ...lineup, [position.id]: null })
                          setError('')
                          setNotice(`${position.label} ist wieder frei.`)
                        }}>Entfernen</button>}
                    </div>
                  )
                })}
              </div>
              <p role="status" className="lineup-notice">{notice}</p>
              {error && <p role="alert" className="error-message">{error}</p>}
              <div className="form-actions">
                <button ref={startButton} className="action-button lineup-start" type="button" disabled={missing !== 0}
                  aria-describedby="lineup-progress" onClick={checkLineup}>Spiel starten</button>
                <button className="secondary-button" type="button" onClick={() => {
                  setLineup(emptyLineup())
                  setSelected(null)
                  setError('')
                  setNotice('Aufstellung geleert. Alle vier Positionen bitte neu belegen.')
                }}>Aufstellung leeren</button>
              </div>
            </>
          )}
        </section>
      </div>
      {drag && <div className="lineup-drag-preview" aria-hidden="true"
        style={{ left: Math.max(8, Math.min(drag.x + 12, window.innerWidth - 180)), top: Math.max(8, Math.min(drag.y + 12, window.innerHeight - 72)) }}>
        {drag.player.avatar} {drag.player.nickname}
      </div>}
      <footer className="match-info">
        <p><strong>{tournament.settings.name}</strong> · {formatBerlinTime(tournament.settings.startsAt)} · {tournament.settings.location}
          {' · '}{tournament.settings.matchMinutes} Minuten je Partie · Sieg {tournament.settings.winPoints} / Niederlage {tournament.settings.lossPoints} Punkte</p>
        <p>Ungespeicherter Entwurf. Verlassen, Neuladen oder Sperren verwirft die Aufstellung.</p>
        <button className="secondary-button" type="button" onClick={onBack}>Vorbereitung verlassen</button>
      </footer>
    </>
  )
}
