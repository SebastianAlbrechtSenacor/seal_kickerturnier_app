import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import type { Player } from './players'
import { assignPlayer, emptyLineup, isPosition, lineupError, positions } from './lineup'
import type { Lineup, Position } from './lineup'
import StandingsTable from './StandingsTable'
import MatchHistory from './MatchHistory'
import type { Tournament } from './tournament'
import { LineupPitch, MatchInfo } from './MatchPresentation'
import { WorkspaceNavigation } from './WorkspaceNavigation'
import WorkspaceDialog from './WorkspaceDialog'
import { KnockoutConfirmation } from './KnockoutBoard'
import { knockoutStartError } from './knockout'

interface Props {
  tournament: Tournament
  onStart: (lineup: Lineup) => Promise<void>
  onBack: () => void
  onExport: () => void
  onKnockout: () => Promise<void>
  tournamentInfo: ReactNode
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

export default function MatchPreparation({ tournament, onStart, onBack, onExport, onKnockout, tournamentInfo }: Props) {
  const players = tournament.players ?? []
  const [lineup, setLineup] = useState(emptyLineup)
  const [selected, setSelected] = useState<Position | null>(null)
  const [starting, setStarting] = useState(false)
  const startPending = useRef(false)
  const [switchingPhase, setSwitchingPhase] = useState(false)
  const phasePending = useRef(false)
  const [phaseError, setPhaseError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('Noch keine Position belegt.')
  const [drag, setDrag] = useState<Drag | null>(null)
  const gesture = useRef<Drag | null>(null)
  const scrollFrame = useRef<number | null>(null)
  const suppressClick = useRef(false)
  const missing = positions.filter((position) => !lineup[position.id]).length
  const knockoutProblem = knockoutStartError(tournament)

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
    if (event.button !== 0 || starting || positions.some((position) => lineup[position.id] === player.id)) return
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

  async function beginMatch() {
    if (startPending.current) return
    const problem = lineupError(lineup, players)
    setError('')
    if (problem) { setError(problem); return }
    startPending.current = true
    setStarting(true)
    try {
      await onStart({ ...lineup })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Die Partie konnte nicht gestartet werden. Bitte erneut versuchen.')
    } finally {
      startPending.current = false
      setStarting(false)
    }
  }

  async function beginKnockout() {
    if (phasePending.current || startPending.current || knockoutProblem) return
    phasePending.current = true
    setSwitchingPhase(true)
    setPhaseError('')
    try {
      await onKnockout()
    } catch (error) {
      setPhaseError(error instanceof Error ? error.message : 'Die K.-o.-Phase konnte nicht gespeichert werden.')
    } finally {
      phasePending.current = false
      setSwitchingPhase(false)
    }
  }

  return (
    <>
      <p className="card-description" id="lineup-instructions">
        Ziehe Name oder Avatar aus der Tabelle auf eine Position.
        Alternativ: Position anklicken oder antippen, dann eine freie Person auswählen.
      </p>
      <div className="match-layout preparation-layout">
        <div className="preparation-summary-panel">
        <div className="preparation-tools">
          <WorkspaceDialog label="Vollständige Vorrundentabelle" title="Vorrundentabelle">
            <StandingsTable tournament={tournament} showHeading={false} />
          </WorkspaceDialog>
          <WorkspaceDialog label="Vollständiger Ergebnisverlauf" title="Ergebnisverlauf">
            <MatchHistory tournament={tournament} />
          </WorkspaceDialog>
          <WorkspaceDialog label="Weitere Turnierinfos" title="Turnierinfos">
            {tournamentInfo}
          </WorkspaceDialog>
        </div>
        <StandingsTable compact tournament={tournament} renderPlayer={(player) => {
          const used = positions.find((position) => lineup[position.id] === player.id)
          return (
            <button type="button" className="lineup-player" disabled={Boolean(used) || starting}
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
        <MatchHistory tournament={tournament} recent />
        </div>
        <section className="lineup-panel" aria-label="Partieaufstellung">
              <h3>Dein Tisch. Deine Aufstellung.</h3>
              <p id="lineup-progress">{missing ? `Noch ${missing} von 4 Positionen frei.` : 'Alle vier Positionen sind belegt. Auswahl bleibt bearbeitbar.'}</p>
              <LineupPitch players={players} lineup={lineup} selected={selected} dropTarget={drag?.over}
                onSelect={starting ? undefined : (position) => {
                  setSelected(position)
                  setError('')
                  setNotice(`${positions.find((item) => item.id === position)?.label} ausgewählt. Jetzt eine freie Person aus der Tabelle wählen.`)
                }}
                onRemove={starting ? undefined : (position) => {
                  setLineup({ ...lineup, [position]: null })
                  setError('')
                  setNotice(`${positions.find((item) => item.id === position)?.label} ist wieder frei.`)
                }} />
              <p role="status" className="lineup-notice">{notice}</p>
              {error && <p role="alert" className="error-message">{error}</p>}
              <div className="form-actions">
                <button className="action-button lineup-start" type="button" disabled={missing !== 0 || starting}
                  aria-describedby="lineup-progress" onClick={() => void beginMatch()}>{starting ? 'Wird gestartet ...' : 'Spiel starten'}</button>
                <button className="secondary-button" type="button" disabled={starting} onClick={() => {
                  setLineup(emptyLineup())
                  setSelected(null)
                  setError('')
                  setNotice('Aufstellung geleert. Alle vier Positionen bitte neu belegen.')
                }}>Aufstellung leeren</button>
                <WorkspaceDialog label="K.O. Runde starten" title="K.-o.-Phase starten?"
                  disabled={starting || Boolean(knockoutProblem)} busy={switchingPhase}
                  onOpen={() => setPhaseError('')}
                  descriptionId={knockoutProblem ? 'knockout-requirement' : undefined}
                  confirm={{ label: switchingPhase ? 'Wird gestartet ...' : 'K.-o.-Phase verbindlich starten', onClick: () => void beginKnockout() }}>
                  <KnockoutConfirmation tournament={tournament} />
                  {phaseError && <p className="error-message" role="alert">{phaseError}</p>}
                </WorkspaceDialog>
              </div>
              {knockoutProblem && <p className="form-note" id="knockout-requirement">{knockoutProblem}</p>}
        </section>
      </div>
      {drag && <div className="lineup-drag-preview" aria-hidden="true"
        style={{ left: Math.max(8, Math.min(drag.x + 12, window.innerWidth - 180)), top: Math.max(8, Math.min(drag.y + 12, window.innerHeight - 72)) }}>
        {drag.player.avatar} {drag.player.nickname}
      </div>}
      <MatchInfo tournament={tournament}>
        <p>Ungespeicherter Entwurf. Verlassen oder Neuladen verwirft die Aufstellung.</p>
        <WorkspaceNavigation>
          <button className="secondary-button" type="button" disabled={starting} onClick={onBack}>Turnier verlassen</button>
          <button className="secondary-button" type="button" disabled={starting} onClick={onExport}>JSON-Sicherung herunterladen</button>
        </WorkspaceNavigation>
      </MatchInfo>
    </>
  )
}
