import { knockoutPlacements } from './knockout'
import type { Tournament } from './tournament'
import { KnockoutArchive, KnockoutPlan } from './KnockoutBoard'
import { MatchInfo } from './MatchPresentation'
import { WorkspaceNavigation } from './WorkspaceNavigation'
import './TournamentCompletion.css'
import WorkspaceDialog from './WorkspaceDialog'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { playConfetti, confettiEnd, reducedMotion } from './completion-confetti'

interface Props {
  tournament: Tournament
  celebrate: boolean
  onBack: () => void
  onExport: () => void
  tournamentInfo?: ReactNode
}

const medals = ['🏆', '🥈', '🥉', '👏']

export default function TournamentCompletion({ tournament, celebrate, onBack, onExport, tournamentInfo }: Props) {
  const [confetti, setConfetti] = useState(() => celebrate && !window.matchMedia?.(reducedMotion).matches)
  const canvas = useRef<HTMLCanvasElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const stopButton = useRef<HTMLButtonElement>(null)
  const [confettiError, setConfettiError] = useState('')

  useEffect(() => {
    if (!confetti) return
    const preference = window.matchMedia?.(reducedMotion)
    const stop = () => {
      if (document.activeElement === stopButton.current) heading.current?.focus({ preventScroll: true })
      setConfetti(false)
    }
    const stopOnReducedMotion = () => { if (preference?.matches) stop() }
    const timer = window.setTimeout(stop, confettiEnd)
    preference?.addEventListener('change', stopOnReducedMotion)
    stopOnReducedMotion()
    return () => {
      window.clearTimeout(timer)
      preference?.removeEventListener('change', stopOnReducedMotion)
    }
  }, [confetti])

  useEffect(() => {
    const layer = canvas.current
    if (!confetti || !layer) return
    let cancelPlayback: (() => void) | undefined
    const frame = requestAnimationFrame(() => {
      try {
        cancelPlayback = playConfetti(layer)
      } catch (error) {
        setConfettiError(error instanceof Error ? error.message : 'Die Konfetti-Animation konnte nicht gestartet werden.')
        setConfetti(false)
      }
    })
    return () => {
      cancelAnimationFrame(frame)
      cancelPlayback?.()
    }
  }, [confetti])

  if (!tournament.knockout || tournament.activeMatch) throw new Error('Das Turnier ist noch nicht abgeschlossen.')
  const teams = knockoutPlacements(tournament.knockout)
  return (
    <section className="tournament-completion" aria-label="Turnierabschluss">
      {confetti && createPortal(<canvas ref={canvas} className="completion-confetti" aria-hidden="true" />, document.body)}
      <div className="completion-banner">
        <p className="card-eyebrow">GUTE LEUTE. GROSSES FINALE.</p>
        <h3 ref={heading} tabIndex={-1}>Siegerehrung</h3>
        {confetti && <button className="secondary-button completion-stop" type="button" ref={stopButton} onClick={() => {
          heading.current?.focus({ preventScroll: true })
          setConfetti(false)
        }}>Konfetti stoppen</button>}
        <p>Vier Teams. Ein Podest. Danke an alle, die mitgekickt haben!</p>
        {confettiError && <p className="error-message" role="status">{confettiError}</p>}
      </div>
      <h3 className="completion-heading">K.-o.-Teamwertung</h3>
      <ol className="completion-podium" aria-label="K.-o.-Teamplatzierungen">
        {teams.map((team, index) => <li className={`podium-team place-${index + 1}`} key={team.id}>
          <span className="podium-medal" aria-hidden="true">{medals[index]}</span>
          <h4>{index + 1}. Platz · Team {team.id}</h4>
          <div className="podium-members">
            {team.playerIds.map((id) => {
              const player = tournament.players?.find((person) => person.id === id)
              if (!player) throw new Error('Das K.-o.-Team enthält unbekannte Spielende.')
              return <p key={id}><span className="completion-avatar" aria-hidden="true">{player.avatar}</span>
                <strong>{player.nickname}</strong></p>
            })}
          </div>
        </li>)}
      </ol>
      <div className="completion-archives">
        <KnockoutArchive tournament={tournament} />
        <WorkspaceDialog inline label="K.-o.-Spielplan und Ergebnisse" title="K.-o.-Spielplan und Ergebnisse">
          <KnockoutPlan tournament={tournament} />
        </WorkspaceDialog>
      </div>
      <MatchInfo tournament={tournament}>
        <div className="match-info-actions">
          <p>Die K.-o.-Teamplätze und die individuelle Vorrundenwertung bleiben getrennt. Das Turnier ist abgeschlossen.</p>
          {tournamentInfo}
        </div>
        <WorkspaceNavigation>
          <button className="secondary-button" type="button" onClick={onBack}>Turnier verlassen</button>
          <button className="secondary-button" type="button" onClick={onExport}>JSON-Sicherung herunterladen</button>
        </WorkspaceNavigation>
      </MatchInfo>
    </section>
  )
}
